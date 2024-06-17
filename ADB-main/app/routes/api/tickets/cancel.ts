import {OrderStatus, PaymentStatus} from '@prisma/client'
import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {db} from '~/db.server'

export const action = async ({request}: ActionArgs) => {
	const formData = await request.formData()

	const ticketId = formData.get('ticketId')?.toString()

	if (!ticketId) {
		return json({success: false, message: 'Ticket ID is required'})
	}

	await db.ticket.update({
		where: {
			id: ticketId,
		},
		data: {
			status: OrderStatus.CANCELLED_BY_PARTICIPANT,
			payment: {
				update: {
					status: PaymentStatus.REFUNDED,
				},
			},
		},
	})

	return json({success: true})
}
