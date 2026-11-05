// The Postgres `payments` mirror (collection `payments`, 10-content-model / 45 §2). The Local API writes it with overrideAccess;
// admin users can only read it (DEC-3). The portal row stays authoritative and is written only by src/lib/portal/payments-write.ts.
import type { Payload } from 'payload'
import type { Payment } from '@/payload-types'
import type { PaymentFlags, PaymentRow, PaymentStatus } from './types'

type PgPool = { query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }> }
const pgPool = (payload: Payload): PgPool | undefined => (payload.db as unknown as { pool?: PgPool }).pool

const asFlags = (v: unknown): PaymentFlags => (v && typeof v === 'object' && !Array.isArray(v) ? (v as PaymentFlags) : {})

export function toRow(d: Payment): PaymentRow {
  const product = d.product
  return {
    id: d.id,
    paymentId: d.paymentId,
    kind: (d.kind ?? 'invoice') as PaymentRow['kind'],
    status: d.status as PaymentStatus,
    gateway: d.gateway ?? null,
    gatewayRef: d.gatewayRef ?? null,
    amountCents: Number(d.amountCents),
    baseCents: d.baseCents == null ? null : Number(d.baseCents),
    surchargeCents: d.surchargeCents == null ? null : Number(d.surchargeCents),
    currency: d.currency ?? 'AUD',
    payerName: d.payerName ?? null,
    payerEmail: d.payerEmail ?? null,
    paymentFor: d.paymentFor ?? null,
    invoiceNo: d.invoiceNo ?? null,
    studentId: d.studentId ?? null,
    productId: typeof product === 'object' && product ? product.id : (product as number | null | undefined) ?? null,
    portalPaymentId: d.portalPaymentId ?? null,
    flags: asFlags(d.flags),
    steps: (d.steps ?? []).map((s) => ({ step: s.step, status: s.status, attempts: s.attempts })),
    statusHistory: (d.statusHistory ?? []).map((h) => ({ status: h.status, at: h.at, note: h.note })),
    settledAt: d.settledAt ?? null,
    createdAt: d.createdAt,
    ip: d.ip ?? null,
  }
}

export async function findPayment(payload: Payload, paymentId: string): Promise<PaymentRow | null> {
  const { docs } = await payload.find({ collection: 'payments', where: { paymentId: { equals: paymentId } }, limit: 1, depth: 0, overrideAccess: true })
  return docs[0] ? toRow(docs[0] as Payment) : null
}

export async function findPaymentByGatewayRef(payload: Payload, ref: string): Promise<PaymentRow | null> {
  const { docs } = await payload.find({ collection: 'payments', where: { gatewayRef: { equals: ref } }, limit: 1, depth: 0, overrideAccess: true })
  return docs[0] ? toRow(docs[0] as Payment) : null
}

export type NewPayment = {
  paymentId: string
  kind: PaymentRow['kind']
  gateway: string
  amountCents: number
  baseCents: number
  surchargeCents: number
  payerName: string
  payerEmail: string
  paymentFor?: string | null
  invoiceNo?: string | null
  studentId?: string | null
  productId?: number | null
  ip?: string | null
  flags: PaymentFlags
  status?: PaymentStatus
}

const now = () => new Date().toISOString()

export async function createPayment(payload: Payload, p: NewPayment): Promise<PaymentRow> {
  const status = p.status ?? 'pending'
  const doc = await payload.create({
    collection: 'payments',
    overrideAccess: true,
    data: {
      paymentId: p.paymentId, kind: p.kind, gateway: p.gateway, status, currency: 'AUD',
      amountCents: p.amountCents, baseCents: p.baseCents, surchargeCents: p.surchargeCents,
      payerName: p.payerName || null, payerEmail: p.payerEmail || null, paymentFor: p.paymentFor ?? null, invoiceNo: p.invoiceNo ?? null, studentId: p.studentId ?? null,
      product: p.productId ?? null, ip: p.ip ?? null, flags: p.flags as never,
      statusHistory: [{ status, at: now(), note: 'created' }],
    },
  })
  return toRow(doc as Payment)
}

export type Patch = Partial<{
  gateway: string
  gatewayRef: string
  portalPaymentId: string
  status: PaymentStatus
  flags: PaymentFlags
  steps: { step: string; status?: string | null; attempts?: number | null }[]
  settledAt: string
  lastSyncedAt: string
  /** Appended to statusHistory. */
  history: { status: string; note?: string }
}>

/** Update the mirror. `flags` is replaced by the merged object the caller built from a fresh read (see `mergeFlags`). */
export async function patchPayment(payload: Payload, row: Pick<PaymentRow, 'id' | 'statusHistory'>, patch: Patch): Promise<PaymentRow> {
  const { history, ...rest } = patch
  const data: Record<string, unknown> = { ...rest }
  if (history) data.statusHistory = [...row.statusHistory.map((h) => ({ status: h.status, at: h.at ?? undefined, note: h.note ?? undefined })), { status: history.status, at: now(), note: history.note }]
  const doc = await payload.update({ collection: 'payments', id: row.id, data: data as never, overrideAccess: true, depth: 0 })
  return toRow(doc as Payment)
}

/**
 * Compare-and-set on `status`: true only for the caller whose UPDATE actually moved the row. This is what makes a webhook replay,
 * a double return and reconcilePending racing a webhook produce one transition, one afterPaid job and one receipt.
 * Without a Postgres pool (never in this stack) it degrades to read-then-write.
 */
export async function casStatus(payload: Payload, paymentId: string, from: PaymentStatus[], to: PaymentStatus): Promise<boolean> {
  const pool = pgPool(payload)
  if (pool) {
    const res = await pool.query(
      'UPDATE payments SET status = $2::enum_payments_status, updated_at = now() WHERE payment_id = $1 AND status = ANY($3::enum_payments_status[]) RETURNING id',
      [paymentId, to, from],
    )
    return (res.rowCount ?? res.rows.length) > 0
  }
  const row = await findPayment(payload, paymentId)
  if (!row || !from.includes(row.status)) return false
  await payload.update({ collection: 'payments', id: row.id, data: { status: to }, overrideAccess: true, depth: 0 })
  return true
}

/** Rows to reconcile: pending for more than `minAgeMs` and less than `maxAgeMs`, oldest first. */
export async function findStalePending(payload: Payload, minAgeMs: number, maxAgeMs: number, limit = 50, nowMs = Date.now()): Promise<PaymentRow[]> {
  const { docs } = await payload.find({
    collection: 'payments',
    where: { and: [
      { status: { equals: 'pending' } },
      { createdAt: { less_than: new Date(nowMs - minAgeMs).toISOString() } },
      { createdAt: { greater_than: new Date(nowMs - maxAgeMs).toISOString() } },
    ] },
    sort: 'createdAt', limit, depth: 0, overrideAccess: true,
  })
  return docs.map((d) => toRow(d as Payment))
}
