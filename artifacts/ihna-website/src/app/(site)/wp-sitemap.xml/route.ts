import { siteOrigin } from '@/lib/seo/metadata'

// /wp-sitemap.xml answers 200 on live (WordPress core's sitemap index). Here it is a sitemap index naming the one sitemap,
// /sitemap.xml (70-urls-seo §5), so crawlers that kept the old index URL still find every page.
export const dynamic = 'force-dynamic' // the origin is read per request environment, not frozen at build

export function GET() {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<sitemap><loc>${siteOrigin()}/sitemap.xml</loc></sitemap>`,
    '</sitemapindex>',
    '',
  ].join('\n')
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
