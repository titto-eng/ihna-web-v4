import { siteOrigin } from './metadata'

/** robots.txt body (70-urls-seo §5). `noindex` (staging) disallows everything and omits the sitemap. */
export function buildRobotsTxt(opts: { noindex?: boolean; origin?: string } = {}): string {
  const origin = opts.origin ?? siteOrigin()
  if (opts.noindex) return 'User-agent: *\nDisallow: /\n'
  return [
    'User-agent: *',
    'Allow: /',
    'Allow: /api/media/', // uploaded images are served from here; crawlers (and Google Images) must reach them
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /pay/',
    'Disallow: /search/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n')
}
