import type { Payload } from 'payload'

// The 12 English-test items from ../ihmv3/e2btns.php (45-payments §7). Prices in cents, AUD.
const PREP = ['IELTS Academic', 'IELTS General', 'PTE', 'OET Nurses', 'OET Doctors', 'TOEFL'] as const
const MOCK = ['IELTS General', 'IELTS Academic', 'PTE', 'TOEFL', 'OET Nurses', 'OET Doctors'] as const
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export const E2_PRODUCTS = [
  ...PREP.map((n, i) => ({
    sku: `e2-prep-${slug(n)}`, legacyE2Btn: i + 1, name: `${n} preparation package`, kind: 'prep-package' as const,
    priceCents: 15000, accessMonths: 3, sortOrder: i + 1,
  })),
  ...MOCK.map((n, i) => ({
    sku: `e2-mock-${slug(n)}`, legacyE2Btn: i + 7, name: `${n} mock test`, kind: 'mock-test' as const,
    priceCents: 5000, accessMonths: 0, sortOrder: i + 7,
  })),
]

/** Idempotent on `sku`. Returns how many rows were created. Names are working titles: see open question 10 §10 Q2. */
export async function seedProducts(payload: Payload): Promise<number> {
  let created = 0
  for (const p of E2_PRODUCTS) {
    const { docs } = await payload.find({ collection: 'products', where: { sku: { equals: p.sku } }, limit: 1, depth: 0, overrideAccess: true })
    if (docs[0]) continue
    await payload.create({ collection: 'products', data: { ...p, currency: 'AUD', gateways: ['securepay', 'airwallex'], active: true }, overrideAccess: true })
    created++
  }
  return created
}
