import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid'
import { Button, Modal, PasswordInput, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { UserRole } from '@prisma/client'
import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { TailwindContainer } from '~/components/TailwindContainer'
import { db } from '~/db.server'
import { useAdminData } from '~/utils/hooks'
import { badRequest, createPasswordHash } from '~/utils/misc.server'
import type { inferErrors } from '~/utils/validation'
import { validateAction } from '~/utils/validation'
import * as React from 'react'
import { Card, Text, Badge, Group } from '@mantine/core'

const AddFacultySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof AddFacultySchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(request, AddFacultySchema)

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { email, name, password } = fields

  await db.user.create({
    data: {
      email,
      name,
      password: await createPasswordHash(password),
      role: UserRole.FACULTY,
    },
  })
  return json({ success: true })
}

export default function ManageFaculties() {
  const fetcher = useFetcher<ActionData>()
  const { faculties } = useAdminData()

  const [isModalOpen, handleModal] = useDisclosure(false)

  const isSubmitting = fetcher.state !== 'idle'

  React.useEffect(() => {
    if (fetcher.state !== 'idle' && fetcher.submission === undefined) {
      return
    }

    if (fetcher.data?.success) {
      handleModal.close()
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.success, fetcher.state, fetcher.submission])

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className="mt-8 px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />} variant="white" size="md" component={Link} to=".." pl={0} mb={20} color="gray">
                Back
              </Button>
              <h1 className="text-3xl font-semibold text-gray-900">Manage Faculty</h1>
              <p className="mt-2 text-sm text-gray-700">A list of all the faculty in the system.</p>
            </div>
            <div>
              <Button loading={isSubmitting} loaderPosition="left" onClick={() => handleModal.open()}>
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Add</span>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                {faculties.map((faculty) => (
                  <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                    <Card shadow="sm" radius="md" withBorder>
                      <Text weight={500}>Name: {faculty.name} </Text>
                      <Text weight={500}>Email: {faculty.email} </Text>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>

      <Modal opened={isModalOpen} onClose={() => handleModal.close()} title="Add faculty" centered overlayBlur={1.2} overlayOpacity={0.6}>
        <fetcher.Form method="post" replace>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <TextInput name="name" label="Name" error={fetcher.data?.fieldErrors?.name} required />

            <TextInput name="email" type="email" label="Email" error={fetcher.data?.fieldErrors?.email} required />

            <PasswordInput name="password" label="Password" error={fetcher.data?.fieldErrors?.password} required />

            <div className="mt-1 flex items-center justify-end gap-4">
              <Button variant="subtle" disabled={isSubmitting} onClick={() => handleModal.close()} color="red">
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} loaderPosition="right">
                Add
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  )
}
