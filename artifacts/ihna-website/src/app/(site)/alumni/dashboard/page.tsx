import type { Metadata } from 'next'
import Link from 'next/link'
import { ProfileForm } from '@/components/alumni/ProfileForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { requireAlumni } from '@/lib/alumni/session'
import { site } from '@/content/site'

// Alumni dashboard (plan §7). Server component: reads the Payload session with `payload.auth({ headers })` and redirects to
// /alumni/login/ when there is none (or when the session belongs to staff). Shows the alumnus's own document only.
export const metadata: Metadata = { title: 'Your alumni profile', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AlumniDashboardPage() {
  const { user } = await requireAlumni('/alumni/dashboard/')
  const since = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' }) : null

  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/15">
      <div className="mx-auto w-full max-w-site px-5 py-12 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-primary-strong">{site.shortName} Alumni</p>
            <h1 className="display mt-3 text-4xl md:text-5xl">Hello, {user.firstName}</h1>
          </div>
          <form method="post" action="/alumni/logout/">
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <Card className="gap-0 py-0">
            <CardContent className="p-6 md:p-8">
              <h2 className="display text-2xl md:text-3xl">Your profile</h2>
              <div className="mt-6">
                <ProfileForm
                  profile={{
                    id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
                    graduationYear: user.graduationYear ?? null, course: user.course ?? '', marketingConsent: Boolean(user.marketingConsent),
                  }}
                />
              </div>
            </CardContent>
          </Card>
          <div className="grid content-start gap-6">
            <Card className="gap-0 py-0">
              <CardContent className="space-y-2 p-6 md:p-8">
                <h2 className="display text-2xl">Your account</h2>
                <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
                {since ? <p className="text-sm text-muted-foreground">Member since {since}</p> : null}
                <p className="pt-2 text-sm">
                  <Link href="/alumni/forgot-password/" className="font-semibold text-primary-strong underline underline-offset-4">Change your password</Link>
                </p>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0">
              <CardContent className="space-y-2 p-6 md:p-8">
                <h2 className="display text-2xl">Alumni community</h2>
                <p className="text-sm text-muted-foreground">Read alumni news, events and stories.</p>
                <p className="pt-2 text-sm">
                  <Link href="/alumni/" className="font-semibold text-primary-strong underline underline-offset-4">Alumni hub</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
