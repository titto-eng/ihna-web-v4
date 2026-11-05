'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { alumniApi, genericError } from './api'
import { FormError, FormNotice } from './FormError'

const schema = z.object({ email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.') })
type Values = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  async function onSubmit(values: Values) {
    setError(null)
    const r = await alumniApi('forgot-password/', { body: { email: values.email } })
    // Payload answers 200 whether or not the account exists; the page says the same thing either way.
    if (r.ok) setSent(true)
    else setError(genericError(r))
  }

  if (sent) {
    return (
      <div className="grid gap-5">
        <FormNotice>If an alumni account exists for that email address, we have sent a link to choose a new password. It expires in one hour.</FormNotice>
        <Link href="/alumni/login/" className="text-sm font-semibold text-primary-strong underline underline-offset-4">Back to sign in</Link>
      </div>
    )
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Reset your password">
        <FormError>{error}</FormError>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" inputMode="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Sending…' : 'Email me a reset link'}</Button>
        <Link href="/alumni/login/" className="text-sm font-semibold text-primary-strong underline underline-offset-4">Back to sign in</Link>
      </form>
    </Form>
  )
}
