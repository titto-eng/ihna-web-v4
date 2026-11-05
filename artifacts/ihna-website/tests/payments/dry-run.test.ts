import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { runAfterPaid } from '@/lib/payments/after'
import { PaymentsConfigError } from '@/lib/payments/config'
import { dryRunLog } from '@/lib/payments/external'
import { assertSandboxOnly, getGateway } from '@/lib/payments/gateways'
import { chargeToken, initiateOrder } from '@/lib/payments/gateways/securepay'
import { retrieveIntent } from '@/lib/payments/gateways/airwallex'
import { handleFakeDecision, handleSecurepayCharge } from '@/lib/payments/handlers'
import { findPayment } from '@/lib/payments/store'
import { boot, closePortal, headersFor, invoiceBody, productBody, removePayments, start, uniqueIp, usePaymentsEnv } from './helpers'

// DRY_RUN=1 never calls fetch to a gateway (or portal, monday.com, Graph, Canvas) host: fetch is mocked and asserted.
let payload: Payload
const created: string[] = []
const deps = { queueAfter: async () => {} }
const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => {
  usePaymentsEnv()
  process.env.PAYMENTS_GATEWAY_MODE = 'real' // the real clients, with DRY_RUN=1
  process.env.DRY_RUN = '1'
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockClear()
  dryRunLog.length = 0
})
afterEach(() => { vi.unstubAllGlobals(); delete process.env.AIRWALLEX_API_URL; delete process.env.PAYWAY_BASE_URL })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

describe('DRY_RUN=1 with the real gateway clients', () => {
  it.each(['payway', 'securepay', 'airwallex'] as const)('start via %s answers 202 and never calls fetch', async (gateway) => {
    const r = await start(payload, invoiceBody({ gateway }), {}, undefined, created)
    expect(r.status).toBe(202)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(String(r.body.redirectUrl)).toMatch(gateway === 'securepay' ? /^\/pay\/securepay\// : /^\/pay\/fake\//)
  })

  it('the planned requests are logged with the right hosts and with credentials masked', async () => {
    await start(payload, invoiceBody({ gateway: 'payway', amount: '99.00' }), {}, undefined, created)
    await start(payload, invoiceBody({ gateway: 'airwallex', amount: '99.00' }), {}, undefined, created)
    const hosts = dryRunLog.map((l) => `${l.service}:${l.host}${l.path}`)
    expect(hosts).toContain('payway:payway.stgeorge.com.au/RequestToken')
    expect(hosts).toContain('airwallex:api-demo.airwallex.com/api/v1/pa/payment_intents/create') // AIRWALLEX_ENV defaults to demo
    const payway = dryRunLog.find((l) => l.service === 'payway')!
    expect(JSON.stringify(payway.body)).toContain('[masked]') // username, password
    expect((payway.body as Record<string, string>).payment_amount).toBe('99.00') // the amount comes from the stored row
  })

  it('SecurePay order, charge and the airwallex intent retrieval are dry too', async () => {
    const r = await start(payload, invoiceBody({ gateway: 'securepay', amount: '20.00' }), {}, undefined, created)
    const row = (await findPayment(payload, r.paymentId))!
    expect((await initiateOrder(row, null, 'THREED_SECURE')).dryRun).toBe(true)
    expect((await chargeToken(row, 'tok_dry')).dryRun).toBe(true)
    expect(await retrieveIntent('int_1')).toMatchObject({ id: 'int_1' })
    const charged = await handleSecurepayCharge({ payload, rawBody: JSON.stringify({ paymentId: row.paymentId, token: 'dry-run-token' }), headers: headersFor(uniqueIp()) }, deps)
    expect(charged.body).toMatchObject({ ok: true, status: 'paid' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('afterPaid (portal callback, monday.com, Graph, Canvas) never calls fetch', async () => {
    const pay = await start(payload, invoiceBody({ gateway: 'payway' }), {}, undefined, created)
    await handleFakeDecision(payload, pay.paymentId, 'approve', {}, deps)
    const e2 = await start(payload, productBody(), {}, undefined, created)
    await handleFakeDecision(payload, e2.paymentId, 'approve', {}, deps)
    await runAfterPaid(payload, pay.paymentId)
    await runAfterPaid(payload, e2.paymentId)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(dryRunLog.map((l) => l.service)).toEqual(expect.arrayContaining(['portal', 'monday']))
  })

  it('DRY_RUN=1 with a live gateway URL fails (a live URL never runs in dry mode, even with PAYMENTS_ALLOW_PRODUCTION=1)', () => {
    expect(() => assertSandboxOnly({ DRY_RUN: '1', AIRWALLEX_API_URL: 'https://api.airwallex.com' })).toThrow(PaymentsConfigError)
    expect(() => assertSandboxOnly({ DRY_RUN: '1', SECUREPAY_API_URL: 'https://payments.auspost.net.au' })).toThrow(PaymentsConfigError)
    expect(() => assertSandboxOnly({ DRY_RUN: '1', AIRWALLEX_ENV: 'prod', PAYMENTS_ALLOW_PRODUCTION: '1' })).toThrow(PaymentsConfigError)
    expect(() => assertSandboxOnly({ DRY_RUN: '1', AIRWALLEX_API_URL: 'https://api-demo.airwallex.com' })).not.toThrow()
    process.env.AIRWALLEX_API_URL = 'https://api.airwallex.com'
    expect(() => getGateway('airwallex')).toThrow(PaymentsConfigError)
  })

  it('with DRY_RUN=0 production endpoints need PAYMENTS_ALLOW_PRODUCTION=1 (sandbox endpoints never do)', () => {
    expect(() => assertSandboxOnly({ DRY_RUN: '0', AIRWALLEX_API_URL: 'https://api.airwallex.com' })).toThrow(/PAYMENTS_ALLOW_PRODUCTION/)
    expect(() => assertSandboxOnly({ DRY_RUN: '0', AIRWALLEX_ENV: 'prod' })).toThrow(/airwallex/)
    expect(() => assertSandboxOnly({ DRY_RUN: '0', SECUREPAY_ENV: 'live' })).toThrow(/securepay/)
    expect(() => assertSandboxOnly({ DRY_RUN: '0', PAYWAY_MERCHANT_ID: '12345678' })).toThrow(/payway/)
    expect(() => assertSandboxOnly({ DRY_RUN: '0', AIRWALLEX_ENV: 'prod', SECUREPAY_ENV: 'live', PAYWAY_MERCHANT_ID: '12345678', PAYMENTS_ALLOW_PRODUCTION: '1' })).not.toThrow()
    expect(() => assertSandboxOnly({ DRY_RUN: '0', AIRWALLEX_ENV: 'demo', SECUREPAY_ENV: 'sandbox', PAYWAY_MERCHANT_ID: 'TEST' })).not.toThrow()
    expect(() => assertSandboxOnly({ DRY_RUN: '0', AIRWALLEX_ENV: 'prod' }, 'securepay')).not.toThrow() // only the named gateway is checked
  })

  it('a simulated SecurePay charge is refused in production (DRY_RUN=1 there must not mark anything paid)', async () => {
    const r = await start(payload, invoiceBody({ gateway: 'securepay' }), {}, undefined, created)
    const env = process.env as Record<string, string | undefined>
    const prev = env.NODE_ENV
    env.NODE_ENV = 'production'
    try {
      const out = await handleSecurepayCharge({ payload, rawBody: JSON.stringify({ paymentId: r.paymentId, token: 'dry-run-token' }), headers: headersFor(uniqueIp()) }, deps)
      expect(out.status).toBe(503)
    } finally { env.NODE_ENV = prev }
    expect((await findPayment(payload, r.paymentId))?.status).toBe('pending')
  })

  it('fake mode is refused in production', () => {
    const env = process.env as Record<string, string | undefined>
    const prev = env.NODE_ENV
    env.NODE_ENV = 'production'
    env.PAYMENTS_GATEWAY_MODE = 'fake'
    try { expect(() => getGateway('payway')).toThrow(PaymentsConfigError) } finally { env.NODE_ENV = prev }
  })
})

describe('PAYMENTS_GATEWAY_MODE=fake with DRY_RUN=0 never reaches a gateway host (the FakeGateway is the only gateway)', () => {
  beforeEach(() => { process.env.PAYMENTS_GATEWAY_MODE = 'fake'; process.env.DRY_RUN = '0' })

  it('the SecurePay charge endpoint refuses and fetch is never called', async () => {
    const r = await start(payload, invoiceBody({ gateway: 'securepay' }), {}, undefined, created)
    expect(r.status).toBe(202)
    expect(r.body.redirectUrl).toBe(`/pay/fake/${r.paymentId}/`)
    const out = await handleSecurepayCharge({ payload, rawBody: JSON.stringify({ paymentId: r.paymentId, token: 'tok_live_looking' }), headers: headersFor(uniqueIp()) }, deps)
    expect(out.status).toBe(404)
    expect((await findPayment(payload, r.paymentId))?.status).toBe('pending')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('even the real SecurePay and Airwallex clients, called directly, record instead of sending in fake mode', async () => {
    const row = { paymentId: crypto.randomUUID(), amountCents: 1000 }
    expect((await chargeToken(row, 'tok')).dryRun).toBe(true)
    expect((await initiateOrder(row, null, 'THREED_SECURE')).dryRun).toBe(true)
    await retrieveIntent('int_1')
    const { airwallexGateway } = await import('@/lib/payments/gateways/airwallex')
    await airwallexGateway.createSession({ paymentId: row.paymentId, amountCents: 1000, currency: 'AUD', kind: 'invoice', payerName: 'A', payerEmail: 'a@example.test', portalPaymentId: '1' })
    const { paywayGateway } = await import('@/lib/payments/gateways/payway')
    await paywayGateway.createSession({ paymentId: row.paymentId, amountCents: 1000, currency: 'AUD', kind: 'invoice', payerName: 'A', payerEmail: 'a@example.test', portalPaymentId: '1' })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(dryRunLog.map((l) => l.service)).toEqual(expect.arrayContaining(['securepay', 'airwallex', 'payway']))
  })

  it('a non-gateway service (the portal callback) is still sent when DRY_RUN=0', async () => {
    const { externalCall } = await import('@/lib/payments/external')
    await externalCall({ service: 'portal', note: 'callback', method: 'GET', url: 'https://portal.example.test/x', encoding: 'none' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('with DRY_RUN=0 the clients do send (proves the dry guard is what stops the call)', () => {
  it('an Airwallex login goes through fetch to the configured host', async () => {
    process.env.DRY_RUN = '0'
    process.env.AIRWALLEX_API_URL = 'https://api-demo.airwallex.com'
    process.env.AIRWALLEX_CLIENT_ID = 'test-client'
    process.env.AIRWALLEX_API_KEY = 'test-key'
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ token: 't', expires_at: new Date(Date.now() + 3_600_000).toISOString() }), { status: 200 }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'int_demo', client_secret: 'cs_demo' }), { status: 201 }))
    const { airwallexGateway } = await import('@/lib/payments/gateways/airwallex')
    const s = await airwallexGateway.createSession({ paymentId: crypto.randomUUID(), amountCents: 12345, currency: 'AUD', kind: 'invoice', payerName: 'A', payerEmail: 'a@example.test', portalPaymentId: '1' })
    expect(s).toMatchObject({ type: 'airwallex', intentId: 'int_demo', clientSecret: 'cs_demo' })
    const calls = fetchMock.mock.calls as unknown as [string, RequestInit][]
    expect(calls.map((c) => new URL(c[0]).host)).toEqual(['api-demo.airwallex.com', 'api-demo.airwallex.com'])
    expect(JSON.parse(String(calls[1][1].body)).amount).toBe(123.45)
    delete process.env.AIRWALLEX_CLIENT_ID
    delete process.env.AIRWALLEX_API_KEY
  })
})
