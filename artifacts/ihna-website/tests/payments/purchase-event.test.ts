import { describe, expect, it } from 'vitest'
import { purchase } from '@/components/tracking/datalayer'
import { purchaseEventFor, type PublicResult } from '@/lib/payments/handlers'

// 80 §4: the paid result page pushes one GA4 `purchase` built from server values only.
const result = (over: Partial<PublicResult> = {}): PublicResult => ({ paymentId: '7d3b0f8e-1c2a-4b5c-9d6e-0f1a2b3c4d5e', status: 'paid', kind: 'invoice', amountCents: 125050, gateway: 'payway', paymentFor: 'Tuition for Jane Citizen', createdAt: '2026-10-20T00:00:00Z', ...over })

describe('purchaseEventFor', () => {
  it('is null unless the payment is paid', () => {
    for (const status of ['pending', 'failed', 'flagged', 'expired'] as const) expect(purchaseEventFor(result({ status }))).toBeNull()
  })
  it('an invoice sends the amount and the kind, never the typed "payment for" text', () => {
    const p = purchaseEventFor(result())!
    expect(p).toEqual({ transactionId: result().paymentId, value: 1250.5, paymentType: 'payway', items: [{ itemId: 'invoice', itemName: 'invoice', price: 1250.5 }] })
    expect(JSON.stringify(purchase(p))).not.toContain('Jane')
  })
  it('a product carries its server-set name', () => {
    expect(purchaseEventFor(result({ kind: 'product', paymentFor: 'PTE prep package', amountCents: 15000, gateway: 'securepay' }))!.items).toEqual([{ itemId: 'product', itemName: 'PTE prep package', price: 150 }])
  })
})
