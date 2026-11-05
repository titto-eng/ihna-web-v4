import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePortal, type PortalTag } from '@/lib/portal/cache'
import { safeEqual } from '@/lib/security/safeEqual'

// 00-architecture §4: POST { tags?: string[]; paths?: string[]; all?: true } with header `x-revalidate-secret`.
// Called by scripts/import/cli.ts after each step (imports skip the publish hooks) and by ops when needed.
// `all` and any `portal` / `portal:<scope>` tag also clear the portal's 60 s negative cache (50-portal-data §5).
const portalScope = (tag: string): PortalTag | undefined => {
  if (tag === 'portal') return undefined
  const m = /^portal:(.+)$/.exec(tag)
  if (!m) return undefined
  if (m[1] === 'calendar' || m[1] === 'countries' || m[1] === 'census' || m[1] === 'agents' || m[1] === 'packages' || m[1] === 'courses') return m[1]
  return /^\d+$/.test(m[1]) ? Number(m[1]) : undefined
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || !safeEqual(req.headers.get('x-revalidate-secret') ?? '', secret)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  }
  let body: { tags?: unknown; paths?: unknown; all?: unknown } = {}
  try { body = await req.json() } catch { /* empty body is fine */ }
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string').slice(0, 500) : []
  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/')).slice(0, 500) : []
  if (body.all === true) {
    revalidatePath('/', 'layout') // everything under the site layout
    revalidatePortal()
  }
  for (const t of tags) {
    revalidateTag(t, 'max')
    if (t === 'portal' || t.startsWith('portal:')) revalidatePortal(portalScope(t))
  }
  for (const p of paths) revalidatePath(p)
  return NextResponse.json({ ok: true, tags: tags.length, paths: paths.length, all: body.all === true })
}
