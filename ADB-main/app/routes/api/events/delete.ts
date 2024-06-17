import {EventStatus, OrderStatus} from '@prisma/client'
import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {db} from '~/db.server'

export const action = async ({request}: ActionArgs) => {
	const formData = await request.formData()

	const eventId = formData.get('eventId')?.toString()

	if (!eventId) {
		return json({success: false, message: 'Event ID is required'})
	}

	const event = await db.event.findUnique({
		where: {
			id: eventId,
		},
		include: {
			tickets: true,
		},
	})

	if (!event) {
		return json({success: false, message: 'Event not found'})
	}

	if (event.tickets.length > 0) {
		await db.ticket.updateMany({
			where: {
				eventId: event.id,
			},
			data: {
				status: OrderStatus.CANCELLED_BY_ORGANIZER,
			},
		})
	}

	await db.event.update({
		where: {
			id: eventId,
		},
		data: {
			status: EventStatus.CANCELLED,
		},
	})

	return json({success: true})
}
