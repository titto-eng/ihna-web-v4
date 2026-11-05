import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/alumni/AuthShell'
import { ResetPasswordForm } from '@/components/alumni/ResetPasswordForm'

// `?token=` comes from the email Payload sent. The token stays in this page's URL only; it is posted to /api/alumni/reset-password/.
export const metadata: Metadata = { title: 'Choose a new alumni password', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function AlumniResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const valid = typeof token === 'string' && /^[A-Za-z0-9]{20,128}$/.test(token)
  return (
    <AuthShell title="Choose a new password" intro="Pick a password you do not use anywhere else.">
      {valid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="grid gap-4">
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">This reset link is missing or incomplete.</p>
          <Link href="/alumni/forgot-password/" className="text-sm font-semibold text-primary-strong underline underline-offset-4">Request a new link</Link>
        </div>
      )}
    </AuthShell>
  )
}
