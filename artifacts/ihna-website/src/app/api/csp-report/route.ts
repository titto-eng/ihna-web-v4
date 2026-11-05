import { NextResponse, type NextRequest } from 'next/server'

// CSP violation sink (90-security §4 CSP): `report-uri /api/csp-report/` (`CSP_REPORT_URI` in src/lib/seo/csp.ts) points here. Accepts the legacy
// `application/csp-report` body (`{ "csp-report": {...} }`) and the Reporting API's `application/reports+json` array, caps the body
// at 16 KB, logs one line per violation with console.warn and answers 204. Nothing is stored and no other method is served.

export const MAX_REPORT_BYTES = 16 * 1024

const ACCEPTED_TYPES = ['application/csp-report', 'application/reports+json', 'application/json']

type LegacyReport = { 'csp-report'?: Record<string, unknown> }
type ReportingApiItem = { type?: string; url?: string; body?: Record<string, unknown> }

const str = (v: unknown, max = 300): string | undefined => (typeof v === 'string' && v ? v.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) : undefined)

/** One flat summary per violation: `{ document, directive, blocked, disposition }`, from either report shape. */
export function summariseCspReport(json: unknown): { document?: string; directive?: string; blocked?: string; disposition?: string }[] {
  const items: Record<string, unknown>[] = []
  if (Array.isArray(json)) {
    for (const r of json as ReportingApiItem[]) if (r && (r.type === undefined || r.type === 'csp-violation') && r.body && typeof r.body === 'object') items.push({ documentURL: r.url, ...r.body })
  } else if (json && typeof json === 'object') {
    const legacy = (json as LegacyReport)['csp-report']
    if (legacy && typeof legacy === 'object') items.push(legacy)
  }
  return items.slice(0, 20).map((b) => ({
    document: str(b.documentURL ?? b['document-uri']),
    directive: str(b.effectiveDirective ?? b['effective-directive'] ?? b['violated-directive'], 80),
    blocked: str(b.blockedURL ?? b['blocked-uri']),
    disposition: str(b.disposition, 20),
  }))
}

export async function POST(req: NextRequest) {
  const type = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (!ACCEPTED_TYPES.includes(type)) return new NextResponse(null, { status: 415 })
  const declared = Number(req.headers.get('content-length') ?? 0)
  if (declared > MAX_REPORT_BYTES) return new NextResponse(null, { status: 413 })
  const text = await req.text()
  if (text.length > MAX_REPORT_BYTES) return new NextResponse(null, { status: 413 })
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return new NextResponse(null, { status: 400 })
  }
  for (const v of summariseCspReport(json)) console.warn(`csp.violation ${JSON.stringify(v)}`)
  return new NextResponse(null, { status: 204 })
}

const methodNotAllowed = () => new NextResponse(null, { status: 405, headers: { Allow: 'POST' } })
export const GET = methodNotAllowed
export const HEAD = methodNotAllowed
export const PUT = methodNotAllowed
export const DELETE = methodNotAllowed
export const PATCH = methodNotAllowed
