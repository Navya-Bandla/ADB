import { PlusIcon } from '@heroicons/react/24/solid'
import { Badge, Button, Card, Text } from '@mantine/core'
import type { ActionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import * as React from 'react'
import { z } from 'zod'
import { TailwindContainer } from '~/components/TailwindContainer'
import { db } from '~/db.server'
import { requireUserId } from '~/session.server'
import { useStudentData } from '~/utils/hooks'
import { formatTime } from '~/utils/misc'
import { badRequest } from '~/utils/misc.server'
import type { inferErrors } from '~/utils/validation'
import { validateAction } from '~/utils/validation'

const DropScheduleSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule is required'),
})

interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof DropScheduleSchema>
}

export const action = async ({ request }: ActionArgs) => {
  const studentId = await requireUserId(request)
  const { fields, fieldErrors } = await validateAction(request, DropScheduleSchema)

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  await db.studentSchedule.delete({
    where: {
      id: fields.scheduleId,
      studentId,
    },
  })
  return json({ success: true })
}

export default function ManageSection() {
  const { schedules } = useStudentData()
  const fetcher = useFetcher<ActionData>()

  const isSubmitting = fetcher.state !== 'idle'

  React.useEffect(() => {
    if (fetcher.state !== 'idle' && fetcher.submission === undefined) {
      return
    }

    if (fetcher.data?.success) {
      // TODO: refresh the data
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
              <h1 className="text-3xl font-semibold text-gray-900">Manage Classes</h1>
              <p className="mt-2 text-sm text-gray-700">A list of all the classes you are enrolled in.</p>
            </div>

            <div>
              <Button component={Link} to="/join-classes" loaderPosition="left" color="gray">
                <PlusIcon className="h-4 w-4" />
                <span className="ml-2">Add</span>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                {schedules.map((schedule) => (
                  <div className="mt-12 text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4" key={schedule.id}>
                    <Card shadow="sm" radius="md" withBorder>
                      <Text weight={500}>
                        Section: {schedule.section.name} ({schedule.section.code}){' '}
                      </Text>
                      <Text weight={500}>
                        Time:
                        <span className="font-medium"> {schedule.section.day} </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(schedule.section.startTime)} - {formatTime(schedule.section.endTime)}
                        </span>
                      </Text>
                      <Text weight={500}>
                        Course: {schedule.section.course.name} ({schedule.section.course.code}){' '}
                      </Text>
                      <Text weight={500}>Faculty: {schedule.section.faculty.name}</Text>
                      <Text weight={500}>Room: {schedule.section.room.no}</Text>
                      <Badge mt="0.5rem" color="pink" variant="light">
                        <Button
                          variant="subtle"
                          compact
                          color="red"
                          loading={isSubmitting}
                          onClick={() => {
                            fetcher.submit(
                              {
                                scheduleId: schedule.id,
                              },
                              {
                                method: 'post',
                                replace: true,
                              }
                            )
                          }}
                        >
                          Drop
                        </Button>
                      </Badge>
                      {/* 
                  <Text size="sm" color="dimmed">
                    With Fjord Tours you can explore more of the magical fjord landscapes with tours and activities on and around the fjords of Norway
                  </Text> */}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
