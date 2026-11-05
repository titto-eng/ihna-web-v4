import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd, courseCrumbs, courseLd, faqLd, instancesFromStartDates, organizationLd, postCrumbs, websiteLd } from '@/lib/seo/jsonld'

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/** Every ld+json tag in `html`, parsed. Throws if one is not valid JSON, fails if one is empty. */
function parseTags(html: string): Record<string, unknown>[] {
  const tags = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
  return tags.map((t) => {
    expect(t.trim()).not.toBe('')
    return JSON.parse(t)
  })
}
const render = (...data: (Record<string, unknown> | null)[]) => renderToStaticMarkup(createElement('div', null, ...data.map((d, i) => createElement(JsonLd, { key: i, data: d }))))

const course = { title: 'Bachelor of Nursing', path: '/courses/bachelor-of-nursing/', excerpt: 'A </script><b>nursing</b> degree', code: 'BN01', cricosCode: '123' }
const post = {
  title: 'Nursing careers', path: '/blog/nursing-careers/', category: 'blog' as const, publishedAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z',
  author: 'Dr A', excerpt: 'x', heroImage: { id: 1, url: '/api/media/file/h.jpg', alt: 'h', updatedAt: '', createdAt: '' }
}

describe('JSON-LD', () => {
  it('a course page: Course + BreadcrumbList parse and match schema.org types', () => {
    const instances = instancesFromStartDates([{ campusName: 'Melbourne', f2f: { fixed: ['2026-11-02'] }, online: { fixed: [] }, blended: { fixed: ['2026-12-07'] } }])
    const tags = parseTags(render(courseLd(course, { instances }), breadcrumbLd(courseCrumbs(course))))
    expect(tags.map((t) => t['@type'])).toEqual(['Course', 'BreadcrumbList'])
    expect(tags[0]).toMatchObject({ '@context': 'https://schema.org', name: 'Bachelor of Nursing', courseCode: 'BN01', url: `${ORIGIN}/courses/bachelor-of-nursing/` })
    expect(tags[0].provider).toMatchObject({ '@type': 'EducationalOrganization' })
    expect(tags[0].hasCourseInstance).toEqual([
      { '@type': 'CourseInstance', courseMode: 'onsite', startDate: '2026-11-02', location: { '@type': 'Place', name: 'Melbourne' } },
      { '@type': 'CourseInstance', courseMode: 'blended', startDate: '2026-12-07', location: { '@type': 'Place', name: 'Melbourne' } },
    ])
    expect((tags[1].itemListElement as { name: string; position: number }[]).map((i) => i.name)).toEqual(['Home', 'Courses', 'Bachelor of Nursing'])
  })

  it('escapes "<" so content cannot close the script tag', () => {
    const html = render(courseLd(course))
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(parseTags(html)[0].description).toBe('A </script><b>nursing</b> degree')
  })

  it('a post: BlogPosting / NewsArticle + BreadcrumbList', () => {
    const tags = parseTags(render(articleLd(post), breadcrumbLd(postCrumbs(post))))
    expect(tags.map((t) => t['@type'])).toEqual(['BlogPosting', 'BreadcrumbList'])
    expect(tags[0]).toMatchObject({ headline: 'Nursing careers', datePublished: post.publishedAt, dateModified: post.updatedAt, image: [`${ORIGIN}/api/media/file/h.jpg`] })
    expect(articleLd({ ...post, category: 'news' })['@type']).toBe('NewsArticle')
    expect((postCrumbs({ ...post, category: 'news' })[1]).path).toBe('/news/')
  })

  it('merges seo.structuredData but never changes @type', () => {
    const ld = courseLd({ ...course, seo: { structuredData: { '@type': 'Evil', inLanguage: 'en-AU' } } })
    expect(ld['@type']).toBe('Course')
    expect(ld.inLanguage).toBe('en-AU')
  })

  it('never emits an empty tag; one crumb is not a trail', () => {
    expect(render(null, {})).not.toContain('ld+json')
    expect(breadcrumbLd([{ name: 'Home', path: '/' }])).toBeNull()
  })

  it('BreadcrumbList items are absolute URLs in order', () => {
    const ld = breadcrumbLd(courseCrumbs({ title: 'Bachelor of Nursing', path: '/courses/bachelor-of-nursing/' }))
    expect((ld?.itemListElement as { item: string }[]).map((i) => i.item)).toEqual([`${ORIGIN}/`, `${ORIGIN}/courses/`, `${ORIGIN}/courses/bachelor-of-nursing/`])
  })

  it('Organization + WebSite for the home page', () => {
    const tags = parseTags(render(organizationLd({ siteName: 'IHM', logo: { id: 1, url: '/l.png', alt: '', updatedAt: '', createdAt: '' } }), websiteLd()))
    expect(tags.map((t) => t['@type'])).toEqual(['EducationalOrganization', 'WebSite'])
    expect(tags[0].logo).toBe(`${ORIGIN}/l.png`)
    expect(tags[1].potentialAction).toMatchObject({ '@type': 'SearchAction' })
  })

  it('FAQPage drops unanswered questions and is null when nothing is left', () => {
    const ld = faqLd([{ question: 'Q1', answer: 'A1' }, { question: 'Q2', answer: '  ' }])
    expect(ld?.mainEntity).toHaveLength(1)
    expect(faqLd([{ question: 'Q', answer: '' }])).toBeNull()
  })
})
