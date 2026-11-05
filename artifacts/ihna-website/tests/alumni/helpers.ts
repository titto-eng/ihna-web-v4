import { REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import type { Payload } from 'payload'
import config from '@/payload.config'
import { Cleanup, boot, makeAlumnus, nonce } from '../collections/helpers'

export { Cleanup, boot, makeAlumnus, nonce }

export const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025'
export const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/+$/, '') // the site under test (ihm-web :3000, ihna-web :3001)

/** A fresh client address per test, so the per-IP counters of different tests never meet. */
export const ipFor = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rest = { status: number; body: Record<string, any>; headers: Headers; token?: string }

/** Drives the real Payload REST handlers in-process (same code as /api/[...slug]), so hooks, access and Set-Cookie are the real ones. */
export async function rest(method: 'GET' | 'POST' | 'PATCH', path: string, opts: { body?: unknown; token?: string; ip?: string } = {}): Promise<Rest> {
  const headers = new Headers({ 'content-type': 'application/json', origin: ORIGIN, 'x-forwarded-for': opts.ip ?? ipFor() })
  if (opts.token) headers.set('cookie', `payload-token=${opts.token}`)
  const req = new Request(`${ORIGIN}/api/${path}`, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) })
  const handler = { GET: REST_GET, POST: REST_POST, PATCH: REST_PATCH }[method](config)
  const res = await handler(req, { params: Promise.resolve({ slug: path.split('?')[0].split('/').filter(Boolean) }) })
  const body = (await res.json().catch(() => ({}))) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  const token = /payload-token=([^;]*)/.exec(res.headers.get('set-cookie') ?? '')?.[1]
  return { status: res.status, body, headers: res.headers, token: token || undefined }
}

/** Headers a browser sends for a same-origin page load: the session cookie and the Origin Payload's CSRF check wants. */
export const cookieHeaders = (token?: string) => new Headers(token ? { cookie: `payload-token=${token}`, origin: ORIGIN } : {})

export const errorOf = (r: Rest): string => r.body.errors?.[0]?.message ?? r.body.message ?? ''

export const loginAlumnus = (email: string, password: string, ip?: string) => rest('POST', 'alumni/login/', { body: { email, password }, ip })

// ---- Mailpit ----------------------------------------------------------------------------------------------------------
type MailSummary = { ID: string; Subject: string; To: { Address: string }[] }

/** Waits for a message to `to` whose subject contains `subject`; returns its HTML body. */
export async function mailTo(to: string, subject: string, timeoutMs = 15_000): Promise<string> {
  const end = Date.now() + timeoutMs
  while (Date.now() < end) {
    const list = (await (await fetch(`${MAILPIT}/api/v1/messages?limit=200`)).json()) as { messages: MailSummary[] }
    const hit = list.messages.find((m) => m.To.some((t) => t.Address.toLowerCase() === to.toLowerCase()) && m.Subject.includes(subject))
    if (hit) return ((await (await fetch(`${MAILPIT}/api/v1/message/${hit.ID}`)).json()) as { HTML: string }).HTML
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`no "${subject}" email for ${to} in Mailpit`)
}

export async function mailCount(to: string): Promise<number> {
  const list = (await (await fetch(`${MAILPIT}/api/v1/messages?limit=200`)).json()) as { messages: MailSummary[] }
  return list.messages.filter((m) => m.To.some((t) => t.Address.toLowerCase() === to.toLowerCase())).length
}

export const tokenFromMail = (html: string): string => {
  const m = /[?&]token=([A-Za-z0-9]+)/.exec(html)
  if (!m) throw new Error('no token link in the email')
  return m[1]
}

export const strongPassword = () => `Correct-Horse-${nonce()}-Battery`

/** An alumnus with a known password, optionally verified. Cleaned up by `cleanup`. */
export async function newAlumnus(payload: Payload, cleanup: Cleanup, verified = true) {
  const tag = nonce()
  const { doc, password } = await makeAlumnus(payload, cleanup, tag, verified)
  return { doc, password, email: doc.email }
}
