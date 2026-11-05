import { beforeEach, describe, expect, it, vi } from 'vitest'

// The dashboard page calls `requireAlumni`, which reads the request headers and redirects. next/headers and next/navigation need a
// Next request scope, so they are replaced here; the session read itself (`payload.auth`) is real.
let cookie = ''
vi.mock('next/headers', () => ({ headers: async () => new Headers(cookie ? { cookie, origin: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001' } : {}) }))
vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { to })
  },
}))

import { Cleanup, boot, loginAlumnus, newAlumnus } from './helpers'
import { requireAlumni, redirectIfSignedIn } from '@/lib/alumni/session'

const where = async (fn: () => Promise<unknown>): Promise<string | null> => {
  try {
    await fn()
    return null
  } catch (e) {
    return (e as { to?: string }).to ?? 'ERROR'
  }
}

beforeEach(() => {
  cookie = ''
})

describe('/alumni/dashboard/ session gate', () => {
  it('redirects to the login page, remembering the dashboard, when logged out', async () => {
    expect(await where(() => requireAlumni('/alumni/dashboard/'))).toBe('/alumni/login/?next=%2Falumni%2Fdashboard%2F')
  })

  it('redirects for a garbage cookie too', async () => {
    cookie = 'payload-token=not.a.jwt'
    expect(await where(() => requireAlumni())).toMatch(/^\/alumni\/login\//)
  })

  it('lets an alumni session through, and bounces the login page to the dashboard', async () => {
    const payload = await boot()
    const cleanup = new Cleanup()
    try {
      const a = await newAlumnus(payload, cleanup)
      const { token } = await loginAlumnus(a.email, a.password)
      cookie = `payload-token=${token}`
      const { user } = await requireAlumni()
      expect(user.id).toBe(a.doc.id)
      expect(await where(() => redirectIfSignedIn(null))).toBe('/alumni/dashboard/')
      expect(await where(() => redirectIfSignedIn('/alumni/dashboard/'))).toBe('/alumni/dashboard/')
      expect(await where(() => redirectIfSignedIn('https://evil.test/'))).toBe('/alumni/dashboard/')
    } finally {
      await cleanup.run(payload)
    }
  })
})
