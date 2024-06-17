import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid'
import { Modal, TextInput, clsx } from '@mantine/core'
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
import { formatTime } from '~/utils/misc'
import { badRequest } from '~/utils/misc.server'
import type { inferErrors } from '~/utils/validation'
import { validateAction } from '~/utils/validation'
import { Card, Text, Badge, Button, Group } from '@mantine/core'

enum MODE {
  edit,
  add,
}

const ManageCourseSchema = z.object({
  courseId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Codee is required'),
})
interface ActionData {
  success: boolean
  fieldErrors?: inferErrors<typeof ManageCourseSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(request, ManageCourseSchema)

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors })
  }

  const { courseId, ...rest } = fields
  const id = new ObjectId()

  await db.course.upsert({
    where: {
      id: courseId || id.toString(),
    },
    update: { ...rest },
    create: { ...rest },
  })
  return json({ success: true })
}

export default function ManageCourses() {
  const fetcher = useFetcher<ActionData>()
  const { courses } = useAdminData()

  type _Course = typeof courses[number]

  const [selectedCourseId, setSelectedCourseId] = React.useState<_Course['id'] | null>(null)
  const [selectedCourse, setSelectedCourse] = React.useState<_Course | null>(null)
  const [mode, setMode] = React.useState<MODE>(MODE.edit)
  const [isModalOpen, handleModal] = useDisclosure(false)

  const isSubmitting = fetcher.state !== 'idle'

  React.useEffect(() => {
    if (fetcher.state !== 'idle' && fetcher.submission === undefined) {
      return
    }

    if (fetcher.data?.success) {
      setSelectedCourseId(null)
      handleModal.close()
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.success, fetcher.state, fetcher.submission])

  React.useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null)
      return
    }

    const course = courses.find((c) => c.id === selectedCourseId)
    if (!course) return

    setSelectedCourse(course)
    handleModal.open()
    // handleModal is not meemoized, so we don't need to add it to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, selectedCourseId])

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className="mt-8 px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <Button leftIcon={<ArrowLeftIcon className="h-4 w-4" />} variant="white" size="md" component={Link} to=".." pl={0} mb={20} color="gray">
                Back
              </Button>
              <h1 className="text-3xl font-semibold text-gray-800">Manage Courses</h1>
              <p className="mt-2 text-sm text-gray-700">Manage the courses that are available to students.</p>
            </div>
            <div>
              <Button
                color="gray"
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
                {courses.map((course) => (
                  <div className="text-gray-800 sm:grid sm:grid-cols-3 sm:gap-4">
                    <Card shadow="sm" radius="md" withBorder>
                      <Text weight={500}>Code: {course.code} </Text>
                      <Text weight={500}>Name: {course.name} </Text>
                      <Text weight={500}>
                        {' '}
                        Sections:
                        <ul className="flex flex-col gap-2">
                          {course.sections.map((section) => (
                            <li key={section.id}>
                              <p className="font-bold">{section.name}</p>
                              <p>
                                {section.day} : {formatTime(section.startTime)} - {formatTime(section.endTime)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </Text>
                      <Badge mt="0.5rem" color="pink" variant="light">
                        <Button
                          loading={isSubmitting}
                          variant="subtle"
                          loaderPosition="right"
                          onClick={() => {
                            setSelectedCourseId(course.id)
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
          setSelectedCourseId(null)
          handleModal.close()
        }}
        title={clsx({
          'Edit venue': mode === MODE.edit,
          'Add venue': mode === MODE.add,
        })}
        centered
        overlayBlur={1.2}
        overlayOpacity={0.6}
      >
        <fetcher.Form method="post" replace>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <input type="hidden" name="courseId" value={selectedCourse?.id} />

            <TextInput name="code" label="Course Code" defaultValue={selectedCourse?.code} error={fetcher.data?.fieldErrors?.code} required />

            <TextInput name="name" label="Course Name" defaultValue={selectedCourse?.name} error={fetcher.data?.fieldErrors?.name} required />

            <div className="mt-1 flex items-center justify-end gap-4">
              <Button
                variant="subtle"
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedCourse(null)
                  handleModal.close()
                }}
                color="red"
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} loaderPosition="right">
                {mode === MODE.edit ? 'Save changes' : 'Add course'}
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  )
}
