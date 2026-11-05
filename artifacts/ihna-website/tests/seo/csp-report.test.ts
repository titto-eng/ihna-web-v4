import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, MAX_REPORT_BYTES, POST, summariseCspReport } from '@/app/api/csp-report/route'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
// Next's own route builder: the same code that turns next.config redirects into the matchers the server runs.
import { buildCustomRoute } from 'next/dist/lib/build-custom-route'
import { buildCsp, CSP_REPORT_URI } from '@/lib/seo/csp'
import { trailingSlashRedirects } from '@/lib/trailing-slash'
import { site } from '@/content/site'

// 90-security §4 CSP: `report-uri /api/csp-report/` has a sink that logs one line per violation and keeps nothing.
const post = (body: string, type = 'application/csp-report', extra: Record<string, string> = {}) =>
  POST(new NextRequest('http://localhost:3001/api/csp-report/', { method: 'POST', headers: { 'content-type': type, ...extra }, body }))

afterEach(() => vi.restoreAllMocks())

describe('POST /api/csp-report', () => {
  it('is the report-uri of both policies', () => {
    expect(CSP_REPORT_URI).toBe('/api/csp-report/')
    expect(buildCsp().reportOnly).toMatch(/report-uri \/api\/csp-report\/(;|$)/)
    expect(buildCsp({ admin: true }).reportOnly).toMatch(/report-uri \/api\/csp-report\/(;|$)/)
  })

  it('reaches the route without a redirect: no trailing-slash rule matches the report-uri, and the route file is there', () => {
    // browsers do not follow a redirect for a report, so a 308 would drop every report (next.config.ts redirects)
    const rules = trailingSlashRedirects(site.postWithoutSlash).map((r) => buildCustomRoute('redirect', r as never, ['/_next']) as unknown as { regex: string })
    expect(rules.filter((r) => new RegExp(r.regex).test(CSP_REPORT_URI))).toEqual([])
    expect(rules.some((r) => new RegExp(r.regex).test(CSP_REPORT_URI.replace(/\/$/, '')))).toBe(true) // the bare path is the one that 308s
    expect(existsSync(resolve(__dirname, `../../src/app${CSP_REPORT_URI}route.ts`))).toBe(true)
  })
  it('accepts a legacy csp-report body, logs one summary line and answers 204', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const res = await post(JSON.stringify({ 'csp-report': { 'document-uri': 'https://ihm.edu.au/courses/', 'violated-directive': 'script-src', 'blocked-uri': 'https://evil.example/x.js', 'effective-directive': 'script-src-elem', disposition: 'report' } }))
    expect(res.status).toBe(204)
    expect(warn).toHaveBeenCalledTimes(1)
    const line = String(warn.mock.calls[0][0])
    expect(line.startsWith('csp.violation ')).toBe(true)
    expect(JSON.parse(line.slice('csp.violation '.length))).toEqual({ document: 'https://ihm.edu.au/courses/', directive: 'script-src-elem', blocked: 'https://evil.example/x.js', disposition: 'report' })
  })
  it('accepts the Reporting API array (application/reports+json)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const body = JSON.stringify([
      { type: 'csp-violation', url: 'https://ihm.edu.au/', body: { effectiveDirective: 'frame-src', blockedURL: 'https://x.example/', disposition: 'report' } },
      { type: 'deprecation', url: 'https://ihm.edu.au/', body: {} },
    ])
    expect((await post(body, 'application/reports+json')).status).toBe(204)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('"directive":"frame-src"')
  })
  it('limits the body to 16 KB and rejects other content types and broken JSON', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect((await post(JSON.stringify({ 'csp-report': { 'blocked-uri': 'x'.repeat(MAX_REPORT_BYTES) } }))).status).toBe(413)
    expect((await post('{}', 'application/csp-report', { 'content-length': String(MAX_REPORT_BYTES + 1) })).status).toBe(413)
    expect((await post('{}', 'text/plain')).status).toBe(415)
    expect((await post('{not json')).status).toBe(400)
    expect((await post('{"other": 1}')).status).toBe(204)
    expect(warn).not.toHaveBeenCalled()
  })
  it('GET answers 405 with Allow: POST', async () => {
    const res = await GET()
    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('POST')
  })
  it('summaries strip control characters and cap at 20 items', () => {
    const many = Array.from({ length: 30 }, () => ({ type: 'csp-violation', body: { blockedURL: 'a\u0000b' } }))
    const out = summariseCspReport(many)
    expect(out).toHaveLength(20)
    expect(out[0].blocked).toBe('ab')
  })
})
