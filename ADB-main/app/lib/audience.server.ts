import type {Audience} from '@prisma/client'
import {db} from '~/db.server'
import {createPasswordHash} from '~/utils/misc.server'

export async function createAudience({
	email,
	password,
	name,
}: {
	email: Audience['email']
	password: string
	name: Audience['name']
}) {
	return db.audience.create({
		data: {
			name,
			email,
			password: await createPasswordHash(password),
		},
	})
}

export function getAudienceDetails(id: Audience['id']) {
	return db.audience.findUnique({
		where: {id},
		include: {},
	})
}
