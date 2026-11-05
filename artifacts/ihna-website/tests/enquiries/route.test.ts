import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { boot, nonce, quickEnquiryBody, removeEnquiries, seed } from './helpers'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'

// The pipeline is tested against the ihm-v2.1 form definitions (every adapter and thank-you type), not the site's own registry.
vi.mock('@/content/forms', () => import('./fixtures/forms'))
// ...and ihm-web's site maps, so the shared pipeline is checked with IHM's configuration (IHNA's: tests/enquiries/ihna-*.test.ts).
vi.mock('@/content/campaign-codes', async () => (await import('./fixtures/site-ihm')).campaignCodesModule)
vi.mock('@/content/hubspot-map', async () => (await import('./fixtures/site-ihm')).hubspotModule)
vi.mock('@/content/dynamics-map', async () => (await import('./fixtures/site-ihm')).dynamicsModule)
vi.mock('@/content/course-crm', async () => (await import('./fixtures/site-ihm')).courseCrmModule)
vi.mock('@/content/enquiry-routing', () => ({ enquiryRouting: { recipientGroups: [], alertTo: [], defaultSourceId: 24 } }))

// The Next route itself (Request in, Response out). The queue is mocked so no job is created or run; the point is that the row
// exists by the time the queue is called, and that the no-JS post answers 303.
const queued: { id: unknown; rowExisted: boolean }[] = []
let payload: Payload
const created: string[] = []
const tag = nonce()

vi.mock('@/jobs/queue', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/jobs/queue')>()),
  queueDeliverEnquiry: async (p: Payload, id: number | string) => {
    const row = await p.findByID({ collection: 'enquiries', id, depth: 0, overrideAccess: true }).catch(() => null)
    queued.push({ id, rowExisted: Boolean(row) })
    return 1
  },
  runJobNow: async () => {},
}))

const { POST } = await import('@/app/api/enquire/route')
const { POST: RETRY } = await import('@/app/api/enquire/retry/route')
const { POST: RELEASE } = await import('@/app/api/enquire/release/route')

beforeAll(async () => {
  payload = await boot()
  await seed(payload)
})
beforeEach(() => { resetRateLimit(); queued.length = 0 })
afterEach(() => vi.restoreAllMocks())
afterAll(async () => {
  await removeEnquiries(payload, created)
})

const post = (body: BodyInit, type: string) =>
  POST(new Request('http://localhost:3000/api/enquire/', { method: 'POST', headers: { 'content-type': type, 'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 250)}-${nonce()}` }, body }))

describe('POST /api/enquire/ (route)', () => {
  it('JSON: 200 { ok, thankYouPath }, the row is stored before deliverEnquiry is queued', async () => {
    const body = quickEnquiryBody({ campaign: 'zmniywrz' })
    created.push(body.submissionId)
    const res = await post(JSON.stringify(body), 'application/json')
    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean; thankYouPath: string; enquiryId: string }
    expect(json).toMatchObject({ ok: true, thankYouPath: '/thanks/?campaign_id=zmniywrz' })
    expect(res.headers.get('cache-control')).toContain('no-store')
    expect(queued).toHaveLength(1)
    expect(queued[0].rowExisted).toBe(true)
  })

  it('no-JS urlencoded post answers 303 to the thank-you (40 check 7)', async () => {
    const body = quickEnquiryBody()
    created.push(body.submissionId)
    const form = new URLSearchParams({ formKey: 'quick-enquiry', submissionId: body.submissionId, pageUrl: body.pageUrl, _hp_url: '', firstName: 'No', lastName: 'Js', email: `nojs-${nonce()}@example.test`, phone: '0400 000 000', consent: 'on' })
    const res = await post(form.toString(), 'application/x-www-form-urlencoded')
    expect(res.status).toBe(303)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/thanks/')
    expect(queued).toHaveLength(1)
  })

  it('no-JS agent-registration with its real `website` field is stored, not spam', async () => {
    const id = crypto.randomUUID()
    created.push(id)
    const form = new URLSearchParams({ formKey: 'agent-registration', submissionId: id, orgName: 'Org', address: '1 St', country: 'India', email: `nojs-${nonce()}@example.test`, phone: '+91 98765 43210', website: 'https://agency.example.test', contact1Name: 'Ravi', contact1Email: 'ravi@example.test', _hp_url: '' })
    const res = await post(form.toString(), 'application/x-www-form-urlencoded')
    expect(res.status).toBe(303)
    expect(new URL(res.headers.get('location')!).pathname).toBe('/thanks/')
    const row = (await payload.find({ collection: 'enquiries', where: { submissionId: { equals: id } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
    expect(row.status).toBe('received')
    expect((row.data as Record<string, unknown>).website).toBe('https://agency.example.test')
  })

  it('no-JS post that fails validation is not a thank-you', async () => {
    const form = new URLSearchParams({ formKey: 'quick-enquiry', submissionId: crypto.randomUUID(), email: 'bad' })
    const res = await post(form.toString(), 'application/x-www-form-urlencoded')
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('enquiry=error')
    expect(queued).toHaveLength(0)
  })

  it('JSON validation error is a 400 JSON body, never a redirect', async () => {
    const res = await post(JSON.stringify({ ...quickEnquiryBody(), fields: {} }), 'application/json')
    expect(res.status).toBe(400)
    expect(((await res.json()) as { error: string }).error).toBe('validation')
  })
})

describe('admin actions are staff-only (DEC-20)', () => {
  it.each([['retry', RETRY], ['release', RELEASE]] as const)('%s without a session -> 401', async (_n, handler) => {
    const res = await handler(new Request('http://localhost:3000/api/enquire/x/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }))
    expect(res.status).toBe(401)
  })

  it('marketing may retry dead deliveries, a viewer may not', async () => {
    // Users has removeTokenFromResponses, so a real JWT cannot be read back; the route's own check is what is under test.
    const as = (role: 'marketing' | 'viewer') => vi.spyOn(payload, 'auth').mockResolvedValue({ user: { id: 1, collection: 'users', email: `${role}@example.test`, roles: [role] }, permissions: {} } as never)
    const body = quickEnquiryBody()
    created.push(body.submissionId)
    const saved = await payload.create({
      collection: 'enquiries', overrideAccess: true,
      data: { submissionId: body.submissionId, formKey: 'quick-enquiry', status: 'dead', email: `dead-${tag}@example.test`, deliveries: [{ adapter: 'hubspot', target: 'contacts', status: 'dead', attempts: 5, lastError: 'HTTP 400' }] } as never,
    })
    const call = () => RETRY(new Request('http://localhost:3000/api/enquire/retry/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'retry-dead', ids: [saved.id] }) }))

    as('viewer')
    expect((await call()).status).toBe(403)
    as('marketing')
    const ok = await call()
    expect(ok.status).toBe(200)
    expect(await ok.json()).toMatchObject({ ok: true, action: 'retry-dead', requeued: 1 })
    expect(queued).toHaveLength(1)
    const row = await payload.findByID({ collection: 'enquiries', id: saved.id, depth: 0, overrideAccess: true })
    expect(row.status).toBe('received')
    expect(row.deliveries?.[0]).toMatchObject({ status: 'pending', attempts: 0 })
  })
})
