// News article layout for the hand-written WordPress posts (the root-level post routes): date chip, framed feature image, a
// readable prose column, an optional "read the full article" source link, and NewsArticle + breadcrumb JSON-LD for search
// and answer engines. The text is passed in as children exactly as migrated.
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { proseClassName } from '@/components/layout/Prose'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd } from '@/lib/seo/jsonld'
import { absoluteUrl } from '@/lib/seo/metadata'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'

type Pic = { src: string; alt?: string; width: number; height: number }

export function Article({
  title,
  path,
  published,
  date,
  image,
  imageFit = 'cover',
  source,
  description,
  children,
}: {
  title: string
  path: string
  /** ISO date for structured data (yyyy-mm-dd). */
  published: string
  /** The date line as shown on the old post. */
  date?: string
  image?: Pic
  /** `contain` for posters / square artwork that must not be cropped. */
  imageFit?: 'cover' | 'contain'
  source?: { href: string; label: string }
  description?: string
  children: ReactNode
}) {
  const ld = articleLd({ title, path, category: 'news', publishedAt: published, updatedAt: published, author: null, excerpt: description ?? null, heroImage: null, seo: null } as never, { settings: site as never })
  if (ld && image) (ld as Record<string, unknown>).image = [absoluteUrl(image.src)]
  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        {date && (
          <p className="label-mono reveal inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary-strong">
            <CalendarDays aria-hidden className="size-4" />
            {date}
          </p>
        )}
        {image && (
          <figure className={cn('reveal mt-8 overflow-hidden rounded-card border border-border shadow-xl shadow-primary/10', imageFit === 'contain' && 'bg-gradient-to-br from-primary/5 to-secondary/10 p-4 md:p-8')}>
            <Image
              src={image.src}
              alt={image.alt ?? ''}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 48rem, 100vw"
              priority
              className={cn('h-auto w-full', imageFit === 'contain' ? 'mx-auto max-h-[36rem] w-auto rounded-xl object-contain' : 'object-cover')}
            />
          </figure>
        )}
        <div className={cn(proseClassName, 'mt-10 max-w-none [&>*:first-child]:mt-0')}>{children}</div>
        {source && (
          <Link
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary-strong px-6 py-3 font-semibold text-ink-foreground shadow-lg shadow-primary-strong/25 transition-all hover:-translate-y-0.5 hover:bg-primary"
          >
            {source.label}
            <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </article>
      <JsonLd data={ld} />
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'News', path: '/news/' }, { name: title, path }])} />
    </Section>
  )
}
