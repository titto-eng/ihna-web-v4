// PayWay Net hosted payment page, "Bill Payments/Shopping Cart" hand-off (45 §6). Old mechanics: unsigned GET to /MakePayment with the amount
// in the URL (T/functions.php:2010-2086). New: a SERVER-SIDE secure token request binds amount and reference; the browser only gets the token.
//
// Verified against the PayWay Net hand-off developers guide, https://www.payway.com.au/docs/hosted-payment-page-handoff-developers-guide/
// (fetched 2026-10-18), cited by section below. Facts that matter operationally:
// - "Tokens are only accepted for a list of IP addresses that you must configure on the Security Information page" -> the server's egress IP.
// - A cart token is "valid for 1 hour after [it is] created, and can only be used once".
// - No sandbox host: a free test facility + merchant_id=TEST on the same host ("Testing and going live").
// - Amounts are dollars with cents ("9999.99"); payment_amount_maximum defaults to 10000 (see createSession).
// - The guide marks this hand-off as replaced by the Trusted Frame (REST API) but still documents it; the old portals depend on it.
import crypto from 'node:crypto'
import { centsToDecimal, decimalToCents } from '../money'
import { paymentSite } from '@/content/payments'
import { envValue, siteUrl, PaymentsConfigError, productionAllowed } from '../config'
import { safeEqual } from '../sign'
import { externalCall, expectOk } from '../external'
import { paywayBaseUrl, paywayIsLive } from './endpoints'
import { fakePagePath } from './fake'
import { GatewayError, SignatureError, type Gateway, type PaymentRow, type Session, type SessionInput, type StatusAnswer, type VerifiedReturn } from '../types'
import { decryptPaywayParameters } from './payway-crypto'

/** T/template-payway-response.php:137: 00 and 08 are approved ("Credit card status codes": 00 Approved, 08 Honour with identification). */
export const PAYWAY_PAID_CODES = ['00', '08']
/** `provider` hidden field: 2 = IHM (T/functions.php:2070). HCLA is 3, IHNA is anything else (the IHNA theme sends none). */
export const PAYWAY_PROVIDER_IHM = 2

/** The `provider` this site sends with its own PayWay payments: `PAYWAY_PROVIDER`, else `paymentSite.paywayProvider` (IHM 2, IHNA none). */
export function paywayProvider(env: Record<string, string | undefined> = process.env): number | undefined {
  const raw = envValue('PAYWAY_PROVIDER', env)
  if (raw !== undefined) return /^\d{1,3}$/.test(raw) ? Number(raw) : undefined
  return paymentSite.paywayProvider ?? undefined
}
/** Hidden fields we send and ask to get back (portal callbacks need type/provider and the payer; PaymentID is our uuid). */
export const PAYWAY_HIDDEN_FIELDS = ['PaymentID', 'type', 'provider', 'StudentName', 'StudentEmail', 'PaymentPurpose'] as const
/** "payment_reference_maximum_length ... default 20". */
export const PAYWAY_REFERENCE_MAX = 20

function need(name: string): string {
  const v = envValue(name)
  if (!v) throw new PaymentsConfigError(`${name} is not set`)
  return v
}

/** Our reference on PayWay reports ("Customer Reference Number"): the invoice number, else the uuid without dashes cut to PayWay's 20-character default. */
export const paywayReference = (input: Pick<SessionInput, 'invoiceNo' | 'paymentId'>): string =>
  (input.invoiceNo?.trim() || input.paymentId.replace(/-/g, '')).slice(0, PAYWAY_REFERENCE_MAX)

/** Server-to-server notification is requested only when its credentials are configured (the endpoint rejects every post without them). */
const notifyConfigured = () => Boolean(envValue('PAYWAY_NOTIFY_PASSWORD'))

/** The secure token request body ("Secure token request" + "PayWay request parameters"). Exported for the contract test. */
export function paywayTokenFields(input: SessionInput): Record<string, string> {
  const provider = paywayProvider()
  // No provider (IHNA) = the field is not sent at all, as the old IHNA theme did; the portal callback then goes to PORTAL_IHNA_URL.
  const names = PAYWAY_HIDDEN_FIELDS.filter((n) => n !== 'provider' || provider !== undefined)
  const all: Record<(typeof PAYWAY_HIDDEN_FIELDS)[number], string> = {
    PaymentID: input.paymentId,
    type: 'general',
    provider: String(provider ?? ''),
    StudentName: input.payerName,
    StudentEmail: input.payerEmail,
    PaymentPurpose: input.paymentFor ?? input.productName ?? '',
  }
  const hidden = Object.fromEntries(names.map((n) => [n, all[n]]))
  // "Browser return and redirect parameters": return_link_url is the URL, return_link_redirect is a boolean flag. Hidden fields come back in the
  // encrypted redirect only when their names are listed in the return URL ("www.example.com?PromotionCode&Name&Address").
  const returnUrl = `${siteUrl()}/pay/return/payway/?${names.join('&')}`
  const fields: Record<string, string> = {
    username: envValue('PAYWAY_USERNAME') ?? '<env:PAYWAY_USERNAME>',
    password: envValue('PAYWAY_PASSWORD') ?? '<env:PAYWAY_PASSWORD>',
    biller_code: envValue('PAYWAY_BILLER_CODE') ?? '<env:PAYWAY_BILLER_CODE>',
    merchant_id: envValue('PAYWAY_MERCHANT_ID') ?? '<env:PAYWAY_MERCHANT_ID>',
    payment_reference: paywayReference(input),
    payment_reference_change: 'false',
    payment_amount: centsToDecimal(input.amountCents), // dollars and cents, from the stored, signed row
    payment_amount_change: 'false',
    // "payment_amount_maximum ... default 10000": raised to the amount itself so a large invoice is not refused, and never above it.
    payment_amount_maximum: centsToDecimal(Math.max(input.amountCents, 1)),
    return_link_url: returnUrl,
    return_link_redirect: 'true',
    return_link_payment_status: 'all',
    information_fields: 'Name,Email',
    Name: input.payerName,
    Email: input.payerEmail,
    hidden_fields: names.join(','),
    ...hidden,
  }
  if (notifyConfigured()) {
    // "Server-to-server payment notification parameters" (valid only in a token request). extended = the documented field set, form-encoded.
    fields.reply_link_url = `${siteUrl()}/api/payments/webhook/payway/`
    fields.reply_link_post_type = 'extended'
    fields.reply_link_payment_status = 'all'
  }
  return fields
}

export const paywayGateway: Gateway = {
  name: 'payway',

  /**
   * "How do I request a card token?": HTTPS POST {base}/RequestToken, application/x-www-form-urlencoded, with biller_code, username and password.
   * The response body is `token=<cart token>` (or `error=<message>`). The customer is then sent to {base}/MakePayment?BillerCode=<biller>&token=<token>
   * ("Parameters": "Use this URL to conduct hosted payment page transactions").
   */
  async createSession(input: SessionInput): Promise<Session> {
    if (paywayIsLive() && !productionAllowed()) throw new PaymentsConfigError('PAYWAY_MERCHANT_ID is a live merchant; set PAYMENTS_ALLOW_PRODUCTION=1 to take real payments')
    const res = await externalCall(
      { service: 'payway', note: 'token request', method: 'POST', url: `${paywayBaseUrl()}/RequestToken`, encoding: 'form', body: paywayTokenFields(input) },
      { dryResponse: { token: 'dry-run' } },
    )
    if (res.dryRun) return { type: 'redirect', url: fakePagePath(input.paymentId) }
    expectOk(res, 'PayWay token request')
    const answer = new URLSearchParams(res.text.trim())
    const token = answer.get('token')
    if (!token) throw new GatewayError(`PayWay token request returned no token${answer.get('error') ? ' (error returned)' : ''}`, false)
    const u = new URL(`${paywayBaseUrl()}/MakePayment`)
    u.searchParams.set('BillerCode', need('PAYWAY_BILLER_CODE'))
    u.searchParams.set('token', token)
    return { type: 'redirect', url: u.toString() }
  },

  /**
   * PayWay Net has no transaction-query call: the hand-off guide offers only the encrypted browser redirect ("Do not use this as a method to track
   * payments ... far less reliable") and the server-to-server notification (handled at /api/payments/webhook/payway/). The PayWay REST API can
   * search transactions "regardless of how they were originally processed" (GET /transactions/search-customer|search-receipt|search-order,
   * https://www.payway.com.au/docs/rest.html#search-transactions), but it needs a separate REST secret API key, and the guide does not say which
   * REST field a Net `payment_reference` becomes, so a lookup could match the wrong payment (one invoice, two attempts). Until that is confirmed
   * with Westpac, a pending PayWay row with no notification is `unknown` -> reconcilePending flags it needs-manual-check.
   */
  async queryStatus(_p: PaymentRow): Promise<StatusAnswer> {
    return { state: 'unknown' }
  },
}

/**
 * Paid only when every documented signal agrees: response_code 00/08 AND payment_status `approved` (when sent) AND summary_code 0 (when sent;
 * "Use this to determine if the transaction was successful"; 0 Approved, 1 Declined, 2 Erred, 3 Rejected per the PayWay Classic API guide,
 * https://www.payway.com.au/docs/api-developers-guide/ ).
 */
export function paywayApproved(params: Record<string, string | undefined>): boolean {
  if (!PAYWAY_PAID_CODES.includes(params.response_code ?? '')) return false
  if (params.payment_status !== undefined && params.payment_status.toLowerCase() !== 'approved') return false
  if (params.summary_code !== undefined && params.summary_code !== '0') return false
  return true
}

/** One event id per PayWay receipt, so the browser return and the server notification of the same payment settle once ("check that your server has
 *  not previously processed a notification for the given receipt number"). */
const receiptEventId = (receipt: string | undefined, fallback: string): string => (receipt ? `payway-receipt:${receipt}` : fallback)

/**
 * "Browser return links and redirect" > "Decrypting Parameters": EncryptedParameters + Signature, AES-128-CBC, PKCS-7, zero IV (payway-crypto.ts).
 * Parameters: "Browser redirect parameters" (bank_reference, payment_amount = "Total amount of attempted transaction ... includes any surcharge",
 * payment_number, payment_reference, payment_status, response_code, summary_code, ...) plus the hidden fields named in return_link_url; there is no
 * surcharge field. The amount checked is that total, the same definition as the notification's am_payment (DEC-52). Throws SignatureError when not
 * signed with our key.
 */
export function verifyPaywayReturn(query: Record<string, string | undefined>, src: Record<string, string | undefined> = process.env): VerifiedReturn {
  const enc = query.EncryptedParameters
  const sig = query.Signature
  if (!enc || !sig) throw new SignatureError('missing EncryptedParameters or Signature')
  const params = decryptPaywayParameters(envValue('PAYWAY_ENCRYPTION_KEY', src) ?? '', enc, sig)
  const code = params.response_code ?? ''
  const receipt = params.payment_number || params.bank_reference || undefined
  return {
    paymentId: params.PaymentID ?? '',
    outcome: paywayApproved(params) ? 'paid' : 'failed',
    amountCents: decimalToCents(params.payment_amount),
    ref: receipt ?? (params.payment_reference || null),
    eventId: receiptEventId(receipt, crypto.createHash('sha256').update(`${enc}.${sig}`).digest('hex')),
    facts: { responseCode: code || undefined, responseMessage: params.response_text || undefined, paymentNumber: receipt, paymentStatus: params.payment_status || undefined },
    params,
  }
}

// ---- server-to-server payment notification (POST /api/payments/webhook/payway/) ---------------------------------------------------------

export type PaywayNotification = { paymentId: string; outcome: 'paid' | 'failed'; amountCents: number | null; ref: string | null; eventId: string; facts: VerifiedReturn['facts']; params: Record<string, string> }

/** "XML post type": <PaymentResponse><no_receipt>..</no_receipt>...<parameter><name>..</name><value>..</value></parameter></PaymentResponse>. */
function parseXml(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  const unesc = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').trim()
  for (const m of body.matchAll(/<parameter>\s*<name>([\s\S]*?)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/parameter>/g)) out[unesc(m[1])] = unesc(m[2])
  const flat = body.replace(/<parameter>[\s\S]*?<\/parameter>/g, '')
  for (const m of flat.matchAll(/<([A-Za-z_][\w]*)>([^<]*)<\/\1>/g)) out[m[1]] ??= unesc(m[2])
  return out
}

/**
 * "Receiving payment notification": PayWay POSTs the result of each payment; "Your website must check that the Basic Auth username and password in
 * the Authorization header match your credentials in PayWay"; the extended/XML field list also carries `username` (the PayWay client number) and
 * `password`. Either source is accepted, compared in constant time with PAYWAY_NOTIFY_USERNAME / PAYWAY_NOTIFY_PASSWORD (shown in the Setup Net
 * wizard). Fields ("Extended and XML post types"): am_payment (dollars, incl. surcharge), am_surcharge, cd_response, fl_success (1 = approved),
 * no_receipt, payment_reference, plus our hidden fields. The amount checked is am_payment, the total charged, as in the browser redirect, so both
 * messages of one payment agree; any surcharge is added by start.ts into the row's amountCents, so a PayWay-side surcharge is an amount-mismatch.
 * Throws SignatureError when the credentials do not match.
 */
export function verifyPaywayNotification(args: { authorization: string | null; contentType: string | null; rawBody: string }, src: Record<string, string | undefined> = process.env): PaywayNotification {
  const wantPass = envValue('PAYWAY_NOTIFY_PASSWORD', src)
  const wantUser = envValue('PAYWAY_NOTIFY_USERNAME', src)
  if (!wantPass) throw new SignatureError('PayWay notification credentials are not configured')
  const isXml = /xml/i.test(args.contentType ?? '') || args.rawBody.trimStart().startsWith('<')
  const params = isXml ? parseXml(args.rawBody) : Object.fromEntries(new URLSearchParams(args.rawBody))

  let user = params.username
  let pass = params.password
  const basic = /^Basic\s+(.+)$/i.exec(args.authorization ?? '')
  if (basic) {
    const decoded = Buffer.from(basic[1], 'base64').toString('utf8')
    const i = decoded.indexOf(':')
    if (i >= 0) { user = decoded.slice(0, i); pass = decoded.slice(i + 1) }
  }
  const passOk = safeEqual(pass ?? '', wantPass)
  const userOk = wantUser ? safeEqual(user ?? '', wantUser) : true
  if (!passOk || !userOk) throw new SignatureError('PayWay notification credentials do not match')

  const paid = params.fl_success === '1' && PAYWAY_PAID_CODES.includes(params.cd_response ?? '')
  const receipt = params.no_receipt || undefined
  // Stored and forwarded to the portal callback in the SAME names as the browser redirect (after.ts portalCallbackStep), never the credentials.
  const hidden = Object.fromEntries(PAYWAY_HIDDEN_FIELDS.filter((k) => params[k] !== undefined).map((k) => [k, params[k]]))
  const normalised: Record<string, string> = {
    ...hidden,
    payment_amount: params.am_payment ?? '',
    payment_number: receipt ?? '',
    bank_reference: receipt ?? '',
    payment_reference: params.payment_reference ?? '',
    response_code: params.cd_response ?? '',
    response_text: params.tx_response ?? '',
    summary_code: params.cd_summary ?? '',
    payment_status: paid ? 'approved' : 'declined',
    payment_date: params.dt_payment ?? '',
  }
  return {
    paymentId: params.PaymentID ?? '',
    outcome: paid ? 'paid' : 'failed',
    amountCents: decimalToCents(params.am_payment),
    ref: receipt ?? (params.payment_reference || null),
    eventId: receiptEventId(receipt, `payway-notify:${crypto.createHash('sha256').update(args.rawBody).digest('hex')}`),
    facts: { responseCode: params.cd_response || undefined, responseMessage: params.tx_response || undefined, paymentNumber: receipt, paymentStatus: paid ? 'approved' : 'declined' },
    params: normalised,
  }
}
