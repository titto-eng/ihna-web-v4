import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import { rateLimit, resetRateLimit } from '@/lib/enquiries/rateLimit'
import { computeThankYou, isLocalPath } from '@/lib/enquiries/thankYou'
import type { FormDef } from '@/lib/enquiries/types'
import { boot, nonce } from './helpers'

const def = (over: Partial<FormDef> = {}): FormDef => ({ key: 'quick-enquiry', fields: [], destinations: [], thankYou: { type: 'path', path: '/thanks/' }, ...over })
const base = { data: {}, landing: null, course: null, campus: null, campaignCode: null, siteHost: 'ihm.edu.au' }

describe('computeThankYou (DEC-4, DEC-18): always server-side', () => {
  it('landing page thankYouPath wins and keeps ?campaign=', () => {
    expect(computeThankYou({ ...base, def: def(), landing: { path: '/lp/x/', thankYouPath: '/lp/x/thanks.php' }, campaignCode: 'zmniywrz' })).toBe('/lp/x/thanks.php?campaign=zmniywrz')
  })
  it('a brochure request on a landing page adds intent=brochure (the ThankYou view shows its BrochureDownload block)', () => {
    const landing = { path: '/lp/x/', thankYouPath: '/lp/x/thanks.php' }
    expect(computeThankYou({ ...base, def: def({ key: 'lp-admissions' }), landing, data: { formType: 'brochure' }, campaignCode: 'zmniywrz' })).toBe('/lp/x/thanks.php?campaign=zmniywrz&intent=brochure')
    expect(computeThankYou({ ...base, def: def({ key: 'quick-enquiry' }), landing, data: { intent: 'brochure' } })).toBe('/lp/x/thanks.php?intent=brochure')
    expect(computeThankYou({ ...base, def: def({ key: 'lp-portal' }), landing })).toBe('/lp/x/thanks.php')
  })
  it('refuses a landing target that is not a local path', () => {
    expect(computeThankYou({ ...base, def: def({ key: 'lp-portal' }), landing: { path: '/lp/x/', thankYouPath: 'https://evil.test/' } })).toBe('/thanks/')
  })
  it('quick-enquiry adds the GTM query', () => {
    expect(computeThankYou({ ...base, def: def(), course: { id: 9, title: 'GCAN', khId: 72 }, campus: { id: 3, name: 'Rosanna' }, campaignCode: 'z29vz2fkcw' })).toBe('/thanks/?course_id=72&campaign_id=z29vz2fkcw&campus=3')
  })
  it('events -> /thanks-events/', () => expect(computeThankYou({ ...base, def: def({ key: 'event-registration', thankYou: { type: 'path', path: '/thanks-events/' } }) })).toBe('/thanks-events/'))
  it('brochure -> the course brochure on our host, else the form path', () => {
    const d = def({ key: 'course-brochure', thankYou: { type: 'brochure' } })
    expect(computeThankYou({ ...base, def: d, course: { id: 1, title: 'x', brochureUrl: 'https://ihm.edu.au/pdf/gcan.pdf' } })).toBe('/pdf/gcan.pdf')
    expect(computeThankYou({ ...base, def: d, course: { id: 1, title: 'x', brochureUrl: 'https://evil.test/gcan.pdf' } })).toBe('/thanks/')
    expect(computeThankYou({ ...base, def: d })).toBe('/thanks/')
  })
  it('whatsapp -> api.whatsapp.com with a course-only prefill', () => {
    const url = computeThankYou({ ...base, def: def({ key: 'whatsapp', thankYou: { type: 'whatsapp' } }), course: { id: 1, title: 'Master of Nursing' }, whatsappNumber: '+61 400 000 000', data: { email: 'a@b.test', phone: '0411' } })!
    expect(url.startsWith('https://api.whatsapp.com/send?phone=61400000000&text=')).toBe(true)
    expect(decodeURIComponent(url)).toContain('Master of Nursing')
    expect(decodeURIComponent(url)).not.toContain('a@b.test')
  })
  it('inline -> null', () => expect(computeThankYou({ ...base, def: def({ thankYou: { type: 'inline' } }) })).toBeNull())
  it('isLocalPath', () => {
    expect(['/a/', '/a/?x=1'].every(isLocalPath)).toBe(true)
    expect(['//evil.test', 'https://x', 'javascript:alert(1)', '/a\\b', ''].some(isLocalPath)).toBe(false)
  })
})

describe('rate limit stores', () => {
  let payload: Payload
  beforeAll(async () => { payload = await boot() })

  it('memory: 10 per window, then blocked, keyed by IP and formKey', async () => {
    resetRateLimit()
    const ip = `m-${nonce()}`
    const results = []
    for (let i = 0; i < 11; i++) results.push((await rateLimit(payload, ip, 'f', { store: 'memory', now: 1_000 })).allowed)
    expect(results.slice(0, 10).every(Boolean)).toBe(true)
    expect(results[10]).toBe(false)
    expect((await rateLimit(payload, ip, 'other', { store: 'memory', now: 1_000 })).allowed).toBe(true)
    expect((await rateLimit(payload, ip, 'f', { store: 'memory', now: 1_000 + 61_000 })).allowed).toBe(true) // next window
  })

  it('postgres: shared counter in enquiry_rate_limits (production store)', async () => {
    const ip = `pg-${nonce()}`
    const now = Date.now()
    const out = []
    for (let i = 0; i < 11; i++) out.push(await rateLimit(payload, ip, 'f', { store: 'postgres', now }))
    expect(out.slice(0, 10).every((r) => r.allowed)).toBe(true)
    expect(out[10]).toMatchObject({ allowed: false, count: 11 })
    expect(out[10].retryAfterSeconds).toBeGreaterThan(0)
    const pool = (payload.db as unknown as { pool: { query: (q: string, v?: unknown[]) => Promise<unknown> } }).pool
    // dev uses drizzle push, which would try to drop a table it does not know: leave nothing behind
    await pool.query('DROP TABLE IF EXISTS enquiry_rate_limits')
  })
})
