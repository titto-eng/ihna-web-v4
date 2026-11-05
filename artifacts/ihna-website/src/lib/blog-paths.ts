import { normalisePath } from './paths'

// Blog post URLs (70-urls-seo §5, rule 1). A post's live URL is stored, never derived from its date: the old App Runner slug was
// the whole path after /blog/, so 172 posts live at /blog/YYYY/MM/<slug>/ and 14 at /blog/<slug>/. `urlDate` holds the
// `YYYY/MM` part of the live URL (empty for the flat ones). The other shape is an alias that renders the post with its canonical.

export const URL_DATE_RE = /^\d{4}\/(0[1-9]|1[0-2])$/
// underscores: a few live post URLs use them (e.g. /blog/is_it_too_late_to_study_nursing/)
const SLUG_RE = /^[a-z0-9_-]+$/

export type PostPathInput = { slug: string; urlDate?: string | null; category?: string | null }

/** The live URL of a post: `/blog/YYYY/MM/<slug>/`, `/blog/<slug>/`, or `/news/<slug>/` for the `news` category (IHM). */
export function postPathOf({ slug, urlDate, category }: PostPathInput): string {
  if (category === 'news') return normalisePath(`/news/${slug}`)
  return normalisePath(urlDate ? `/blog/${urlDate}/${slug}` : `/blog/${slug}`)
}

/** `YYYY/MM` of a date in Melbourne time (what the old theme printed). */
export function monthOf(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit' }).formatToParts(d)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  return y && m ? `${y}/${m}` : null
}

/**
 * The other URL shape a post answers at (served with the canonical pointing at the live URL): the flat `/blog/<slug>/` for a
 * dated post, `/blog/<YYYY/MM of publishedAt>/<slug>/` for a flat one. Null for news posts.
 */
export function postAliasPath(p: PostPathInput & { publishedAt?: string | null }): string | null {
  if (p.category === 'news') return null
  if (p.urlDate) return normalisePath(`/blog/${p.slug}`)
  const month = monthOf(p.publishedAt)
  return month ? normalisePath(`/blog/${month}/${p.slug}`) : null
}

/** App Runner slug (`2024/06/some-post` or `some-post`) → `{ urlDate, slug }`. */
export function splitApiSlug(apiSlug: string): { urlDate: string; slug: string } {
  const s = apiSlug.trim().replace(/^\/+|\/+$/g, '')
  const m = s.match(/^(\d{4}\/\d{2})\/(.+)$/)
  return m ? { urlDate: m[1], slug: m[2] } : { urlDate: '', slug: s }
}

export type BlogRoute =
  | { kind: 'listing'; page: number }
  | { kind: 'post'; slug: string; urlDate: string }
  | null

/** `/blog/[[...parts]]`: listing, `/page/N/`, `/<slug>/`, `/<YYYY>/<MM>/<slug>/`. Anything else is not a route. */
export function parseBlogParts(parts: string[] | undefined): BlogRoute {
  if (!parts?.length) return { kind: 'listing', page: 1 }
  if (parts[0] === 'page') {
    const n = Number(parts[1])
    return parts.length === 2 && Number.isInteger(n) && n >= 2 ? { kind: 'listing', page: n } : null
  }
  if (parts.length === 1) return SLUG_RE.test(parts[0]) ? { kind: 'post', slug: parts[0], urlDate: '' } : null
  if (parts.length === 3 && URL_DATE_RE.test(`${parts[0]}/${parts[1]}`) && SLUG_RE.test(parts[2])) {
    return { kind: 'post', slug: parts[2], urlDate: `${parts[0]}/${parts[1]}` }
  }
  return null
}

/** True when the requested shape is the post's live URL or its alias (any other date in the URL is a 404). */
export function servesPost(route: { slug: string; urlDate: string }, post: PostPathInput & { publishedAt?: string | null }): 'canonical' | 'alias' | null {
  const requested = postPathOf({ slug: route.slug, urlDate: route.urlDate })
  if (requested === postPathOf(post)) return 'canonical'
  return requested === postAliasPath(post) ? 'alias' : null
}
