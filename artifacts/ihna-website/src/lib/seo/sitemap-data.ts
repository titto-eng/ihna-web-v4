import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { landingPages } from '@/content/landing'
import { pages } from '@/content/pages'
import { sitemapEntries, type SitemapEntry } from './sitemap'

type Row = Parameters<typeof sitemapEntries>[0][number]

// Build-time stamp for the hardcoded pages: they change when the code deploys, not per row.
const DEPLOYED_AT = new Date().toISOString()

async function loadEntries(): Promise<SitemapEntry[]> {
  const payload = await getPayload({ config })
  const find = async (collection: 'courses' | 'posts') =>
    (
      await payload.find({
        collection,
        where: { _status: { equals: 'published' } },
        select: { path: true, updatedAt: true, _status: true, seo: { noindex: true } } as never,
        limit: 0,
        pagination: false,
        depth: 0,
        draft: false,
        overrideAccess: true,
      })
    ).docs as unknown as Row[]
  const [courses, posts] = await Promise.all([find('courses'), find('posts')])
  const staticRows: Row[] = pages.map((p) => ({ path: p.path, updatedAt: DEPLOYED_AT, seo: { noindex: Boolean(p.noindex) } }))
  const landingRows: Row[] = landingPages.map((l) => ({ path: l.path, updatedAt: DEPLOYED_AT, noindex: l.noindex }))
  return [...sitemapEntries(staticRows), ...sitemapEntries(courses), ...sitemapEntries(posts), ...sitemapEntries(landingRows, { landing: true })].sort((a, b) =>
    a.path.localeCompare(b.path),
  )
}

/** Cached under tag `sitemap` (revalidated by the publish hooks) and hourly. */
export const getSitemapEntries = unstable_cache(loadEntries, ['sitemap-entries'], { tags: ['sitemap'], revalidate: 3600 })
