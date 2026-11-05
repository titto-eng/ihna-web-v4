import { afterEach, describe, expect, it } from 'vitest'
import { clientIp } from '@/lib/enquiries/request'
import { ipOf } from '@/lib/alumni/rateLimit'
import { trustedIpHeaders } from '@/lib/security/clientIp'

// 90-security §4 "Client IP": the enquiry, payment, receipt, alumni and legacy-endpoint limiters key on the platform's client address,
// never on the leftmost X-Forwarded-For entry, which the client writes itself, and never on a header the proxy is not configured to set.
const saved = process.env.TRUSTED_IP_HEADERS
afterEach(() => {
  if (saved === undefined) delete process.env.TRUSTED_IP_HEADERS
  else process.env.TRUSTED_IP_HEADERS = saved
})

describe('clientIp', () => {
  it('takes the rightmost X-Forwarded-For entry, so a spoofed leftmost value does not change the bucket', () => {
    delete process.env.TRUSTED_IP_HEADERS
    const h = new Headers({ 'x-forwarded-for': '1.2.3.4, 198.51.100.7' })
    expect(clientIp(h)).toBe('198.51.100.7')
    expect(clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 8.8.8.8, 198.51.100.7' }))).toBe('198.51.100.7')
    expect(clientIp(new Headers({ 'x-forwarded-for': `${Math.random()}, 198.51.100.7` }))).toBe('198.51.100.7')
  })

  it('by default ignores client-sent platform headers (cf-connecting-ip, x-vercel-forwarded-for, x-real-ip)', () => {
    delete process.env.TRUSTED_IP_HEADERS
    expect(clientIp(new Headers({ 'cf-connecting-ip': '203.0.113.5', 'x-forwarded-for': '1.2.3.4, 198.51.100.7' }))).toBe('198.51.100.7')
    expect(clientIp(new Headers({ 'x-real-ip': `${Math.random()}`, 'x-forwarded-for': '198.51.100.8' }))).toBe('198.51.100.8')
    expect(clientIp(new Headers({ 'x-vercel-forwarded-for': '203.0.113.6' }))).toBe('unknown')
  })

  it('reads a platform header only when TRUSTED_IP_HEADERS names it, in the configured order', () => {
    process.env.TRUSTED_IP_HEADERS = 'cf-connecting-ip, X-Real-IP'
    expect(clientIp(new Headers({ 'cf-connecting-ip': '203.0.113.5', 'x-real-ip': '203.0.113.6', 'x-forwarded-for': '1.2.3.4' }))).toBe('203.0.113.5')
    expect(clientIp(new Headers({ 'x-real-ip': '203.0.113.6', 'x-forwarded-for': '1.2.3.4' }))).toBe('203.0.113.6')
    // a header that is not named stays ignored; with no trusted header present, the rightmost X-Forwarded-For entry
    expect(clientIp(new Headers({ 'x-vercel-forwarded-for': '203.0.113.7', 'x-forwarded-for': '1.2.3.4, 198.51.100.9' }))).toBe('198.51.100.9')
  })

  it('accepts only plain header names and never treats X-Forwarded-For as a single-value header', () => {
    expect(trustedIpHeaders(undefined)).toEqual([])
    expect(trustedIpHeaders('')).toEqual([])
    expect(trustedIpHeaders('x-forwarded-for, cf-connecting-ip, bad header, x_real_ip')).toEqual(['cf-connecting-ip'])
  })

  it('a single-value header and no header still work', () => {
    delete process.env.TRUSTED_IP_HEADERS
    expect(clientIp(new Headers({ 'x-forwarded-for': ' 198.51.100.9 ' }))).toBe('198.51.100.9')
    expect(clientIp(new Headers({ 'x-forwarded-for': ' , ' }))).toBe('unknown')
    expect(clientIp(new Headers())).toBe('unknown')
    expect(clientIp(new Headers({ 'x-forwarded-for': 'a'.repeat(200) })).length).toBe(64)
  })

  it('agrees with the alumni limiter for the same headers', () => {
    process.env.TRUSTED_IP_HEADERS = 'cf-connecting-ip'
    const cases: Record<string, string>[] = [{ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }, { 'cf-connecting-ip': '3.3.3.3', 'x-forwarded-for': '1.1.1.1' }, { 'x-real-ip': '4.4.4.4' }, {}]
    for (const h of cases) {
      expect(clientIp(new Headers(h))).toBe(ipOf(new Headers(h)))
    }
  })
})
