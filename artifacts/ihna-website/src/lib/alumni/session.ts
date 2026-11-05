import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { Alumnus } from '@/payload-types'

// Session helpers for the /alumni/* server components (plan §7). The session is Payload's own HttpOnly cookie;
// `payload.auth({ headers })` reads it. Payload uses one cookie name for every auth collection, so a staff session
// can arrive here: it is not an alumni session, and it is never treated as one.

export const LOGIN_PATH = '/alumni/login/'
export const DASHBOARD_PATH = '/alumni/dashboard/'

export type AlumniUser = Alumnus & { collection: 'alumni' }

/** The alumni user behind these request headers, or null (no cookie, expired token, or a staff session). */
export async function alumniFromHeaders(payload: Payload, headers: Headers): Promise<AlumniUser | null> {
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== 'alumni') return null
  return user as AlumniUser
}

export async function getAlumniSession(): Promise<{ payload: Payload; user: AlumniUser | null }> {
  const payload = await getPayload({ config })
  return { payload, user: await alumniFromHeaders(payload, await nextHeaders()) }
}

/** Only same-site /alumni/ paths may be a `next` target (no open redirect). */
export function safeNext(value: unknown): string | null {
  if (typeof value !== 'string') return null
  return /^\/alumni\/[A-Za-z0-9\-/]*$/.test(value) && !value.includes('//') ? value : null
}

/** For a protected page: the alumni user, or a redirect to the login page that remembers where they were going. */
export async function requireAlumni(here: string = DASHBOARD_PATH): Promise<{ payload: Payload; user: AlumniUser }> {
  const { payload, user } = await getAlumniSession()
  if (!user) redirect(`${LOGIN_PATH}?next=${encodeURIComponent(here)}`)
  return { payload, user }
}

/** For the login-type pages: already signed in means go to the dashboard. */
export async function redirectIfSignedIn(next?: string | null): Promise<void> {
  const { user } = await getAlumniSession()
  if (user) redirect(safeNext(next) ?? DASHBOARD_PATH)
}
