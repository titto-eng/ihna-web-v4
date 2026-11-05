import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { Cleanup, boot, cookieHeaders, errorOf, ipFor, loginAlumnus, newAlumnus, nonce, rest } from './helpers'
import { alumniFromHeaders } from '@/lib/alumni/session'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'

let payload: Payload
const cleanup = new Cleanup()

beforeAll(async () => {
  payload = await boot()
})
afterAll(async () => {
  await cleanup.run(payload)
})

describe('POST /api/alumni/login/', () => {
  it('signs a verified alumnus in with an HttpOnly cookie and no token in the body', async () => {
    const a = await newAlumnus(payload, cleanup)
    const r = await loginAlumnus(a.email, a.password)
    expect(r.status).toBe(200)
    expect(r.body.token).toBeUndefined() // removeTokenFromResponses
    expect(r.token).toBeTruthy()
    const cookie = r.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
    expect(cookie).not.toMatch(/Domain=/i) // host-only
    // the dashboard's session read sees this alumnus, as an alumni user
    const user = await alumniFromHeaders(payload, cookieHeaders(r.token))
    expect(user?.id).toBe(a.doc.id)
    expect(user?.collection).toBe('alumni')
  })

  it('rejects a wrong password and an unknown email with the same 401 (no account enumeration)', async () => {
    const a = await newAlumnus(payload, cleanup)
    const wrong = await loginAlumnus(a.email, 'not-the-password')
    const unknown = await loginAlumnus(`nobody-${nonce()}@example.test`, 'not-the-password')
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(errorOf(wrong)).toBe(errorOf(unknown))
    expect(wrong.token).toBeUndefined()
  })

  it('refuses an unverified account until it is verified', async () => {
    const a = await newAlumnus(payload, cleanup, false)
    const r = await loginAlumnus(a.email, a.password)
    expect(r.status).toBe(403) // Payload's UnverifiedEmail
    expect(errorOf(r)).toMatch(/verify/i)
    expect(r.token).toBeUndefined()
  })

  it('locks the account after 5 failed attempts: even the right password is refused', async () => {
    const a = await newAlumnus(payload, cleanup)
    for (let i = 0; i < 5; i++) expect((await loginAlumnus(a.email, `wrong-${i}`)).status).toBe(401)
    const r = await loginAlumnus(a.email, a.password)
    expect(r.status).toBe(401)
    expect(errorOf(r)).toMatch(/locked/i)
    expect(r.token).toBeUndefined()
  })

  it('a staff login is not an alumni login: staff credentials do not work on the alumni endpoint', async () => {
    const tag = nonce()
    const staff = await payload.create({ collection: 'users', data: { email: `t-${tag}-staff@example.test`, password: `Pw-${tag}-staff-0123456789`, roles: ['admin'] }, overrideAccess: true })
    cleanup.track('users', staff.id)
    const r = await loginAlumnus(staff.email, `Pw-${tag}-staff-0123456789`)
    expect(r.status).toBe(401)
    expect(r.token).toBeUndefined()
  })

  it('rate limits to 10 per minute per IP: the 11th is 429 with Retry-After', async () => {
    resetRateLimit()
    const ip = ipFor()
    for (let i = 0; i < 10; i++) expect((await loginAlumnus(`x${i}-${nonce()}@example.test`, 'nope', ip)).status).toBe(401)
    const r = await loginAlumnus(`x-${nonce()}@example.test`, 'nope', ip)
    expect(r.status).toBe(429)
    expect(Number(r.headers.get('retry-after'))).toBeGreaterThan(0)
    // another client address is unaffected
    expect((await loginAlumnus(`y-${nonce()}@example.test`, 'nope', ipFor())).status).toBe(401)
  })
})

describe('sessions', () => {
  it('a staff session is not an alumni session (the dashboard treats it as signed out)', async () => {
    const tag = nonce()
    const email = `t-${tag}-staff2@example.test`
    const password = `Pw-${tag}-staff-0123456789`
    const staff = await payload.create({ collection: 'users', data: { email, password, roles: ['viewer'] }, overrideAccess: true })
    cleanup.track('users', staff.id)
    const { token } = await rest('POST', 'users/login/', { body: { email, password } })
    expect(token).toBeTruthy()
    expect((await payload.auth({ headers: cookieHeaders(token) })).user?.collection).toBe('users') // a real session...
    expect(await alumniFromHeaders(payload, cookieHeaders(token))).toBeNull() // ...that the alumni pages do not accept
    expect(await alumniFromHeaders(payload, new Headers())).toBeNull()
  })

  it('admin panel access is denied to alumni', () => {
    expect(payload.collections.alumni.config.access.admin?.({ req: {} as never })).toBe(false)
  })

  it('auth settings match 90-security §4', () => {
    const auth = payload.collections.alumni.config.auth
    expect(auth.tokenExpiration).toBe(12 * 60 * 60)
    expect(auth.maxLoginAttempts).toBe(5)
    expect(auth.lockTime).toBe(15 * 60 * 1000)
    expect(auth.verify).toBeTruthy()
    expect(auth.removeTokenFromResponses).toBe(true)
    expect(auth.forgotPassword?.expiration).toBe(60 * 60 * 1000)
    expect((auth.cookies as { sameSite?: string }).sameSite).toBe('Lax')
  })
})
