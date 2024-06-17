import {UserRole} from '@prisma/client'

export function round(number: number, precision: number) {
	const d = Math.pow(10, precision)
	return Math.round((number + Number.EPSILON) * d) / d
}

export function titleCase(string: string) {
	string = string.toLowerCase()
	const wordsArray = string.split(' ')

	for (var i = 0; i < wordsArray.length; i++) {
		wordsArray[i] =
			wordsArray[i].charAt(0).toUpperCase() + wordsArray[i].slice(1)
	}

	return wordsArray.join(' ')
}

export function formatDate(date: Date | string) {
	return new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: '2-digit',
		day: 'numeric',
	}).format(new Date(date))
}

export function formatTime(date: Date | string) {
	return new Intl.DateTimeFormat('en', {
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
	return new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: '2-digit',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(date))
}

export function formatList(list: Array<string>) {
	return new Intl.ListFormat('en').format(list)
}

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

export function userRoleLookup(role: UserRole) {
	return {
		[UserRole.ADMIN]: 'Admin',
		[UserRole.FACULTY]: 'Faculty',
		[UserRole.STUDENT]: 'Student',
	}[role]
}

export function combineDateAndTime(date: string, time: string) {
	const dateTimeString = date + ' ' + time + ':00'
	return new Date(dateTimeString)
}

export const setFixedDate = (date: Date) => {
	const fixedDate = new Date('2000-01-01T00:00:00Z')
	return new Date(
		fixedDate.getFullYear(),
		fixedDate.getMonth(),
		fixedDate.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds()
	)
}
