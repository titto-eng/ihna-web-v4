import { siteOrigin } from './metadata'

// /sitemap.xml (70-urls-seo §5): pure helpers (unit-tested). The Payload reader is in sitemap-data.ts.
export type SitemapEntry = { path: string; lastmod?: string | null }

type Row = { path?: string | null; slug?: string | null; updatedAt?: string | null; _status?: string | null; noindex?: boolean | null; seo?: { noindex?: boolean | null } | null }

// Transactional, payment-response, thank-you, search and pagination URLs never go in the sitemap.
const EXCLUDED_PATH = [
  /^\/(airwallex|payway|secure-pay|pay-online|makepayment|make-a-payment|pay|search|alumni\/login)(-|\/|$)/,
  /(^|\/|-)thanks?(-|\/|$)/,
  /(^|\/|-)thank-?you(-|\/|$)/,
  /\/page\/\d+\/?$/,
  /^\/courses\/test-\d+\/$/, // DEC-34: kept live, noindex, never advertised
]

export const isSitemapPath = (path: string | null | undefined): path is string =>
  Boolean(path && path.startsWith('/') && !/[?#]/.test(path) && !EXCLUDED_PATH.some((re) => re.test(path)))

const isPublished = (r: Row) => r._status === undefined || r._status === null || r._status === 'published'

/** Drafts, noindex docs (either spelling of the field), excluded paths and duplicates are dropped. */
export function sitemapEntries(rows: Row[], opts: { landing?: boolean } = {}): SitemapEntry[] {
  const seen = new Set<string>()
  const out: SitemapEntry[] = []
  for (const r of rows) {
    // landing pages are in only when `noindex` is explicitly false (70 §10 Q5); other collections keep `seo.noindex`
    const noindex = opts.landing ? r.noindex !== false : Boolean(r.seo?.noindex)
    if (!isPublished(r) || noindex) continue
    if (!isSitemapPath(r.path) || seen.has(r.path)) continue
    seen.add(r.path)
    out.push({ path: r.path, lastmod: r.updatedAt })
  }
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export function buildSitemapXml(entries: SitemapEntry[], origin = siteOrigin()): string {
  const urls = entries.map((e) => {
    const lm = e.lastmod && !Number.isNaN(Date.parse(e.lastmod)) ? `<lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ''
    return `<url><loc>${esc(`${origin}${e.path}`)}</loc>${lm}</url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}
