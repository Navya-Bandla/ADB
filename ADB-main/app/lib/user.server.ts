import type {User, UserRole} from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import {db} from '~/db.server'
import {createPasswordHash} from '~/utils/misc.server'

export async function getUserById(id: string) {
	return db.user.findUnique({
		where: {id},
		include: {
			schedules: true,
			sections: true,
		},
	})
}

export async function getUserByEmail(email: string) {
	return db.user.findUnique({
		where: {email},
		include: {
			schedules: true,
			sections: true,
		},
	})
}

export async function createUser({
	email,
	password,
	name,
	role,
}: {
	email: User['email']
	password: string
	name: User['name']
	role: User['role']
}) {
	return db.user.create({
		data: {
			name,
			email,
			password: await createPasswordHash(password),
			role,
		},
	})
}

export async function verifyLogin({
	email,
	password,
	role,
}: {
	email: string
	password: string
	role: UserRole
}) {
	const userWithPassword = await db.user.findUnique({
		where: {email, role},
	})

	if (!userWithPassword || !userWithPassword.password) {
		return null
	}

	const isValid = await bcrypt.compare(password, userWithPassword.password)

	if (!isValid) {
		return null
	}

	const {password: _password, ...userWithoutPassword} = userWithPassword

	return userWithoutPassword
}
