import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extract } from '../../scripts/import/html-to-blocks'
import { findLegacyMarkup } from '../../scripts/import/lib/assert-clean'
import { SNAPSHOT_DIR } from '../../scripts/import/lib/apprunner'
import { blocksToHtml } from '../../scripts/import/lib/to-payload'
import { apiDate, blogCardPath, blogHeroPath, galleryImagePath, inlineImages, readTimeOf } from '../../scripts/import/steps/apprunner'
import { monthOf, parseBlogParts, postAliasPath, postPathOf, servesPost, splitApiSlug } from '@/lib/blog-paths'
import { galleryCampusOf } from '@/content/campuses'
import { buildRss } from '@/lib/seo/rss'
import { filterGalleries, type GalleryView } from '@/components/templates/Galleries'

// 30-import `apprunner`, 70-urls-seo §5: the blog URL rules and the extractor on App Runner bodies (rule 5).

describe('blog URLs', () => {
  it('splits the App Runner slug: the whole path after /blog/ is the live URL', () => {
    expect(splitApiSlug('2024/04/tamannas-triumph')).toEqual({ urlDate: '2024/04', slug: 'tamannas-triumph' })
    expect(splitApiSlug('standing-with-our-nepal-community')).toEqual({ urlDate: '', slug: 'standing-with-our-nepal-community' })
  })

  it('live URL from urlDate; alias is the other shape', () => {
    // a dated slug whose month differs from the publish date keeps the slug's month
    const dated = { slug: 'tamannas-triumph', urlDate: '2024/04', publishedAt: '2023-11-09T13:00:00.000Z' }
    expect(postPathOf(dated)).toBe('/blog/2024/04/tamannas-triumph/')
    expect(postAliasPath(dated)).toBe('/blog/tamannas-triumph/')
    // a flat post's alias takes the Melbourne month of its publish date (2026-09-02 00:00 Melbourne = 2026-09-01 UTC)
    const flat = { slug: 'standing-with-our-nepal-community', urlDate: '', publishedAt: '2026-09-01T14:00:00.000Z' }
    expect(postPathOf(flat)).toBe('/blog/standing-with-our-nepal-community/')
    expect(postAliasPath(flat)).toBe('/blog/2026/09/standing-with-our-nepal-community/')
    expect(monthOf('2026-09-01T14:00:00.000Z')).toBe('2026/09')
    expect(postPathOf({ slug: 'x', category: 'news' })).toBe('/news/x/')
    expect(postAliasPath({ slug: 'x', category: 'news' })).toBeNull()
  })

  it('parses blog route parts', () => {
    expect(parseBlogParts(undefined)).toEqual({ kind: 'listing', page: 1 })
    expect(parseBlogParts(['page', '3'])).toEqual({ kind: 'listing', page: 3 })
    expect(parseBlogParts(['page', '1'])).toBeNull()
    expect(parseBlogParts(['a-post'])).toEqual({ kind: 'post', slug: 'a-post', urlDate: '' })
    expect(parseBlogParts(['2024', '06', 'a-post'])).toEqual({ kind: 'post', slug: 'a-post', urlDate: '2024/06' })
    expect(parseBlogParts(['2024', '13', 'a-post'])).toBeNull()
    expect(parseBlogParts(['2024', '06'])).toBeNull()
    expect(parseBlogParts(['category', 'nursing'])).toBeNull()
  })

  it('serves a post at its live URL and its alias only', () => {
    const post = { slug: 'a-post', urlDate: '2022/05', publishedAt: '2022-10-05T00:00:00.000Z', category: 'blog' }
    expect(servesPost({ slug: 'a-post', urlDate: '2022/05' }, post)).toBe('canonical')
    expect(servesPost({ slug: 'a-post', urlDate: '' }, post)).toBe('alias')
    expect(servesPost({ slug: 'a-post', urlDate: '2022/10' }, post)).toBeNull()
    const flat = { slug: 'b-post', urlDate: '', publishedAt: '2026-08-03T14:00:00.000Z', category: 'blog' }
    expect(servesPost({ slug: 'b-post', urlDate: '' }, flat)).toBe('canonical')
    expect(servesPost({ slug: 'b-post', urlDate: '2026/08' }, flat)).toBe('alias')
    expect(servesPost({ slug: 'b-post', urlDate: '2026/07' }, flat)).toBeNull()
  })
})

describe('apprunner step helpers', () => {
  it('image paths, dates, read time', () => {
    expect(blogHeroPath('abc')).toBe('static/images/desktop/blog/abc.webp')
    expect(blogCardPath('abc')).toBe('static/images/mobile/blog/abc.webp')
    expect(galleryImagePath('x-1')).toBe('static/images/desktop/gallery/x-1.webp')
    expect(new Date(apiDate('2023-11-10T00:00:00')!).toISOString()).toBe('2023-11-09T13:00:00.000Z')
    expect(apiDate(null)).toBeNull()
    expect(readTimeOf('7', 10)).toBe(7)
    expect(readTimeOf('None', 1000)).toBe(5)
  })

  it('collects inline images on allowed hosts only', () => {
    const imgs = inlineImages('<p><img src="https://www.ihna.edu.au/wp-content/uploads/blog/uploads/2022/05/a.jpg" alt="A"><img src="https://i0.wp.com/x.jpg"></p>')
    expect(imgs).toEqual([{ legacyPath: 'wp-content/uploads/blog/uploads/2022/05/a.jpg', url: 'https://www.ihna.edu.au/wp-content/uploads/blog/uploads/2022/05/a.jpg', alt: 'A' }])
  })
})

const FIXTURE = `
<div class="blog-body" style="color:red"><center><h2 style="font-size:20px">Heading</h2></center>
<p class="lead">Text with <span style="font-weight:bold">a span</span> and <a href="https://ihna.edu.au/blog/2022/05/x/" class="btn">a self link</a>.</p>
<form><label>Name</label><input type="text" name="n"></form>
<iframe src="https://www.youtube.com/embed/abcdefghijk" style="width:100%"></iframe>
<figure class="wp-block-image"><img src="https://www.ihna.edu.au/wp-content/uploads/blog/uploads/2022/05/a.jpg" class="size-full" alt="A"></figure>
<table class="t"><tr><td style="x">Cell</td></tr></table></div>`

describe('extractor on App Runner bodies (rule 5)', () => {
  it('a body with classes, styles, center, a form and an iframe comes out clean, links site-relative', () => {
    const x = extract(FIXTURE, { url: 'https://ihna.edu.au/blog/2022/05/y/', wpType: 'post' })
    const html = blocksToHtml(x.layout, 'Title')
    expect(findLegacyMarkup(html)).toEqual([])
    expect(html).not.toMatch(/<(center|input|label|form|iframe|span|div)\b/i)
    expect(html).toContain('href="/blog/2022/05/x/"')
    expect(x.layout.some((b) => b.blockType === 'videoEmbed')).toBe(true)
  })

  const snapshot = resolve(SNAPSHOT_DIR, 'blogs.json')
  it.skipIf(!existsSync(snapshot))('every App Runner body in the snapshot converts without class=/style= (186 posts)', () => {
    const blogs = JSON.parse(readFileSync(snapshot, 'utf8')) as { slug: string; title: string; detailed_blog?: string | null }[]
    expect(blogs.length).toBe(186)
    const bad: string[] = []
    for (const b of blogs) {
      const x = extract(b.detailed_blog ?? '', { url: `https://ihna.edu.au/blog/${b.slug}/`, wpType: 'post' })
      const hits = findLegacyMarkup(blocksToHtml(x.layout, b.title))
      if (hits.length) bad.push(`${b.slug}: ${hits.join(', ')}`)
    }
    expect(bad).toEqual([])
  })
})

describe('galleries and feed', () => {
  const g = (id: number, campuses: GalleryView['campuses'], year: string): GalleryView => ({ id, anchor: `a${id}`, title: `G${id}`, eventDate: `${year}-01-01`, year, campuses, featured: false, cover: null, images: [] })
  it('campus filter takes the old App Runner id or the key; unknown → all', () => {
    expect(galleryCampusOf('65cdcea09990767ff90f9e14')?.key).toBe('perth')
    expect(galleryCampusOf('sydney')?.key).toBe('sydney')
    expect(galleryCampusOf('nope')).toBeNull()
    const all = [g(1, ['perth'], '2024'), g(2, ['sydney'], '2023'), g(3, [], '2024')]
    expect(filterGalleries(all, galleryCampusOf('perth'), null).map((x) => x.id)).toEqual([1])
    expect(filterGalleries(all, null, '2024').map((x) => x.id)).toEqual([1, 3])
  })

  it('RSS escapes text and links absolute URLs', () => {
    const xml = buildRss({ title: 'IHNA Blog', description: 'd', origin: 'https://ihna.edu.au' }, [{ title: 'A & <B>', path: '/blog/2024/06/a/', publishedAt: '2024-06-01T00:00:00.000Z', excerpt: 'x' }])
    expect(xml).toContain('<title>A &amp; &lt;B&gt;</title>')
    expect(xml).toContain('<link>https://ihna.edu.au/blog/2024/06/a/</link>')
    expect(xml.startsWith('<?xml')).toBe(true)
  })
})
