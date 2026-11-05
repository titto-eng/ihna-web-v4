import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdapterInput, DeliveryResult } from '@/lib/adapters'
import { deriveStatus, runDelivery } from '@/jobs/deliverEnquiry'
import { handleEnquire } from '@/lib/enquiries/process'
import { resetEnquiries } from '@/lib/enquiries/admin'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'
import { boot, mailpit, mailpitUp, nonce, quickEnquiryBody, removeEnquiries, request, seed } from './helpers'

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

type Row = { id: number; status: string; publicId?: string; deliveries?: { id?: string; adapter: string; target: string; status: string; attempts: number; lastError?: string | null; dryRunRequest?: unknown }[] }
const reload = async (id: number) => (await payload.findByID({ collection: 'enquiries', id, depth: 0, overrideAccess: true })) as unknown as Row

/** Saves a quick-enquiry through the real pipeline (nothing queued) and returns its id. */
async function save(formKey = 'quick-enquiry', fields: Record<string, unknown> = {}): Promise<number> {
  const body = quickEnquiryBody({ formKey }, fields)
  created.push(body.submissionId)
  const res = await handleEnquire({ payload, ...request(body, `203.0.113.${Math.floor(Math.random() * 250)}-${nonce()}`) }, { queueDelivery: async () => {} })
  expect(res.status).toBe(200)
  const found = await payload.find({ collection: 'enquiries', where: { submissionId: { equals: body.submissionId } }, limit: 1, depth: 0, overrideAccess: true })
  return found.docs[0].id as number
}

const ENV = { ...process.env, DRY_RUN: '1', ENQUIRY_NOTIFY_TO: 'tech-alerts@example.test' }
const ok = (): DeliveryResult => ({ status: 'dry_run', dryRunRequest: { fake: true } })
const failing = (e = 'HTTP 503'): DeliveryResult => ({ status: 'failed', lastError: e, responseCode: 503 })

beforeAll(async () => {
  payload = await boot()
  await seed(payload)
})
beforeEach(() => {
  resetRateLimit()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())
afterAll(async () => removeEnquiries(payload, created))

describe('deliverEnquiry job body', () => {
  it('delivers every pending row once and derives the status', async () => {
    const id = await save()
    const run = vi.fn(async (_i: AdapterInput) => ok())
    const out = await runDelivery(payload, id, { run, env: ENV })
    expect(out).toMatchObject({ status: 'delivered', retryNeeded: false, attempted: 3 })
    const row = await reload(id)
    expect(row.status).toBe('delivered')
    expect(row.deliveries?.map((d) => `${d.adapter}:${d.status}:${d.attempts}`).sort()).toEqual(['email:dry_run:1', 'hubspot:dry_run:1', 'portalCrm:dry_run:1'])
  })

  it('a sent delivery is not resent; only the failed one is retried', async () => {
    const id = await save()
    const calls: string[] = []
    const flaky = async (i: AdapterInput): Promise<DeliveryResult> => {
      calls.push(i.destination.adapter)
      return i.destination.adapter === 'portalCrm' ? failing() : { status: 'sent', responseCode: 200 }
    }
    const first = await runDelivery(payload, id, { run: flaky, env: ENV })
    expect(first.retryNeeded).toBe(true) // the job will throw so Payload retries it with backoff
    expect((await reload(id)).status).toBe('delivering')
    expect(calls.sort()).toEqual(['email', 'hubspot', 'portalCrm'])

    calls.length = 0
    const second = await runDelivery(payload, id, { run: async (i) => { calls.push(i.destination.adapter); return { status: 'sent', responseCode: 200 } }, env: ENV })
    expect(calls).toEqual(['portalCrm']) // email and hubspot were already sent
    expect(second).toMatchObject({ status: 'delivered', retryNeeded: false })
    const row = await reload(id)
    expect(row.deliveries?.find((d) => d.adapter === 'portalCrm')?.attempts).toBe(2)
    expect(row.deliveries?.find((d) => d.adapter === 'hubspot')?.attempts).toBe(1)
  })

  it('five failures -> dead, the enquiry stays saved, and the tech role gets an alert in Mailpit (no personal data)', async () => {
    expect(await mailpitUp(), 'Mailpit must be running on :8025 (docker compose up -d mailpit)').toBe(true)
    const tag = nonce()
    const env = { ...ENV, ENQUIRY_NOTIFY_TO: `alert-${tag}@example.test` }
    const email = `person-${tag}@example.test`
    const id = await save('quick-enquiry', { email })
    const alwaysFail = async (i: AdapterInput): Promise<DeliveryResult> => (i.destination.adapter === 'portalCrm' ? failing('HTTP 502') : ok())

    for (let n = 1; n <= 4; n++) {
      const r = await runDelivery(payload, id, { run: alwaysFail, env })
      expect(r.retryNeeded).toBe(true)
      expect(r.newlyDead).toHaveLength(0)
    }
    const last = await runDelivery(payload, id, { run: alwaysFail, env })
    expect(last.newlyDead).toHaveLength(1)
    expect(last.retryNeeded).toBe(false) // completes: nothing left for the queue to retry
    const row = await reload(id)
    const portal = row.deliveries!.find((d) => d.adapter === 'portalCrm')!
    expect(portal).toMatchObject({ status: 'dead', attempts: 5, lastError: 'HTTP 502' })
    expect(row.status).toBe('partial') // email and hubspot did arrive

    // a sixth run does nothing
    const calls = vi.fn(alwaysFail)
    await runDelivery(payload, id, { run: calls, env })
    expect(calls).not.toHaveBeenCalled()

    const res = await fetch(`${mailpit}/search?query=${encodeURIComponent(`to:alert-${tag}@example.test`)}`)
    const json = (await res.json()) as { messages: { ID: string; Subject: string }[] }
    expect(json.messages.length).toBe(1)
    expect(json.messages[0].Subject).toContain('dead delivery')
    const full = (await (await fetch(`${mailpit}/message/${json.messages[0].ID}`)).json()) as { Text: string }
    expect(full.Text).toContain('portalCrm')
    expect(full.Text).not.toContain(email) // no PII in the alert
    await fetch(`${mailpit}/messages`, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ IDs: [json.messages[0].ID] }) })
  })

  it('a non-retryable failure goes dead on the first attempt', async () => {
    const id = await save()
    const out = await runDelivery(payload, id, { run: async (i) => (i.destination.adapter === 'hubspot' ? { status: 'dead', lastError: 'HTTP 400' } : ok()), env: { ...ENV, ENQUIRY_NOTIFY_TO: '' } })
    expect(out.newlyDead).toHaveLength(1)
    expect((await reload(id)).deliveries?.find((d) => d.adapter === 'hubspot')).toMatchObject({ status: 'dead', attempts: 1 })
  })

  it('held and spam rows are never delivered', async () => {
    const id = await save()
    await payload.update({ collection: 'enquiries', id, data: { status: 'held' }, overrideAccess: true })
    const run = vi.fn(async () => ok())
    expect(await runDelivery(payload, id, { run, env: ENV })).toMatchObject({ attempted: 0 })
    expect(run).not.toHaveBeenCalled()
  })

  it('real DRY_RUN path end to end: records the requests, email goes to Mailpit when a recipient exists', async () => {
    expect(await mailpitUp()).toBe(true)
    const tag = nonce()
    const env = { ...ENV, ENQUIRY_NOTIFY_TO: `dryrun-${tag}@example.test`, NODE_ENV: 'test' }
    const id = await save('quick-enquiry', { firstName: `Dry${tag}` })
    const out = await runDelivery(payload, id, { env })
    expect(out.status).toBe('delivered')
    const row = await reload(id)
    expect(row.deliveries?.every((d) => d.status === 'dry_run' && d.dryRunRequest)).toBe(true)
    expect(row.deliveries?.every((d) => d.lastError === 'DRY_RUN=1')).toBe(true) // the row says why it only recorded (DEC-50)
    const msgs = (await (await fetch(`${mailpit}/search?query=${encodeURIComponent(`to:dryrun-${tag}@example.test`)}`)).json()) as { messages: { ID: string }[] }
    expect(msgs.messages).toHaveLength(1)
    await fetch(`${mailpit}/messages`, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ IDs: [msgs.messages[0].ID] }) })
  })

  it('the autoresponder row exists for admission-popup and is skipped for held rows', async () => {
    const id = await save('admission-popup', { name: 'Test Person', course: undefined })
    const row = await reload(id)
    expect(row.deliveries?.map((d) => `${d.adapter}:${d.target}`).sort()).toEqual(['email:admissions', 'email:autoresponder', 'portalCrm:portal'])
  })
})

describe('deriveStatus', () => {
  it.each([
    [[], undefined, 'delivered'],
    [['pending', 'sent'], undefined, 'delivering'],
    [['failed'], undefined, 'delivering'],
    [['sent', 'dry_run'], undefined, 'delivered'],
    [['sent', 'dead'], undefined, 'partial'],
    [['dead', 'dead'], undefined, 'dead'],
    [['held', 'held'], undefined, 'held'],
    [['sent'], 'spam', 'spam'],
  ] as const)('%j (%s) -> %s', (statuses, current, expected) => {
    expect(deriveStatus(statuses.map((status) => ({ status })) as never, current)).toBe(expected)
  })
})

describe('Retry dead / Release held / requeue stuck', () => {
  it('retry-dead resets dead rows to pending with 0 attempts and queues once; sent rows are untouched', async () => {
    const id = await save()
    await runDelivery(payload, id, { run: async (i) => (i.destination.adapter === 'hubspot' ? { status: 'dead', lastError: 'HTTP 400' } : { status: 'sent' }), env: { ...ENV, ENQUIRY_NOTIFY_TO: '' } })
    const queue = vi.fn(async () => {})
    const out = await resetEnquiries(payload, 'retry-dead', queue, { ids: [id] })
    expect(out).toEqual({ requeued: 1, skipped: 0 })
    expect(queue).toHaveBeenCalledTimes(1)
    const row = await reload(id)
    expect(row.status).toBe('received')
    expect(row.deliveries?.find((d) => d.adapter === 'hubspot')).toMatchObject({ status: 'pending', attempts: 0, lastError: null })
    expect(row.deliveries?.filter((d) => d.status === 'sent')).toHaveLength(2)
  })

  it('release-held turns held rows pending and queues them', async () => {
    const id = await save()
    const row = await reload(id)
    await payload.update({ collection: 'enquiries', id, data: { status: 'held', deliveries: row.deliveries!.map((d) => ({ ...d, status: 'held' })) as never }, overrideAccess: true })
    const queue = vi.fn(async () => {})
    expect(await resetEnquiries(payload, 'release-held', queue, { ids: [id] })).toEqual({ requeued: 1, skipped: 0 })
    expect((await reload(id)).deliveries?.every((d) => d.status === 'pending')).toBe(true)
  })

  it('requeue-stuck leaves fresh rows alone', async () => {
    const id = await save()
    const queue = vi.fn(async () => {})
    expect(await resetEnquiries(payload, 'requeue-stuck', queue, { ids: [id] })).toEqual({ requeued: 0, skipped: 0 })
    expect(queue).not.toHaveBeenCalled()
  })
})
