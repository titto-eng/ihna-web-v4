// Finance re-runs afterPaid steps that went `dead` (45 §3, DEC-20). `payments` has no update access (DEC-3), so this server action is the only
// way to retry: it resets each dead step to `failed` with 0 attempts, records who asked in statusHistory, and queues afterPaid once per payment.
import type { Payload } from 'payload'
import type { Payment } from '@/payload-types'
import { queueAfterPaid } from './queue'
import { patchPayment, toRow } from './store'

export const RETRY_LIMIT = 200

export type RetryResult = { requeued: number; paymentIds: string[] }

export async function retryDeadSteps(
  payload: Payload,
  opts: { paymentIds?: string[]; by?: string; queue?: (payload: Payload, paymentId: string) => Promise<void> } = {},
): Promise<RetryResult> {
  const queue = opts.queue ?? queueAfterPaid
  const where = opts.paymentIds?.length
    ? { and: [{ 'steps.status': { equals: 'dead' } }, { paymentId: { in: opts.paymentIds.slice(0, RETRY_LIMIT) } }] }
    : { 'steps.status': { equals: 'dead' } }
  const found = await payload.find({ collection: 'payments', where: where as never, limit: RETRY_LIMIT, depth: 0, overrideAccess: true, pagination: false })
  const out: RetryResult = { requeued: 0, paymentIds: [] }
  for (const doc of found.docs as Payment[]) {
    const row = toRow(doc)
    const dead = row.steps.filter((s) => s.status === 'dead').map((s) => s.step)
    if (!dead.length) continue
    const steps = row.steps.map((s) => (s.status === 'dead' ? { step: s.step, status: 'failed', attempts: 0 } : s))
    await patchPayment(payload, row, { steps, history: { status: row.status, note: `retry dead steps (${dead.join(', ')})${opts.by ? ` by ${opts.by}` : ''}` } })
    await queue(payload, row.paymentId)
    out.requeued++
    out.paymentIds.push(row.paymentId)
  }
  return out
}
