import slugify from 'slugify'
import {z} from 'zod'

const name = z.string().min(1, 'Name is required')
const email = z.string().email('Invalid email')
const password = z.string().min(8, 'Password must be at least 8 characters')

export const RegisterUserSchema = z
	.object({
		name,
		email,
		password,
		confirmPassword: password,
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['password', 'confirmPassword'],
	})

export const ManageStadiumSchema = z.object({
	stadiumId: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	abbr: z
		.string()
		.min(1, 'Abbreviation is required')
		.transform(value =>
			slugify(value, {lower: true, trim: true, replacement: ''})
		),
	size: z.preprocess(Number, z.number().min(1, 'Max capacity is required')),
})

export const ManageTeamSchema = z.object({
	teamId: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	abbr: z
		.string()
		.min(1, 'Abbreviation is required')
		.transform(value =>
			slugify(value.toUpperCase(), {trim: true, replacement: ''})
		),
})

export const ManageFixtureSchema = z.object({
	fixtureId: z.string().optional(),
	teamOneId: z.string().min(1, 'Team one is required'),
	teamTwoId: z.string().min(1, 'Team two is required'),
	stadiumId: z.string().min(1, 'Stadium is required'),
	pricePerTicket: z.preprocess(
		Number,
		z.number().min(0, 'Price per ticket must be at least 0')
	),
	fixtureDate: z.preprocess(arg => {
		if (typeof arg == 'string' || arg instanceof Date) {
			return new Date(arg)
		}
	}, z.date()),
	fixtureStartTime: z.preprocess(arg => {
		if (typeof arg == 'string' || arg instanceof Date) {
			return new Date(arg)
		}
	}, z.date()),
	fixtureEndTime: z.preprocess(arg => {
		if (typeof arg == 'string' || arg instanceof Date) {
			return new Date(arg)
		}
	}, z.date()),
})
