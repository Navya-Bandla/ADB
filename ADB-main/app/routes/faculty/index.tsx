import { Card, Group, Text } from '@mantine/core'
import { TailwindContainer } from '~/components/TailwindContainer'
import { useFacultyData } from '~/utils/hooks'

export default function ManageSection() {
  const { sections } = useFacultyData()

  return (
    <>
      <TailwindContainer className="rounded-md bg-white">
        <div className="mt-8 px-4 py-10 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Sections</h1>
              <p className="mt-2 text-sm text-gray-700">A list of all sections you are currently managing.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                {sections.map((section) => (
                  <Card shadow="sm" radius="md" withBorder key={section.id}>
                    <Group position="apart" mt="md" mb="xs">
                      <Text weight={500}>Code: {section.code} </Text>
                      <Text weight={500}>Name: {section.name} </Text>
                      <Text weight={500}>Course: {section.course.name} </Text>

                      <Text weight={500}>Room: {section.room.no} </Text>
                    </Group>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TailwindContainer>
    </>
  )
}
