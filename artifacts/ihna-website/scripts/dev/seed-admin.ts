// Dev only: creates the first admin from DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD in .env (never prints them).
import 'dotenv/config'
import { getPayload } from 'payload'

// The dev server owns schema push (DEC-46); the config reads the flag when it loads, so it is imported after the flag is set.
process.env.DISABLE_DB_PUSH ??= '1'
const { default: config } = await import('../../src/payload.config')

const email = process.env.DEV_ADMIN_EMAIL
const password = process.env.DEV_ADMIN_PASSWORD
if (!email || !password) throw new Error('DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD must be set in .env')
if (process.env.NODE_ENV === 'production') throw new Error('seed-admin is dev only')

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (existing.totalDocs) {
  console.log('dev admin already exists')
} else {
  await payload.create({ collection: 'users', data: { email, password, name: 'Dev Admin', roles: ['admin'] } })
  console.log('dev admin created')
}
process.exit(0)
