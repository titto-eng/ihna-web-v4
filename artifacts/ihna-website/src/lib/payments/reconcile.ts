// reconcilePending (45 §6): covers PayWay's missing webhook and closed tabs. Every 15 minutes, payments pending for more than 10 minutes
// (and less than 7 days) are asked what the gateway thinks and settled through the same `settle` as the returns and the webhook.
// PayWay has no confirmed status API: its rows become `flagged` (reason needs-manual-check) and are listed in the Payments admin.
import type { Payload } from 'payload'
import { PENDING_EXPIRE_MS, PENDING_MAX_AGE_MS, PENDING_MIN_AGE_MS, type GatewayName } from './config'
import { getGateway } from './gateways'
import { flagForManualCheck, settle, type SettleDeps } from './settle'
import { findStalePending } from './store'
import type { Gateway } from './types'

export type ReconcileResult = { checked: number; paid: number; failed: number; flagged: number; expired: number; errors: number }
export type ReconcileDeps = SettleDeps & { gatewayFor?: (name: GatewayName) => Gateway; nowMs?: number; limit?: number }

export async function reconcilePending(payload: Payload, deps: ReconcileDeps = {}): Promise<ReconcileResult> {
  const nowMs = deps.nowMs ?? Date.now()
  const rows = await findStalePending(payload, PENDING_MIN_AGE_MS, PENDING_MAX_AGE_MS, deps.limit ?? 50, nowMs)
  const out: ReconcileResult = { checked: 0, paid: 0, failed: 0, flagged: 0, expired: 0, errors: 0 }
  for (const row of rows) {
    out.checked++
    try {
      const gateway = (deps.gatewayFor ?? getGateway)(row.gateway as GatewayName)
      const ans = await gateway.queryStatus(row)
      if (ans.state === 'paid') {
        const r = await settle(payload, { paymentId: row.paymentId, outcome: 'paid', amountCents: ans.amountCents ?? null, ref: ans.ref ?? null, source: 'reconcile', facts: ans.facts, note: 'status query' }, deps)
        if (r.result === 'applied') out.paid++
        else if (r.result === 'flagged') out.flagged++
      } else if (ans.state === 'failed') {
        const r = await settle(payload, { paymentId: row.paymentId, outcome: 'failed', source: 'reconcile', facts: ans.facts, note: 'status query' }, deps)
        if (r.result === 'applied') out.failed++
      } else if (ans.state === 'unknown') {
        const r = await flagForManualCheck(payload, row.paymentId, `No status answer from ${row.gateway}.`, deps)
        if (r.result === 'flagged') out.flagged++
      } else if (nowMs - Date.parse(row.createdAt) > PENDING_EXPIRE_MS) {
        const r = await settle(payload, { paymentId: row.paymentId, outcome: 'expired', source: 'reconcile', note: 'no answer after 24 h' }, deps)
        if (r.result === 'applied') out.expired++
      }
    } catch (e) {
      out.errors++ // one gateway outage must not stop the others; the row is tried again in 15 minutes
      console.error(`[reconcilePending] ${row.paymentId}: ${e instanceof Error ? e.message : 'error'}`)
    }
  }
  return out
}
