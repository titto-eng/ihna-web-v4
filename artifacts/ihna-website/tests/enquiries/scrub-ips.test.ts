import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { IP_RETENTION_DAYS, scrubEnquiryIps, scrubEnquiryIpsTask } from '@/jobs/scrubEnquiryIps'
import { jobsConfig, jobTasks } from '@/jobs'
import { boot, removeEnquiries, uuid } from './helpers'

let payload: Payload
const ids: string[] = []
const day = 86_400_000

const make = async (ageDays: number, ip: string | null) => {
  const submissionId = uuid()
  ids.push(submissionId)
  const doc = await payload.create({
    collection: 'enquiries', overrideAccess: true,
    data: { submissionId, formKey: 'newsletter', status: 'delivered', email: `ip-${submissionId.slice(0, 8)}@example.test`, ip, createdAt: new Date(Date.now() - ageDays * day).toISOString(), deliveries: [{ adapter: 'hubspot', target: 'contacts', status: 'dry_run', attempts: 1 }] } as never,
  })
  return doc.id as number
}
const get = async (id: number) => (await payload.findByID({ collection: 'enquiries', id, depth: 0, overrideAccess: true })) as unknown as { ip?: string | null; email?: string; deliveries?: unknown[] }

beforeAll(async () => { payload = await boot() })
afterAll(async () => removeEnquiries(payload, ids))

describe('scrubEnquiryIps (40 §2: ip nulled after 90 days)', () => {
  it('nulls the ip of enquiries older than 90 days, keeps newer ones, and keeps the rows and their deliveries', async () => {
    const old = await make(IP_RETENTION_DAYS + 10, '203.0.113.1')
    const edge = await make(IP_RETENTION_DAYS - 1, '203.0.113.2')
    const fresh = await make(1, '203.0.113.3')
    const oldNoIp = await make(200, null)

    const n = await scrubEnquiryIps(payload)
    expect(n).toBeGreaterThanOrEqual(1)
    const o = await get(old)
    expect(o.ip ?? null).toBeNull()
    expect(o.email).toMatch(/@example.test$/) // the enquiry itself is untouched
    expect(o.deliveries).toHaveLength(1)
    expect((await get(edge)).ip).toBe('203.0.113.2')
    expect((await get(fresh)).ip).toBe('203.0.113.3')
    expect((await get(oldNoIp)).ip ?? null).toBeNull()

    // a second run finds nothing of ours to scrub
    await scrubEnquiryIps(payload)
    expect((await get(fresh)).ip).toBe('203.0.113.3')
  })

  it('honours an explicit window and clock', async () => {
    const id = await make(5, '203.0.113.9')
    await scrubEnquiryIps(payload, { days: 3 })
    expect((await get(id)).ip ?? null).toBeNull()
    const keep = await make(5, '203.0.113.10')
    await scrubEnquiryIps(payload, { days: 3, now: new Date(Date.now() - 30 * day) })
    expect((await get(keep)).ip).toBe('203.0.113.10')
  })

  it('is a daily scheduled task on the maintenance queue, run by autoRun', () => {
    expect(scrubEnquiryIpsTask.slug).toBe('scrubEnquiryIps')
    expect(scrubEnquiryIpsTask.schedule).toEqual([{ cron: '0 0 3 * * *', queue: 'maintenance' }])
    expect(jobTasks.map((t) => t.slug)).toContain('scrubEnquiryIps')
    const autoRun = jobsConfig.autoRun as { queue?: string }[]
    expect(autoRun.map((a) => a.queue)).toEqual(expect.arrayContaining(['enquiries', 'maintenance']))
  })
})
