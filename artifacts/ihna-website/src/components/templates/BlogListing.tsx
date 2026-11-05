import Link from 'next/link'
import { ArrowRight, Search as SearchIcon } from 'lucide-react'
import Image from '@/components/blocks/MediaImage'
import { mediaOf } from '@/components/blocks/media'
import { Container } from '@/components/layout/Container'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { site } from '@/content/site'
import type { NewsItem } from '@/content/news'
import { pickSize } from '@/lib/media-sizes'
import type { Post } from '@/payload-types'
import { formatPostDate } from './BlogPost'

/** The old blog listing showed 10 posts per page. */
export const POSTS_PER_PAGE = 10

/** `/blog/` for page 1, `/blog/page/2/` after that (the old WordPress pagination URLs, rule 1). */
export const pagePath = (base: string, n: number) => (n <= 1 ? base : `${base}page/${n}/`)

const withQuery = (href: string, title?: string) => (title ? `${href}?title=${encodeURIComponent(title)}` : href)

/** Category label of a post (`topic`, a blogCategories doc when populated). */
export const topicName = (post: Pick<Post, 'topic'>): string | null =>
  post.topic && typeof post.topic === 'object' && 'name' in post.topic ? post.topic.name : null

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const image = pickSize(mediaOf((post.cardImage || post.heroImage) as never), 'card')
  const topic = topicName(post)
  return (
    <Link href={post.path ?? '#'} className={`group flex h-full overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 ${featured ? 'flex-col lg:grid lg:grid-cols-[1.25fr_1fr]' : 'flex-col'}`}>
      <span className="relative block overflow-hidden bg-muted">
        {image ? (
          <Image src={image.url} alt={image.alt} width={image.width} height={image.height} sizes={featured ? '(min-width: 1024px) 55vw, 90vw' : '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw'} style={{ objectPosition: image.position }} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${featured ? 'aspect-[16/10] h-full lg:aspect-auto' : 'aspect-[4/3]'}`} />
        ) : (
          <span aria-hidden className="bg-sunrise-glow flex aspect-[4/3] w-full items-end p-6"><span className="label-mono text-ink-foreground">{site.shortName} blog</span></span>
        )}
        {topic && <span className="label-mono absolute top-4 left-4 rounded-full bg-ink/75 px-3 py-1 text-[10px] text-white backdrop-blur">{topic}</span>}
      </span>
      <span className={`flex flex-1 flex-col gap-3 ${featured ? 'p-7 md:p-10 lg:justify-center' : 'p-6'}`}>
        <span className="label-mono text-xs text-secondary-strong"><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time></span>
        <h2 className={`display leading-snug text-foreground transition-colors group-hover:text-primary-strong ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{post.title}</h2>
        {post.excerpt && <span className={`text-muted-foreground ${featured ? 'line-clamp-4 text-lg' : 'line-clamp-3'}`}>{post.excerpt}</span>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary-strong">Continue reading <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" /></span>
      </span>
    </Link>
  )
}

export function Search({ base, title, onDark = false, id = 'blog-search' }: { base: string; title?: string; onDark?: boolean; id?: string }) {
  return (
    <form action={base} method="get" role="search" className={`flex w-full max-w-xl items-center gap-2 rounded-full border p-1.5 pl-5 shadow-lg ${onDark ? 'border-white/20 bg-white/10 backdrop-blur' : 'border-border bg-card'}`}>
      <SearchIcon aria-hidden className={`size-5 shrink-0 ${onDark ? 'text-white/70' : 'text-primary-strong'}`} />
      <label htmlFor={id} className="sr-only">Search the blog</label>
      <Input id={id} name="title" type="search" defaultValue={title ?? ''} placeholder="Search by title" maxLength={100} className={`h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 ${onDark ? 'text-white placeholder:text-white/60' : ''}`} />
      <Button type="submit" className="rounded-full bg-secondary px-5 text-ink hover:bg-secondary/90">Search</Button>
    </form>
  )
}

// Listing for /blog/ and /news/: cards, 10 per page, numbered pagination; /blog/ also has the title search (`?title=`).
export function BlogListing({ title, posts, page, totalPages, base, query }: { title: string; posts: Post[]; page: number; totalPages: number; base: string; query?: { title?: string } }) {
  const q = query?.title?.trim() || undefined
  // the newest post leads the first page as a wide card
  const lead = page === 1 && !q ? posts[0] : undefined
  const rest = lead ? posts.slice(1) : posts
  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary-strong text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute inset-0 bg-gradient-to-br from-primary-strong via-primary-strong to-ink" />
          <span className="course-aurora absolute -top-32 right-[-6rem] size-[30rem] rounded-full bg-primary/45 blur-3xl" />
          <span className="course-aurora absolute -bottom-40 left-1/3 size-80 rounded-full bg-secondary/20 blur-3xl [animation-delay:-7s]" />
          <span className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_left,black,transparent_75%)]" />
        </div>
        <Container className="py-16 md:py-24">
          <p className="hero-fade-up inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 text-xs font-semibold tracking-wide backdrop-blur md:text-sm">
            <span aria-hidden className="size-2.5 rounded-full bg-secondary" />{site.shortName}
          </p>
          <h1 className="display hero-fade-up mt-6 text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] [--d:80ms]">{title}</h1>
          <span aria-hidden className="mt-6 block h-1 w-20 rounded-full bg-gradient-to-r from-secondary to-primary" />
          {query && <div className="hero-fade-up mt-8 [--d:160ms]"><Search base={base} title={q} onDark /></div>}
        </Container>
      </section>
      <section className="bg-background py-12 md:py-20">
        <Container>
          {q && (
            <p className="mb-8 text-muted-foreground">
              {posts.length ? <>Posts matching “{q}”.</> : <>No posts match “{q}”.</>}{' '}
              <Link href={base} className="font-semibold text-primary-strong underline underline-offset-4">Show all posts</Link>
            </p>
          )}
          {posts.length ? (
            <>
              {lead && <div className="reveal mb-8"><PostCard post={lead} featured /></div>}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => <div key={p.id} className="reveal"><PostCard post={p} /></div>)}
              </div>
            </>
          ) : (
            !q && <p className="text-muted-foreground">Nothing has been published yet.</p>
          )}
          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
              {page > 1 && <Link href={withQuery(pagePath(base, page - 1), q)} rel="prev" className="label-mono rounded-full border border-border px-4 py-2 hover:border-primary">Previous</Link>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={withQuery(pagePath(base, n), q)}
                  aria-current={n === page ? 'page' : undefined}
                  className={n === page ? 'label-mono rounded-full bg-primary-strong px-4 py-2 text-white' : 'label-mono rounded-full px-4 py-2 hover:bg-muted'}
                >
                  {n}
                </Link>
              ))}
              {page < totalPages && <Link href={withQuery(pagePath(base, page + 1), q)} rel="next" className="label-mono rounded-full border border-border px-4 py-2 hover:border-primary">Next</Link>}
            </nav>
          )}
        </Container>
      </section>
    </>
  )
}

const newsDate = new Intl.DateTimeFormat('en-AU', { dateStyle: 'long', timeZone: 'Australia/Melbourne' })

// `/news/` and `/category/india/news/` (IHNA): the four WordPress news posts that live at the site root as code pages.
export function NewsItemsListing({ title, items, eyebrow }: { title: string; items: NewsItem[]; eyebrow?: string }) {
  return (
    <section className="bg-background py-12 md:py-20">
      <Container>
        {eyebrow && <p className="label-mono mb-3 text-accent">{eyebrow}</p>}
        <h1 className="display mb-12 text-display-md">{title}</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((n) => (
            <Link key={n.path} href={n.path} className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2">
              <Card className="h-full gap-0 py-0 transition-transform duration-300 hover:-translate-y-0.5">
                <CardContent className="flex flex-1 flex-col gap-3 p-6">
                  <p className="label-mono text-accent"><time dateTime={n.date}>{newsDate.format(new Date(`${n.date}T12:00:00+10:00`))}</time></p>
                  <h2 className="display text-2xl leading-snug">{n.title}</h2>
                  <p className="line-clamp-4 text-muted-foreground">{n.excerpt}</p>
                  <span className="label-mono mt-auto text-primary-strong">Read more</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
