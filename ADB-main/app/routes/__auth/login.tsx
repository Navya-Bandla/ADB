import { Anchor, Button, PasswordInput, Select, TextInput } from '@mantine/core'
import { UserRole } from '@prisma/client'
import type { ActionFunction } from '@remix-run/node'
import { Link, useFetcher, useSearchParams } from '@remix-run/react'
import { z } from 'zod'
import { verifyLogin } from '~/lib/user.server'
import { createUserSession } from '~/session.server'
import { userRoleLookup } from '~/utils/misc'
import { badRequest, safeRedirect } from '~/utils/misc.server'
import type { inferErrors } from '~/utils/validation'
import { validateAction } from '~/utils/validation'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  redirectTo: z.string().default('/'),
})

interface ActionData {
  fieldErrors?: inferErrors<typeof LoginSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fieldErrors, fields } = await validateAction(request, LoginSchema)

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors })
  }

  const { email, password, redirectTo, role } = fields

  const user = await verifyLogin({ email, password, role })

  if (!user) {
    return badRequest<ActionData>({
      fieldErrors: {
        password: 'Invalid username or password',
      },
    })
  }

  return createUserSession({
    request,
    userId: user.id,
    role,
    redirectTo: safeRedirect(redirectTo),
  })
}

export default function Login() {
  const [searchParams] = useSearchParams()

  const fetcher = useFetcher<ActionData>()
  const actionData = fetcher.data

  const redirectTo = searchParams.get('redirectTo') || '/'
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <>
      <div>
        <h2 className="text-gray-1000 mt-6 text-3xl font-extrabold">Sign in</h2>
        <p className="mt-2 text-sm text-gray-600">
          Do not have an account yet{' '}
          <Anchor component={Link} to="/register" size="sm" prefetch="intent" color="grape">
            Create account
          </Anchor>
        </p>
      </div>

      <fetcher.Form method="post" replace className="mt-8">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
          <TextInput name="email" type="email" autoComplete="email" label="Email address" error={actionData?.fieldErrors?.email} required />

          <PasswordInput name="password" label="Password" error={actionData?.fieldErrors?.password} autoComplete="current-password" required />

          <Select
            label="Role"
            placeholder="Pick one"
            name="role"
            color="grape"
            mb={12}
            data={Object.values(UserRole).map((role) => ({
              label: userRoleLookup(role),
              value: role,
            }))}
            required
          />

          <Button type="submit" loading={isSubmitting} fullWidth loaderPosition="right" mt="1rem" color="grape">
            Sign in
          </Button>
        </fieldset>
      </fetcher.Form>
    </>
  )
}
