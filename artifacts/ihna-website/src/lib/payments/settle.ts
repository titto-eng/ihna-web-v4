// settle(paymentId, outcome): shared by the PayWay and SecurePay returns, the Airwallex webhook, reconcilePending and the fake gateway (45 §6).
// One row moves once: the compare-and-set on `status` is the single point that decides who won, so a replayed webhook, a
// double return, or reconcilePending racing a webhook produce one transition, one afterPaid job and one receipt.
import type { Payload } from 'payload'
import { paymentSite } from '@/content/payments'
import { financeRecipients } from './config'
import { sendPaymentMail } from './mail'
import { queueAfterPaid } from './queue'
import { verifyAmountSignature } from './sign'
import { casStatus, findPayment, patchPayment } from './store'
import type { GatewayFacts, Outcome, PaymentFlags, PaymentRow, PaymentStatus } from './types'

export type SettleInput = {
  paymentId: string
  outcome: Outcome
  amountCents?: number | null
  ref?: string | null
  eventId?: string | null
  source: 'webhook' | 'return' | 'reconcile' | 'fake' | 'charge'
  facts?: GatewayFacts
  /** PayWay: the verified decrypted return, forwarded to the portal callbacks. */
  params?: Record<string, string>
  note?: string
}

export type SettleResult = {
  result: 'applied' | 'ignored' | 'flagged' | 'not-found'
  status: PaymentStatus | null
  reason?: string
}

export type SettleDeps = { queueAfter?: (payload: Payload, paymentId: string) => Promise<void>; env?: Record<string, string | undefined> }

const MAX_EVENT_IDS = 50

/** A verified "paid" from the gateway also wins over an earlier failed/expired: money taken is the truth. Never over refunded, paid or an amount/signature flag. */
function paidSources(row: PaymentRow): PaymentStatus[] {
  return row.flags.reason === 'needs-manual-check' ? ['pending', 'failed', 'expired', 'flagged'] : ['pending', 'failed', 'expired']
}

async function alertFinance(payload: Payload, subject: string, text: string, env?: Record<string, string | undefined>) {
  try {
    await sendPaymentMail(payload, { to: financeRecipients(env ?? process.env), subject, text }, env)
  } catch (e) {
    console.error('[payments] finance alert failed', e instanceof Error ? e.message : e)
  }
}

export async function settle(payload: Payload, input: SettleInput, deps: SettleDeps = {}): Promise<SettleResult> {
  const row = await findPayment(payload, input.paymentId)
  if (!row) return { result: 'not-found', status: null }
  if (input.eventId && row.flags.eventIds?.includes(input.eventId)) return { result: 'ignored', status: row.status, reason: 'replay' }

  const queueAfter = deps.queueAfter ?? queueAfterPaid
  const flagsBase: PaymentFlags = { ...row.flags }
  const eventIds = input.eventId ? [...(flagsBase.eventIds ?? []), input.eventId].slice(-MAX_EVENT_IDS) : flagsBase.eventIds
  const withFacts = (extra: Partial<PaymentFlags> = {}): PaymentFlags => ({
    ...flagsBase,
    ...(eventIds ? { eventIds } : {}),
    gateway: { ...flagsBase.gateway, ...input.facts },
    ...(input.params ? { payway: { ...flagsBase.payway, params: input.params } } : {}),
    ...extra,
  })
  const label = `${input.source}${input.note ? `: ${input.note}` : ''}`

  const flag = async (from: PaymentStatus[], reason: string, detail: string): Promise<SettleResult> => {
    if (!(await casStatus(payload, row.paymentId, from, 'flagged'))) return { result: 'ignored', status: row.status, reason: 'already settled' }
    await patchPayment(payload, row, { flags: withFacts({ reason, reasonDetail: detail }), history: { status: 'flagged', note: `${label}: ${reason}` }, lastSyncedAt: new Date().toISOString() })
    await alertFinance(payload, `${paymentSite.mailTag} payment flagged: ${reason}`, `Payment ${row.paymentId} (${row.gateway}) was flagged: ${reason}. ${detail}\n\nOpen /admin/collections/payments to review. No funds are marked received.`, deps.env)
    return { result: 'flagged', status: 'flagged', reason }
  }

  // The stored amount must still match the signature made when the row was created (rule 6).
  const signed = verifyAmountSignature({ paymentId: row.paymentId, amountCents: row.amountCents, currency: row.currency, kind: row.kind }, row.flags.amountSig)
  if (!signed && input.outcome !== 'refunded') return flag(['pending', 'failed', 'expired'], 'signature-mismatch', 'The stored amount does not match its signature.')

  if (input.outcome === 'refunded') {
    if (row.status !== 'paid') return { result: 'ignored', status: row.status, reason: 'not paid' }
    if (!(await casStatus(payload, row.paymentId, ['paid'], 'refunded'))) return { result: 'ignored', status: row.status, reason: 'already settled' }
    await patchPayment(payload, row, { flags: withFacts({ reason: 'refunded' }), history: { status: 'refunded', note: label }, lastSyncedAt: new Date().toISOString() })
    await alertFinance(payload, `${paymentSite.mailTag} refund recorded`, `Payment ${row.paymentId} (${row.gateway}) was refunded at the gateway. The portal row is not changed automatically: finance to action.`, deps.env)
    return { result: 'applied', status: 'refunded' }
  }

  if (input.outcome === 'paid') {
    if (input.amountCents == null || input.amountCents !== row.amountCents) {
      return flag(paidSources(row), 'amount-mismatch', `Gateway confirmed ${input.amountCents == null ? 'no amount' : `${input.amountCents} cents`}; the stored amount is ${row.amountCents} cents.`)
    }
    if (!(await casStatus(payload, row.paymentId, paidSources(row), 'paid'))) return { result: 'ignored', status: row.status, reason: 'already settled' }
    await patchPayment(payload, row, {
      flags: withFacts({ reason: undefined, reasonDetail: undefined }),
      settledAt: new Date().toISOString(), lastSyncedAt: new Date().toISOString(),
      ...(input.ref && !row.gatewayRef ? { gatewayRef: input.ref } : {}),
      history: { status: 'paid', note: label },
    })
    await queueAfter(payload, row.paymentId)
    return { result: 'applied', status: 'paid' }
  }

  // failed / cancelled / expired: only a pending row moves.
  const to: PaymentStatus = input.outcome
  if (!(await casStatus(payload, row.paymentId, ['pending'], to))) return { result: 'ignored', status: row.status, reason: 'already settled' }
  await patchPayment(payload, row, { flags: withFacts(), settledAt: new Date().toISOString(), lastSyncedAt: new Date().toISOString(), history: { status: to, note: label } })
  if (row.gateway === 'payway' || row.kind === 'portalReturn') await queueAfter(payload, row.paymentId) // PayWay failures tell the portal (paywayPaymentCancel)
  return { result: 'applied', status: to }
}

/** Flag a pending row that nobody can settle automatically (PayWay has no status API). Listed in the Payments admin as `flagged`. */
export async function flagForManualCheck(payload: Payload, paymentId: string, detail: string, deps: SettleDeps = {}): Promise<SettleResult> {
  const row = await findPayment(payload, paymentId)
  if (!row) return { result: 'not-found', status: null }
  if (!(await casStatus(payload, paymentId, ['pending'], 'flagged'))) return { result: 'ignored', status: row.status, reason: 'already settled' }
  await patchPayment(payload, row, { flags: { ...row.flags, reason: 'needs-manual-check', reasonDetail: detail }, history: { status: 'flagged', note: 'reconcile: needs-manual-check' }, lastSyncedAt: new Date().toISOString() })
  await alertFinance(payload, `${paymentSite.mailTag} payment needs a manual check`, `Payment ${paymentId} (${row.gateway}) has been pending for more than 10 minutes and the gateway offers no status query. Check the payment in the gateway portal and record the outcome in the student portal; a late gateway notification still settles it here. The row stays flagged in /admin/collections/payments as the record.`, deps.env)
  return { result: 'flagged', status: 'flagged', reason: 'needs-manual-check' }
}
