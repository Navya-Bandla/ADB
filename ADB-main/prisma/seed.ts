import {PrismaClient} from '@prisma/client'
import {createPasswordHash} from '~/utils/misc.server'

const db = new PrismaClient()
/**
 * Football teams and stadiums are seeded from the data in the seed.ts file.
 */
async function seed() {
	await db.user.deleteMany()
	await db.course.deleteMany()
	await db.room.deleteMany()
	await db.section.deleteMany()
	await db.timeSlot.deleteMany()
	await db.studentSchedule.deleteMany()

	const admin = await db.user.create({
		data: {
			name: 'Admin',
			email: 'admin@app.com',
			password: await createPasswordHash('password'),
			role: 'ADMIN',
		},
	})

	const faculty = await db.user.create({
		data: {
			name: 'Faculty',
			email: 'faculty@app.com',
			password: await createPasswordHash('password'),
			role: 'FACULTY',
		},
	})

	const student = await db.user.create({
		data: {
			name: 'Student',
			email: 'student@app.com',
			password: await createPasswordHash('password'),
			role: 'STUDENT',
		},
	})

	const room = await db.room.create({
		data: {
			no: 'B-12',
			maxCapacity: 30,
		},
	})

	const course = await db.course.create({
		data: {
			name: 'Math',
			code: 'MATH-101',
		},
	})

	const section = await db.section.create({
		data: {
			name: 'A',
			code: 'A',
			courseId: course.id,
			roomId: room.id,
			facultyId: faculty.id,
			day: 'MONDAY',
			startTime: new Date(2023, 4, 28, 9, 0, 0),
			endTime: new Date(2023, 4, 28, 10, 45, 0),
		},
	})

	await db.timeSlot.create({
		data: {
			sectionId: section.id,
			day: 'MONDAY',
			startTime: new Date(2023, 4, 28, 9, 0, 0),
			endTime: new Date(2023, 4, 28, 10, 45, 0),
		},
	})

	const studentSchedule = await db.studentSchedule.create({
		data: {
			studentId: student.id,
			sectionId: section.id,
		},
	})

	console.log(`Database has been seeded. 🌱`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await db.$disconnect()
	})
