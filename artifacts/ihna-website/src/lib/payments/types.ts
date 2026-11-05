import type { GatewayName } from './config'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'flagged' | 'cancelled' | 'expired'
export type PaymentKind = 'invoice' | 'product' | 'sae' | 'portalReturn'

/** Non-secret gateway facts kept in `payments.flags.gateway`; the portal row columns are filled from here. Never tokens or client secrets. */
export type GatewayFacts = {
  responseCode?: string
  responseMessage?: string
  bankTransactionId?: string
  orderId?: string
  dccOrderId?: string
  intentId?: string
  paymentNumber?: string
  paymentStatus?: string
}

export type PaymentFlags = {
  amountSig?: string
  submissionId?: string
  /** Event ids already applied (webhook replay protection). */
  eventIds?: string[]
  /** Why a row is `flagged`: amount-mismatch, signature-mismatch, needs-manual-check, refunded. */
  reason?: string
  reasonDetail?: string
  gateway?: GatewayFacts
  /** PayWay hidden fields and the decrypted return, forwarded to the portal callbacks. */
  payway?: { type?: string; provider?: number; autoenrol?: boolean; params?: Record<string, string> }
  chargeAttempted?: boolean
  monday?: { itemId?: string }
  sae?: { graphUserId?: string; canvasUserId?: string; welcomeSent?: boolean }
  e2payment?: boolean
  [k: string]: unknown
}

/** What the rest of the code sees of a stored payment (the Postgres mirror row). */
export type PaymentRow = {
  id: number | string
  paymentId: string
  kind: PaymentKind
  status: PaymentStatus
  gateway: GatewayName | string | null
  gatewayRef?: string | null
  amountCents: number
  baseCents?: number | null
  surchargeCents?: number | null
  currency: string
  payerName?: string | null
  payerEmail?: string | null
  paymentFor?: string | null
  invoiceNo?: string | null
  studentId?: string | null
  productId?: number | null
  portalPaymentId?: string | null
  flags: PaymentFlags
  steps: { step: string; status?: string | null; attempts?: number | null }[]
  statusHistory: { status: string; at?: string | null; note?: string | null }[]
  settledAt?: string | null
  createdAt: string
  ip?: string | null
}

export type Outcome = 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded'

export type VerifiedReturn = {
  paymentId: string
  outcome: Outcome | 'pending'
  amountCents: number | null
  ref: string | null
  eventId: string | null
  facts: GatewayFacts
  /** PayWay: the decrypted parameters. */
  params?: Record<string, string>
}

export type StatusAnswer = { state: 'paid' | 'failed' | 'pending' | 'unknown'; amountCents?: number; ref?: string; facts?: GatewayFacts }

export type SessionInput = {
  paymentId: string
  amountCents: number
  currency: string
  kind: PaymentKind
  payerName: string
  payerEmail: string
  invoiceNo?: string | null
  paymentFor?: string | null
  portalPaymentId: string
  productName?: string | null
  /** `T/functions.php` hidden fields: provider 2 = IHM; autoenrol payments are portal-started and never come through here. */
  ip?: string | null
}

/** `next` tells the browser what to do after `POST /api/payments/start/`. */
export type Session =
  | { type: 'redirect'; url: string; gatewayRef?: string; facts?: GatewayFacts }
  | { type: 'securepay'; url: string; gatewayRef?: string; facts?: GatewayFacts }
  | { type: 'airwallex'; url: string; clientSecret?: string; intentId?: string; gatewayRef?: string; facts?: GatewayFacts }

export interface Gateway {
  name: GatewayName | 'fake'
  createSession(input: SessionInput): Promise<Session>
  queryStatus(payment: PaymentRow): Promise<StatusAnswer>
}

export class SignatureError extends Error {
  constructor(message = 'invalid signature') {
    super(message)
    this.name = 'SignatureError'
  }
}
export class GatewayError extends Error {
  readonly retryable: boolean
  constructor(message: string, retryable = true) {
    super(message)
    this.name = 'GatewayError'
    this.retryable = retryable
  }
}
