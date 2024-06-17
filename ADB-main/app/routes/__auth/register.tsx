import { Anchor, Button, PasswordInput, TextInput } from '@mantine/core'
import { UserRole } from '@prisma/client'
import type { ActionFunction } from '@remix-run/node'
import { Form, Link, useActionData, useTransition } from '@remix-run/react'
import { createUser, getUserByEmail } from '~/lib/user.server'
import { RegisterUserSchema } from '~/lib/zod.schema'
import { createUserSession } from '~/session.server'
import { badRequest } from '~/utils/misc.server'
import type { inferErrors } from '~/utils/validation'
import { validateAction } from '~/utils/validation'

interface ActionData {
  fieldErrors?: inferErrors<typeof RegisterUserSchema>
}

export const action: ActionFunction = async ({ request }) => {
  const { fieldErrors, fields } = await validateAction(request, RegisterUserSchema)
  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors })
  }

  const { email, password, name } = fields

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return badRequest<ActionData>({
      fieldErrors: { email: 'A user already exists with this email' },
    })
  }

  const user = await createUser({
    email,
    password,
    name,
    role: UserRole.STUDENT,
  })
  return createUserSession({
    request,
    userId: user.id,
    role: UserRole.STUDENT,
    redirectTo: '/',
  })
}
export default function Register() {
  const transition = useTransition()
  const actionData = useActionData<ActionData>()
  const isSubmitting = transition.state !== 'idle'

  return (
    <>
      <div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Register</h2>
        <p className="mt-2 text-sm text-gray-600">
          Have an account already?{' '}
          <Anchor component={Link} to="/login" size="sm" prefetch="intent" color="grape">
            Sign in
          </Anchor>
        </p>
      </div>

      <Form replace method="post" className="mt-8">
        <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
          <TextInput name="name" autoComplete="given-name" label="Name" error={actionData?.fieldErrors?.name} required />

          <TextInput name="email" type="email" autoComplete="email" label="Email address" error={actionData?.fieldErrors?.email} required />

          <PasswordInput name="password" label="Password" error={actionData?.fieldErrors?.password} autoComplete="current-password" required />

          <PasswordInput name="confirmPassword" label="Confirm password" error={actionData?.fieldErrors?.password} autoComplete="current-password" required />

          <Button type="submit" loading={isSubmitting} fullWidth loaderPosition="right" mt="1rem" color="grape">
            Register
          </Button>
        </fieldset>
      </Form>
    </>
  )
}
