'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { alumniApi, genericError } from './api'
import { FormError, FormNotice } from './FormError'

// The alumnus's own editable fields (agreed list, see report): name, graduation year, course, marketing consent.
// Email changes go through staff (the collection ignores an alumnus's own email PATCH), passwords through "forgot password".
const schema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.').max(100),
  lastName: z.string().trim().min(1, 'Enter your last name.').max(100),
  graduationYear: z.string().trim().refine((v) => v === '' || (/^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= 2100), 'Enter a four-digit year, or leave blank.'),
  course: z.string().trim().max(200),
  marketingConsent: z.boolean(),
})
type Values = z.infer<typeof schema>

export type ProfileDefaults = { id: number | string; email: string; firstName: string; lastName: string; graduationYear: number | null; course: string; marketingConsent: boolean }

export function ProfileForm({ profile }: { profile: ProfileDefaults }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: profile.firstName, lastName: profile.lastName, graduationYear: profile.graduationYear ? String(profile.graduationYear) : '', course: profile.course, marketingConsent: profile.marketingConsent },
  })

  async function onSubmit(v: Values) {
    setError(null)
    setSaved(false)
    const r = await alumniApi(`${profile.id}/`, {
      method: 'PATCH',
      body: { firstName: v.firstName, lastName: v.lastName, graduationYear: v.graduationYear === '' ? null : Number(v.graduationYear), course: v.course, marketingConsent: v.marketingConsent },
    })
    if (r.ok) {
      setSaved(true)
      router.refresh()
    } else if (r.status === 401 || r.status === 403) setError('Your session has ended. Sign in again to save your changes.')
    else setError(genericError(r))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Your profile">
        <FormError>{error}</FormError>
        {saved ? <FormNotice>Your profile is saved.</FormNotice> : null}
        <FormItem>
          <FormLabel htmlFor="profile-email">Email</FormLabel>
          <Input id="profile-email" value={profile.email} readOnly aria-readonly="true" className="bg-muted" />
          <p className="text-sm text-muted-foreground">To change your email address, contact the alumni team.</p>
        </FormItem>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem><FormLabel>First name</FormLabel><FormControl><Input autoComplete="given-name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem><FormLabel>Last name</FormLabel><FormControl><Input autoComplete="family-name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="graduationYear" render={({ field }) => (
            <FormItem><FormLabel>Graduation year</FormLabel><FormControl><Input inputMode="numeric" maxLength={4} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="course" render={({ field }) => (
            <FormItem><FormLabel>Course</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="marketingConsent" render={({ field }) => (
          <FormItem className="flex items-start gap-3">
            <FormControl><Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} className="mt-1" /></FormControl>
            <div className="grid gap-1">
              <FormLabel>Send me alumni news and events</FormLabel>
              <FormDescription>You can change this at any time.</FormDescription>
            </div>
          </FormItem>
        )} />
        <div><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving…' : 'Save changes'}</Button></div>
      </form>
    </Form>
  )
}
