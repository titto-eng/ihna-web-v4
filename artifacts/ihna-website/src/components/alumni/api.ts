// Calls to Payload's own REST endpoints for the alumni collection (D10). The session cookie is set by Payload (HttpOnly),
// never read or stored here. Paths end with a slash because trailingSlash is on (a redirect would drop nothing, but costs a hop).
export type ApiResult = { ok: boolean; status: number; message: string; data?: Record<string, unknown> }

export async function alumniApi(path: string, init: { method?: 'POST' | 'PATCH'; body?: unknown } = {}): Promise<ApiResult> {
  try {
    const res = await fetch(`/api/alumni/${path}`, {
      method: init.method ?? 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
    const data = (await res.json().catch(() => ({}))) as { errors?: { message?: string }[]; message?: string } & Record<string, unknown>
    const message = data.errors?.[0]?.message ?? data.message ?? ''
    return { ok: res.ok, status: res.status, message, data }
  } catch {
    return { ok: false, status: 0, message: '' }
  }
}

export const NETWORK_ERROR = 'We could not reach the server. Check your connection and try again.'
export const RATE_LIMITED = 'Too many attempts. Please wait a minute and try again.'

/** Message for a failed call that the caller has no specific wording for. */
export const genericError = (r: ApiResult): string => (r.status === 0 ? NETWORK_ERROR : r.status === 429 ? RATE_LIMITED : 'Something went wrong. Please try again.')
