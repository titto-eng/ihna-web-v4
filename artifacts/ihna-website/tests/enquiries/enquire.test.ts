import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleEnquire, type QueueFn } from '@/lib/enquiries/process'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'
import { resolveSourceId } from '@/lib/enquiries/campaign'
import { site } from '@/content/site'
import { boot, nonce, quickEnquiryBody, removeEnquiries, request, seed, uuid } from './helpers'

// The pipeline is tested against the ihm-v2.1 form definitions (every adapter and thank-you type), not the site's own registry.
vi.mock('@/content/forms', () => import('./fixtures/forms'))
// ...and ihm-web's site maps, so the shared pipeline is checked with IHM's configuration (IHNA's: tests/enquiries/ihna-*.test.ts).
vi.mock('@/content/campaign-codes', async () => (await import('./fixtures/site-ihm')).campaignCodesModule)
vi.mock('@/content/hubspot-map', async () => (await import('./fixtures/site-ihm')).hubspotModule)
vi.mock('@/content/dynamics-map', async () => (await import('./fixtures/site-ihm')).dynamicsModule)
vi.mock('@/content/course-crm', async () => (await import('./fixtures/site-ihm')).courseCrmModule)
vi.mock('@/content/enquiry-routing', () => ({ enquiryRouting: { recipientGroups: [], alertTo: [], defaultSourceId: 24 } }))

let payload: Payload
const created: string[] = []
const ip = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}-${nonce()}`

type Row = { id: number; status: string; formKey: string; honeypot?: boolean; captchaStatus?: string; email?: string; campaign?: number | { id: number } | null; campaignCode?: string | null; hutk?: string | null; utm?: Record<string, string | null>; deliveries?: { adapter: string; target: string; status: string; attempts: number }[]; data?: Record<string, unknown> }
const rowOf = async (submissionId: string) => (await payload.find({ collection: 'enquiries', where: { submissionId: { equals: submissionId } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Row | undefined

let queue: ReturnType<typeof vi.fn<QueueFn>>
const call = async (body: unknown, from = ip(), headers: Record<string, string> = {}) => {
  const b = body as { submissionId?: string }
  if (b?.submissionId) created.push(b.submissionId)
  return handleEnquire({ payload, ...request(body, from, headers) }, { queueDelivery: queue })
}

beforeAll(async () => {
  payload = await boot()
  await seed(payload)
})
beforeEach(() => {
  resetRateLimit()
  queue = vi.fn<QueueFn>().mockResolvedValue(undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.RECAPTCHA_SECRET_KEY
})
afterAll(async () => removeEnquiries(payload, created))

describe('POST /api/enquire pipeline', () => {
  it('validation failure -> 400 with fieldErrors and nothing stored', async () => {
    const body = quickEnquiryBody({}, { email: 'not-an-email', phone: 'abc', consent: false })
    const res = await call(body)
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ ok: false, error: 'validation' })
    expect(Object.keys(res.body.fieldErrors as object).sort()).toEqual(['consent', 'email', 'phone'])
    expect(await rowOf(body.submissionId)).toBeUndefined()
    expect(queue).not.toHaveBeenCalled()
  })

  it('unknown or malformed formKey -> 400 unknown_form; bad JSON -> 400; oversize -> 413', async () => {
    expect((await call({ ...quickEnquiryBody(), formKey: 'no-such-form' })).body).toMatchObject({ error: 'unknown_form' })
    expect((await call({ ...quickEnquiryBody(), formKey: '../etc' })).body).toMatchObject({ error: 'unknown_form' })
    expect((await call('{not json')).status).toBe(400)
    const big = await call({ ...quickEnquiryBody(), fields: { message: 'x'.repeat(40_000) } })
    expect(big.status).toBe(413)
  })

  it('INSERTs first, then queues deliverEnquiry, and answers with the server-computed thank-you', async () => {
    const body = quickEnquiryBody({ campaign: 'z29vz2fkcw', utm_source: 'google', gclid: 't1', hutk: 'abcdef123456', thankYouPath: 'https://evil.test/', next: 'https://evil.test/' })
    let rowAtQueueTime: Row | undefined
    queue.mockImplementation(async () => { rowAtQueueTime = await rowOf(body.submissionId) })
    const res = await call(body)
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.thankYouPath).toBe('/thanks/?campaign_id=z29vz2fkcw')
    expect(JSON.stringify(res.body)).not.toContain('evil.test')
    expect(queue).toHaveBeenCalledTimes(1)
    expect(rowAtQueueTime?.status).toBe('received') // the row existed when the queue was called
    const row = (await rowOf(body.submissionId))!
    expect(row).toMatchObject({ formKey: 'quick-enquiry', campaignCode: 'z29vz2fkcw', hutk: 'abcdef123456', captchaStatus: 'unverified' })
    expect(row.utm).toMatchObject({ utmSource: 'google', gclid: 't1' })
    expect(row.deliveries?.map((d) => `${d.adapter}:${d.target}:${d.status}`).sort()).toEqual(['email:marketing:pending', 'hubspot:contacts:pending', 'portalCrm:portal:pending'])
    expect(row.campaign ?? null).toBeNull() // DEC-41: only the raw code is kept
  })

  it('a failing INSERT -> 500 save_failed with a safe message and no queue call', async () => {
    vi.spyOn(payload, 'create').mockRejectedValueOnce(new Error('connection terminated: secret detail'))
    const body = quickEnquiryBody()
    const res = await call(body)
    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({ ok: false, error: 'save_failed' })
    expect(JSON.stringify(res.body)).not.toContain('secret detail')
    expect(res.body.thankYouPath).toBeUndefined()
    expect(queue).not.toHaveBeenCalled()
  })

  it('a queue failure never loses the saved row (rule 2)', async () => {
    queue.mockRejectedValueOnce(new Error('jobs down'))
    const body = quickEnquiryBody()
    const res = await call(body)
    expect(res.status).toBe(200)
    expect((await rowOf(body.submissionId))?.status).toBe('received')
  })

  it('is idempotent on submissionId: one row, one queue call, the same answer', async () => {
    const body = quickEnquiryBody()
    const from = ip()
    const a = await call(body, from)
    const b = await call(body, from)
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(b.body.enquiryId).toBe(a.body.enquiryId)
    expect(b.body.duplicate).toBe(true)
    expect(queue).toHaveBeenCalledTimes(1)
    const found = await payload.find({ collection: 'enquiries', where: { submissionId: { equals: body.submissionId } }, overrideAccess: true, limit: 5 })
    expect(found.totalDocs).toBe(1)
  })

  it('two concurrent posts of one submissionId still make one row', async () => {
    const body = quickEnquiryBody()
    const from = ip()
    const [a, b] = await Promise.all([call(body, from), call(body, from)])
    expect([a.status, b.status]).toEqual([200, 200])
    const found = await payload.find({ collection: 'enquiries', where: { submissionId: { equals: body.submissionId } }, overrideAccess: true, limit: 5 })
    expect(found.totalDocs).toBe(1)
  })

  it('honeypot filled -> stored as spam, no deliveries, no queue, an ordinary 200', async () => {
    const body = quickEnquiryBody({ _hp_url: 'http://spam.test' })
    const res = await call(body)
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    const row = (await rowOf(body.submissionId))!
    expect(row).toMatchObject({ status: 'spam', honeypot: true })
    expect(row.deliveries ?? []).toHaveLength(0)
    expect(row.email ?? null).toBeNull() // nothing from the bot's fields is kept
    expect(queue).not.toHaveBeenCalled()
  })

  it('agent-registration has a real `website` field: a JS submit with it is NOT spam; the honeypot is `_hp_url`', async () => {
    const fields = { orgName: 'Org', address: '1 St', country: 'India', email: `a-${nonce()}@example.test`, phone: '+91 98765 43210', website: 'https://agency.example.test', contact1Name: 'Ravi', contact1Email: 'ravi@example.test' }
    const ok = { formKey: 'agent-registration', submissionId: uuid(), fields, pageUrl: 'http://localhost:3000/agent-registration/', _hp_url: '' }
    expect((await call(ok)).status).toBe(200)
    const row = (await rowOf(ok.submissionId))!
    expect(row.status).toBe('received')
    expect(row.honeypot).toBe(false)
    expect(row.data?.website).toBe('https://agency.example.test')
    expect(row.deliveries?.map((d) => `${d.adapter}:${d.target}`).sort()).toEqual(['email:agents', 'email:autoresponder', 'portalStakeholder:ihm', 'portalStakeholder:ihna'])

    const bot = { ...ok, submissionId: uuid(), _hp_url: 'http://spam.test' }
    await call(bot)
    expect((await rowOf(bot.submissionId))?.status).toBe('spam')
  })

  it('no honeypot name collides with a real field of any seeded form', async () => {
    const { forms } = await import('@/content/forms')
    expect(forms.flatMap((s) => s.fields.map((f) => f.name))).not.toContain('_hp_url')
  })

  it('rate limit: the 11th request in a minute from one IP and formKey -> 429', async () => {
    const from = ip()
    for (let i = 0; i < 10; i++) {
      const r = await call({ ...quickEnquiryBody(), fields: {} }, from) // 400s still count
      expect(r.status).toBe(400)
    }
    const eleventh = await call(quickEnquiryBody(), from)
    expect(eleventh.status).toBe(429)
    expect(eleventh.body.error).toBe('rate_limited')
    expect(Number(eleventh.headers?.['Retry-After'])).toBeGreaterThan(0)
    // another IP and another formKey are not affected
    expect((await call(quickEnquiryBody(), ip())).status).toBe(200)
    expect((await call({ ...quickEnquiryBody(), formKey: 'newsletter', fields: { email: `n-${nonce()}@example.test` } }, from)).status).toBe(200)
  })

  describe('reCAPTCHA v3', () => {
    const google = (json: unknown | Error) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (!String(url).includes('google.com/recaptcha')) throw new Error(`unexpected fetch ${String(url)}`)
      if (json instanceof Error) throw json
      return new Response(JSON.stringify(json), { status: 200 })
    })

    it('no secret configured: allowed, captchaStatus unverified', async () => {
      const res = await call(quickEnquiryBody())
      expect(res.status).toBe(200)
      expect(queue).toHaveBeenCalled()
    })

    it('good score -> ok and delivered', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret'
      google({ success: true, score: 0.9, action: 'enquire', hostname: 'localhost' })
      const body = quickEnquiryBody({ captchaToken: 'tok' })
      expect((await call(body)).status).toBe(200)
      expect(await rowOf(body.submissionId)).toMatchObject({ status: 'received', captchaStatus: 'ok' })
      expect(queue).toHaveBeenCalled()
    })

    it('low score -> held: saved, held deliveries, nothing queued, visitor still sees success', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret'
      google({ success: true, score: 0.2, action: 'enquire', hostname: 'localhost' })
      const body = quickEnquiryBody({ captchaToken: 'tok' })
      expect((await call(body)).status).toBe(200)
      const row = (await rowOf(body.submissionId))!
      expect(row).toMatchObject({ status: 'held', captchaStatus: 'low' })
      expect(row.deliveries?.every((d) => d.status === 'held')).toBe(true)
      expect(queue).not.toHaveBeenCalled()
    })

    it('no token -> held (missing); siteverify outage -> unverified and delivered anyway', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret'
      const noToken = quickEnquiryBody()
      await call(noToken)
      expect(await rowOf(noToken.submissionId)).toMatchObject({ status: 'held', captchaStatus: 'missing' })

      google(new Error('timeout'))
      const outage = quickEnquiryBody({ captchaToken: 'tok' })
      await call(outage)
      expect(await rowOf(outage.submissionId)).toMatchObject({ status: 'received', captchaStatus: 'unverified' })
      expect(queue).toHaveBeenCalledTimes(1)
    })

    it('wrong action -> held', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'test-secret'
      google({ success: true, score: 0.99, action: 'login', hostname: 'localhost' })
      const body = quickEnquiryBody({ captchaToken: 'tok' })
      await call(body)
      expect(await rowOf(body.submissionId)).toMatchObject({ status: 'held', captchaStatus: 'low' })
    })
  })

  describe('campaign resolution (41 check 4)', () => {
    it('body code beats the cookie; an unknown valid code is stored raw; an invalid one is ignored', async () => {
      const cookie = `${site.attributionCookies.last}=${encodeURIComponent(JSON.stringify({ campaign: 'zmniywrz', utm_source: 'facebook' }))}`
      const a = quickEnquiryBody({ campaign: 'z29vz2fkcw' })
      await call(a, ip(), { cookie })
      expect(await rowOf(a.submissionId)).toMatchObject({ campaignCode: 'z29vz2fkcw' })

      const fromCookie = quickEnquiryBody()
      await call(fromCookie, ip(), { cookie })
      const row = (await rowOf(fromCookie.submissionId))!
      expect(row.campaignCode).toBe('zmniywrz')
      expect(row.utm?.utmSource).toBe('facebook')

      const unknown = quickEnquiryBody({ campaign: 'Unknown_Code_1' })
      await call(unknown)
      const u = (await rowOf(unknown.submissionId))!
      expect(u.campaignCode).toBe('Unknown_Code_1')
      expect(u.campaign ?? null).toBeNull()

      const bad = quickEnquiryBody({ campaign: '<script>alert(1)</script>' })
      await call(bad)
      expect((await rowOf(bad.submissionId))?.campaignCode ?? null).toBeNull()
    })

    it('codes match case-sensitively: Z29VZ2FKCW is not z29vz2fkcw', async () => {
      const body = quickEnquiryBody({ campaign: 'Z29VZ2FKCW' })
      await call(body)
      const row = (await rowOf(body.submissionId))!
      expect(row.campaignCode).toBe('Z29VZ2FKCW')
      expect(row.campaign ?? null).toBeNull()
    })

    it('promo_code=MMF on quick-enquiry is kept as the raw campaign code (DEC-41)', async () => {
      const body = quickEnquiryBody({}, { promoCode: 'MMF' })
      await call(body)
      const row = (await rowOf(body.submissionId))!
      expect(row.campaignCode).toBe('MMF')
      expect(row.campaign ?? null).toBeNull()
    })
  })

  it('source id: fixed form source beats the form default; default is 24', () => {
    const routing = { defaultSourceId: 24 }
    expect(resolveSourceId({ fixedSourceId: 544, defaultSourceId: 1 }, routing)).toBe(544)
    expect(resolveSourceId({ defaultSourceId: 1 }, routing)).toBe(1)
    expect(resolveSourceId({}, routing)).toBe(24)
  })

  it('a course id that does not exist -> 400 on that field', async () => {
    const res = await call(quickEnquiryBody({}, { course: '999999999' }))
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors).toHaveProperty('course')
  })

  it('submissionId must be a uuid', async () => {
    const res = await call({ ...quickEnquiryBody(), submissionId: 'abc' })
    expect(res.status).toBe(400)
    expect(uuid()).toMatch(/^[0-9a-f-]{36}$/)
  })
})
