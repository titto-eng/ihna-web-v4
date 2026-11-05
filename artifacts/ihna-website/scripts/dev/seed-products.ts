// Creates the 12 English-test (E2) products in the database DATABASE_URL points at (45 §7). Idempotent on `sku`: an existing product is never
// changed, so prices finance has edited in /admin stay as they are. Safe in any environment; the schema must already exist (`npm run payload migrate`).
// Usage: npm run seed:products
import 'dotenv/config'
import { getPayload } from 'payload'

// Never push the schema from a script (DEC-46); the config reads the flag when it loads, so it is imported after the flag is set.
process.env.DISABLE_DB_PUSH ??= '1'
process.env.ENQUIRY_AUTORUN ??= '0' // a seed never runs queued jobs
const { default: config } = await import('../../src/payload.config')
const { E2_PRODUCTS, seedProducts } = await import('../../src/collections/seed/products')

const payload = await getPayload({ config })
const created = await seedProducts(payload)
console.log(`products: ${created} created, ${E2_PRODUCTS.length - created} already present`)
process.exit(0)
