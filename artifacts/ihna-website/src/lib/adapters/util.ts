import type { Planned, PlannedHttp, SendResult } from './types'
import { envValue } from '@/lib/enquiries/config'

export const SECRET_KEY = /secret|password|passwd|token|api[-_]?key|webhook[-_]?key|authorization|credential/i
export const MASK = '[masked]'

/** `{ value, missing }` for an environment name. The value never leaves this process except in the request itself. */
export const envRef = (name: string, env: Record<string, string | undefined> = process.env, missing: string[] = []): string => {
  const v = envValue(name, env)
  if (v === undefined) {
    missing.push(name)
    return `<env:${name}>`
  }
  return v
}

export const escapeHtml = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Drops undefined, null and blank values (portal and HubSpot treat blanks as data). */
export const compact = <T extends Record<string, unknown>>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '')) as Partial<T>

export const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v.trim() : v === undefined || v === null || typeof v === 'object' ? undefined : String(v))

function maskValue(key: string, value: unknown): unknown {
  if (!SECRET_KEY.test(key)) return value
  return typeof value === 'string' && /^bearer\s/i.test(value) ? `Bearer ${MASK}` : MASK
}

export function maskDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskDeep)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? maskValue(k, v) : maskDeep(v)]))
  return value
}

/** The exact request recorded by DRY_RUN, with every credential-looking header or body key masked. */
export function maskPlanned(planned: Planned): unknown {
  if (planned.transport === 'email') return { transport: 'email', message: planned.message }
  return {
    transport: 'http',
    requests: planned.requests.map((r) => ({ ...r, headers: maskDeep(r.headers), body: maskDeep(r.body) })),
  }
}

export const encodeBody = (r: PlannedHttp): string =>
  r.encoding === 'json'
    ? JSON.stringify(r.body)
    : new URLSearchParams(Object.entries(r.body).map(([k, v]) => [k, String(v)])).toString()

export type HttpOutcome = { status: number; text: string }

/** A short, tag-free excerpt of a response body for the delivery row (audit and CRM references). Never used in `lastError`. */
export const excerpt = (text: string, max = 2000): string =>
  text.replace(/&nbsp;/gi, ' ').replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)

/** 10 s timeout. A thrown network error is reported by the caller as retryable. */
export async function httpSend(r: PlannedHttp, timeoutMs = 10_000, fetchImpl: typeof fetch = fetch): Promise<HttpOutcome> {
  const res = await fetchImpl(r.url, {
    method: r.method,
    headers: { ...r.headers, 'content-type': r.encoding === 'json' ? 'application/json' : 'application/x-www-form-urlencoded' },
    body: encodeBody(r),
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'manual',
  })
  return { status: res.status, text: await res.text().catch(() => '') }
}

/**
 * 2xx = sent. Network error, timeout, 5xx and 429 = retryable. Any other status (4xx) = not retryable: the request itself is
 * wrong, so it goes to `dead` and alerts (40 §6). `lastError` never carries a response body.
 */
export function classify(status: number, text?: string): SendResult {
  const responseBody = text === undefined ? undefined : excerpt(text)
  if (status >= 200 && status < 300) return { ok: true, responseCode: status, responseBody }
  const retryable = status >= 500 || status === 429
  return { ok: false, retryable, responseCode: status, error: `HTTP ${status}`, responseBody }
}

export const networkError = (e: unknown): SendResult => ({
  ok: false, retryable: true, error: `network: ${e instanceof Error ? e.name : 'error'}`.slice(0, 200),
})

/** Single-request adapters share this: send every planned request in order, stop at the first failure. */
export async function sendPlannedHttp(
  planned: Planned, fetchImpl?: typeof fetch,
  /** Called after each 2xx response; the last non-undefined id becomes the delivery's `externalId`. */
  idFrom?: (index: number, text: string) => string | undefined,
): Promise<SendResult> {
  if (planned.transport !== 'http') return { ok: false, retryable: false, error: 'not an http plan' }
  if (planned.missingEnv?.length) return { ok: false, retryable: false, error: `missing configuration: ${planned.missingEnv.join(', ')}` }
  let last: SendResult = { ok: true }
  let externalId: string | undefined
  for (const [i, r] of planned.requests.entries()) {
    try {
      const out = await httpSend(r, 10_000, fetchImpl)
      last = classify(out.status, out.text)
      if (last.ok) externalId = idFrom?.(i, out.text) ?? externalId
    } catch (e) {
      return { ...(networkError(e) as Extract<SendResult, { ok: false }>), externalId }
    }
    if (!last.ok) return { ...last, externalId }
  }
  return externalId ? { ...last, externalId } : last
}
