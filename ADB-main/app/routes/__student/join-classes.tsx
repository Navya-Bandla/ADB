import {Badge, Button, Card, Text} from '@mantine/core'
import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {useFetcher} from '@remix-run/react'
import * as React from 'react'
import {z} from 'zod'
import {TailwindContainer} from '~/components/TailwindContainer'
import {db} from '~/db.server'
import {requireUserId} from '~/session.server'
import {useStudentData} from '~/utils/hooks'
import {formatTime, setFixedDate} from '~/utils/misc'
import {badRequest} from '~/utils/misc.server'
import type {inferErrors} from '~/utils/validation'
import {validateAction} from '~/utils/validation'

const AddScheduleSchema = z.object({
	sectionId: z.string().min(1, 'Section is required'),
})

interface ActionData {
	success: boolean
	fieldErrors?: inferErrors<typeof AddScheduleSchema>
}

export const action = async ({request}: ActionArgs) => {
	const studentId = await requireUserId(request)
	const {fields, fieldErrors} = await validateAction(request, AddScheduleSchema)

	if (fieldErrors) {
		return badRequest<ActionData>({success: false, fieldErrors})
	}

	await db.studentSchedule.create({
		data: {
			sectionId: fields.sectionId,
			studentId,
		},
	})
	return json({success: true})
}

export default function ManageSection() {
	const {allSections, schedules} = useStudentData()
	const fetcher = useFetcher<ActionData>()

	const isSubmitting = fetcher.state !== 'idle'

	React.useEffect(() => {
		if (fetcher.state !== 'idle' && fetcher.submission === undefined) {
			return
		}

		if (fetcher.data?.success) {
			// TODO: refresh the data
		} else if (fetcher.data?.fieldErrors) {
			alert('Cannot enroll in this section.')
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
							<h1 className="text-3xl font-semibold text-gray-800">
								Join Classes
							</h1>
							<p className="mt-2 text-sm text-gray-700">
								A list of all the classes available for you to join.
							</p>
						</div>
					</div>
					<div className="mt-8 flex flex-col">
						<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle sm:grid sm:grid-cols-3 sm:gap-4 md:px-6 lg:px-8">
								{allSections.map(section => {
									const isAlreadyEnrolled = schedules.some(
										s => s.sectionId === section.id
									)

									const isInConflict = schedules.some(s => {
										if (s.sectionId === section.id) {
											return false
										}

										const isSameDay = s.section.day === section.day
										if (!isSameDay) {
											return false
										}

										const currentSectionStart = setFixedDate(
											new Date(section.startTime)
										)
										const currentSectionEnd = setFixedDate(
											new Date(section.endTime)
										)

										const otherSectionStart = setFixedDate(
											new Date(s.section.startTime)
										)
										const otherSectionEnd = setFixedDate(
											new Date(s.section.endTime)
										)

										return (
											(currentSectionStart >= otherSectionStart &&
												currentSectionStart <= otherSectionEnd) ||
											(currentSectionEnd >= otherSectionStart &&
												currentSectionEnd <= otherSectionEnd)
										)
									})

									return (
										<div className="mt-12 text-gray-800" key={section.id}>
											<Card shadow="sm" radius="md" withBorder>
												<Text weight={500}>
													Course: {section.course.name} ({section.course.code})
												</Text>
												<Text weight={500}>
													Section: {section.name} ({section.code})
												</Text>
												<Text weight={500}>
													Time:
													<span className="font-medium"> {section.day} </span>
													<span className="text-xs text-gray-500">
														{formatTime(section.startTime)} -{' '}
														{formatTime(section.endTime)}
													</span>
												</Text>
												<Text weight={500}>
													Faculty: {section.faculty.name}
												</Text>
												<Text weight={500}>Room: {section.room.no}</Text>
												<Badge mt="0.5rem" color="pink" variant="light">
													<Button
														variant="subtle"
														compact
														loading={isSubmitting}
														color="blue"
														disabled={isAlreadyEnrolled || isInConflict}
														onClick={() => {
															fetcher.submit(
																{
																	sectionId: section.id,
																},
																{
																	method: 'post',
																	replace: true,
																}
															)
														}}
													>
														{isAlreadyEnrolled
															? 'Enrolled'
															: isInConflict
															? 'Conflict'
															: 'Enroll'}
													</Button>
												</Badge>
												{/* 
                  <Text size="sm" color="dimmed">
                    With Fjord Tours you can explore more of the magical fjord landscapes with tours and activities on and around the fjords of Norway
                  </Text> */}
											</Card>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				</div>
			</TailwindContainer>
		</>
	)
}
