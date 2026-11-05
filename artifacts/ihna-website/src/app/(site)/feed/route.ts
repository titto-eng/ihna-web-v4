import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { site } from '@/content/site'
import { siteOrigin } from '@/lib/seo/metadata'
import { buildRss, type FeedItem } from '@/lib/seo/rss'

// /feed/: RSS of the 20 newest published posts (the old WordPress feed URL answers 200 on live). Cached under the posts tags.
export const dynamic = 'force-dynamic'

const loadItems = unstable_cache(
  async (): Promise<FeedItem[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 20, depth: 0,
      select: { title: true, path: true, publishedAt: true, excerpt: true },
    })
    return docs.map((d) => ({ title: d.title, path: d.path ?? '/blog/', publishedAt: d.publishedAt, excerpt: d.excerpt }))
  },
  ['feed-items'],
  { tags: ['posts', 'collection:posts'], revalidate: 3600 },
)

export async function GET() {
  const xml = buildRss({ title: `${site.shortName} Blog`, description: site.defaultDescription ?? site.siteName, origin: siteOrigin() }, await loadItems())
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
