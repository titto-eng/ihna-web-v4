import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { findPayment } from '@/lib/payments/store'
import { fakeGateway } from '@/lib/payments/gateways'
import { verifyAmountSignature } from '@/lib/payments/sign'
import { boot, closePortal, invoiceBody, productBody, removePayments, start, uniqueIp, usePaymentsEnv, headersFor } from './helpers'
import { handleStart } from '@/lib/payments/start'

// 45 §8 check 3 (start-contract) + the tamper and product-price requirements: the browser never decides what is charged.
let payload: Payload
const created: string[] = []

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => usePaymentsEnv())
afterAll(async () => { await removePayments(payload, created); await closePortal() })

describe('product price is never taken from the request', () => {
  it('a product request that carries `amount` is a 400 and creates no row', async () => {
    const body = productBody({ amount: '1.00' })
    const r = await start(payload, body, {}, undefined, created)
    expect(r.status).toBe(400)
    expect(JSON.stringify(r.body)).toMatch(/amount/)
    expect(await findPayment(payload, r.paymentId)).toBeNull()
  })

  it.each(['priceCents', 'price', 'total', 'baseCents', 'surchargeCents', 'currency', 'paymentId', 'status'])('an unknown money-like key (%s) is rejected', async (key) => {
    const r = await start(payload, productBody({ [key]: 1 }), {}, undefined, created)
    expect(r.status).toBe(400)
  })

  it('stored total = the server price for every one of the 12 products (150.00 prep packages, 50.00 mock tests)', async () => {
    for (let n = 1; n <= 12; n++) {
      const r = await start(payload, productBody({ e2btn: n }), {}, undefined, created)
      expect(r.status).toBe(202)
      const row = await findPayment(payload, r.paymentId)
      expect(row?.amountCents).toBe(n <= 6 ? 15000 : 5000)
      expect(row?.baseCents).toBe(row?.amountCents)
    }
  })

  it('productId may be the sku or the numeric id, and still prices from the collection', async () => {
    const { docs } = await payload.find({ collection: 'products', where: { sku: { equals: 'e2-mock-pte' } }, limit: 1, depth: 0, overrideAccess: true })
    const bySku = await start(payload, productBody({ e2btn: undefined, productId: 'e2-mock-pte' }), {}, undefined, created)
    const byId = await start(payload, productBody({ e2btn: undefined, productId: docs[0].id }), {}, undefined, created)
    expect((await findPayment(payload, bySku.paymentId))?.amountCents).toBe(5000)
    expect((await findPayment(payload, byId.paymentId))?.amountCents).toBe(5000)
  })

  it('the stored price follows the products collection, not a constant in the code', async () => {
    const { docs } = await payload.find({ collection: 'products', where: { legacyE2Btn: { equals: 12 } }, limit: 1, depth: 0, overrideAccess: true })
    const orig = docs[0].priceCents
    await payload.update({ collection: 'products', id: docs[0].id, data: { priceCents: 5500 }, overrideAccess: true })
    try {
      const r = await start(payload, productBody({ e2btn: 12 }), {}, undefined, created)
      expect((await findPayment(payload, r.paymentId))?.amountCents).toBe(5500)
    } finally {
      await payload.update({ collection: 'products', id: docs[0].id, data: { priceCents: orig }, overrideAccess: true })
    }
  })

  it('an unknown or inactive product is 404, an unknown e2btn is a 400', async () => {
    expect((await start(payload, productBody({ e2btn: undefined, productId: 'nope' }), {}, undefined, created)).status).toBe(404)
    expect((await start(payload, productBody({ e2btn: 13 }), {}, undefined, created)).status).toBe(400)
  })

  it('PayWay for a product is 400 (E2 products allow SecurePay and Airwallex only, server-enforced)', async () => {
    const r = await start(payload, productBody({ gateway: 'payway' }), {}, undefined, created)
    expect(r.status).toBe(400)
    expect(r.body.error).toBe('gateway_not_allowed')
    expect(await findPayment(payload, r.paymentId)).toBeNull()
  })
})

describe('invoice amounts are typed by the payer, then stored and signed on the server', () => {
  it('parses to cents, stores base and total, and signs them', async () => {
    const r = await start(payload, invoiceBody({ amount: '$1,250.5' }), {}, undefined, created)
    expect(r.status).toBe(202)
    const row = (await findPayment(payload, r.paymentId))!
    expect(row.amountCents).toBe(125050)
    expect(verifyAmountSignature({ paymentId: r.paymentId, amountCents: 125050, currency: 'AUD', kind: 'invoice' }, row.flags.amountSig)).toBe(true)
    expect(verifyAmountSignature({ paymentId: r.paymentId, amountCents: 100, currency: 'AUD', kind: 'invoice' }, row.flags.amountSig)).toBe(false)
  })

  it.each([['abc'], ['12.345'], ['-5'], ['0'], ['0.50'], ['1e6'], [''], ['100000.00']])('rejects the amount %j', async (amount) => {
    const r = await start(payload, invoiceBody({ amount }), {}, undefined, created)
    expect(r.status).toBe(400)
    expect((r.body.fieldErrors as Record<string, string>).amount).toBeTruthy()
  })

  it('tamper: a second request with the same submission and a different amount does not change the stored, signed amount', async () => {
    const first = invoiceBody({ amount: '500.00' })
    const a = await start(payload, first, {}, undefined, created)
    expect(a.status).toBe(202)
    const b = await start(payload, { ...first, amount: '1.00' }, {}, undefined, created)
    expect(b.paymentId).toBe(a.paymentId)
    const row = (await findPayment(payload, a.paymentId))!
    expect(row.amountCents).toBe(50000)
    expect(verifyAmountSignature({ paymentId: a.paymentId, amountCents: 50000, currency: 'AUD', kind: 'invoice' }, row.flags.amountSig)).toBe(true)
  })

  it('is idempotent on submissionId: a retry answers 202 again with the same payment and creates no second portal row', async () => {
    const body = invoiceBody()
    const a = await start(payload, body, {}, undefined, created)
    const rowA = (await findPayment(payload, a.paymentId))!
    const b = await start(payload, body, {}, undefined, created)
    expect(b.status).toBe(202)
    expect((await findPayment(payload, a.paymentId))?.portalPaymentId).toBe(rowA.portalPaymentId)
  })
})

describe('request hygiene', () => {
  it('is strict: unknown keys, a bad email and a non-uuid submissionId are 400', async () => {
    expect((await start(payload, invoiceBody({ extra: 1 }), {}, undefined, created)).status).toBe(400)
    expect((await start(payload, invoiceBody({ payerEmail: 'not-an-email' }), {}, undefined, created)).status).toBe(400)
    expect((await start(payload, invoiceBody({ submissionId: 'abc' }), {}, undefined, created)).status).toBe(400)
    const bad = await handleStart({ payload, rawBody: '{nope', headers: headersFor(uniqueIp()) })
    expect(bad.status).toBe(400)
  })

  it('the payment id is derived on the server, never sequential, never the submission id', async () => {
    const ids = new Set<string>()
    for (let i = 0; i < 3; i++) ids.add((await start(payload, invoiceBody(), {}, undefined, created)).paymentId)
    expect(ids.size).toBe(3)
    for (const id of ids) expect(id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('is rate limited to 5 starts per minute per IP', async () => {
    const ip = uniqueIp()
    const codes: number[] = []
    for (let i = 0; i < 6; i++) codes.push((await start(payload, invoiceBody(), {}, ip, created)).status)
    expect(codes.slice(0, 5).every((c) => c === 202)).toBe(true)
    expect(codes[5]).toBe(429)
  })

  it('SAE is not available yet (501) and creates nothing', async () => {
    const r = await start(payload, { kind: 'sae', gateway: 'payway', payerName: 'Sae Student', payerEmail: 'sae@example.test', submissionId: crypto.randomUUID(), saeApplicationId: 1 }, {}, undefined, created)
    expect(r.status).toBe(501)
    expect(await findPayment(payload, r.paymentId)).toBeNull()
  })

  it('a gateway outage marks the row failed and answers 502, nothing is charged', async () => {
    const boom = vi.spyOn(fakeGateway, 'createSession').mockRejectedValueOnce(new Error('down'))
    const r = await start(payload, invoiceBody(), {}, undefined, created)
    expect(r.status).toBe(502)
    expect((await findPayment(payload, r.paymentId))?.status).toBe('failed')
    boom.mockRestore()
  })
})
