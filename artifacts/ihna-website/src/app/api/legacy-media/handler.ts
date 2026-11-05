import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Old WordPress image URLs (`/wp-content/uploads/<y>/<m>/<file>`) keep working (rule 1). The import stores every
// uploaded file under a hashed name and records the original path in `media.legacyPath` (no host, no leading slash). This resolves
// the old path to the media file URL and answers 301; 404 only when no media carries that path.

/** Look-alike paths WordPress made from one upload: `-scaled`, `-<w>x<h>` thumbnails and `-e<digits>` edited copies. */
export function legacyCandidates(path: string): string[] {
  const m = /^(.*?)(\.[A-Za-z0-9]+)$/.exec(path)
  if (!m) return [path]
  const [, stem, ext] = m
  const out = [path]
  const push = (s: string) => {
    const c = `${s}${ext}`
    if (!out.includes(c)) out.push(c)
  }
  const noSize = stem.replace(/-\d+x\d+$/, '')
  const noEdit = noSize.replace(/-e\d{10,}$/, '')
  push(noSize)
  push(noEdit)
  push(noSize.replace(/-scaled$/, ''))
  push(noEdit.replace(/-scaled$/, ''))
  push(`${noEdit.replace(/-scaled$/, '')}-scaled`)
  return out
}

/** `['2024','01','a%20b.jpg']` → `wp-content/uploads/2024/01/a b.jpg`; null for anything that is not a plain path. */
export function legacyPathOf(segments: string[]): string | null {
  const parts: string[] = []
  for (const s of segments) {
    let d: string
    try {
      d = decodeURIComponent(s)
    } catch {
      return null
    }
    if (!d || d === '.' || d === '..' || /[\0\\/]/.test(d)) return null
    parts.push(d)
  }
  return parts.length ? `wp-content/uploads/${parts.join('/')}` : null
}

export type MediaFinder = (paths: string[]) => Promise<{ legacyPath: string; url: string }[]>

const find: MediaFinder = async (paths) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'media',
    where: { legacyPath: { in: paths } },
    limit: paths.length,
    depth: 0,
    pagination: false,
    select: { legacyPath: true, filename: true },
  })
  // Payload's `url` is absolute and slash-terminated (serverURL + trailingSlash); the canonical file route has neither.
  return docs.filter((d) => d.legacyPath && d.filename).map((d) => ({ legacyPath: d.legacyPath as string, url: `/api/media/file/${encodeURIComponent(d.filename as string)}` }))
}

/** The media file URL for an old uploads path, or null. Exact path wins over a look-alike. */
export async function resolveLegacyMedia(segments: string[], finder: MediaFinder = find): Promise<string | null> {
  const path = legacyPathOf(segments)
  if (!path) return null
  const candidates = legacyCandidates(path)
  const hits = await finder(candidates)
  for (const c of candidates) {
    const hit = hits.find((h) => h.legacyPath === c)
    if (hit) return hit.url
  }
  return null
}

export async function handleLegacyMedia(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  let url: string | null = null
  try {
    url = await resolveLegacyMedia(path)
  } catch {
    return new Response('Media lookup failed', { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  if (!url) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } })
  return NextResponse.redirect(new URL(url, req.url), { status: 301, headers: { 'Cache-Control': 'public, max-age=3600' } })
}
