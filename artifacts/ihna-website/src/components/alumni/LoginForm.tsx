'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { alumniApi, genericError } from './api'
import { FormError } from './FormError'

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})
type Values = z.infer<typeof schema>

export const LOCKED_MESSAGE = 'Your account is locked for 15 minutes after too many failed sign-in attempts. Try again later, or reset your password to unlock it now.'
const UNVERIFIED_MESSAGE = 'Confirm your email address first: we sent you a verification link when your account was created.'
const BAD_CREDENTIALS = 'That email and password do not match.'

export function LoginForm({ next }: { next?: string | null }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  async function onSubmit(values: Values) {
    setError(null)
    const r = await alumniApi('login/', { body: { email: values.email, password: values.password } })
    if (r.ok) {
      router.replace(next || '/alumni/dashboard/')
      router.refresh()
      return
    }
    if (r.status === 401 && /locked/i.test(r.message)) setError(LOCKED_MESSAGE)
    else if ((r.status === 401 || r.status === 403) && /verify/i.test(r.message)) setError(UNVERIFIED_MESSAGE)
    else if (r.status === 401 || r.status === 400) setError(BAD_CREDENTIALS)
    else setError(genericError(r))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Alumni sign in">
        <FormError>{error}</FormError>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="username" inputMode="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
        <div className="flex flex-wrap justify-between gap-3 text-sm">
          <Link href="/alumni/forgot-password/" className="font-semibold text-primary-strong underline underline-offset-4">Forgot your password?</Link>
          <Link href="/alumni/register/" className="font-semibold text-primary-strong underline underline-offset-4">Request access</Link>
        </div>
      </form>
    </Form>
  )
}
