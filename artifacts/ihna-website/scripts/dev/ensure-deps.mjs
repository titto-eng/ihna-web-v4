// `predev` preflight (runs before `npm run dev` on the host): plain Node, no dependencies, so it works before anything is installed.
//  1. node_modules: installs (npm ci) when the binaries the dev server needs are missing or package-lock.json changed since the last
//     install, so a fresh clone, an interrupted install or a node_modules from another OS never ends in "'cross-env' is not recognized".
//  2. Database: when DATABASE_URL points at this machine and nothing answers, starts the Docker Postgres + Mailpit of this repo.
//  3. Port 3001: says clearly when it is taken (usually the Docker `app` container) instead of a bare EADDRINUSE.
// Skip it with SKIP_ENSURE_DEPS=1.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import net from 'node:net'

if (process.env.SKIP_ENSURE_DEPS === '1') process.exit(0)

const root = process.cwd()
const lock = join(root, 'package-lock.json')
const nm = join(root, 'node_modules')
const win = process.platform === 'win32'
const hash = existsSync(lock) ? createHash('sha1').update(readFileSync(lock)).digest('hex') : ''

// Stamps written by this script and by the two Docker helpers (dev-entrypoint.sh on Linux, host-dev.ps1 on Windows).
const stamps = [`.deps-hash-${process.platform}`, win ? '.lock-hash-win' : '.lock-hash'].map((f) => join(nm, f))
const stampOk = stamps.some((f) => existsSync(f) && readFileSync(f, 'utf8').trim().toLowerCase() === hash.toLowerCase())

const bins = ['next', 'cross-env', 'payload'].map((b) => join(nm, '.bin', win ? `${b}.cmd` : b))
const missing = bins.filter((b) => !existsSync(b))

if (missing.length > 0 || !stampOk) install()
await services()

function install() {

const why = missing.length ? `missing ${missing.map((b) => b.split(/[\\/]/).pop()).join(', ')}` : 'package-lock.json changed'
console.log(`\n[deps] node_modules needs installing (${why}). Running "npm ci" once, this takes a few minutes...\n`)
const r = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { stdio: 'inherit', shell: true })
if (r.status !== 0) {
  console.error(`
[deps] npm ci failed. Usually a file in node_modules is locked. Then:
  1. stop every running dev server / terminal using this folder (and the Docker "app" container if it is running),
  2. close the folder in your editor's file explorer, then
  3. run "npm ci" again (or delete the node_modules folder first).
`)
  process.exit(r.status ?? 1)
}
writeFileSync(stamps[0], hash)
console.log('\n[deps] dependencies installed.\n')
}

/** `KEY=value` from the environment, else from .env (first match, quotes stripped). */
function envValue(key) {
  if (process.env[key]) return process.env[key]
  const file = join(root, '.env')
  if (!existsSync(file)) return undefined
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '') || undefined : undefined
}

function portOpen(host, port, timeout = 1500) {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port })
    const done = (ok) => { sock.destroy(); resolve(ok) }
    sock.setTimeout(timeout, () => done(false))
    sock.once('connect', () => done(true))
    sock.once('error', () => done(false))
  })
}

async function services() {
  const dbUrl = envValue('DATABASE_URL')
  let db
  try { db = dbUrl ? new URL(dbUrl) : undefined } catch { db = undefined }
  const local = db && ['127.0.0.1', 'localhost', '::1'].includes(db.hostname)
  if (local) {
    const port = Number(db.port || 5432)
    if (!(await portOpen(db.hostname, port))) {
      console.log(`[dev] no database on ${db.hostname}:${port}; starting the Docker Postgres and Mailpit (docker compose up -d postgres mailpit)...`)
      const r = spawnSync('docker', ['compose', '-f', 'docker-compose.yml', '-f', 'docker-compose.dev.yml', 'up', '-d', 'postgres', 'mailpit'], { stdio: 'inherit', shell: true })
      let up = false
      if (r.status === 0) for (let i = 0; i < 30 && !up; i++) { up = await portOpen(db.hostname, port); if (!up) await new Promise((res) => setTimeout(res, 1000)) }
      if (!up) {
        console.error(`[dev] still no database on ${db.hostname}:${port}. Start Docker Desktop, then run:\n      docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres mailpit\n`)
        process.exit(1)
      }
      console.log('[dev] database is up.')
    }
  }
  if (await portOpen('127.0.0.1', 3001)) {
    console.error(`
[dev] port 3001 is already in use. Usually the Docker "app" container is running the site already (open http://localhost:3001).
      To run the dev server here instead:  docker compose -f docker-compose.yml -f docker-compose.dev.yml stop app
`)
    process.exit(1)
  }
}
