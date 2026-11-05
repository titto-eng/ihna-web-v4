import { describe, expect, it } from 'vitest'
import { buildSitemapXml, isSitemapPath, sitemapEntries } from '@/lib/seo/sitemap'
import { buildRobotsTxt } from '@/lib/seo/robots'

const row = (path: string, extra: Record<string, unknown> = {}) => ({ path, updatedAt: '2026-03-04T05:06:07.000Z', _status: 'published', ...extra })

describe('sitemap entries', () => {
  it('drops drafts, noindex docs, test courses, thank-you, payment and search paths', () => {
    const paths = sitemapEntries([
      row('/about-us/'),
      row('/draft/', { _status: 'draft' }),
      row('/hidden/', { seo: { noindex: true } }),
      row('/courses/test-1/'),
      row('/courses/test-2/', { seo: { noindex: true } }),
      row('/courses/bachelor-of-nursing/'),
      row('/thanks/'),
      row('/thanks-events/'),
      row('/blog/thanks/'),
      row('/blog/page/2/'),
      row('/payway-response/'),
      row('/secure-pay-response/'),
      row('/airwallex-checkout/'),
      row('/search/'),
      row('/payment-options/'), // an information page: stays
      row('/has-query/?x=1'),
    ]).map((e) => e.path)
    expect(paths).toEqual(['/about-us/', '/courses/bachelor-of-nursing/', '/payment-options/'])
  })

  it('includes landing pages only when noindex is explicitly false', () => {
    const paths = sitemapEntries([row('/lp/a/', { noindex: false }), row('/lp/b/', { noindex: true }), row('/lp/c/')], { landing: true }).map((e) => e.path)
    expect(paths).toEqual(['/lp/a/'])
  })

  it('dedupes and keeps lastmod from updatedAt', () => {
    const e = sitemapEntries([row('/a/'), row('/a/')])
    expect(e).toHaveLength(1)
    expect(e[0].lastmod).toBe('2026-03-04T05:06:07.000Z')
  })

  it('classifies paths', () => {
    expect(isSitemapPath('/')).toBe(true)
    expect(isSitemapPath('/courses/test-12/')).toBe(false)
    expect(isSitemapPath('/news-and-events/')).toBe(true)
  })
})

describe('sitemap xml', () => {
  it('is a valid urlset with escaped locs and ISO lastmod', () => {
    const xml = buildSitemapXml([{ path: '/a&b/', lastmod: '2026-03-04T05:06:07Z' }, { path: '/c/' }], 'https://ihm.edu.au')
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<loc>https://ihm.edu.au/a&amp;b/</loc><lastmod>2026-03-04T05:06:07.000Z</lastmod>')
    expect(xml).toContain('<url><loc>https://ihm.edu.au/c/</loc></url>')
    expect(xml.replace(/<\?xml[^>]*\?>/, '')).not.toContain('?') // no query URLs
  })
})

describe('robots.txt', () => {
  it('allows all, disallows admin/api/search and names the sitemap', () => {
    const t = buildRobotsTxt({ origin: 'https://ihm.edu.au' })
    expect(t).toContain('User-agent: *')
    expect(t).toContain('Allow: /\n')
    for (const d of ['/admin/', '/api/', '/search/']) expect(t).toContain(`Disallow: ${d}`)
    expect(t).toContain('Allow: /api/media/')
    expect(t).toContain('Sitemap: https://ihm.edu.au/sitemap.xml')
    expect(t).not.toMatch(/^Disallow: \/$/m)
  })

  it('disallows everything on staging', () => {
    const t = buildRobotsTxt({ noindex: true, origin: 'https://staging.ihm.edu.au' })
    expect(t).toMatch(/^Disallow: \/$/m)
    expect(t).not.toContain('Sitemap:')
  })
})
