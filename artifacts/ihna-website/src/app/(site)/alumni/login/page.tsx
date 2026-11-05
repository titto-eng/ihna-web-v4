import type { Metadata } from 'next'
import { AuthShell } from '@/components/alumni/AuthShell'
import { LoginForm } from '@/components/alumni/LoginForm'
import { redirectIfSignedIn, safeNext } from '@/lib/alumni/session'

// Alumni sign-in (plan §7, D10): Payload's own auth over /api/alumni/login/. It replaces the old OTP flow, which leaked the
// OTP to the browser; that flow is NOT ported. Accounts are imported or invited (no self-registration, see /alumni/register/).
export const metadata: Metadata = { title: 'Alumni sign in', robots: { index: false, follow: false } }

export default async function AlumniLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next } = await searchParams
  await redirectIfSignedIn(next)
  return (
    <AuthShell title="Welcome back" intro="Sign in to see your alumni profile and keep your details up to date.">
      <LoginForm next={safeNext(next)} />
    </AuthShell>
  )
}
