import type {Audience, Order} from '@prisma/client'
import {PaymentMethod} from '@prisma/client'
import {OrderStatus} from '@prisma/client'
import {PaymentStatus} from '@prisma/client'
import {db} from '~/db.server'

export function getAllOrders() {
	return db.order.findMany({
		include: {
			audience: {
				select: {
					name: true,
					email: true,
				},
			},
			payment: true,
			schedule: {
				include: {
					timeSlot: true,
					teamOne: true,
					teamTwo: true,
					stadium: true,
				},
			},
			tickets: true,
		},
	})
}

export function getOrdersById(audienceId: Audience['id']) {
	return db.order.findMany({
		where: {
			audienceId: audienceId,
		},
		orderBy: [
			{
				status: 'desc',
			},
			{
				createdAt: 'desc',
			},
		],
		include: {
			audience: {
				select: {
					name: true,
					email: true,
				},
			},
			payment: true,
			schedule: {
				include: {
					timeSlot: true,
					teamOne: true,
					teamTwo: true,
					stadium: true,
				},
			},
			tickets: true,
		},
	})
}

export function cancelOrder(
	orderId: Order['id'],
	status: OrderStatus = OrderStatus.CANCELLED_BY_ADMIN
) {
	return db.order.update({
		where: {id: orderId},
		data: {
			status,
			tickets: {
				deleteMany: {},
			},
			payment: {
				update: {
					status: PaymentStatus.REFUNDED,
				},
			},
		},
	})
}

const generateSeats = (noOfTickets: number, offset = 0) => {
	const seats = []
	for (let i = 1; i <= noOfTickets; i++) {
		seats.push((i + offset).toString())
	}
	return seats
}

export async function createOrder({
	audienceId,
	fixtureId,
	noOfTickets,
}: {
	audienceId: Audience['id']
	fixtureId: Order['scheduleId']
	noOfTickets: Order['noOfTickets']
}) {
	const fixture = await db.schedule.findUnique({
		where: {id: fixtureId},
		select: {
			pricePerTicket: true,
			orders: {
				include: {
					tickets: true,
				},
			},
		},
	})

	if (!fixture) {
		throw new Error('Fixture not found')
	}

	const totalAmount = fixture.pricePerTicket * noOfTickets

	let lastSeat = 0
	const successfulOrders = fixture?.orders.filter(
		o => o.status === OrderStatus.SUCCESS
	)
	if (!successfulOrders || successfulOrders.length === 0) {
		//
	} else {
		const seatsAlloted = successfulOrders
			.map(o => o.tickets.map(t => t.seatNo))
			.flat()
		lastSeat = Math.max(...seatsAlloted.map(seat => Number(seat)))
	}

	return db.order.create({
		data: {
			audienceId,
			scheduleId: fixtureId,
			noOfTickets,
			status: OrderStatus.SUCCESS,
			tickets: {
				createMany: {
					data: generateSeats(noOfTickets, lastSeat).map(seat => ({
						seatNo: seat,
					})),
				},
			},
			payment: {
				create: {
					audienceId,
					status: PaymentStatus.PAID,
					method: PaymentMethod.CREDIT_CARD,
					amount: totalAmount,
				},
			},
		},
	})
}
