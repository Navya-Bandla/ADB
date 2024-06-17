import {ArrowLeftIcon} from '@heroicons/react/24/solid'
import {Button, Select} from '@mantine/core'
import type {User} from '@prisma/client'
import type {ActionFunction} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Link, useFetcher} from '@remix-run/react'
import * as React from 'react'
import {z} from 'zod'
import {TailwindContainer} from '~/components/TailwindContainer'
import {db} from '~/db.server'
import {useAdminData} from '~/utils/hooks'
import {badRequest} from '~/utils/misc.server'
import type {inferErrors} from '~/utils/validation'
import {validateAction} from '~/utils/validation'

const DropStudentScheduleSchema = z.object({
	studentId: z.string().min(1, 'Student is required'),
	scheduleId: z.string().min(1, 'Schedule is required'),
})

interface ActionData {
	success: boolean
	fieldErrors?: inferErrors<typeof DropStudentScheduleSchema>
}

export const action: ActionFunction = async ({request}) => {
	const {fields, fieldErrors} = await validateAction(
		request,
		DropStudentScheduleSchema
	)

	if (fieldErrors) {
		return badRequest<ActionData>({success: false, fieldErrors})
	}

	await db.studentSchedule.delete({
		where: {
			id: fields.scheduleId,
			studentId: fields.studentId,
		},
	})
	return json({success: true})
}

export default function ManageZones() {
	const fetcher = useFetcher<ActionData>()
	const isSubmitting = fetcher.state !== 'idle'

	const {students} = useAdminData()

	const [studentId, setStudentId] = React.useState<User['id'] | null>(null)

	const selectedStudent = React.useMemo(
		() => students.find(student => student.id === studentId),
		[students, studentId]
	)

	return (
		<>
			<TailwindContainer className="rounded-md bg-white">
				<div className="mt-8 px-4 py-10 sm:px-6 lg:px-8">
					<div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
						<div>
							<Button
								leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
								variant="white"
								size="md"
								component={Link}
								to=".."
								pl={0}
								mb={20}
								color="gray"
							>
								Back
							</Button>
							<h1 className="text-3xl font-semibold text-gray-900">
								Manage Students
							</h1>
							<p className="mt-2 text-sm text-gray-700">
								A list of all the students in the system.
							</p>
						</div>
						<div className="flex items-end gap-4">
							<Select
								label="Student"
								value={studentId}
								onChange={setStudentId}
								clearable
								searchable
								placeholder="Select a student"
								data={students.map(student => ({
									value: student.id,
									label: `${student.name} (${student.email})`,
								}))}
							/>
						</div>
					</div>
					<div className="mt-8 flex flex-col">
						<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
								{studentId ? (
									<>
										<table className="min-w-full divide-y divide-gray-300">
											<thead>
												<tr>
													<th
														scope="col"
														className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
													>
														Section
													</th>

													<th
														scope="col"
														className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
													>
														Course
													</th>
													<th
														scope="col"
														className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
													>
														Faculty
													</th>

													<th
														scope="col"
														className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0"
													></th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{selectedStudent?.schedules.map(schedule => (
													<tr key={schedule.id}>
														<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
															{schedule.section.name}
														</td>

														<td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
															{schedule.section.course.name}
														</td>

														<td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
															{schedule.section.faculty.name}
														</td>

														<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-8">
															<Button
																loading={isSubmitting}
																variant="white"
																compact
																loaderPosition="right"
																color="red"
																onClick={() => {
																	fetcher.submit(
																		{
																			scheduleId: schedule.id,
																			studentId: selectedStudent.id,
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
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</>
								) : (
									<div className="flex flex-col items-center justify-center rounded border border-dashed py-12">
										<div className="text-sm font-medium italic text-gray-900">
											Please select a student to drop their classes.
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</TailwindContainer>
		</>
	)
}
