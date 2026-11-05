import type { Course, Media, Post } from '@/payload-types'
import { absoluteUrl, ogImageOf, siteOrigin } from './metadata'

// Pure schema.org builders (70-urls-seo §4 JSON-LD). No I/O; components in src/components/seo render them.
export type JsonLdObject = Record<string, unknown>

type Crumb = { name: string; path: string }
type OrgSettings = { siteName?: string | null; logo?: Media | number | null; phone?: string | null; email?: string | null; organisation?: { address?: string | null } | null } | null | undefined

const clean = <T extends JsonLdObject>(o: T): T => {
  for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === null || o[k] === '') delete o[k]
  return o
}

export const SITE_NAME_FALLBACK = 'Institute of Health and Nursing Australia'
const ctx = 'https://schema.org'

export function organizationLd(settings?: OrgSettings, origin = siteOrigin(), sameAs: string[] = []): JsonLdObject {
  const logo = ogImageOf(settings?.logo, origin)
  return clean({
    '@context': ctx,
    '@type': 'EducationalOrganization',
    '@id': `${origin}/#organization`,
    name: settings?.siteName || SITE_NAME_FALLBACK,
    url: `${origin}/`,
    logo: logo?.url,
    telephone: settings?.phone ?? undefined,
    email: settings?.email ?? undefined,
    address: settings?.organisation?.address ? { '@type': 'PostalAddress', streetAddress: settings.organisation.address, addressCountry: 'AU' } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  })
}

export function websiteLd(settings?: OrgSettings, origin = siteOrigin()): JsonLdObject {
  return {
    '@context': ctx,
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: settings?.siteName || SITE_NAME_FALLBACK,
    publisher: { '@id': `${origin}/#organization` },
    // The search page exists at /search/ (robots-disallowed but a valid SearchAction target).
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${origin}/search/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  }
}

export function breadcrumbLd(items: Crumb[], origin = siteOrigin()): JsonLdObject | null {
  const list = items.filter((i) => i.name && i.path)
  if (list.length < 2) return null // a single crumb is not a trail
  return {
    '@context': ctx,
    '@type': 'BreadcrumbList',
    itemListElement: list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path, origin) })),
  }
}

export const courseCrumbs = (c: Pick<Course, 'title' | 'path'>): Crumb[] => [
  { name: 'Home', path: '/' }, { name: 'Courses', path: '/courses/' }, { name: c.title, path: c.path ?? '/courses/' },
]

export const postCrumbs = (p: Pick<Post, 'title' | 'path' | 'category'>): Crumb[] => [
  { name: 'Home', path: '/' },
  p.category === 'news' ? { name: 'News', path: '/news/' } : { name: 'Blog', path: '/blog/' },
  { name: p.title, path: p.path ?? '/blog/' },
]

export type CourseInstanceInput = { startDate: string; mode?: 'f2f' | 'online' | 'blended'; location?: string }

const MODE: Record<NonNullable<CourseInstanceInput['mode']>, string> = { f2f: 'onsite', online: 'online', blended: 'blended' }

/** `structuredData` (admin JSON field) is merged last so marketing can add properties, never remove @type. */
const mergeExtra = (base: JsonLdObject, extra: unknown): JsonLdObject =>
  extra && typeof extra === 'object' && !Array.isArray(extra) ? { ...base, ...(extra as JsonLdObject), '@context': ctx, '@type': base['@type'] } : base

export function courseLd(
  course: Pick<Course, 'title' | 'path' | 'excerpt' | 'code' | 'cricosCode' | 'seo'>,
  opts: { settings?: OrgSettings; origin?: string; instances?: CourseInstanceInput[] } = {},
): JsonLdObject {
  const origin = opts.origin ?? siteOrigin()
  const instances = (opts.instances ?? []).filter((i) => /^\d{4}-\d{2}-\d{2}/.test(i.startDate))
  return mergeExtra(
    clean({
      '@context': ctx,
      '@type': 'Course',
      name: course.title,
      description: course.excerpt || undefined,
      url: absoluteUrl(course.path ?? '/courses/', origin),
      courseCode: course.code || undefined,
      provider: { '@type': 'EducationalOrganization', name: opts.settings?.siteName || SITE_NAME_FALLBACK, url: `${origin}/` },
      hasCourseInstance: instances.length
        ? instances.map((i) =>
            clean({
              '@type': 'CourseInstance',
              courseMode: i.mode ? MODE[i.mode] : undefined,
              startDate: i.startDate.slice(0, 10),
              location: i.location ? { '@type': 'Place', name: i.location } : undefined,
            }),
          )
        : undefined,
    }),
    course.seo && 'structuredData' in course.seo ? course.seo.structuredData : undefined,
  )
}

export function articleLd(
  post: Pick<Post, 'title' | 'path' | 'category' | 'publishedAt' | 'updatedAt' | 'author' | 'excerpt' | 'heroImage' | 'seo'>,
  opts: { settings?: OrgSettings; origin?: string } = {},
): JsonLdObject {
  const origin = opts.origin ?? siteOrigin()
  const image = ogImageOf(post.heroImage as Media | number | null | undefined, origin)
  const url = absoluteUrl(post.path ?? '/blog/', origin)
  return mergeExtra(
    clean({
      '@context': ctx,
      '@type': post.category === 'news' ? 'NewsArticle' : 'BlogPosting',
      headline: post.title,
      description: post.excerpt || undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: post.author ? { '@type': 'Person', name: post.author } : { '@type': 'Organization', name: opts.settings?.siteName || SITE_NAME_FALLBACK },
      publisher: { '@type': 'Organization', name: opts.settings?.siteName || SITE_NAME_FALLBACK, url: `${origin}/` },
      image: image ? [image.url] : undefined,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    }),
    post.seo && 'structuredData' in post.seo ? post.seo.structuredData : undefined,
  )
}

/** Questions with no answer text are dropped; no questions = null (never an empty FAQPage). */
export function faqLd(items: { question: string; answer: string }[]): JsonLdObject | null {
  const mainEntity = items
    .filter((i) => i.question?.trim() && i.answer?.trim())
    .map((i) => ({ '@type': 'Question', name: i.question.trim(), acceptedAnswer: { '@type': 'Answer', text: i.answer.trim() } }))
  return mainEntity.length ? { '@context': ctx, '@type': 'FAQPage', mainEntity } : null
}

/** Portal start dates (`StartDates`) flattened into CourseInstance inputs. */
export function instancesFromStartDates(
  campuses: { campusName: string; f2f: { fixed: string[] }; online: { fixed: string[] }; blended: { fixed: string[] } }[] | undefined,
  limit = 12,
): CourseInstanceInput[] {
  const out: CourseInstanceInput[] = []
  for (const c of campuses ?? []) {
    for (const mode of ['f2f', 'online', 'blended'] as const) {
      for (const startDate of c[mode].fixed) out.push({ startDate, mode, location: mode === 'online' ? undefined : c.campusName })
    }
  }
  return out.sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, limit)
}
