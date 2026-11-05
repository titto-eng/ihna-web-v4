// Server-side amount and id handling (rule 6). Nothing the browser sends decides a payment id or an amount.
import crypto from 'node:crypto'
import { envValue, isProduction, PaymentsConfigError } from './config'

/** HMAC key: PAYMENTS_DATA_KEY. Outside production a key derived from PAYLOAD_SECRET keeps dev and tests running. */
export function dataKey(src: Record<string, string | undefined> = process.env): Buffer {
  const k = envValue('PAYMENTS_DATA_KEY', src)
  if (k) return Buffer.from(k, 'utf8')
  if (isProduction(src)) throw new PaymentsConfigError('PAYMENTS_DATA_KEY is required in production')
  const base = envValue('PAYLOAD_SECRET', src)
  if (!base) throw new PaymentsConfigError('PAYMENTS_DATA_KEY (or PAYLOAD_SECRET in development) is not set')
  return crypto.createHmac('sha256', base).update('payments-data-key').digest()
}

const hmac = (label: string, data: string) => crypto.createHmac('sha256', dataKey()).update(`${label}\n${data}`).digest()

/**
 * The payment id is a v4-shaped uuid derived from the client's submissionId with a server secret: unguessable, never sequential,
 * and a retry of the same submission maps to the same row (idempotent start). The client cannot choose it.
 */
export function derivePaymentId(submissionId: string): string {
  const b = hmac('payment-id', submissionId).subarray(0, 16)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = b.toString('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

export type AmountSubject = { paymentId: string; amountCents: number; currency: string; kind: string }
const subject = (s: AmountSubject) => `${s.paymentId}|${s.amountCents}|${s.currency}|${s.kind}`

/** Signature stored with the row when it is created; re-checked before a gateway session is built and again when a payment is settled. */
export const signAmount = (s: AmountSubject): string => hmac('amount', subject(s)).toString('hex')

export function verifyAmountSignature(s: AmountSubject, sig: unknown): boolean {
  if (typeof sig !== 'string' || !/^[0-9a-f]{64}$/.test(sig)) return false
  return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), hmac('amount', subject(s)))
}

export const safeEqual = (a: string, b: string): boolean => {
  const x = crypto.createHash('sha256').update(a).digest()
  const y = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(x, y)
}
