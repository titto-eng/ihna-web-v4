import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/alumni/AuthShell'
import { EnquiryFormClient } from '@/components/forms/EnquiryFormClient'
import { getFormView } from '@/lib/enquiries/formView'
import { site } from '@/content/site'

// No self-registration (open question in DECISIONS / 90-security §10): accounts are imported or invited by the alumni team.
// This page explains that and carries the `alumni-signup` enquiry form, which reaches the team through the normal enquiry pipeline.
export const metadata: Metadata = { title: 'Request alumni access', robots: { index: false, follow: false } }

export default async function AlumniRegisterPage() {
  const view = await getFormView('alumni-signup')
  return (
    <AuthShell title="Request alumni access" intro={`${site.shortName} alumni accounts are created by our team, so we can confirm you graduated. Tell us who you are and we will send an invitation to set a password.`}>
      <div className="grid gap-6">
        {view ? (
          <EnquiryFormClient def={view.def} campuses={view.campuses} courses={view.courses} layout="sidebar" />
        ) : (
          <p className="text-sm text-muted-foreground">
            Our request form is unavailable right now. Please{' '}
            <Link href="/contact/" className="font-semibold text-primary-strong underline underline-offset-4">contact us</Link>.
          </p>
        )}
        <p className="text-sm">
          Already have an account? <Link href="/alumni/login/" className="font-semibold text-primary-strong underline underline-offset-4">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  )
}
