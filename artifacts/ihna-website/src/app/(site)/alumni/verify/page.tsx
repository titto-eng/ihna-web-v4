import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/alumni/AuthShell'
import { VerifyConfirm } from '@/components/alumni/VerifyConfirm'
import { site } from '@/content/site'

// `?token=` comes from Payload's verification email. The page only renders a button; the POST to /api/alumni/verify/:token/
// happens on click, so a mail scanner opening the link cannot verify (or burn) the token.
export const metadata: Metadata = { title: 'Confirm your alumni email', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function AlumniVerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const valid = typeof token === 'string' && /^[A-Za-z0-9]{20,128}$/.test(token)
  return (
    <AuthShell title="Confirm your email" intro={`One more step to finish setting up your ${site.shortName} alumni account.`}>
      {valid ? (
        <VerifyConfirm token={token} />
      ) : (
        <div className="grid gap-4">
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">This verification link is missing or incomplete.</p>
          <Link href="/alumni/login/" className="text-sm font-semibold text-primary-strong underline underline-offset-4">Back to sign in</Link>
        </div>
      )}
    </AuthShell>
  )
}
