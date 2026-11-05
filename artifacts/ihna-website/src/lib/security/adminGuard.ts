import { safeEqual } from './safeEqual'

/**
 * The `/admin` guard decision (90-security §4, 00-architecture §4 step 2). Pure, so the proxy and the tests share it.
 *
 * - With `ADMIN_BASIC_USER` and `ADMIN_BASIC_HASH` unset there is no guard.
 * - A `cf-access-authenticated-user-email` header is trusted only when `ADMIN_GUARD_TRUST_CF_ACCESS=1`, which the operator sets
 *   only when the origin is reachable through Cloudflare Access alone. Without that switch the header is ignored: anyone who can
 *   reach the origin directly can write it.
 * - Otherwise HTTP Basic auth: the user must match and the SHA-256 hex of the password must equal the configured hash. Both are
 *   compared in constant time.
 */
export type AdminGuardEnv = { ADMIN_BASIC_USER?: string; ADMIN_BASIC_HASH?: string; ADMIN_GUARD_TRUST_CF_ACCESS?: string; [name: string]: string | undefined }

export const guardConfigured = (env: AdminGuardEnv): boolean => Boolean(env.ADMIN_BASIC_USER && env.ADMIN_BASIC_HASH)

export const trustsCloudflareAccess = (env: AdminGuardEnv): boolean => env.ADMIN_GUARD_TRUST_CF_ACCESS?.trim() === '1'

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** True when the `Authorization: Basic` header carries the configured user and a password whose SHA-256 hex equals the hash. */
export async function basicAuthOk(header: string | null, user: string, hash: string): Promise<boolean> {
  if (!header?.startsWith('Basic ')) return false
  let decoded = ''
  try {
    decoded = atob(header.slice(6).trim())
  } catch {
    return false
  }
  const at = decoded.indexOf(':')
  const u = at === -1 ? decoded : decoded.slice(0, at)
  const p = at === -1 ? '' : decoded.slice(at + 1)
  const hex = await sha256Hex(p)
  const userOk = safeEqual(u, user)
  const passOk = safeEqual(hex, hash.trim().toLowerCase())
  return userOk && passOk
}

/** The decision for one `/admin*` request: `allow`, or `challenge` (answer 401 with `WWW-Authenticate: Basic`). */
export async function adminGuardDecision(headers: Headers, env: AdminGuardEnv): Promise<'allow' | 'challenge'> {
  if (!guardConfigured(env)) return 'allow'
  if (trustsCloudflareAccess(env) && headers.get('cf-access-authenticated-user-email')) return 'allow'
  return (await basicAuthOk(headers.get('authorization'), env.ADMIN_BASIC_USER!, env.ADMIN_BASIC_HASH!)) ? 'allow' : 'challenge'
}
