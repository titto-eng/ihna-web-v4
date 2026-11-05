import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { getSeoMetadata } from '@/lib/seo/get-metadata'
import { parseBlogParts, servesPost, type BlogRoute as Route } from '@/lib/blog-paths'
import { pageAt } from '@/content/pages'
import { newsListing } from '@/content/news'
import { BlogListing, NewsItemsListing, POSTS_PER_PAGE, pagePath } from './BlogListing'
import { BlogPost } from './BlogPost'
import { getLatestPosts } from './data'
import type { Post } from '@/payload-types'

// Shared by /blog/[[...parts]] and /news/[[...parts]]: `/<base>/` listing, `/<base>/page/N/` pagination, and the posts.
// A post answers at its live URL (`path`: /blog/YYYY/MM/<slug>/ or /blog/<slug>/, rule 1) and at the other blog shape as an alias
// that renders the same post with the canonical pointing at the live URL (src/lib/blog-paths.ts). `/news/<slug>/` is the IHM
// news prefix. `/news/` lists `src/content/news.ts` when its source is `items` (IHNA), else every post (DEC-39, DEC-42).
export type Base = 'blog' | 'news'
export type Parts = string[] | undefined
export type ListingQuery = { title?: string }

const LISTING_TITLES: Record<Base, string> = { blog: 'Blog', news: 'News' }
// WordPress capped the blog archive at 6 pages: an old `/blog/page/N/` past our last page goes to the last page rather than a 404.
const LEGACY_PAGE_CAP = 6

const published: Where = { _status: { equals: 'published' } }

/** `?title=` search on the blog listing (the old listing's search box), case-insensitive on the title. */
const listingWhere = (base: Base, q: ListingQuery): Where => {
  const and: Where[] = [published]
  if (base === 'blog') and.push({ category: { equals: 'blog' } })
  const title = q.title?.trim().slice(0, 100)
  if (title) and.push({ title: { like: title } })
  return { and }
}

const routeOf = (base: Base, parts: Parts): Route => {
  const r = parseBlogParts(parts)
  // the news prefix has flat post URLs only
  return base === 'news' && r?.kind === 'post' && r.urlDate ? null : r
}

async function getPost(base: Base, slug: string): Promise<Post | null> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts', where: { slug: { equals: slug }, category: { equals: base } }, draft, limit: 1, depth: 2, overrideAccess: draft,
  })
  return (docs[0] as Post | undefined) ?? null
}

/** The post a `/blog/...` or `/news/<slug>/` URL shows: at its live URL or its alias, nowhere else. */
async function resolvePost(base: Base, r: { slug: string; urlDate: string }): Promise<Post | null> {
  const post = await getPost(base, r.slug)
  if (!post) return null
  return servesPost(r, { slug: post.slug, urlDate: post.urlDate, category: post.category, publishedAt: post.publishedAt }) ? post : null
}

async function getListing(base: Base, page: number, q: ListingQuery = {}) {
  const payload = await getPayload({ config })
  const posts = await payload.find({ collection: 'posts', where: listingWhere(base, q), sort: '-publishedAt', limit: POSTS_PER_PAGE, page, depth: 1 })
  // the registry row for /blog/ or /news/ (src/content/pages.ts) owns the listing's title
  return { posts, title: pageAt(`/${base}/`)?.title ?? LISTING_TITLES[base] }
}

export async function blogMetadata(base: Base, parts: Parts): Promise<Metadata> {
  const r = routeOf(base, parts)
  if (!r) return {}
  if (r.kind === 'post') {
    const post = await resolvePost(base, r)
    if (!post) return {}
    // canonical = `seo.canonical || path`, so an alias URL canonicalises to the live one. Title template, robots, OG: 70 §4.
    return getSeoMetadata(post, {}, { type: 'article' })
  }
  if (base === 'news' && newsListing.source === 'items') {
    return getSeoMetadata({ title: newsListing.metaTitle ?? newsListing.title, path: '/news/' })
  }
  const title = pageAt(`/${base}/`)?.title ?? LISTING_TITLES[base]
  return getSeoMetadata({ title: r.page > 1 ? `${title} (page ${r.page})` : title, path: pagePath(`/${base}/`, r.page) })
}

export async function BlogRoute({ base, parts, query = {} }: { base: Base; parts: Parts; query?: ListingQuery }) {
  const r = routeOf(base, parts)
  if (!r) notFound()
  if (r.kind === 'post') {
    const post = await resolvePost(base, r)
    if (!post) notFound()
    return <BlogPost post={post} recent={await getLatestPosts(5).catch(() => [])} />
  }
  if (base === 'news' && newsListing.source === 'items') {
    if (r.page > 1) notFound()
    return <NewsItemsListing title={newsListing.title} items={newsListing.items} />
  }
  const { posts, title } = await getListing(base, r.page, query)
  const root = `/${base}/`
  const search = base === 'blog' ? query : undefined
  if (r.page > posts.totalPages) {
    if (query.title) return <BlogListing title={title} posts={[]} page={1} totalPages={0} base={root} query={search} />
    if (base === 'blog' && r.page <= LEGACY_PAGE_CAP && posts.totalPages >= 1) permanentRedirect(pagePath(root, posts.totalPages))
    notFound()
  }
  return <BlogListing title={title} posts={posts.docs as Post[]} page={r.page} totalPages={posts.totalPages} base={root} query={search} />
}
