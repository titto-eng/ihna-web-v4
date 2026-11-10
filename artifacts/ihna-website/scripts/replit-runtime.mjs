import { spawn } from 'node:child_process'
import { hkdfSync } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'

// Load the private local configuration before validating secrets or choosing storage.
// Replit supplies its configuration through Secrets, not a checked-in env file.
if (!process.env.REPL_ID && existsSync('.env.local')) process.loadEnvFile('.env.local')

// Derive a separate CMS key from Replit's persistent secret; never log either key.
if (!process.env.PAYLOAD_SECRET && process.env.SESSION_SECRET) {
  process.env.PAYLOAD_SECRET = Buffer.from(hkdfSync(
    'sha256', process.env.SESSION_SECRET, 'ihna-replit', 'payload-cms', 32,
  )).toString('hex')
}
if (!process.env.PAYLOAD_SECRET) throw new Error('Configure PAYLOAD_SECRET in .env.local, or SESSION_SECRET in Replit Secrets.')
if (process.argv[2] === 'dev' && process.env.REPLIT_DEV_DOMAIN) {
  process.env.NEXT_PUBLIC_SITE_URL = `https://${process.env.REPLIT_DEV_DOMAIN}`
}
const mode = process.argv[2]
if (!['dev', 'build', 'start'].includes(mode)) throw new Error('Expected dev, build, or start.')
if (mode === 'build' && process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
  const { restorePublic } = await import('./restore-public.mjs')
  await restorePublic()
}
if (mode === 'build' && !process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID && !existsSync('public/images')) {
  throw new Error('Local public assets are missing. Copy public/ from the supplied source archive before building.')
}
const args = [mode, ...(mode === 'build' ? [] : ['--hostname', '0.0.0.0', '--port', process.env.PORT || '3001'])]
// Run the JS entry point directly: Windows cannot spawn the pnpm next.cmd shim.
const require = createRequire(import.meta.url)
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), ...args], { stdio: 'inherit', env: process.env })
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal))
child.on('error', (error) => { console.error(error.message); process.exit(1) })
child.on('exit', (code) => process.exit(code ?? 1))
