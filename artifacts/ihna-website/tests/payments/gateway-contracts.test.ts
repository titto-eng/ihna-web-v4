import crypto from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaymentsConfigError } from '@/lib/payments/config'
import { airwallexGateway, mapAirwallexEvent, resetAirwallexToken, retrieveIntent, verifyAirwallexWebhook } from '@/lib/payments/gateways/airwallex'
import { chargeToken, initiateOrder, resetSecurepayToken, securepayGateway } from '@/lib/payments/gateways/securepay'
import { paywayApproved, paywayGateway, paywayReference, verifyPaywayNotification, verifyPaywayReturn } from '@/lib/payments/gateways/payway'
import { encryptPaywayParameters } from '@/lib/payments/gateways/payway-crypto'
import { GatewayError, SignatureError, type PaymentRow, type SessionInput } from '@/lib/payments/types'

// Mock-fetch contract tests: every gateway request is asserted against the provider's documented contract (URL, method, headers, body).
// Sources are cited in the clients: Airwallex docs (airwallex.com/docs), the SecurePay API reference (auspost.com.au/payments/docs/securepay,
// archived 2024-12-17), the PayWay Net hand-off guide (payway.com.au/docs/hosted-payment-page-handoff-developers-guide). No value here is real.

type Call = { url: string; method: string; headers: Record<string, string>; body: string | undefined }
const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()
const calls = (): Call[] => fetchMock.mock.calls.map(([url, init]) => ({ url, method: String(init.method), headers: (init.headers ?? {}) as Record<string, string>, body: init.body as string | undefined }))
const reply = (body: unknown, status = 200) => fetchMock.mockResolvedValueOnce(new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }))

const GATEWAY_ENV = [
  'PAYMENTS_GATEWAY_MODE', 'DRY_RUN', 'PAYMENTS_ALLOW_PRODUCTION', 'NEXT_PUBLIC_SITE_URL',
  'AIRWALLEX_ENV', 'AIRWALLEX_API_URL', 'AIRWALLEX_CLIENT_ID', 'AIRWALLEX_API_KEY',
  'SECUREPAY_ENV', 'SECUREPAY_API_URL', 'SECUREPAY_AUTH_URL', 'SECUREPAY_CLIENT_ID', 'SECUREPAY_CLIENT_SECRET', 'SECUREPAY_MERCHANT_CODE',
  'PAYWAY_BASE_URL', 'PAYWAY_USERNAME', 'PAYWAY_PASSWORD', 'PAYWAY_BILLER_CODE', 'PAYWAY_MERCHANT_ID', 'PAYWAY_NOTIFY_USERNAME', 'PAYWAY_NOTIFY_PASSWORD',
]
let saved: Record<string, string | undefined> = {}

beforeEach(() => {
  saved = Object.fromEntries(GATEWAY_ENV.map((k) => [k, process.env[k]]))
  for (const k of GATEWAY_ENV) delete process.env[k]
  Object.assign(process.env, {
    PAYMENTS_GATEWAY_MODE: 'real', DRY_RUN: '0', NEXT_PUBLIC_SITE_URL: 'https://site.example.test',
    AIRWALLEX_ENV: 'demo', AIRWALLEX_CLIENT_ID: 'aw-client-test', AIRWALLEX_API_KEY: 'aw-key-test',
    SECUREPAY_ENV: 'sandbox', SECUREPAY_CLIENT_ID: 'sp-client-test', SECUREPAY_CLIENT_SECRET: 'sp-secret-test', SECUREPAY_MERCHANT_CODE: 'SPMERCHANTTEST',
    PAYWAY_USERNAME: 'pw-user-test', PAYWAY_PASSWORD: 'pw-pass-test', PAYWAY_BILLER_CODE: '000000', PAYWAY_MERCHANT_ID: 'TEST',
  })
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  resetAirwallexToken()
  resetSecurepayToken()
})
afterEach(() => {
  vi.unstubAllGlobals()
  for (const k of GATEWAY_ENV) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k] }
})

const sessionInput = (over: Partial<SessionInput> = {}): SessionInput => ({
  paymentId: crypto.randomUUID(), amountCents: 125_000, currency: 'AUD', kind: 'invoice', payerName: 'Test Payer', payerEmail: 'payer@example.test',
  invoiceNo: 'INV-1001', paymentFor: 'Tuition', portalPaymentId: '42', ...over,
})
const row = (over: Partial<PaymentRow> = {}): PaymentRow => ({
  id: 1, paymentId: crypto.randomUUID(), kind: 'invoice', status: 'pending', gateway: 'airwallex', amountCents: 9950, currency: 'AUD', flags: {}, steps: [], statusHistory: [], createdAt: new Date().toISOString(), ...over,
})

describe('Airwallex (docs: api_access_token, payment_intents create/retrieve, webhooks)', () => {
  it('login then create intent: exact URLs, headers and a major-unit amount on the demo host', async () => {
    reply({ token: 'aw-token', expires_at: new Date(Date.now() + 30 * 60_000).toISOString() }, 201)
    reply({ id: 'int_demo_1', client_secret: 'cs_demo_1', status: 'REQUIRES_PAYMENT_METHOD' }, 201)
    const input = sessionInput()
    const s = await airwallexGateway.createSession(input)
    expect(s).toMatchObject({ type: 'airwallex', intentId: 'int_demo_1', clientSecret: 'cs_demo_1', gatewayRef: 'int_demo_1', url: `/pay/airwallex/${input.paymentId}/` })
    const [login, create] = calls()
    expect(login).toMatchObject({ url: 'https://api-demo.airwallex.com/api/v1/authentication/login', method: 'POST', body: undefined })
    expect(login.headers).toMatchObject({ 'x-client-id': 'aw-client-test', 'x-api-key': 'aw-key-test', 'content-type': 'application/json' })
    expect(create).toMatchObject({ url: 'https://api-demo.airwallex.com/api/v1/pa/payment_intents/create', method: 'POST' })
    expect(create.headers).toMatchObject({ authorization: 'Bearer aw-token', 'content-type': 'application/json' })
    expect(JSON.parse(create.body!)).toEqual({
      request_id: input.paymentId, amount: 1250, currency: 'AUD', merchant_order_id: input.paymentId,
      return_url: `https://site.example.test/pay/return/airwallex/?id=${input.paymentId}`, metadata: { paymentId: input.paymentId, invoiceNumber: 'INV-1001' },
    })
  })

  it('reuses the 30-minute token and sends cents as a 2-dp major amount', async () => {
    reply({ token: 'aw-token', expires_at: new Date(Date.now() + 30 * 60_000).toISOString() }, 201)
    reply({ id: 'int_a', client_secret: 'cs_a' }, 201)
    reply({ id: 'int_b', client_secret: 'cs_b' }, 201)
    await airwallexGateway.createSession(sessionInput({ amountCents: 12_345 }))
    await airwallexGateway.createSession(sessionInput({ amountCents: 5 }))
    const urls = calls().map((c) => new URL(c.url).pathname)
    expect(urls).toEqual(['/api/v1/authentication/login', '/api/v1/pa/payment_intents/create', '/api/v1/pa/payment_intents/create'])
    expect(JSON.parse(calls()[1].body!).amount).toBe(123.45)
    expect(JSON.parse(calls()[2].body!).amount).toBe(0.05)
  })

  it('retrieve: GET /api/v1/pa/payment_intents/{id}; queryStatus maps SUCCEEDED (captured_amount, else amount), CANCELLED, open states, 404', async () => {
    reply({ token: 'aw-token', expires_at: new Date(Date.now() + 30 * 60_000).toISOString() }, 201)
    reply({ id: 'int_1', status: 'SUCCEEDED', amount: 99.5, captured_amount: 99.5 })
    expect(await airwallexGateway.queryStatus(row({ gatewayRef: 'int_1' }))).toMatchObject({ state: 'paid', amountCents: 9950, ref: 'int_1' })
    const get = calls()[1]
    expect(get).toMatchObject({ url: 'https://api-demo.airwallex.com/api/v1/pa/payment_intents/int_1', method: 'GET' })
    expect(get.headers.authorization).toBe('Bearer aw-token')
    reply({ id: 'int_2', status: 'SUCCEEDED', amount: 12 })
    expect(await airwallexGateway.queryStatus(row({ gatewayRef: 'int_2' }))).toMatchObject({ state: 'paid', amountCents: 1200 })
    reply({ id: 'int_3', status: 'CANCELLED' })
    expect((await airwallexGateway.queryStatus(row({ gatewayRef: 'int_3' }))).state).toBe('failed')
    for (const status of ['REQUIRES_PAYMENT_METHOD', 'REQUIRES_CUSTOMER_ACTION', 'REQUIRES_CAPTURE', 'PENDING']) {
      reply({ id: 'int_4', status })
      expect((await airwallexGateway.queryStatus(row({ gatewayRef: 'int_4' }))).state).toBe('pending')
    }
    reply({ code: 'resource_not_found' }, 404)
    expect(await retrieveIntent('int_missing')).toBeNull()
    expect((await airwallexGateway.queryStatus(row({ gatewayRef: null }))).state).toBe('unknown')
  })

  it('prod needs PAYMENTS_ALLOW_PRODUCTION=1 and then uses api.airwallex.com', async () => {
    process.env.AIRWALLEX_ENV = 'prod'
    await expect(airwallexGateway.createSession(sessionInput())).rejects.toThrow(PaymentsConfigError)
    expect(fetchMock).not.toHaveBeenCalled()
    process.env.PAYMENTS_ALLOW_PRODUCTION = '1'
    reply({ token: 't', expires_at: new Date(Date.now() + 60 * 60_000).toISOString() }, 201)
    reply({ id: 'int_p', client_secret: 'cs_p' }, 201)
    await airwallexGateway.createSession(sessionInput())
    expect(calls().map((c) => new URL(c.url).host)).toEqual(['api.airwallex.com', 'api.airwallex.com'])
  })

  it('webhook signature: hex HMAC-SHA256 of x-timestamp + raw body with the endpoint secret; 5-minute window', () => {
    const secret = 'whsec_contract_test'
    const rawBody = '{"id":"evt_1","name":"payment_intent.succeeded"}'
    const timestamp = String(Date.now())
    const signature = crypto.createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('hex')
    expect(() => verifyAirwallexWebhook({ secret, timestamp, signature, rawBody })).not.toThrow()
    expect(() => verifyAirwallexWebhook({ secret, timestamp, signature, rawBody: `${rawBody} ` })).toThrow(SignatureError)
    expect(() => verifyAirwallexWebhook({ secret, timestamp, signature: signature.toUpperCase(), rawBody })).not.toThrow()
    expect(() => verifyAirwallexWebhook({ secret, timestamp, signature, rawBody, nowMs: Number(timestamp) + 5 * 60_000 + 1 })).toThrow(SignatureError)
  })

  it('webhook events: documented names map to outcomes; refunds find the payment by payment_intent_id', () => {
    const ev = (name: string, object: Record<string, unknown>) => ({ id: `evt_${name}`, name, data: { object } })
    expect(mapAirwallexEvent(ev('payment_intent.succeeded', { id: 'int_1', merchant_order_id: 'p1', amount: 10, captured_amount: 10 }))).toMatchObject({ kind: 'settle', outcome: 'paid', amountCents: 1000, intentId: 'int_1', paymentId: 'p1' })
    expect(mapAirwallexEvent(ev('payment_intent.cancelled', { id: 'int_1', merchant_order_id: 'p1' }))).toMatchObject({ kind: 'settle', outcome: 'failed' })
    for (const name of ['refund.accepted', 'refund.settled']) {
      expect(mapAirwallexEvent(ev(name, { id: 'rfd_1', payment_intent_id: 'int_1', amount: 21.49 }))).toMatchObject({ kind: 'settle', outcome: 'refunded', intentId: 'int_1', paymentId: null, amountCents: 2149 })
    }
    for (const name of ['refund.received', 'refund.failed', 'payment_intent.payment_failed', 'payment_attempt.authorization_failed', 'payment_intent.created']) {
      expect(mapAirwallexEvent(ev(name, { id: 'x', payment_intent_id: 'int_1' })).kind).toBe('ignore')
    }
  })
})

describe('SecurePay (API reference: Client Credentials, Create Payment, Initiate Payment Order)', () => {
  const token = () => reply({ access_token: 'sp-token', token_type: 'Bearer', expires_in: 86400 })

  it('oauth then Create Payment: sandbox URLs, Basic auth form body, Bearer + Idempotency-Key, integer cents, ip and orderId', async () => {
    token()
    reply({ createdAt: '2026-10-18T10:00:00+11:00', merchantCode: 'SPMERCHANTTEST', customerCode: 'anonymous', amount: '1000', currency: 'AUD', status: 'paid', orderId: 'x', bankTransactionId: 'b1', gatewayResponseCode: '00', gatewayResponseMessage: 'Transaction successful' }, 201)
    const p = { paymentId: crypto.randomUUID(), amountCents: 1000 }
    const charge = await chargeToken(p, 'card-token-1', '203.0.113.7')
    expect(charge).toMatchObject({ outcome: 'paid', amountCents: 1000, dryRun: false, facts: { responseCode: '00', bankTransactionId: 'b1', paymentStatus: 'paid' } })
    const [auth, pay] = calls()
    expect(auth).toMatchObject({ url: 'https://welcome.api2.sandbox.auspost.com.au/oauth/token', method: 'POST' })
    expect(auth.headers).toMatchObject({ authorization: `Basic ${Buffer.from('sp-client-test:sp-secret-test').toString('base64')}`, 'content-type': 'application/x-www-form-urlencoded' })
    expect(Object.fromEntries(new URLSearchParams(auth.body!))).toEqual({ grant_type: 'client_credentials', audience: 'https://api.payments.auspost.com.au' })
    expect(pay).toMatchObject({ url: 'https://payments-stest.npe.auspost.zone/v2/payments', method: 'POST' })
    expect(pay.headers).toMatchObject({ authorization: 'Bearer sp-token', 'content-type': 'application/json', 'idempotency-key': p.paymentId })
    expect(JSON.parse(pay.body!)).toEqual({ merchantCode: 'SPMERCHANTTEST', token: 'card-token-1', ip: '203.0.113.7', amount: 1000, orderId: p.paymentId })
  })

  it('Payment Object status decides: failed is a decline, unknown is NOT (stays open), numeric or string amounts parse', async () => {
    token()
    reply({ amount: 10051, currency: 'AUD', status: 'failed', gatewayResponseCode: '51', gatewayResponseMessage: 'Not sufficient funds', errorCode: 'INSUFFICIENT_FUNDS' }, 201)
    expect(await chargeToken({ paymentId: crypto.randomUUID(), amountCents: 10051 }, 't', '203.0.113.7')).toMatchObject({ outcome: 'failed', amountCents: 10051 })
    reply({ amount: '500', status: 'unknown', errorCode: 'GATEWAY_TIMEOUT' }, 201)
    expect((await chargeToken({ paymentId: crypto.randomUUID(), amountCents: 500 }, 't', '2001:db8::1')).outcome).toBe('unknown')
    // the oauth token is reused (valid 24 h): one token call for three charges
    reply({ amount: '500', status: 'paid', gatewayResponseCode: '08' }, 201)
    expect((await chargeToken({ paymentId: crypto.randomUUID(), amountCents: 500 }, 't', '203.0.113.7')).outcome).toBe('paid')
    expect(calls().filter((c) => c.url.endsWith('/oauth/token'))).toHaveLength(1)
  })

  it('a 4xx Error Object is a non-retryable error (nothing settled); 5xx/429 are retryable', async () => {
    token()
    reply({ errors: [{ id: 'e1', code: 'MIN_CONSTRAINT_VIOLATION', detail: 'must be greater than or equal to 1', source: { pointer: 'amount' } }] }, 400)
    await expect(chargeToken({ paymentId: crypto.randomUUID(), amountCents: 100 }, 't', '203.0.113.7')).rejects.toMatchObject({ name: 'GatewayError', retryable: false, message: expect.stringContaining('MIN_CONSTRAINT_VIOLATION') })
    reply('', 503)
    await expect(chargeToken({ paymentId: crypto.randomUUID(), amountCents: 100 }, 't', '203.0.113.7')).rejects.toMatchObject({ retryable: true })
  })

  it('ip is required by SecurePay: without a valid customer IP nothing is sent', async () => {
    await expect(chargeToken({ paymentId: crypto.randomUUID(), amountCents: 100 }, 't', 'unknown')).rejects.toBeInstanceOf(GatewayError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('Initiate Payment Order: /v2/payments/orders/initiate with orderType and our uuid as orderReference', async () => {
    token()
    reply({ orderId: 'ord_1', orderToken: 'jwt', amount: 2500, orderType: 'THREED_SECURE' }, 201)
    const p = { paymentId: crypto.randomUUID(), amountCents: 2500 }
    expect(await initiateOrder(p, '203.0.113.7', 'THREED_SECURE')).toEqual({ orderId: 'ord_1', orderToken: 'jwt', dryRun: false })
    const order = calls()[1]
    expect(order).toMatchObject({ url: 'https://payments-stest.npe.auspost.zone/v2/payments/orders/initiate', method: 'POST' })
    expect(order.headers).toMatchObject({ authorization: 'Bearer sp-token', 'content-type': 'application/json' })
    expect(JSON.parse(order.body!)).toEqual({ merchantCode: 'SPMERCHANTTEST', amount: 2500, ip: '203.0.113.7', orderType: 'THREED_SECURE', orderReference: p.paymentId })
  })

  it('SECUREPAY_ENV=live uses the live hosts, and only with PAYMENTS_ALLOW_PRODUCTION=1', async () => {
    process.env.SECUREPAY_ENV = 'live'
    await expect(chargeToken({ paymentId: crypto.randomUUID(), amountCents: 100 }, 't', '203.0.113.7')).rejects.toThrow(PaymentsConfigError)
    expect(fetchMock).not.toHaveBeenCalled()
    process.env.PAYMENTS_ALLOW_PRODUCTION = '1'
    token()
    reply({ amount: 100, status: 'paid' }, 201)
    await chargeToken({ paymentId: crypto.randomUUID(), amountCents: 100 }, 't', '203.0.113.7')
    expect(calls().map((c) => c.url)).toEqual(['https://welcome.api2.auspost.com.au/oauth/token', 'https://payments.auspost.net.au/v2/payments'])
  })

  it('no status endpoint exists: an uncharged row is pending, a charged-but-unsettled one is unknown (manual check)', async () => {
    expect((await securepayGateway.queryStatus(row({ gateway: 'securepay' }))).state).toBe('pending')
    expect((await securepayGateway.queryStatus(row({ gateway: 'securepay', flags: { chargeAttempted: true } }))).state).toBe('unknown')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('PayWay Net hand-off (secure token request, MakePayment, notification)', () => {
  it('RequestToken: form POST with login, biller, TEST merchant, server amount, return_link_url listing the hidden fields; MakePayment?BillerCode&token', async () => {
    reply('token=cart-token-1')
    const input = sessionInput()
    const s = await paywayGateway.createSession(input)
    expect(s).toEqual({ type: 'redirect', url: 'https://payway.stgeorge.com.au/MakePayment?BillerCode=000000&token=cart-token-1' })
    const [req] = calls()
    expect(req).toMatchObject({ url: 'https://payway.stgeorge.com.au/RequestToken', method: 'POST' })
    expect(req.headers['content-type']).toBe('application/x-www-form-urlencoded')
    const f = Object.fromEntries(new URLSearchParams(req.body!))
    expect(f).toEqual({
      username: 'pw-user-test', password: 'pw-pass-test', biller_code: '000000', merchant_id: 'TEST',
      payment_reference: 'INV-1001', payment_reference_change: 'false', payment_amount: '1250.00', payment_amount_change: 'false', payment_amount_maximum: '1250.00',
      // IHNA (src/content/payments.ts paywayProvider: null): no `provider` field, as the old IHNA theme; callbacks go to PORTAL_IHNA_URL.
      return_link_url: 'https://site.example.test/pay/return/payway/?PaymentID&type&StudentName&StudentEmail&PaymentPurpose',
      return_link_redirect: 'true', return_link_payment_status: 'all',
      information_fields: 'Name,Email', Name: 'Test Payer', Email: 'payer@example.test',
      hidden_fields: 'PaymentID,type,StudentName,StudentEmail,PaymentPurpose',
      PaymentID: input.paymentId, type: 'general', StudentName: 'Test Payer', StudentEmail: 'payer@example.test', PaymentPurpose: 'Tuition',
    })
  })

  it('PAYWAY_PROVIDER sends and lists the provider field (IHM: 2)', async () => {
    process.env.PAYWAY_PROVIDER = '2'
    try {
      reply('token=t-provider')
      await paywayGateway.createSession(sessionInput())
      const f = Object.fromEntries(new URLSearchParams(calls()[0].body!))
      expect(f.provider).toBe('2')
      expect(f.hidden_fields).toBe('PaymentID,type,provider,StudentName,StudentEmail,PaymentPurpose')
      expect(f.return_link_url).toContain('?PaymentID&type&provider&')
    } finally {
      delete process.env.PAYWAY_PROVIDER
    }
  })

  it('asks for the server-to-server notification only when its credentials are configured', async () => {
    process.env.PAYWAY_NOTIFY_PASSWORD = 'notify-pass-test'
    reply('token=t2')
    await paywayGateway.createSession(sessionInput())
    const f = Object.fromEntries(new URLSearchParams(calls()[0].body!))
    expect(f).toMatchObject({ reply_link_url: 'https://site.example.test/api/payments/webhook/payway/', reply_link_post_type: 'extended', reply_link_payment_status: 'all' })
  })

  it('an error answer is a GatewayError; a live merchant needs PAYMENTS_ALLOW_PRODUCTION=1', async () => {
    reply('error=Invalid+username')
    await expect(paywayGateway.createSession(sessionInput())).rejects.toBeInstanceOf(GatewayError)
    process.env.PAYWAY_MERCHANT_ID = '24000000'
    fetchMock.mockClear()
    await expect(paywayGateway.createSession(sessionInput())).rejects.toThrow(PaymentsConfigError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('payment_reference is the invoice number, else the uuid cut to the 20-character default', () => {
    expect(paywayReference({ invoiceNo: 'INV-7', paymentId: '11111111-2222-4333-8444-555555555555' })).toBe('INV-7')
    expect(paywayReference({ invoiceNo: null, paymentId: '11111111-2222-4333-8444-555555555555' })).toBe('11111111222243338444')
  })

  it('paid needs response_code 00/08 and, when sent, payment_status approved and summary_code 0', () => {
    expect(paywayApproved({ response_code: '08', payment_status: 'approved', summary_code: '0' })).toBe(true)
    expect(paywayApproved({ response_code: '00' })).toBe(true)
    expect(paywayApproved({ response_code: '00', payment_status: 'declined' })).toBe(false)
    expect(paywayApproved({ response_code: '00', summary_code: '2' })).toBe(false)
    expect(paywayApproved({ response_code: '51', payment_status: 'declined', summary_code: '1' })).toBe(false)
  })

  it('notification (extended, form-encoded): Basic auth checked, fl_success decides, amount is the total charged, credentials never kept', () => {
    process.env.PAYWAY_NOTIFY_USERNAME = 'Q00000'
    process.env.PAYWAY_NOTIFY_PASSWORD = 'notify-pass-test'
    const id = crypto.randomUUID()
    const rawBody = new URLSearchParams({ am_payment: '101.50', am_surcharge: '1.50', cd_response: '08', cd_summary: '0', fl_success: '1', no_receipt: '1002431909', payment_reference: 'INV-1', tx_response: 'Honour with identification', username: 'Q00000', password: 'notify-pass-test', PaymentID: id, type: 'general', provider: '2' }).toString()
    const authorization = `Basic ${Buffer.from('Q00000:notify-pass-test').toString('base64')}`
    const n = verifyPaywayNotification({ authorization, contentType: 'application/x-www-form-urlencoded', rawBody })
    expect(n).toMatchObject({ paymentId: id, outcome: 'paid', amountCents: 10150, ref: '1002431909', eventId: 'payway-receipt:1002431909' })
    expect(n.params).toMatchObject({ PaymentID: id, payment_number: '1002431909', response_code: '08', payment_status: 'approved', type: 'general', provider: '2' })
    expect(JSON.stringify(n.params)).not.toContain('notify-pass-test')
    expect(verifyPaywayNotification({ authorization: null, contentType: 'application/x-www-form-urlencoded', rawBody }).outcome).toBe('paid') // username/password fields
    const declined = new URLSearchParams({ am_payment: '10.00', cd_response: '51', fl_success: '0', no_receipt: '9', PaymentID: id, username: 'Q00000', password: 'notify-pass-test' }).toString()
    expect(verifyPaywayNotification({ authorization: null, contentType: null, rawBody: declined }).outcome).toBe('failed')
    expect(() => verifyPaywayNotification({ authorization: `Basic ${Buffer.from('Q00000:wrong').toString('base64')}`, contentType: null, rawBody })).toThrow(SignatureError)
    expect(() => verifyPaywayNotification({ authorization: null, contentType: null, rawBody: rawBody.replace('notify-pass-test', 'x') })).toThrow(SignatureError)
    delete process.env.PAYWAY_NOTIFY_PASSWORD
    expect(() => verifyPaywayNotification({ authorization, contentType: null, rawBody })).toThrow(SignatureError)
  })

  it('notification (XML post type) parses the documented PaymentResponse document', () => {
    process.env.PAYWAY_NOTIFY_PASSWORD = 'notify-pass-test'
    const id = crypto.randomUUID()
    const xml = `<PaymentResponse><cd_source>net</cd_source><no_receipt>1002431909</no_receipt><payment_reference>Invoice No. 5</payment_reference><am_payment>11.00</am_payment><am_surcharge>1.00</am_surcharge><cd_summary>0</cd_summary><cd_response>00</cd_response><fl_success>1</fl_success><parameter><name>PaymentID</name><value>${id}</value></parameter><username>QXXXXX</username><password>notify-pass-test</password></PaymentResponse>`
    expect(verifyPaywayNotification({ authorization: null, contentType: 'application/xml', rawBody: xml })).toMatchObject({ paymentId: id, outcome: 'paid', amountCents: 1100, ref: '1002431909' })
  })

  it('browser return and notification of one surcharged payment report the same amount (the total charged)', () => {
    process.env.PAYWAY_NOTIFY_PASSWORD = 'notify-pass-test'
    const key = crypto.randomBytes(16).toString('base64')
    const id = crypto.randomUUID()
    const ret = verifyPaywayReturn(encryptPaywayParameters(key, { PaymentID: id, payment_amount: '101.50', payment_number: '77', response_code: '00', payment_status: 'approved', summary_code: '0' }), { PAYWAY_ENCRYPTION_KEY: key })
    const rawBody = new URLSearchParams({ am_payment: '101.50', am_surcharge: '1.50', cd_response: '00', fl_success: '1', no_receipt: '77', PaymentID: id, password: 'notify-pass-test' }).toString()
    const n = verifyPaywayNotification({ authorization: null, contentType: null, rawBody })
    expect(ret.amountCents).toBe(10150)
    expect(n.amountCents).toBe(ret.amountCents)
    expect(n.eventId).toBe(ret.eventId)
  })
})
