import { buildSitemapXml } from '@/lib/seo/sitemap'
import { getSitemapEntries } from '@/lib/seo/sitemap-data'

export const dynamic = 'force-dynamic' // the entry list is cached under tag `sitemap` inside getSitemapEntries

export async function GET() {
  const xml = buildSitemapXml(await getSitemapEntries())
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
