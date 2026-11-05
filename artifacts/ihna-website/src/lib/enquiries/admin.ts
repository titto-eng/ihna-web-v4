import type { Payload } from 'payload'
import type { DeliveryRow } from './types'

// "Retry dead", "Release held" and the stuck-row sweeper (40 §3, DEC-20: admin and marketing). The collection grants no update, so
// these write through the Local API with overrideAccess. Called by the routes under src/app/api/enquire/{retry,release}/.
export type AdminAction = 'retry-dead' | 'release-held' | 'requeue-stuck'
export type QueueFn = (payload: Payload, enquiryId: number | string) => Promise<void>

type Row = { id: number | string; status?: string; deliveries?: DeliveryRow[] | null; createdAt?: string }

export async function resetEnquiries(payload: Payload, action: AdminAction, queue: QueueFn, opts: { ids?: (number | string)[]; stuckAfterMinutes?: number } = {}): Promise<{ requeued: number; skipped: number }> {
  const statusFilter = action === 'retry-dead' ? ['dead', 'partial'] : action === 'release-held' ? ['held'] : ['received']
  const where: Record<string, unknown>[] = [{ status: { in: statusFilter } }]
  if (opts.ids?.length) where.push({ id: { in: opts.ids } })
  if (action === 'requeue-stuck') where.push({ createdAt: { less_than: new Date(Date.now() - (opts.stuckAfterMinutes ?? 5) * 60_000).toISOString() } })

  const found = await payload.find({ collection: 'enquiries', where: { and: where } as never, limit: 200, depth: 0, overrideAccess: true, pagination: false })
  let requeued = 0
  let skipped = 0
  for (const doc of found.docs as unknown as Row[]) {
    const rows = (doc.deliveries ?? []).map((r) => ({ ...r }))
    let touched = 0
    for (const r of rows) {
      const reset =
        (action === 'retry-dead' && r.status === 'dead') ||
        (action === 'release-held' && r.status === 'held') ||
        (action === 'requeue-stuck' && (r.status === 'pending' || r.status === 'failed'))
      if (!reset) continue
      r.status = 'pending'
      if (action !== 'requeue-stuck') r.attempts = 0
      r.lastError = null
      touched++
    }
    if (!touched) { skipped++; continue }
    await payload.update({ collection: 'enquiries', id: doc.id, data: { deliveries: rows as never, status: 'received' as never }, overrideAccess: true })
    try {
      await queue(payload, doc.id)
      requeued++
    } catch (e) {
      console.error(`[enquire] ${action}: enquiry ${doc.id} reset but not queued`, e instanceof Error ? e.message : e)
      skipped++
    }
  }
  return { requeued, skipped }
}
