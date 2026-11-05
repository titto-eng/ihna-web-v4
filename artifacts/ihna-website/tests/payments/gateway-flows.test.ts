import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { handlePaywayNotification, handlePaywayReturn, handleSecurepayCharge } from '@/lib/payments/handlers'
import { resetSecurepayToken } from '@/lib/payments/gateways/securepay'
import { reconcilePending } from '@/lib/payments/reconcile'
import { findPayment } from '@/lib/payments/store'
import { POST as paywayNotifyRoute } from '@/app/api/payments/webhook/payway/route'
import { backdate, boot, closePortal, headersFor, invoiceBody, paywayReturn, removePayments, start, usePaymentsEnv } from './helpers'

// The settle paths the real gateways add: PayWay's server-to-server notification (one settlement per receipt, shared with the browser return)
// and SecurePay's `status: unknown` (not a decline: stays pending, then needs a person). Test credentials only.
let payload: Payload
const created: string[] = []
const queued: string[] = []
const deps = { queueAfter: async (_p: Payload, id: string) => { queued.push(id) } }
const NOTIFY = { PAYWAY_NOTIFY_USERNAME: 'Q00000', PAYWAY_NOTIFY_PASSWORD: 'notify-pass-test' }
const basic = (u: string, p: string) => `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}`
const notification = (paymentId: string, over: Record<string, string> = {}) =>
  new URLSearchParams({ am_payment: '1250.00', am_surcharge: '0.00', cd_response: '08', cd_summary: '0', fl_success: '1', no_receipt: `R${Date.now()}${Math.floor(Math.random() * 1000)}`, payment_reference: 'INV', tx_response: 'Approved', PaymentID: paymentId, type: 'general', provider: '2', ...over }).toString()

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => { usePaymentsEnv(); Object.assign(process.env, NOTIFY); queued.length = 0 })
afterEach(() => { vi.unstubAllGlobals(); delete process.env.PAYWAY_NOTIFY_USERNAME; delete process.env.PAYWAY_NOTIFY_PASSWORD })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

describe('PayWay server-to-server notification', () => {
  it('valid credentials -> paid once; a replay and the browser return of the same receipt change nothing', async () => {
    const { paymentId } = await start(payload, invoiceBody({ gateway: 'payway', amount: '1250.00' }), {}, undefined, created)
    const body = notification(paymentId, { no_receipt: '7000001' })
    const first = await handlePaywayNotification(payload, { rawBody: body, authorization: basic('Q00000', 'notify-pass-test'), contentType: 'application/x-www-form-urlencoded' }, deps)
    expect(first).toMatchObject({ status: 200, body: { result: 'applied', status: 'paid' } })
    const again = await handlePaywayNotification(payload, { rawBody: body, authorization: basic('Q00000', 'notify-pass-test'), contentType: 'application/x-www-form-urlencoded' }, deps)
    expect(again.body).toMatchObject({ result: 'ignored' })
    await handlePaywayReturn(payload, paywayReturn({ PaymentID: paymentId, payment_amount: '1250.00', response_code: '08', payment_status: 'approved', summary_code: '0', payment_number: '7000001' }), deps)
    expect(queued).toEqual([paymentId])
    const row = (await findPayment(payload, paymentId))!
    expect(row.status).toBe('paid')
    expect(row.flags.payway?.params).toMatchObject({ payment_number: '7000001', response_code: '08' })
    expect(JSON.stringify(row.flags)).not.toContain('notify-pass-test')
  })

  it('wrong credentials -> 401 and nothing changes; an amount that differs -> flagged', async () => {
    const { paymentId } = await start(payload, invoiceBody({ gateway: 'payway', amount: '1250.00' }), {}, undefined, created)
    const bad = await handlePaywayNotification(payload, { rawBody: notification(paymentId), authorization: basic('Q00000', 'guess'), contentType: null }, deps)
    expect(bad.status).toBe(401)
    expect((await findPayment(payload, paymentId))?.status).toBe('pending')
    const off = await handlePaywayNotification(payload, { rawBody: notification(paymentId, { am_payment: '1.00' }), authorization: basic('Q00000', 'notify-pass-test'), contentType: null }, deps)
    expect(off.body).toMatchObject({ result: 'flagged', status: 'flagged' })
  })

  it('a decline is settled failed; a payment that is not ours is answered 200 (PayWay stops retrying)', async () => {
    const { paymentId } = await start(payload, invoiceBody({ gateway: 'payway' }), {}, undefined, created)
    const declined = await handlePaywayNotification(payload, { rawBody: notification(paymentId, { fl_success: '0', cd_response: '51', cd_summary: '1' }), authorization: basic('Q00000', 'notify-pass-test'), contentType: null }, deps)
    expect(declined.body).toMatchObject({ status: 'failed' })
    const foreign = await handlePaywayNotification(payload, { rawBody: notification('12345'), authorization: basic('Q00000', 'notify-pass-test'), contentType: null }, deps)
    expect(foreign).toMatchObject({ status: 200, body: { ignored: expect.any(String) } })
  })

  it('the route reads the raw body and the Authorization header', async () => {
    const res = await paywayNotifyRoute(new Request('http://localhost/api/payments/webhook/payway/', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: notification('12345') }))
    expect(res.status).toBe(401)
  })
})

describe('SecurePay charge with a real (mocked) gateway', () => {
  const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()
  beforeEach(() => {
    Object.assign(process.env, { PAYMENTS_GATEWAY_MODE: 'real', DRY_RUN: '0', SECUREPAY_ENV: 'sandbox', SECUREPAY_CLIENT_ID: 'sp-client-test', SECUREPAY_CLIENT_SECRET: 'sp-secret-test', SECUREPAY_MERCHANT_CODE: 'SPMERCHANTTEST' })
    delete process.env.SECUREPAY_API_URL
    delete process.env.SECUREPAY_AUTH_URL
    resetSecurepayToken()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => { for (const k of ['SECUREPAY_ENV', 'SECUREPAY_CLIENT_ID', 'SECUREPAY_CLIENT_SECRET', 'SECUREPAY_MERCHANT_CODE']) delete process.env[k] })

  it('status unknown is not a decline: the row stays pending, then reconcilePending flags it for a manual check', async () => {
    process.env.PAYMENTS_GATEWAY_MODE = 'fake' // create the row without a gateway call, then switch to the real client
    const { paymentId } = await start(payload, invoiceBody({ gateway: 'securepay', amount: '20.00' }), {}, undefined, created)
    process.env.PAYMENTS_GATEWAY_MODE = 'real'
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'sp-token', expires_in: 86400 }), { status: 200 }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ amount: '2000', status: 'unknown', errorCode: 'GATEWAY_ERROR' }), { status: 201 }))
    const out = await handleSecurepayCharge({ payload, rawBody: JSON.stringify({ paymentId, token: 'card-token' }), headers: headersFor('203.0.113.9') }, deps)
    expect(out).toMatchObject({ status: 200, body: { ok: true, status: 'pending' } })
    const pay = fetchMock.mock.calls[1]
    expect(JSON.parse(String(pay[1].body))).toEqual({ merchantCode: 'SPMERCHANTTEST', token: 'card-token', ip: '203.0.113.9', amount: 2000, orderId: paymentId })
    const row = (await findPayment(payload, paymentId))!
    expect(row.status).toBe('pending')
    expect(row.flags.chargeAttempted).toBe(true)
    await backdate(payload, paymentId, 11 * 60_000)
    const r = await reconcilePending(payload, { ...deps, limit: 500 })
    expect(r.flagged).toBeGreaterThanOrEqual(1)
    expect((await findPayment(payload, paymentId))?.flags.reason).toBe('needs-manual-check')
  })

  it('paid with the amount as a string of cents settles paid', async () => {
    process.env.PAYMENTS_GATEWAY_MODE = 'fake'
    const { paymentId } = await start(payload, invoiceBody({ gateway: 'securepay', amount: '20.00' }), {}, undefined, created)
    process.env.PAYMENTS_GATEWAY_MODE = 'real'
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'sp-token', expires_in: 86400 }), { status: 200 }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ amount: '2000', currency: 'AUD', status: 'paid', orderId: paymentId, bankTransactionId: 'b', gatewayResponseCode: '00' }), { status: 201 }))
    const out = await handleSecurepayCharge({ payload, rawBody: JSON.stringify({ paymentId, token: 'card-token' }), headers: headersFor('203.0.113.10') }, deps)
    expect(out.body).toMatchObject({ ok: true, status: 'paid' })
  })
})
