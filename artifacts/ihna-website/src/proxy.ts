import { NextResponse, type NextRequest } from 'next/server'
import { matchLegacyRule } from '@/lib/legacy-redirects'
import { site } from '@/content/site'
import { DOCUMENT_PREFIXES } from '@/content/documents'
import { buildCsp, embedHostSources } from '@/lib/seo/csp'
import { adminGuardDecision } from '@/lib/security/adminGuard'

// Next 16 "proxy" (formerly middleware). Runs at the edge: no DB access here.
// Order (00-architecture §3): 410 for WordPress internals → /admin guard → uploads pass-through → security headers.
// Trailing slashes are handled by next.config (trailingSlash: true → 308), except `site.postWithoutSlash` (below). Exact redirects live in
// next.config too (src/content/redirects.ts).

const GONE_PREFIXES = ['/wp-json', '/xmlrpc.php', '/wp-login.php', '/wp-admin']
const EMBED_HOSTS = embedHostSources([...site.allowedEmbedHosts])

/** A PDF under one of the site's document stores (src/content/documents.ts); `/pdf/~/` is the rewritten form itself. */
const isDocumentUrl = (pathname: string) =>
  /\.pdf$/i.test(pathname) && !pathname.startsWith('/pdf/~/') && DOCUMENT_PREFIXES.some((p) => pathname.startsWith(p) && pathname.length > p.length)

function unauthorised() {
  return new NextResponse('Authentication required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="IHNA CMS"' } })
}

const POST_WITHOUT_SLASH: readonly string[] = (site as { postWithoutSlash?: readonly string[] }).postWithoutSlash ?? []

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // A webhook posted without the trailing slash (site.postWithoutSlash): next.config.ts leaves these paths to us. POST reaches the
  // slashed route with its body; any other method gets the usual 308 to the slashed form.
  if (POST_WITHOUT_SLASH.includes(pathname)) {
    const slashed = new URL(`${pathname}/${req.nextUrl.search}`, req.url)
    return req.method === 'POST' ? NextResponse.rewrite(slashed) : NextResponse.redirect(slashed, 308)
  }

  if (GONE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return new NextResponse(null, { status: 410 })
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Basic auth when ADMIN_BASIC_* is set; the Cloudflare Access header counts only with ADMIN_GUARD_TRUST_CF_ACCESS=1 (90-security §4).
    if ((await adminGuardDecision(req.headers, process.env)) === 'challenge') return unauthorised()
  }

  const legacy = matchLegacyRule(pathname)
  if (legacy) return NextResponse.redirect(new URL(legacy.to, req.url), legacy.status)

  if (isDocumentUrl(pathname)) return NextResponse.rewrite(new URL(`/pdf/~${pathname}`, req.url)) // `documents` collection wins over a copy in public/ (src/app/(site)/pdf/serve.ts)

  if (pathname.startsWith('/wp-content/uploads/')) {
    // Old image URLs: the route handler looks `media.legacyPath` up and answers 301 to the file. No page headers or CSP needed.
    return NextResponse.next()
  }

  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CSP (90-security §4, DEC-21): script/connect/frame are Report-Only, the safe three are enforced.
  // `frame-src` includes site.allowedEmbedHosts (src/content/site.ts); no lookup, no DB.
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const csp = buildCsp({ embedHosts: isAdmin ? [] : EMBED_HOSTS, admin: isAdmin, dev: process.env.NODE_ENV !== 'production' })
  res.headers.set('Content-Security-Policy', csp.enforced)
  res.headers.set('Content-Security-Policy-Report-Only', csp.reportOnly)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|media/|api/media/).*)'],
}
