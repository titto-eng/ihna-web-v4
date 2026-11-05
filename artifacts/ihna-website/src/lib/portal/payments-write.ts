// The ONLY place that writes the portal `payments` table (45-payments §2). It goes through the write-limited PAY_* user:
// SELECT, INSERT and column-level UPDATE on `payments`, never DELETE. Every statement is a constant string with `?`
// placeholders (tests/payments/no-raw-sql.test.ts and tests/portal/no-raw-sql.test.ts grep this file). Amounts are decimal
// strings built from integer cents. Tokens and client secrets are never written (45 §2).
import { PortalUnavailable, payConfig, runPayRead, runPayWrite, type PortalPaymentRow, type SqlParam } from './client'
import { centsToDecimal } from '@/lib/payments/money'

// Column names follow the legacy inserts (T/functions.php:2052,2137,2210) and updates (T/functions.php:2406-2414).
// PROVISIONAL until SHOW CREATE TABLE arrives (50-portal-data §10 Q2): the fixture in docker/portal-fixtures/payments.schema.sql mirrors them.

/**
 * The payer IP column. Both legacy themes write and read `ip_address` (IHM T/functions.php:2406, :2571; IHNA functions.php:2032, :2192);
 * no legacy statement names `ip_addr`. SQL must stay a constant string (no-raw-sql tests), so the statement below spells it out and
 * tests/payments/portal-write-columns.test.ts checks that it uses this constant.
 */
export const PORTAL_PAYMENT_IP_COLUMN = 'ip_address'

const SQL_INSERT_PENDING =
  'INSERT INTO payments (student_name, studentid, invoice_number, payment_type_id, email, payment_for, e2payment, amount, total, ' +
  'payment_gateway, applydate, created, ip_address, status) VALUES (?, ?, ?, 2, ?, ?, ?, ?, ?, ?, CURDATE(), NOW(), ?, 0)'

// Idempotent: WHERE status = 0 means a second call (retried job, replayed return) changes nothing.
const SQL_MARK_PAID =
  'UPDATE payments SET status = 1, paid_amount = ?, paymentdate = ?, payment_gateway = COALESCE(?, payment_gateway), ' +
  'sp_status = COALESCE(?, sp_status), sp_bankTransactionId = COALESCE(?, sp_bankTransactionId), ' +
  'sp_gatewayResponseCode = COALESCE(?, sp_gatewayResponseCode), sp_gatewayResponseMessage = COALESCE(?, sp_gatewayResponseMessage), ' +
  'sp_orderId = COALESCE(?, sp_orderId), sp_dcc_orderId = COALESCE(?, sp_dcc_orderId), aw_intent_id = COALESCE(?, aw_intent_id), ' +
  'payment_number = COALESCE(?, payment_number), response_code = COALESCE(?, response_code), payment_status = COALESCE(?, payment_status), ' +
  'type = COALESCE(?, type) WHERE id = ? AND status = 0'

// A failed or abandoned payment keeps status 0 ("pending or failed", 45 §2) but records what the gateway said.
const SQL_RECORD_RESPONSE =
  'UPDATE payments SET payment_gateway = COALESCE(?, payment_gateway), ' +
  'sp_status = COALESCE(?, sp_status), sp_bankTransactionId = COALESCE(?, sp_bankTransactionId), ' +
  'sp_gatewayResponseCode = COALESCE(?, sp_gatewayResponseCode), sp_gatewayResponseMessage = COALESCE(?, sp_gatewayResponseMessage), ' +
  'sp_orderId = COALESCE(?, sp_orderId), sp_dcc_orderId = COALESCE(?, sp_dcc_orderId), aw_intent_id = COALESCE(?, aw_intent_id), ' +
  'payment_number = COALESCE(?, payment_number), response_code = COALESCE(?, response_code), payment_status = COALESCE(?, payment_status), ' +
  'type = COALESCE(?, type) WHERE id = ? AND status = 0'

const SQL_SELECT_ROW = 'SELECT id, status, amount, paid_amount, payment_gateway, invoice_number, email FROM payments WHERE id = ?'

export type PortalInsert = {
  studentName: string
  studentId?: string | null
  invoiceNumber: string
  email: string
  paymentFor: string
  e2payment: boolean
  amountCents: number
  gateway: string
  ip?: string | null
}

/** Gateway facts mapped onto portal columns (45 §2): SecurePay `sp_*`, Airwallex `aw_intent_id`, PayWay `payment_number`, `response_code`, `payment_status`. */
export type PortalFacts = {
  gateway?: string | null
  spStatus?: string | null
  spBankTransactionId?: string | null
  spResponseCode?: string | null
  spResponseMessage?: string | null
  spOrderId?: string | null
  spDccOrderId?: string | null
  awIntentId?: string | null
  paymentNumber?: string | null
  responseCode?: string | null
  paymentStatus?: string | null
  type?: string | null
}

export type PortalRow = PortalPaymentRow

/**
 * DRY_RUN=1 may only write to the Docker fixture (45 §6): a PAY host that is not local is refused before any connection is made.
 * `isDryRun` is read here, not imported from the enquiries module, so this file stays free of unrelated imports.
 */
const LOCAL_HOSTS = ['127.0.0.1', 'localhost', '::1', '[::1]', 'portal-mysql']
const envValue = (name: string, src: Record<string, string | undefined>): string | undefined => {
  const v = src[name]?.trim()
  return v ? v : undefined
}
/** `PAYMENTS_DRY_RUN`, else `DRY_RUN`, else `1` (DEC-50). An empty value counts as unset, so `PAYMENTS_DRY_RUN=` follows `DRY_RUN`. */
export const isPaymentsDryRun = (src: Record<string, string | undefined> = process.env): boolean =>
  (envValue('PAYMENTS_DRY_RUN', src) ?? envValue('DRY_RUN', src) ?? '1') === '1'
function assertWriteAllowed(): void {
  const dry = isPaymentsDryRun(process.env)
  const host = payConfig().host.toLowerCase()
  if (dry && !LOCAL_HOSTS.includes(host)) throw new PortalUnavailable('dry-run-non-fixture', 'DRY_RUN=1 refuses to write to a non-local portal host')
}

const s = (v: string | null | undefined): SqlParam => (v === undefined || v === null || v === '' ? null : v.slice(0, 255))

const factParams = (f: PortalFacts): SqlParam[] => [
  s(f.gateway), s(f.spStatus), s(f.spBankTransactionId), s(f.spResponseCode), s(f.spResponseMessage), s(f.spOrderId), s(f.spDccOrderId),
  s(f.awIntentId), s(f.paymentNumber), s(f.responseCode), s(f.paymentStatus), s(f.type),
]

/** Inserts the pending row (status 0) and returns the portal's own row id. That id is server-only; it is never put in a URL. */
export async function insertPendingPayment(p: PortalInsert): Promise<string> {
  assertWriteAllowed()
  const amount = centsToDecimal(p.amountCents)
  const res = await runPayWrite(SQL_INSERT_PENDING, [
    p.studentName.slice(0, 255), p.studentId?.trim() ? p.studentId.slice(0, 50) : '0', p.invoiceNumber.slice(0, 100), p.email.slice(0, 254),
    p.paymentFor.slice(0, 255), p.e2payment ? 'yes' : 'no', amount, amount, p.gateway.slice(0, 40), s(p.ip),
  ])
  if (!res.insertId) throw new PortalUnavailable('no-insert-id', 'portal payments insert returned no id')
  return String(res.insertId)
}

/** status 0 → 1 with the amount the gateway confirmed. Returns false when the row was already paid (a replay). */
export async function markPortalPaid(portalId: string, paidCents: number, facts: PortalFacts = {}, at: Date = new Date()): Promise<boolean> {
  assertWriteAllowed()
  const when = at.toISOString().slice(0, 19).replace('T', ' ')
  const res = await runPayWrite(SQL_MARK_PAID, [centsToDecimal(paidCents), when, ...factParams(facts), Number(portalId)])
  return res.affectedRows > 0
}

/** Records the gateway's answer on a row that stays unpaid (declined, abandoned, expired). */
export async function recordPortalResponse(portalId: string, facts: PortalFacts): Promise<void> {
  assertWriteAllowed()
  await runPayWrite(SQL_RECORD_RESPONSE, [...factParams(facts), Number(portalId)])
}

export async function readPortalPayment(portalId: string): Promise<PortalRow | null> {
  const rows = await runPayRead<PortalRow>(SQL_SELECT_ROW, [Number(portalId)])
  return rows[0] ?? null
}
