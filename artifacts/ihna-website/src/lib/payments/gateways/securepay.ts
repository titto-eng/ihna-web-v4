// SecurePay (Australia Post) tokenised card (45 §6). Old mechanics: OAuth -> orders/initiate -> UI tokenises -> POST /v2/payments
// (T/template-secure-pay-card-dcc.php:37-110, T/functions.php:2236-2410). New: the amount always comes from the stored row,
// uuid = orderId = Idempotency-Key, and the card token is charged by POST /api/payments/securepay/charge/.
//
// Verified against the SecurePay API reference (https://auspost.com.au/payments/docs/securepay/ , archived copy of 2024-12-17: the page now
// 404s and SecurePay hands the reference out on request at https://www.securepay.com.au/support/developer-documentation). Section names are
// cited next to each call. Amounts are integer CENTS ("Do not send float values (1.00 will be treated as 1 cent)"). Requests time out after
// 30 seconds on SecurePay's side ("for all requests timeout is 30 seconds"). Sandbox: SECUREPAY_ENV=sandbox (endpoints.ts).
import { isIP } from 'node:net'
import crypto from 'node:crypto'
import { envValue, gatewayMode, isDryRun } from '../config'
import { externalCall, expectOk, type ExternalResult } from '../external'
import { securepayApiUrl, securepayAuthUrl } from './endpoints'
import { GatewayError, type Gateway, type GatewayFacts, type PaymentRow, type Session, type SessionInput, type StatusAnswer } from '../types'

/** The old theme's approved codes (T/functions.php:2398). Informational only: the documented outcome is the Payment Object's `status`. */
export const SECUREPAY_PAID_CODES = ['00', '11', '77', '08', '16']
/** SecurePay's own request timeout is 30 s; we wait a little longer so a slow approval is not mistaken for a network error. */
const SECUREPAY_TIMEOUT_MS = 35_000
/** "audience parameter must be set to https://api.payments.auspost.com.au" (Authentication > Client Credentials). */
export const SECUREPAY_AUDIENCE = 'https://api.payments.auspost.com.au'

const merchantCode = () => envValue('SECUREPAY_MERCHANT_CODE') ?? '<env:SECUREPAY_MERCHANT_CODE>'

let cachedToken: { value: string; exp: number; url: string } | null = null
/** Tests only: forget the cached access token. */
export const resetSecurepayToken = () => { cachedToken = null }

/**
 * Authentication > Client Credentials: POST {auth URL} with `Authorization: Basic base64(clientId:clientSecret)`,
 * `Content-Type: application/x-www-form-urlencoded`, body grant_type=client_credentials&audience=https://api.payments.auspost.com.au.
 * Response {access_token, token_type: Bearer, expires_in (seconds; 86400), scope}. "do not retrieve a new access_token for every API call":
 * cached until a minute before it expires.
 */
async function accessToken(): Promise<string> {
  const url = securepayAuthUrl()
  if (cachedToken && cachedToken.url === url && cachedToken.exp > Date.now() + 60_000) return cachedToken.value
  const id = envValue('SECUREPAY_CLIENT_ID')
  const secret = envValue('SECUREPAY_CLIENT_SECRET')
  const res = await externalCall(
    {
      service: 'securepay', note: 'oauth token', method: 'POST', url, encoding: 'form',
      headers: { authorization: `Basic ${Buffer.from(`${id ?? '<env:SECUREPAY_CLIENT_ID>'}:${secret ?? '<env:SECUREPAY_CLIENT_SECRET>'}`).toString('base64')}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: { grant_type: 'client_credentials', audience: SECUREPAY_AUDIENCE },
    },
    { dryResponse: { access_token: 'dry-run', token_type: 'Bearer', expires_in: 86400 } },
  )
  if (res.dryRun) return 'dry-run'
  expectOk(res, 'SecurePay oauth')
  const j = res.json as { access_token?: string; expires_in?: number } | null
  if (!j?.access_token) throw new GatewayError('SecurePay oauth returned no token', false)
  cachedToken = { value: j.access_token, exp: Date.now() + (Number(j.expires_in) > 0 ? Number(j.expires_in) : 3600) * 1000, url }
  return j.access_token
}

/**
 * `ip` is required on every payment call ("A customer IP address. Must be a valid IPv4 or IPv6"). Never invented for a real call: no valid IP,
 * no call. A call that is only recorded (DRY_RUN=1 or fake mode) gets the loopback placeholder so tests and dry runs work without one.
 */
function customerIp(ip: string | null | undefined): string {
  const v = (ip ?? '').trim()
  if (isIP(v)) return v
  if (isDryRun() || gatewayMode() === 'fake') return '127.0.0.1'
  throw new GatewayError('SecurePay needs the customer IP address and none is available for this request', false)
}

/** SecurePay error body: {errors: [{id, code, detail, source.pointer}]} ("Error Object"). Only the code reaches a log. */
const errorCode = (res: ExternalResult): string | undefined => (res.json as { errors?: { code?: string }[] } | null)?.errors?.[0]?.code

/** The Payment Object's `amount` is documented as a String of cents ("10000") but the examples also show a number. */
const centsOf = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isSafeInteger(v)) return v
  if (typeof v === 'string' && /^\d{1,12}$/.test(v)) return Number(v)
  return null
}

export type SecurePayOrder = { orderId: string; orderToken: string; dryRun: boolean }
export type SecurePayOrderType = 'DYNAMIC_CURRENCY_CONVERSION' | 'THREED_SECURE'

/**
 * Rest API > Initiate Payment Order: POST {api}/v2/payments/orders/initiate {merchantCode, amount (cents), ip, orderType, orderReference?} ->
 * {orderId, orderToken (JWT, expires after 10 minutes), ...}. Only needed BEFORE a DCC or 3DS2 payment; a plain card payment needs no order.
 * Not used by the card page today: DCC is off (see SecurePayPage) and 3DS2 is not enabled. Kept, contract-tested, for when either is switched on.
 */
export async function initiateOrder(p: Pick<PaymentRow, 'paymentId' | 'amountCents'>, ip: string | null | undefined, orderType: SecurePayOrderType): Promise<SecurePayOrder> {
  const ipAddress = customerIp(ip)
  const token = await accessToken()
  const res = await externalCall(
    {
      service: 'securepay', note: 'orders initiate', method: 'POST', url: `${securepayApiUrl()}/v2/payments/orders/initiate`,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: { merchantCode: merchantCode(), amount: p.amountCents, ip: ipAddress, orderType, orderReference: p.paymentId },
    },
    { dryResponse: { orderId: 'dry-order', orderToken: 'dry-token' }, timeoutMs: SECUREPAY_TIMEOUT_MS },
  )
  if (!res.dryRun) expectOk(res, 'SecurePay order initiate')
  const j = res.json as { orderId?: string; orderToken?: string } | null
  if (!j?.orderId || !j.orderToken) throw new GatewayError('SecurePay order initiate returned no order', false)
  return { orderId: j.orderId, orderToken: j.orderToken, dryRun: res.dryRun }
}

export type SecurePayCharge = { outcome: 'paid' | 'failed' | 'unknown'; amountCents: number | null; facts: GatewayFacts; dryRun: boolean }

/**
 * Rest API > Create Payment: POST {api}/v2/payments with `Authorization: Bearer`, `Content-Type: application/json` and `Idempotency-Key`
 * ("The server guarantees to process a payment only once if the same key is used") = the payment uuid; body {merchantCode, token, ip, amount
 * (integer cents), orderId}. orderId = our uuid, so the payment is findable (and refundable: POST /v2/orders/{orderId}/refunds) by it.
 * Payment Object `status` is the outcome: paid | failed | unknown ("not determined (e.g. due to connectivity issues)"). `unknown` is NOT a
 * decline: the row stays pending and reconcilePending flags it for a person. A card token is single-use and lives 30 minutes.
 */
export async function chargeToken(p: Pick<PaymentRow, 'paymentId' | 'amountCents'>, cardToken: string, ip?: string | null): Promise<SecurePayCharge> {
  const ipAddress = customerIp(ip) // before the token: no IP, no call at all
  const token = await accessToken()
  const res = await externalCall(
    {
      service: 'securepay', note: 'charge', method: 'POST', url: `${securepayApiUrl()}/v2/payments`,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': p.paymentId },
      body: { merchantCode: merchantCode(), token: cardToken, ip: ipAddress, amount: p.amountCents, orderId: p.paymentId },
    },
    {
      timeoutMs: SECUREPAY_TIMEOUT_MS,
      dryResponse: { createdAt: new Date().toISOString(), merchantCode: 'dry', customerCode: 'anonymous', ip: ipAddress, amount: String(p.amountCents), currency: 'AUD', status: 'paid', orderId: p.paymentId, bankTransactionId: `dry-${crypto.randomUUID().slice(0, 8)}`, gatewayResponseCode: '00', gatewayResponseMessage: 'dry run' },
    },
  )
  if (res.status >= 500 || res.status === 429) throw new GatewayError(`SecurePay charge: HTTP ${res.status}`, true)
  const j = (res.json ?? {}) as { status?: string; amount?: unknown; bankTransactionId?: string; gatewayResponseCode?: string; gatewayResponseMessage?: string; orderId?: string; errorCode?: string }
  // A 4xx with an Error Object and no Payment Object (bad token, validation) never reached the bank: nothing to settle, the customer can retry.
  if (res.status >= 400 && !j.status) throw new GatewayError(`SecurePay charge: HTTP ${res.status}${errorCode(res) ? ` ${errorCode(res)}` : ''}`, false)
  const status = (j.status ?? '').toLowerCase()
  return {
    outcome: status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : 'unknown',
    amountCents: centsOf(j.amount),
    dryRun: res.dryRun,
    facts: { responseCode: j.gatewayResponseCode || undefined, responseMessage: j.gatewayResponseMessage, bankTransactionId: j.bankTransactionId, orderId: j.orderId, paymentStatus: j.status ?? undefined },
  }
}

export const securepayGateway: Gateway = {
  name: 'securepay',

  /** Nothing remote yet: the card page loads the SecurePay UI, which tokenises; POST /api/payments/securepay/charge/ charges the token. */
  async createSession(input: SessionInput): Promise<Session> {
    return { type: 'securepay', url: `/pay/securepay/${input.paymentId}/` }
  },

  /**
   * The SecurePay v2 card API has no payment-retrieve endpoint (the reference lists Create/Refund/PreAuth/Capture/Initiate Order/Payment
   * Instruments only; "Payment Transaction Status" exists for Apple Pay), and the single-use card token is never stored, so an Idempotency-Key
   * replay is impossible too. A row never charged is abandoned (`pending`, expires after 24 h); one that was charged but not settled
   * (network error, `status: unknown`) needs a person: `unknown` -> reconcilePending flags it needs-manual-check.
   */
  async queryStatus(p: PaymentRow): Promise<StatusAnswer> {
    return p.flags.chargeAttempted ? { state: 'unknown' } : { state: 'pending' }
  },
}
