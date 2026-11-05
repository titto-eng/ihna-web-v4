import { spawn } from 'node:child_process'
import { hkdfSync } from 'node:crypto'

// Derive a separate CMS key from Replit's persistent secret; never log either key.
if (!process.env.PAYLOAD_SECRET && process.env.SESSION_SECRET) {
  process.env.PAYLOAD_SECRET = Buffer.from(hkdfSync(
    'sha256', process.env.SESSION_SECRET, 'ihna-replit', 'payload-cms', 32,
  )).toString('hex')
}
if (!process.env.PAYLOAD_SECRET) throw new Error('Configure PAYLOAD_SECRET or SESSION_SECRET in Replit Secrets.')
if (process.argv[2] === 'dev' && process.env.REPLIT_DEV_DOMAIN) {
  process.env.NEXT_PUBLIC_SITE_URL = `https://${process.env.REPLIT_DEV_DOMAIN}`
}
const mode = process.argv[2]
if (!['dev', 'build', 'start'].includes(mode)) throw new Error('Expected dev, build, or start.')
if (mode === 'build') {
  const { restorePublic } = await import('./restore-public.mjs')
  await restorePublic()
}
const args = [mode, ...(mode === 'build' ? [] : ['--hostname', '0.0.0.0', '--port', process.env.PORT || '3001'])]
const child = spawn('next', args, { stdio: 'inherit', env: process.env })
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal))
child.on('error', (error) => { console.error(error.message); process.exit(1) })
child.on('exit', (code) => process.exit(code ?? 1))
