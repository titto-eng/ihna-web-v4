import type { Metadata } from 'next'
import { AuthShell } from '@/components/alumni/AuthShell'
import { ForgotPasswordForm } from '@/components/alumni/ForgotPasswordForm'

// Payload forgot-password flow: POST /api/alumni/forgot-password/ sends the email through the configured adapter (Mailpit in dev).
export const metadata: Metadata = { title: 'Reset your alumni password', robots: { index: false, follow: false } }

export default function AlumniForgotPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" intro="Enter the email address on your alumni account and we will send you a link to choose a new one.">
      <ForgotPasswordForm />
    </AuthShell>
  )
}
