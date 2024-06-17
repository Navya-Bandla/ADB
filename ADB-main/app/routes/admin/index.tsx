import { UserIcon } from '@heroicons/react/24/outline'
import { BookOpenIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link } from '@remix-run/react'
import clsx from 'clsx'
import { TailwindContainer } from '~/components/TailwindContainer'
import { requireUserId } from '~/session.server'

const actions = [
  {
    title: 'Course',
    description: 'View and manage courses',
    href: 'course',
    icon: BookOpenIcon,
  },
  {
    title: 'Rooms',
    description: 'View and manage rooms',
    href: 'room',
    icon: BuildingOfficeIcon,
  },
  {
    title: 'Faculty',
    description: 'View and manage faculty',
    href: 'faculty',
    icon: UserIcon,
  },
  {
    title: 'Sections',
    description: 'View and manage sections',
    href: 'sections',
    icon: BuildingOfficeIcon,
  },
  {
    title: 'Students',
    description: 'View and manage students',
    href: 'students',
    icon: UserIcon,
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)
  return json({})
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <TailwindContainer>
          <div className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="flex items-center justify-center py-1 text-center text-2xl font-extrabold tracking-tight text-gray-800">Admin Dashboard</h2>
            <div className="mt-12 text-center text-gray-800 sm:grid sm:grid-cols-1 sm:gap-4">
              {actions.map((action) => (
                <Card action={action} key={action.href} />
              ))}
            </div>
          </div>
        </TailwindContainer>
      </div>
    </div>
  )
}

function Card({ action }: { action: typeof actions[number] }) {
  return (
    <div key={action.title} className={clsx('group relative rounded border bg-gray-100 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500')}>
      <div>
        <h3 className="text-lg font-medium">
          <Link to={action.href} className="focus:outline-none">
            {/* Extend touch target to entire panel */}
            <span className="absolute inset-0" aria-hidden="true" />
            {action.title}
          </Link>
        </h3>
        <p className="mt-2 text-center text-sm text-gray-500">{action.description}</p>
      </div>
      <span className="pointer-events-none absolute top-6 right-6 text-violet-300 group-hover:text-violet-400" aria-hidden="true">
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
        </svg>
      </span>
    </div>
  )
}
