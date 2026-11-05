import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { Cleanup, boot, cookieHeaders, errorOf, ipFor, loginAlumnus, mailCount, mailTo, newAlumnus, nonce, rest, strongPassword, tokenFromMail } from './helpers'
import { alumniFromHeaders } from '@/lib/alumni/session'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'
import { site } from '@/content/site'

// Real email path: Payload sends through the configured adapter (SMTP -> Mailpit on :1025); the token is read back from Mailpit's API.
let payload: Payload
const cleanup = new Cleanup()

beforeAll(async () => {
  payload = await boot()
})
afterAll(async () => {
  await cleanup.run(payload)
})

describe('forgot password -> reset', () => {
  it('emails a link, the token resets the password and signs the alumnus in; the token works once', async () => {
    const a = await newAlumnus(payload, cleanup)
    const forgot = await rest('POST', 'alumni/forgot-password/', { body: { email: a.email } })
    expect(forgot.status).toBe(200)

    const html = await mailTo(a.email, `Reset your ${site.shortName} alumni password`)
    expect(html).toContain('/alumni/reset-password/?token=')
    const token = tokenFromMail(html)

    // policy: too short, then common, are refused and do not spend the token
    expect((await rest('POST', 'alumni/reset-password/', { body: { token, password: 'short' } })).status).toBe(400)
    const common = await rest('POST', 'alumni/reset-password/', { body: { token, password: 'Password123456' } })
    expect(common.status).toBe(400)
    expect(errorOf(common)).toMatch(/common/i)

    const next = strongPassword()
    const reset = await rest('POST', 'alumni/reset-password/', { body: { token, password: next } })
    expect(reset.status).toBe(200)
    expect(reset.body.token).toBeUndefined() // removeTokenFromResponses
    expect((await alumniFromHeaders(payload, cookieHeaders(reset.token)))?.id).toBe(a.doc.id) // signed in by the reset

    expect((await loginAlumnus(a.email, next)).status).toBe(200)
    expect((await loginAlumnus(a.email, a.password)).status).toBe(401) // old password gone

    const again = await rest('POST', 'alumni/reset-password/', { body: { token, password: strongPassword() } })
    expect(again.status).toBe(403) // spent
  })

  it('an unknown email gets the same 200 and no email (no account enumeration)', async () => {
    const email = `nobody-${nonce()}@example.test`
    const r = await rest('POST', 'alumni/forgot-password/', { body: { email } })
    expect(r.status).toBe(200)
    await new Promise((res) => setTimeout(res, 800))
    expect(await mailCount(email)).toBe(0)
  })

  it('a reset also clears a lockout', async () => {
    const a = await newAlumnus(payload, cleanup)
    for (let i = 0; i < 5; i++) await loginAlumnus(a.email, `wrong-${i}`)
    expect((await loginAlumnus(a.email, a.password)).status).toBe(401)
    await rest('POST', 'alumni/forgot-password/', { body: { email: a.email } })
    const token = tokenFromMail(await mailTo(a.email, `Reset your ${site.shortName} alumni password`))
    const next = strongPassword()
    expect((await rest('POST', 'alumni/reset-password/', { body: { token, password: next } })).status).toBe(200)
    expect((await loginAlumnus(a.email, next)).status).toBe(200)
  })

  it('forgot-password is limited to 10/min per IP and 3/hour per email (429 + Retry-After)', async () => {
    resetRateLimit()
    const ip = ipFor()
    for (let i = 0; i < 10; i++) expect((await rest('POST', 'alumni/forgot-password/', { body: { email: `n${i}-${nonce()}@example.test` }, ip })).status).toBe(200)
    const limited = await rest('POST', 'alumni/forgot-password/', { body: { email: `n-${nonce()}@example.test` }, ip })
    expect(limited.status).toBe(429)
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)

    const same = `same-${nonce()}@example.test`
    for (let i = 0; i < 3; i++) expect((await rest('POST', 'alumni/forgot-password/', { body: { email: same } })).status).toBe(200)
    expect((await rest('POST', 'alumni/forgot-password/', { body: { email: same } })).status).toBe(429)
  })
})

describe('verify email', () => {
  it('login is refused until the emailed link is used; the link works once', async () => {
    const tag = nonce()
    const email = `t-${tag}-verify@example.test`
    const password = strongPassword()
    const doc = await payload.create({ collection: 'alumni', data: { email, password, firstName: 'Verify', lastName: 'Me' }, overrideAccess: true }) // sends the verification email
    cleanup.track('alumni', doc.id)

    expect((await loginAlumnus(email, password)).status).toBe(403)
    const html = await mailTo(email, `Verify your ${site.shortName} alumni account`)
    expect(html).toContain('/alumni/verify/?token=')
    const token = tokenFromMail(html)

    expect((await rest('POST', `alumni/verify/${token}/`)).status).toBe(200)
    expect((await loginAlumnus(email, password)).status).toBe(200)
    expect((await rest('POST', `alumni/verify/${token}/`)).status).toBeGreaterThanOrEqual(400) // spent
  })
})
