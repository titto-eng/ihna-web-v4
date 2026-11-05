import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { E2_PRODUCTS, seedProducts } from '@/collections/seed/products'
import { boot, Cleanup, nonce, rejectsWith } from './helpers'

let payload: Payload
const cleanup = new Cleanup()
const n = nonce()

describe('product seed, lookups', () => {
  beforeAll(async () => {
    payload = await boot()
  })
  afterAll(async () => {
    await cleanup.run(payload)
  })

  it('seeds the 12 English-test products idempotently, legacyE2Btn 1-12 unique', async () => {
    const before = await payload.find({ collection: 'products', where: { sku: { in: E2_PRODUCTS.map((p) => p.sku) } }, limit: 0, depth: 0 })
    const existing = new Set(before.docs.map((d) => d.sku))
    const created = await seedProducts(payload)
    expect(await seedProducts(payload)).toBe(0)
    expect(created).toBe(12 - existing.size)
    const all = await payload.find({ collection: 'products', where: { sku: { in: E2_PRODUCTS.map((p) => p.sku) } }, limit: 0, depth: 0 })
    expect(all.totalDocs).toBe(12)
    expect(all.docs.map((d) => d.legacyE2Btn).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(all.docs.filter((d) => d.kind === 'prep-package').every((d) => d.priceCents === 15000)).toBe(true)
    expect(all.docs.filter((d) => d.kind === 'mock-test').every((d) => d.priceCents === 5000)).toBe(true)
    for (const d of all.docs) if (!existing.has(d.sku)) await payload.delete({ collection: 'products', id: d.id })
  })

  it('discipline parent is a self relationship; duration needs months', async () => {
    const parent = await payload.create({ collection: 'disciplines', data: { name: `Nursing ${n}` } })
    cleanup.track('disciplines', parent.id)
    const child = await payload.create({ collection: 'disciplines', data: { name: `Aged care ${n}`, parent: parent.id, color: '#1a73e8' } })
    cleanup.track('disciplines', child.id)
    expect(child.slug).toBe(`aged-care-${n}`)
    await rejectsWith(payload.create({ collection: 'durations', data: { name: '3 years' } as never }), /months/i)
  })
})
