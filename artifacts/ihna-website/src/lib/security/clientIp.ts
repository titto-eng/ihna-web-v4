/**
 * The platform's client address (90-security §4 "Client IP").
 *
 * A single-value header such as `cf-connecting-ip`, `x-vercel-forwarded-for` or `x-real-ip` is trusted only when it is named in
 * `TRUSTED_IP_HEADERS` (comma separated, checked in order), which is set only where the proxy or CDN in front of the app sets or
 * overwrites that header on every request. Unset (the default), no such header is read: a client could send its own and choose its
 * rate-limit bucket and the IP stored on an enquiry. Then (and when no trusted header is present) the address is the rightmost
 * `X-Forwarded-For` entry, the hop our own proxy appended; never the leftmost, which the client writes. Else `unknown`.
 */
const HEADER_NAME = /^[a-z0-9-]+$/

export function trustedIpHeaders(value = process.env.TRUSTED_IP_HEADERS): string[] {
  return (value ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter((h) => HEADER_NAME.test(h) && h !== 'x-forwarded-for')
}

export function clientIp(headers: Headers, trusted: string[] = trustedIpHeaders()): string {
  for (const name of trusted) {
    const value = headers.get(name)?.trim()
    if (value) return value.slice(0, 64)
  }
  const xff = headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean).pop()
  return (xff || 'unknown').slice(0, 64)
}
