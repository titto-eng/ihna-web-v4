import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildMetadata } from '@/lib/seo/metadata'

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

afterEach(() => vi.unstubAllEnvs())

describe('buildMetadata', () => {
  it('stays backward compatible: (doc, fallback) with no options', () => {
    const m = buildMetadata({ title: 'About', path: '/about-us/' }, {})
    expect(m.title).toBe('About')
    expect(m.alternates?.canonical).toBe(`${ORIGIN}/about-us/`)
    expect(m.robots).toBeUndefined()
    expect(buildMetadata(null)).toEqual({})
    expect(buildMetadata(null, { title: 'Fallback', path: '/x/' }).title).toBe('Fallback')
  })

  it('prefers meta over title and sets canonical without a query', () => {
    const m = buildMetadata({ title: 'T', path: '/a/?utm_source=x', meta: { title: 'Meta T', description: 'D' } })
    expect(m.title).toBe('Meta T')
    expect(m.description).toBe('D')
    expect(m.alternates?.canonical).toBe(`${ORIGIN}/a/`)
  })

  it('honours seo.canonical (relative becomes absolute)', () => {
    expect(buildMetadata({ title: 'T', path: '/a/', seo: { canonical: '/b/?x=1' } }).alternates?.canonical).toBe(`${ORIGIN}/b/`)
  })

  it('uses meta.image, then heroImage, then the site default for OG', () => {
    const media = (url: string) => ({ url, width: 1200, height: 630 })
    const settings = { defaultOgImage: media('/api/media/file/default.jpg') as never }
    const withMeta = buildMetadata({ title: 'T', path: '/a/', meta: { image: media('/api/media/file/meta.jpg') }, heroImage: media('/hero.jpg') }, {}, { settings })
    expect(withMeta.openGraph?.images).toEqual([{ url: `${ORIGIN}/api/media/file/meta.jpg`, width: 1200, height: 630 }])
    const hero = buildMetadata({ title: 'T', path: '/a/', heroImage: media('/hero.jpg') }, {}, { settings })
    expect((hero.openGraph?.images as { url: string }[])[0].url).toBe(`${ORIGIN}/hero.jpg`)
    const dflt = buildMetadata({ title: 'T', path: '/a/', meta: { image: 7 } }, {}, { settings }) // an id (depth 0) is not a URL
    expect((dflt.openGraph?.images as { url: string }[])[0].url).toBe(`${ORIGIN}/api/media/file/default.jpg`)
    expect(buildMetadata({ title: 'T', path: '/a/' }).openGraph?.images).toBeUndefined()
  })

  it('adds a twitter card that follows the image', () => {
    const withImg = buildMetadata({ title: 'T', path: '/a/', meta: { image: { url: '/i.jpg' } } })
    expect(withImg.twitter).toMatchObject({ card: 'summary_large_image', images: [`${ORIGIN}/i.jpg`] })
    expect(buildMetadata({ title: 'T', path: '/a/' }).twitter).toMatchObject({ card: 'summary' })
  })

  it('sets metadataBase', () => {
    expect(String(buildMetadata({ title: 'T', path: '/a/' }).metadataBase)).toBe(`${ORIGIN}/`)
  })

  it('applies the title template only when settings are passed', () => {
    const m = buildMetadata({ title: 'Nursing', path: '/n/' }, {}, { settings: { titleTemplate: '%s - IHM' } })
    expect(m.title).toEqual({ absolute: 'Nursing - IHM' })
    expect(m.openGraph?.title).toBe('Nursing - IHM')
  })

  it('marks noindex docs (seo.noindex and landing-page noindex) as noindex,nofollow', () => {
    expect(buildMetadata({ title: 'T', path: '/a/', seo: { noindex: true } }).robots).toEqual({ index: false, follow: false })
    expect(buildMetadata({ title: 'T', path: '/a/', noindex: true }).robots).toEqual({ index: false, follow: false })
  })

  it('noindexes /search and defaults /lp/* to noindex unless the doc opts in', () => {
    expect(buildMetadata(null, { title: 'Search', path: '/search/' }).robots).toEqual({ index: false, follow: true })
    expect(buildMetadata({ title: 'LP', path: '/lp/gcc/' }).robots).toEqual({ index: false, follow: false })
    expect(buildMetadata({ title: 'LP', path: '/lp/gcc/', noindex: true }).robots).toEqual({ index: false, follow: false })
    expect(buildMetadata({ title: 'LP', path: '/lp/gcc/', noindex: false }).robots).toBeUndefined()
  })

  it('noindexes everything when NEXT_PUBLIC_ROBOTS=noindex (staging)', () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOTS', 'noindex')
    expect(buildMetadata({ title: 'T', path: '/a/' }).robots).toEqual({ index: false, follow: false })
  })

  it('makes posts og:type=article with times', () => {
    const m = buildMetadata({ title: 'P', path: '/blog/p/', category: 'blog', publishedAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-02-03T00:00:00.000Z' })
    expect(m.openGraph).toMatchObject({ type: 'article', publishedTime: '2026-01-02T00:00:00.000Z', modifiedTime: '2026-02-03T00:00:00.000Z' })
  })
})
