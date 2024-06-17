import type {LoaderFunction} from '@remix-run/node'
import {redirect} from '@remix-run/node'
import {Outlet} from '@remix-run/react'
import appConfig from 'app.config'
import {getUser} from '~/session.server'

export const loader: LoaderFunction = async ({request}) => {
	const user = await getUser(request)
	if (user) return redirect('/')

	return null
}

export default function AuthLayout() {
	return (
		<>
			<div className="relative flex min-h-full">
				<div className="absolute inset-0">
					<img
						src={appConfig.banner}
						alt={appConfig.name}
						className="h-full w-full object-cover opacity-70"
					/>
				</div>

				<div className="relative flex w-full items-center justify-center">
					<div className="mx-auto w-full max-w-md place-items-center rounded-lg border bg-white/90 px-6 py-6">
						<Outlet />
					</div>
				</div>
			</div>
		</>
	)
}
