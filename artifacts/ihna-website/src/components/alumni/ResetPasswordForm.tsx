'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { passwordProblem } from '@/lib/alumni/password'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { alumniApi, genericError } from './api'
import { FormError } from './FormError'

const schema = z
  .object({ password: z.string(), confirm: z.string() })
  .superRefine((v, ctx) => {
    const problem = passwordProblem(v.password)
    if (problem) ctx.addIssue({ code: 'custom', path: ['password'], message: problem })
    if (v.confirm !== v.password) ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'The two passwords do not match.' })
  })
type Values = z.infer<typeof schema>

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: '', confirm: '' } })

  async function onSubmit(values: Values) {
    setError(null)
    const r = await alumniApi('reset-password/', { body: { token, password: values.password } })
    if (r.ok) {
      // Payload signs the alumnus in on a successful reset (HttpOnly cookie).
      router.replace('/alumni/dashboard/')
      router.refresh()
      return
    }
    if (r.status === 403) setExpired(true)
    else if (r.status === 400 && r.message) setError(r.message)
    else setError(genericError(r))
  }

  if (expired) {
    return (
      <div className="grid gap-5">
        <FormError>This reset link has expired or has already been used.</FormError>
        <Link href="/alumni/forgot-password/" className="text-sm font-semibold text-primary-strong underline underline-offset-4">Request a new link</Link>
      </div>
    )
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Choose a new password">
        <FormError>{error}</FormError>
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>New password</FormLabel>
            <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
            <FormDescription>12 to 128 characters. Avoid common passwords and your email address.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirm" render={({ field }) => (
          <FormItem><FormLabel>Confirm new password</FormLabel><FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving…' : 'Set password and sign in'}</Button>
      </form>
    </Form>
  )
}
