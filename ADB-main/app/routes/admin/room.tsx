import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid'
import { Modal, NumberInput, TextInput, clsx } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { ObjectId } from 'bson'
import * as React from 'react'
import { z } from 'zod'
import { TailwindContainer } from '~/components/TailwindContainer'
import { db } from '~/db.server'
import { useAdminData } from '~/utils/hooks'
import { badRequest } from '~/utils/misc.server'
import type { inferErrors } from '~/utils/validation'
import { validateAction } from '~/utils/validation'
import { Card, Image, Text, Badge, Button, Group, Tooltip } from '@mantine/core'

enum MODE {
  edit,
  add,
}

const ManageRoomSchema = z.object({
  roomId: z.string().optional(),
  no: z.string().min(1, 'Name is required'),
  maxCapacity: z.string().transform(Number),
})
interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof ManageRoomSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(request, ManageRoomSchema)

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { roomId, no, maxCapacity } = fields
  const id = new ObjectId().toString()

  await db.room.upsert({
    where: {
      id: roomId || id,
    },
    update: {
      maxCapacity,
      no,
    },
    create: {
      id,
      maxCapacity,
      no,
    },
  })
  return json({ success: true })
}

export default function ManageRooms() {
  const fetcher = useFetcher<ActionData>()
  const { rooms } = useAdminData()

  type _Room = typeof rooms[number]

  const [selectedRoomId, setSelectedRoomId] = React.useState<_Room['id'] | null>(null)
  const [selectedRoom, setSelectedRoom] = React.useState<_Room | null>(null)
  const [mode, setMode] = React.useState<MODE>(MODE.edit)
  const [isModalOpen, handleModal] = useDisclosure(false)

  const isSubmitting = fetcher.state !== 'idle'

  React.useEffect(() => {
    if (fetcher.state !== 'idle' && fetcher.submission === undefined) {
      return
    }

    if (fetcher.data?.success) {
      setSelectedRoomId(null)
      handleModal.close()
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.success, fetcher.state, fetcher.submission])

  React.useEffect(() => {
    if (!selectedRoomId) {
      setSelectedRoom(null)
      return
    }

    const room = rooms.find((room) => room.id === selectedRoomId)
    if (!room) return

    setSelectedRoom(room)
    handleModal.open()
    // handleModal is not meemoized, so we don't need to add it to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, selectedRoomId])

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className="mt-8 px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />} variant="white" size="md" component={Link} to=".." pl={0} mb={20} color="gray">
                Back
              </Button>
              <h1 className="text-3xl font-semibold text-gray-900">Manage Rooms</h1>
              <p className="mt-2 text-sm text-gray-700">Manage the rooms that are available for classes.</p>
            </div>
            <div>
              <Button
                loading={isSubmitting}
                loaderPosition="left"
                onClick={() => {
                  setMode(MODE.add)
                  handleModal.open()
                }}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Add</span>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                {rooms.map((room) => (
                  <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                    <Card shadow="sm" radius="md" withBorder>
                      <Text weight={500}>Name: {room.no} </Text>
                      <Text weight={500}>Max Capacity: {room.maxCapacity} </Text>

                      <Badge mt="0.5rem" color="pink" variant="light">
                        <Button
                          loading={isSubmitting}
                          variant="subtle"
                          loaderPosition="right"
                          onClick={() => {
                            setSelectedRoomId(room.id)
                            setMode(MODE.edit)
                          }}
                        >
                          Edit
                        </Button>
                      </Badge>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          setSelectedRoomId(null)
          handleModal.close()
        }}
        title={clsx({
          'Edit room': mode === MODE.edit,
          'Add room': mode === MODE.add,
        })}
        centered
        overlayBlur={1.2}
        overlayOpacity={0.6}
      >
        <fetcher.Form method="post" replace>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <input type="hidden" name="roomId" value={selectedRoom?.id} />

            <TextInput name="no" label="Room No." defaultValue={selectedRoom?.no} error={fetcher.data?.fieldErrors?.no} required />

            <NumberInput name="maxCapacity" label="Max Capacity" defaultValue={selectedRoom?.maxCapacity} error={fetcher.data?.fieldErrors?.maxCapacity} required />

            <div className="mt-1 flex items-center justify-end gap-4">
              <Button
                variant="subtle"
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedRoom(null)
                  handleModal.close()
                }}
                color="red"
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} loaderPosition="right">
                {mode === MODE.edit ? 'Save changes' : 'Create'}
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  )
}
