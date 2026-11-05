import { describe, expect, it } from 'vitest'
import nextConfig, { HSTS_VALUE, productionHeaders } from '../../next.config'

// 90-security §4 "Headers" and 00-architecture §6: HSTS in production only, no X-Powered-By, standalone output for the Dockerfile.
describe('next.config', () => {
  it('sends Strict-Transport-Security on every path in production only', () => {
    expect(productionHeaders('production')).toEqual([{ source: '/:path*', headers: [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] }])
    expect(HSTS_VALUE).toBe('max-age=63072000; includeSubDomains')
    expect(productionHeaders('development')).toEqual([])
    expect(productionHeaders('test')).toEqual([])
    expect(productionHeaders(undefined)).toEqual([])
  })
  it('drops X-Powered-By and builds the standalone output the Dockerfile copies', async () => {
    const cfg = await nextConfig
    expect(cfg.poweredByHeader).toBe(false)
    expect(cfg.output).toBe('standalone')
    expect(cfg.trailingSlash).toBe(true)
    expect(typeof cfg.headers).toBe('function')
  })
})
