import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

// Shared metadata builder (70-urls-seo §4). Routes call `buildMetadata(doc, fallback)`; the signature is stable.
// Pass `{ settings }` (or use `getSeoMetadata`) to get the site default OG image and the title template.

type MediaLike = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | number | null | undefined

export type SeoDoc = {
  title?: string | null
  path?: string | null
  excerpt?: string | null
  meta?: { title?: string | null; description?: string | null; image?: unknown } | null
  seo?: { noindex?: boolean | null; canonical?: string | null } | null
  /** landingPages keep `noindex` at the top level. */
  noindex?: boolean | null
  heroImage?: unknown
  /** `blog` / `news` posts become `og:type=article`. */
  category?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
}

export type SeoFallback = { title?: string; description?: string; path?: string }
/** The site-wide SEO defaults (src/content/site.ts). */
export type SeoSettings = { defaultOgImage?: Media | number | null; titleTemplate?: string | null; defaultDescription?: string | null; siteName?: string | null }

export type SeoOptions = {
  settings?: SeoSettings | null
  type?: 'website' | 'article'
  /** Force noindex (e.g. `/search/`). */
  noindex?: boolean
}

export const siteOrigin = (): string => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/** Absolute URL for a site-relative or absolute path. Query strings and fragments are dropped for canonicals. */
export const absoluteUrl = (pathOrUrl: string, origin = siteOrigin()): string =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`

const stripQuery = (u: string) => u.replace(/[?#].*$/, '')

export type OgImage = { url: string; width?: number; height?: number; alt?: string }

/** A populated media doc becomes an absolute OG image; ids (depth 0) and empty values yield null. */
export function ogImageOf(m: unknown, origin = siteOrigin()): OgImage | null {
  if (!m || typeof m !== 'object') return null
  const { url, width, height, alt } = m as Exclude<MediaLike, number | null | undefined>
  if (!url) return null
  return { url: absoluteUrl(url, origin), ...(width ? { width } : {}), ...(height ? { height } : {}), ...(alt ? { alt } : {}) }
}

// Paths that are noindex unless the document says otherwise: search results and the landing-page families.
const isSearchPath = (p: string) => p === '/search' || p === '/search/' || p.startsWith('/search/')
const isLandingPath = (p: string) => p.startsWith('/lp/') || p.startsWith('/enquirenow/')

/** Resolved robots intent, shared with the sitemap so the two never disagree. */
export function resolveRobots(doc: SeoDoc | null | undefined, path: string | undefined, forceNoindex = false): { index: boolean; follow: boolean } {
  if (process.env.NEXT_PUBLIC_ROBOTS === 'noindex') return { index: false, follow: false }
  if (path && isSearchPath(path)) return { index: false, follow: true }
  if (forceNoindex || doc?.seo?.noindex || doc?.noindex === true) return { index: false, follow: false }
  // landing pages default to noindex; only an explicit `noindex: false` opts in (70 §10 Q5)
  if (path && isLandingPath(path) && doc?.noindex !== false) return { index: false, follow: false }
  return { index: true, follow: true }
}

export function buildMetadata(doc: SeoDoc | null | undefined, fallback: SeoFallback = {}, options: SeoOptions = {}): Metadata {
  if (!doc && !fallback.title) return {}
  const origin = siteOrigin()
  const { settings } = options
  const baseTitle = doc?.meta?.title || doc?.title || fallback.title
  const description = doc?.meta?.description || doc?.excerpt || fallback.description || settings?.defaultDescription || undefined
  const path = doc?.path || fallback.path
  const canonicalOverride = doc?.seo?.canonical?.trim()
  const canonical = canonicalOverride ? stripQuery(absoluteUrl(canonicalOverride, origin)) : path ? `${origin}${stripQuery(path)}` : undefined

  // With settings the template is applied here (absolute); without, the layout's `title.template` applies.
  const tpl = settings?.titleTemplate
  const title: Metadata['title'] = baseTitle && tpl && tpl.includes('%s') ? { absolute: tpl.replace('%s', baseTitle) } : baseTitle
  const fullTitle = typeof title === 'object' && title ? title.absolute : title

  const image =
    ogImageOf(doc?.meta?.image, origin) ?? ogImageOf(doc?.heroImage, origin) ?? ogImageOf(settings?.defaultOgImage, origin)
  const type = options.type ?? (doc?.category === 'blog' || doc?.category === 'news' ? 'article' : 'website')
  const robots = resolveRobots(doc, path, options.noindex)

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: robots.index && robots.follow ? undefined : robots,
    openGraph: {
      title: typeof fullTitle === 'string' ? fullTitle : undefined,
      description,
      url: canonical,
      siteName: settings?.siteName ?? undefined,
      locale: 'en_AU',
      type,
      ...(type === 'article' && doc?.publishedAt ? { publishedTime: doc.publishedAt } : {}),
      ...(type === 'article' && doc?.updatedAt ? { modifiedTime: doc.updatedAt } : {}),
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: typeof fullTitle === 'string' ? fullTitle : undefined,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  }
}
