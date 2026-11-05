import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { handleFakeDecision, loadReceipt, loadResult, receiptAllowed } from '@/lib/payments/handlers'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'
import { boot, closePortal, invoiceBody, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §8 check 11 (data layer): the receipt shows only for the payer's own email; wrong email, unknown id and malformed id are indistinguishable.
let payload: Payload
const created: string[] = []
const deps = { queueAfter: async () => {} }
let paymentId = ''
const body = invoiceBody({ payerEmail: 'Payer.Case@Example.test', gateway: 'securepay' })

beforeAll(async () => {
  usePaymentsEnv(); payload = await boot()
  const r = await start(payload, body, {}, undefined, created)
  paymentId = r.paymentId
  await handleFakeDecision(payload, paymentId, 'approve', {}, deps)
})
beforeEach(() => { usePaymentsEnv(); resetRateLimit() })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

describe('receipt access', () => {
  it('the right email (any case) returns the receipt', async () => {
    expect(await loadReceipt(payload, paymentId, 'payer.case@example.test')).toMatchObject({ status: 'paid', amountCents: 125000, paymentFor: 'Tuition' })
    expect(await loadReceipt(payload, paymentId, 'PAYER.CASE@EXAMPLE.TEST')).not.toBeNull()
  })
  it('a wrong, empty or missing email returns nothing', async () => {
    expect(await loadReceipt(payload, paymentId, 'someone@else.test')).toBeNull()
    expect(await loadReceipt(payload, paymentId, '')).toBeNull()
    expect(await loadReceipt(payload, paymentId, undefined)).toBeNull()
    expect(await loadReceipt(payload, paymentId, 'payer.case@example.test.evil')).toBeNull()
  })
  it('an unknown or malformed id returns nothing, the same as a wrong email (no enumeration)', async () => {
    expect(await loadReceipt(payload, crypto.randomUUID(), 'payer.case@example.test')).toBeNull()
    expect(await loadReceipt(payload, 'not-a-uuid', 'payer.case@example.test')).toBeNull()
    expect(await loadReceipt(payload, '1', 'payer.case@example.test')).toBeNull() // sequential-looking ids are never valid
  })
  it('the receipt carries no gateway reference, ip or portal id', async () => {
    const r = await loadReceipt(payload, paymentId, 'payer.case@example.test')
    expect(Object.keys(r ?? {}).sort()).toEqual(['amountCents', 'currency', 'gateway', 'invoiceNo', 'kind', 'paidAt', 'payerName', 'paymentFor', 'paymentId', 'status'])
  })
  it('the public result carries no name or email', async () => {
    const r = await loadResult(payload, paymentId, deps)
    expect(Object.keys(r ?? {}).sort()).toEqual(['amountCents', 'createdAt', 'gateway', 'kind', 'paymentFor', 'paymentId', 'status'])
    expect(await loadResult(payload, 'nope', deps)).toBeNull()
  })
  it('is limited to 10 per minute per IP', async () => {
    const results: boolean[] = []
    for (let i = 0; i < 11; i++) results.push(await receiptAllowed(payload, '203.0.113.77'))
    expect(results.slice(0, 10).every(Boolean)).toBe(true)
    expect(results[10]).toBe(false)
  })
})
