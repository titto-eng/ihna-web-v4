// Airwallex payment intent + drop-in (45 §6). Old mechanics: login -> payment_intents/create -> drop-in -> webhook with
// HMAC-SHA256(timestamp + body) in x-signature (T/template-airwallex-dropin-checkout.php:55-150, T/template-airwallex-dropin-response.php:1-40).
// New: the amount comes from the stored row, the intent carries our uuid as request_id and merchant_order_id, the webhook verifies
// the raw body with a timestamp window and is idempotent on the event id.
// Verified against Airwallex's public docs (2026-10): every endpoint below cites its page. Amounts are MAJOR units ("Airwallex amounts are in
// major currency units", drop-in quickstart). Sandbox: AIRWALLEX_ENV=demo (endpoints.ts).
import crypto from 'node:crypto'
import { centsToDecimal, decimalToCents } from '../money'
import { envValue, siteUrl } from '../config'
import { externalCall, expectOk } from '../external'
import { airwallexApiUrl } from './endpoints'
import { fakePagePath } from './fake'
import { GatewayError, SignatureError, type Gateway, type Outcome, type PaymentRow, type Session, type SessionInput, type StatusAnswer } from '../types'

export { airwallexEnv } from './endpoints'

const apiUrl = () => airwallexApiUrl()

let cached: { value: string; exp: number; base: string } | null = null
/** Tests only: forget the cached access token. */
export const resetAirwallexToken = () => { cached = null }

/**
 * POST /api/v1/authentication/login with x-client-id + x-api-key, no body; 201 {token, expires_at}. "The access token remains valid for
 * 30 minutes and can be reused until it expires": cached until a minute before expires_at.
 * https://www.airwallex.com/docs/api/authentication/api_access_token
 */
async function bearer(): Promise<string> {
  const base = apiUrl()
  if (cached && cached.base === base && cached.exp > Date.now() + 60_000) return cached.value
  const res = await externalCall(
    {
      service: 'airwallex', note: 'login', method: 'POST', url: `${base}/api/v1/authentication/login`, encoding: 'none',
      headers: { 'content-type': 'application/json', 'x-client-id': envValue('AIRWALLEX_CLIENT_ID') ?? '<env:AIRWALLEX_CLIENT_ID>', 'x-api-key': envValue('AIRWALLEX_API_KEY') ?? '<env:AIRWALLEX_API_KEY>' },
    },
    { dryResponse: { token: 'dry-run', expires_at: new Date(Date.now() + 1_800_000).toISOString() } },
  )
  if (res.dryRun) return 'dry-run'
  expectOk(res, 'Airwallex login')
  const j = res.json as { token?: string; expires_at?: string } | null
  if (!j?.token) throw new GatewayError('Airwallex login returned no token', false)
  const exp = j.expires_at ? Date.parse(j.expires_at) : NaN
  cached = { value: j.token, exp: Number.isFinite(exp) ? exp : Date.now() + 25 * 60_000, base }
  return j.token
}

type Intent = { id?: string; client_secret?: string; status?: string; amount?: number; captured_amount?: number; currency?: string }

export const airwallexGateway: Gateway = {
  name: 'airwallex',

  /**
   * POST /api/v1/pa/payment_intents/create {request_id, amount (major units), currency, merchant_order_id, return_url?, metadata?}.
   * request_id is the idempotency key ("reusing one returns the existing PaymentIntent"); both ids are <= 64 chars (a uuid is 36).
   * https://www.airwallex.com/docs/api/payments/payment_intents/create ,
   * https://www.airwallex.com/docs/payments/integration-options/web-checkout/drop-in-element/guest-user-checkout
   */
  async createSession(input: SessionInput): Promise<Session> {
    const token = await bearer()
    const res = await externalCall(
      {
        service: 'airwallex', note: 'payment intent create', method: 'POST', url: `${apiUrl()}/api/v1/pa/payment_intents/create`,
        headers: { authorization: `Bearer ${token}` },
        body: {
          request_id: input.paymentId,
          amount: Number(centsToDecimal(input.amountCents)), // major units, from the stored row
          currency: input.currency,
          merchant_order_id: input.paymentId,
          return_url: `${siteUrl()}/pay/return/airwallex/?id=${input.paymentId}`,
          metadata: { paymentId: input.paymentId, invoiceNumber: input.invoiceNo ?? '' },
        },
      },
      { dryResponse: { id: 'dry-intent', client_secret: 'dry-secret' } },
    )
    if (res.dryRun) return { type: 'redirect', url: fakePagePath(input.paymentId) }
    expectOk(res, 'Airwallex intent create')
    const j = res.json as Intent | null
    if (!j?.id || !j.client_secret) throw new GatewayError('Airwallex intent create returned no intent', false)
    return { type: 'airwallex', url: `/pay/airwallex/${input.paymentId}/`, clientSecret: j.client_secret, intentId: j.id, gatewayRef: j.id, facts: { intentId: j.id } }
  },

  /**
   * The intent's own status (retrieve below): SUCCEEDED -> paid for captured_amount (falls back to amount), CANCELLED -> failed; REQUIRES_PAYMENT_METHOD,
   * REQUIRES_CUSTOMER_ACTION, REQUIRES_CAPTURE and PENDING are still open, so pending (a failed attempt can be retried by the customer).
   */
  async queryStatus(p: PaymentRow): Promise<StatusAnswer> {
    const intentId = p.gatewayRef
    if (!intentId) return { state: 'unknown' }
    const j = await retrieveIntent(intentId)
    if (!j) return { state: 'unknown' }
    switch ((j.status ?? '').toUpperCase()) {
      case 'SUCCEEDED': {
        const captured = j.captured_amount ?? j.amount
        return { state: 'paid', amountCents: captured === undefined ? undefined : decimalToCents(captured) ?? undefined, ref: intentId, facts: { intentId, paymentStatus: 'SUCCEEDED' } }
      }
      case 'CANCELLED': return { state: 'failed', facts: { intentId, paymentStatus: 'CANCELLED' } }
      default: return { state: 'pending' }
    }
  },
}

/**
 * GET /api/v1/pa/payment_intents/{id} with the bearer token. The drop-in page fetches the intent server-side so the client secret is never stored (45 §2).
 * https://www.airwallex.com/docs/api/payments/payment_intents/retrieve
 */
export async function retrieveIntent(intentId: string): Promise<Intent | null> {
  const token = await bearer()
  const res = await externalCall(
    { service: 'airwallex', note: 'payment intent retrieve', method: 'GET', url: `${apiUrl()}/api/v1/pa/payment_intents/${encodeURIComponent(intentId)}`, headers: { authorization: `Bearer ${token}` } },
    { dryResponse: { id: intentId, status: 'REQUIRES_PAYMENT_METHOD', client_secret: 'dry-secret' } },
  )
  if (!res.dryRun && res.status === 404) return null
  if (!res.dryRun) expectOk(res, 'Airwallex intent retrieve')
  return (res.json as Intent | null) ?? null
}

// ---- webhook --------------------------------------------------------------------------------------------------------------

export const WEBHOOK_TOLERANCE_MS = 5 * 60_000

/**
 * Headers x-timestamp (Unix ms) and x-signature = hex HMAC-SHA256(key = the notification URL's secret, message = x-timestamp as received + the raw,
 * unparsed body). Airwallex leaves the tolerance to the merchant ("decide if the difference is within your tolerance"): 5 minutes here.
 * https://www.airwallex.com/docs/developer-tools/webhooks/listen-for-webhook-events . Throws SignatureError.
 */
export function verifyAirwallexWebhook(args: { secret: string | undefined; timestamp: string | null; signature: string | null; rawBody: string; nowMs?: number }): void {
  const { secret, timestamp, signature, rawBody } = args
  if (!secret) throw new SignatureError('webhook secret not configured')
  if (!timestamp || !signature) throw new SignatureError('missing signature headers')
  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) throw new SignatureError('bad timestamp')
  if (Math.abs((args.nowMs ?? Date.now()) - ts) > WEBHOOK_TOLERANCE_MS) throw new SignatureError('stale timestamp')
  const expected = crypto.createHmac('sha256', secret).update(timestamp + rawBody).digest('hex')
  const given = signature.trim().toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(given) || !crypto.timingSafeEqual(Buffer.from(given, 'hex'), Buffer.from(expected, 'hex'))) throw new SignatureError('signature mismatch')
}

export type AirwallexEvent = {
  id?: string
  name?: string
  data?: { object?: { id?: string; payment_intent_id?: string; merchant_order_id?: string; status?: string; amount?: number; captured_amount?: number; metadata?: Record<string, unknown> } }
}

export type MappedEvent =
  | { kind: 'settle'; outcome: Outcome; paymentId: string | null; intentId: string | null; amountCents: number | null; eventId: string }
  | { kind: 'ignore'; reason: string }

/**
 * Event names from https://www.airwallex.com/docs/payments/reference/payments-webhooks :
 * - payment_intent.succeeded -> paid, for captured_amount (falls back to amount; major units).
 * - payment_intent.cancelled -> failed.
 * - refund.accepted / refund.settled -> refunded (data.object is the Refund: id = refund id, payment_intent_id = the intent).
 * - payment_intent.payment_failed, payment_attempt.*, refund.received / refund.failed and the rest are informational: a failed ATTEMPT is not
 *   final (the customer may retry on the same intent), a received refund is not yet accepted, a failed one changes nothing.
 * Idempotency: the event `id` ("corresponds to Event ID in the web app") is stored per payment and a replay is ignored (settle.ts).
 */
export const AIRWALLEX_REFUND_EVENTS = ['refund.accepted', 'refund.settled']

export function mapAirwallexEvent(e: AirwallexEvent): MappedEvent {
  const name = e.name ?? ''
  const eventId = e.id
  const o = e.data?.object
  if (!eventId || !o) return { kind: 'ignore', reason: 'malformed event' }
  const paymentId = (typeof o.metadata?.paymentId === 'string' ? o.metadata.paymentId : null) ?? (o.merchant_order_id ?? null)
  const intentId = o.payment_intent_id ?? o.id ?? null
  if (name === 'payment_intent.succeeded') {
    const captured = o.captured_amount ?? o.amount
    return { kind: 'settle', outcome: 'paid', paymentId, intentId, amountCents: captured === undefined ? null : decimalToCents(captured), eventId }
  }
  if (name === 'payment_intent.cancelled') return { kind: 'settle', outcome: 'failed', paymentId, intentId, amountCents: null, eventId }
  if (AIRWALLEX_REFUND_EVENTS.includes(name)) {
    // A Refund object's own id is the refund id, never the intent: only payment_intent_id identifies the payment.
    return { kind: 'settle', outcome: 'refunded', paymentId: null, intentId: o.payment_intent_id ?? null, amountCents: o.amount === undefined ? null : decimalToCents(o.amount), eventId }
  }
  return { kind: 'ignore', reason: `event ${name || 'unnamed'} is informational` }
}
