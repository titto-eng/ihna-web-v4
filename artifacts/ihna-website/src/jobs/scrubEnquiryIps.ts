import type { Payload, TaskConfig } from 'payload'

// 40 §2: `enquiries.ip` is nulled after 90 days. Only the address is cleared; the enquiry and its deliveries stay (rule 2).
export const IP_RETENTION_DAYS = 90
export const MAINTENANCE_QUEUE = 'maintenance'

/** Nulls `ip` on enquiries older than `days`. Returns how many rows were scrubbed. */
export async function scrubEnquiryIps(payload: Payload, opts: { days?: number; now?: Date } = {}): Promise<number> {
  const cutoff = new Date((opts.now ?? new Date()).getTime() - (opts.days ?? IP_RETENTION_DAYS) * 86_400_000).toISOString()
  const res = await payload.update({
    collection: 'enquiries',
    where: { and: [{ createdAt: { less_than: cutoff } }, { ip: { exists: true } }] },
    data: { ip: null } as never,
    overrideAccess: true,
    depth: 0,
  })
  return res.docs.length
}

/** Daily at 03:00 (server time). Scheduled by the autoRun runner of the `maintenance` queue. */
export const scrubEnquiryIpsTask = {
  slug: 'scrubEnquiryIps',
  inputSchema: [],
  outputSchema: [{ name: 'scrubbed', type: 'number', required: true }],
  schedule: [{ cron: '0 0 3 * * *', queue: MAINTENANCE_QUEUE }],
  handler: async ({ req }) => ({ output: { scrubbed: await scrubEnquiryIps(req.payload) } }),
} as TaskConfig<'scrubEnquiryIps'>
