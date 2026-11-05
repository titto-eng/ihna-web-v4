import Link from 'next/link'
import Image from '@/components/blocks/MediaImage'
import { mediaOf } from '@/components/blocks/media'
import { Container } from '@/components/layout/Container'
import { Prose } from '@/components/layout/Prose'
import { RenderBlocks } from '@/components/RenderBlocks'
import { ArticleJsonLd } from '@/components/seo/Article'
import { site } from '@/content/site'
import type { Post } from '@/payload-types'

const date = new Intl.DateTimeFormat('en-AU', { dateStyle: 'long', timeZone: 'Australia/Melbourne' })
export const formatPostDate = (iso: string) => date.format(new Date(iso))
export const listingPath = (post: Pick<Post, 'category'>) => (post.category === 'news' ? '/news/' : '/blog/')

// Blog and news post (05-design-system templates, 30-import): hero image, date, Prose. Content is Lexical only, rendered by Prose.
/** Recent posts in the sidebar (the old blog templates' "Recent posts"): thumbnail and title. */
export function RecentPosts({ posts }: { posts: Post[] }) {
  if (!posts.length) return null
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-xl text-foreground">Recent posts</h2>
      <ul className="mt-4 divide-y divide-border">
        {posts.map((p) => {
          const img = mediaOf((p.cardImage || p.heroImage) as never)
          return (
            <li key={p.id}>
              <Link href={p.path ?? '#'} className="group flex items-center gap-4 py-3">
                <span className="relative block size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {img?.url && <Image src={img.url} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-110" />}
                </span>
                <span className="min-w-0 text-sm leading-snug font-semibold text-foreground group-hover:text-primary-strong">{p.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function BlogPost({ post, recent = [] }: { post: Post; recent?: Post[] }) {
  const image = mediaOf(post.heroImage as never)
  const home = listingPath(post)
  return (
    <article className="bg-background py-12 md:py-20">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,52rem)_20rem] lg:justify-center">
        <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="label-mono mb-8 text-muted-foreground">
          <Link href={home} className="underline-offset-4 hover:underline">{post.category === 'news' ? 'News' : 'Blog'}</Link>
        </nav>
        <header>
          <p className="label-mono mb-4 flex flex-wrap items-center gap-x-4 text-accent">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            {post.topic && typeof post.topic === 'object' && 'name' in post.topic ? <span>{post.topic.name}</span> : null}
            {post.readTime ? <span>{post.readTime} min read</span> : null}
            {post.author ? <span>{post.author}</span> : null}
          </p>
          <h1 className="display text-display-md">{post.title}</h1>
        </header>
        {image?.url && (
          <figure className="my-10 overflow-hidden rounded-card">
            <Image
              src={image.url}
              alt={image.alt ?? ''}
              width={image.width ?? 1600}
              height={image.height ?? 900}
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
          </figure>
        )}
        <Prose data={post.content as never} className="mx-auto" />
        <footer className="mt-14 border-t border-border pt-6">
          <Link href={home} className="label-mono text-primary-strong underline-offset-4 hover:underline">
            ← All {post.category === 'news' ? 'news' : 'posts'}
          </Link>
        </footer>
        </div>
        {/* every post's sidebar carries the `blog-enquiry` form (old blog-details template, `[BlogEnquiryForm]`); thank-you /blog/thanks/ */}
        <aside aria-label="More from the blog" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {post.category !== 'news' && (
            <form action="/blog/" method="get" role="search" className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
              <label htmlFor="post-search" className="font-display text-xl text-foreground">Search</label>
              <div className="mt-3 flex gap-2">
                <input id="post-search" name="title" type="search" placeholder="Search the blog" maxLength={100} className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary" />
                <button type="submit" className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-ink">Search</button>
              </div>
            </form>
          )}
          <RecentPosts posts={recent.filter((p) => p.id !== post.id).slice(0, 4)} />
          <RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey: 'blog-enquiry', heading: `Interested in studying with ${site.shortName}?`, variant: 'sidebar', spacing: 'none', anchorId: 'quickContact' }]} ctx={{ depth: 1 }} />
        </aside>
      </Container>
      <ArticleJsonLd post={post} />
    </article>
  )
}
