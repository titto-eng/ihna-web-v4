import { afterEach, describe, expect, it, vi } from 'vitest'
import { landingPages as LANDING } from '@/content/landing'
import { site as SITE } from '@/content/site'

// Route metadata goes through buildMetadata (70-urls-seo §4): landing rows keep an explicit `noindex: false`, posts and courses honour
// `seo.noindex` / `seo.canonical` and staging NEXT_PUBLIC_ROBOTS=noindex; the registry, embed hosts and Course JSON-LD follow their DEC rows.

const docs = vi.hoisted(() => ({ current: [] as unknown[] }))
vi.mock('payload', () => ({ getPayload: async () => ({ find: async () => ({ docs: docs.current, totalPages: 1 }) }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn, revalidateTag: () => {} }))
const getStartDates = vi.hoisted(() => vi.fn(async () => ({ unavailable: true, data: { campuses: [] } })))
vi.mock('@/lib/portal', () => ({ getStartDates }))

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
const robotsOf = (m: { robots?: unknown }) => m.robots as { index: boolean } | undefined
const titled = (t: string) => ({ absolute: SITE.titleTemplate.replace('%s', t) })
// The landing checks run whenever src/content/landing.ts has the rows they need (IHNA has no application_form.php rows).
const hasOpenAndClosed = LANDING.some((l) => l.noindex === false) && LANDING.some((l) => l.noindex === true)
const hasApplicationEmbed = LANDING.some((l) => l.applicationCourseId != null)

afterEach(() => {
  vi.unstubAllEnvs()
  docs.current = []
  getStartDates.mockClear()
})

describe('landingMetadata', () => {
  it.skipIf(!hasOpenAndClosed)('a row with noindex: false is indexable; noindex: true and extra.noindex are not', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOTS', '')
    const { landingPages } = await import('@/content/landing')
    const { landingMetadata } = await import('@/components/templates/landing/pages')
    const open = landingPages.find((l) => l.noindex === false)!
    const closed = landingPages.find((l) => l.noindex === true)!
    expect(robotsOf(landingMetadata(open.path))).toBeUndefined()
    expect(robotsOf(landingMetadata(closed.path))?.index).toBe(false)
    expect(robotsOf(landingMetadata(open.path, { noindex: true }))?.index).toBe(false)
  })

  it('every thankYouPath is served by a route file', async () => {
    const { existsSync } = await import('node:fs')
    const { landingPages } = await import('@/content/landing')
    for (const l of landingPages) {
      if (!l.thankYouPath) continue // the form answers inline on the page
      const lp = /^\/lp\/[^/]+\/(thanks\.php|thankyou\.php|thankyou)$/.exec(l.thankYouPath)
      const file = lp ? `src/app/(site)/lp/[slug]/${lp[1]}/page.tsx` : `src/app/(site)${l.thankYouPath.replace(/\/$/, '')}/page.tsx`
      expect(existsSync(file), `${l.path} -> ${l.thankYouPath}`).toBe(true)
    }
  })
})

describe('post metadata', () => {
  const post = { title: 'A post', slug: 'a-post', path: '/blog/a-post/', category: 'blog', publishedAt: '2026-01-01T00:00:00.000Z', excerpt: 'Ex' }

  it('applies seo.noindex and seo.canonical, and the single title suffix', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOTS', '')
    const { blogMetadata } = await import('@/components/templates/blogRoute')
    docs.current = [{ ...post, seo: { noindex: true, canonical: '/blog/other/' } }]
    const m = await blogMetadata('blog', ['a-post'])
    expect(robotsOf(m)?.index).toBe(false)
    expect(m.alternates?.canonical).toBe(`${ORIGIN}/blog/other/`)
    expect(m.title).toEqual(titled('A post'))
  })

  it('staging NEXT_PUBLIC_ROBOTS=noindex reaches posts', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOTS', 'noindex')
    const { blogMetadata } = await import('@/components/templates/blogRoute')
    docs.current = [post]
    expect(robotsOf(await blogMetadata('blog', ['a-post']))?.index).toBe(false)
    expect(robotsOf(await blogMetadata('blog', []))?.index).toBe(false)
  })
})

describe('course metadata', () => {
  it('applies seo.noindex / seo.canonical and staging noindex', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOTS', '')
    const { generateMetadata } = await import('@/app/(site)/courses/[slug]/page')
    const params = Promise.resolve({ slug: 'c' })
    docs.current = [{ id: 1, title: 'C', slug: 'c', path: '/courses/c/', _status: 'published', seo: { canonical: '/courses/d/' } }]
    const m = await generateMetadata({ params })
    expect(m.alternates?.canonical).toBe(`${ORIGIN}/courses/d/`)
    expect(robotsOf(m)).toBeUndefined()
    vi.stubEnv('NEXT_PUBLIC_ROBOTS', 'noindex')
    expect(robotsOf(await generateMetadata({ params }))?.index).toBe(false)
  })
})

describe('SEO titles', () => {
  it('the SEO plugin generates a bare title; the template adds the suffix once', async () => {
    const { buildMetadata } = await import('@/lib/seo/metadata')
    const { site } = await import('@/content/site')
    // payload.config.ts generateTitle returns the title alone
    const src = (await import('node:fs')).readFileSync('src/payload.config.ts', 'utf8')
    expect(src).not.toMatch(new RegExp(`generateTitle:[^\\n]*\\| ${site.shortName}`))
    expect(buildMetadata({ title: 'X', meta: { title: 'X' }, path: '/x/' }, {}, { settings: site }).title).toEqual(titled('X'))
  })
})

describe('registry and embeds', () => {
  it('/payment-options/ is noindex and out of the sitemap rows', async () => {
    const { pageAt } = await import('@/content/pages')
    const { sitemapEntries } = await import('@/lib/seo/sitemap')
    const row = pageAt('/payment-options/')!
    expect(row.noindex).toBe(true)
    expect(sitemapEntries([{ path: row.path, seo: { noindex: Boolean(row.noindex) } }])).toEqual([])
  })

  it.skipIf(!hasApplicationEmbed)('the application embed origin is an allowed embed host (DEC-55)', async () => {
    vi.stubEnv('STUDENT_PORTAL_EMBED_ORIGIN', '')
    const { portalOrigin } = await import('@/components/templates/landing/ApplicationEmbed')
    const { site } = await import('@/content/site')
    expect(site.allowedEmbedHosts as readonly string[]).toContain(new URL(portalOrigin()).hostname)
  })
})

describe('Course JSON-LD start dates (DEC-7)', () => {
  const course = { id: 1, title: 'C', slug: 'c', path: '/courses/c/', khId: 41 }

  it('reads start dates only when showStartDates is true', async () => {
    const { CourseJsonLd } = await import('@/components/seo/Course')
    for (const showStartDates of [null, undefined, false]) await CourseJsonLd({ course: { ...course, showStartDates } as never })
    expect(getStartDates).not.toHaveBeenCalled()
    await CourseJsonLd({ course: { ...course, showStartDates: true } as never })
    expect(getStartDates).toHaveBeenCalledWith(41)
  })
})
