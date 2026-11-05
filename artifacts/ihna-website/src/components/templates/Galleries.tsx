import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from '@/components/blocks/MediaImage'
import { mediaOf } from '@/components/blocks/media'
import { Section } from '@/components/layout/Section'
import { Gallery } from '@/components/page'
import { Card, CardContent } from '@/components/ui/card'
import { galleryCampuses, type GalleryCampus, type GalleryCampusKey } from '@/content/campuses'
import { pickSize } from '@/lib/media-sizes'
import { cn } from '@/lib/cn'
import type { Gallery as GalleryDoc, Media } from '@/payload-types'
import { SectionTitle } from './pageParts'

// Event galleries (the `galleries` collection): /all-events/ with its `?campus=` and `?year=` filters, and the campus pages'
// gallery strip. Each gallery keeps its old App Runner id as the in-page anchor (`/all-events/#<id>`, rule 1 for old links).

export type GalleryView = {
  id: number
  anchor: string
  title: string
  eventDate: string | null
  year: string | null
  campuses: GalleryCampusKey[]
  featured: boolean
  cover: Media | null
  images: Media[]
}

const date = new Intl.DateTimeFormat('en-AU', { dateStyle: 'long', timeZone: 'Australia/Melbourne' })
const yearOf = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat('en-AU', { year: 'numeric', timeZone: 'Australia/Melbourne' }).format(new Date(iso)) : null)

export function toGalleryView(d: GalleryDoc): GalleryView {
  const images = (d.items ?? []).map((i) => mediaOf(i.image as never)).filter((m): m is Media => !!m?.url)
  return {
    id: d.id,
    anchor: d.apprunnerId || `gallery-${d.id}`,
    title: d.title,
    eventDate: d.eventDate ?? null,
    year: yearOf(d.eventDate),
    campuses: (d.campuses ?? []) as GalleryCampusKey[],
    featured: Boolean(d.featured),
    cover: mediaOf(d.coverImage as never) ?? images[0] ?? null,
    images,
  }
}

/** Active galleries, ordered by `sortOrder` then newest event first. Cached under the galleries tags. */
export const getGalleries = (): Promise<GalleryView[]> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({ collection: 'galleries', where: { active: { equals: true } }, sort: ['sortOrder', '-eventDate'], depth: 1, limit: 0, pagination: false })
      return docs.map((d) => toGalleryView(d as GalleryDoc))
    },
    ['templates', 'galleries'],
    { tags: ['galleries', 'collection:galleries'], revalidate: 300 },
  )()

/** Pure filter for /all-events/: campus (null = all), year (null = all). */
export function filterGalleries(all: GalleryView[], campus: GalleryCampus | null, year: string | null): GalleryView[] {
  return all.filter((g) => (!campus || g.campuses.includes(campus.key)) && (!year || g.year === year))
}

export const allEventsHref = (campus: GalleryCampus | null, year?: string | null, anchor?: string) => {
  const q = new URLSearchParams()
  if (campus) q.set('campus', campus.apprunnerId)
  if (year) q.set('year', year)
  const s = q.toString()
  return `/all-events/${s ? `?${s}` : ''}${anchor ? `#${anchor}` : ''}`
}

function GalleryCard({ g, href }: { g: GalleryView; href: string }) {
  const pic = pickSize(g.cover, 'card')
  return (
    <Link href={href} className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-transform duration-300 hover:-translate-y-0.5">
        {pic ? (
          <Image src={pic.url} alt={pic.alt || g.title} width={pic.width} height={pic.height} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw" style={{ objectPosition: pic.position }} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div aria-hidden className="bg-sunrise-glow aspect-[4/3] w-full" />
        )}
        <CardContent className="space-y-2 p-5">
          {g.eventDate && <p className="label-mono text-accent"><time dateTime={g.eventDate}>{date.format(new Date(g.eventDate))}</time></p>}
          <h3 className="display text-xl leading-snug">{g.title}</h3>
          {g.images.length > 0 && <p className="text-sm text-muted-foreground">{g.images.length} photo{g.images.length === 1 ? '' : 's'}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}

const pill = (active: boolean) =>
  cn('label-mono rounded-full border px-4 py-2 transition-colors', active ? 'border-primary bg-primary text-foreground' : 'border-border hover:bg-muted')

/** /all-events/: campus and year filters, the event cards, then each event's photos under its anchor. */
export function AllEventsView({ galleries, campus, year, years }: { galleries: GalleryView[]; campus: GalleryCampus | null; year: string | null; years: string[] }) {
  return (
    <>
      <Section tone="muted" spacing="compact">
        <nav aria-label="Filter by campus" className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-2 text-muted-foreground">Campus</span>
          <Link href={allEventsHref(null, year)} className={pill(!campus)} aria-current={!campus ? 'page' : undefined}>All campuses</Link>
          {galleryCampuses.map((c) => (
            <Link key={c.key} href={allEventsHref(c, year)} className={pill(campus?.key === c.key)} aria-current={campus?.key === c.key ? 'page' : undefined}>{c.name}</Link>
          ))}
        </nav>
        {years.length > 1 && (
          <nav aria-label="Filter by year" className="mt-4 flex flex-wrap items-center gap-2">
            <span className="label-mono mr-2 text-muted-foreground">Year</span>
            <Link href={allEventsHref(campus, null)} className={pill(!year)}>All years</Link>
            {years.map((y) => <Link key={y} href={allEventsHref(campus, y)} className={pill(year === y)}>{y}</Link>)}
          </nav>
        )}
      </Section>
      <Section>
        <SectionTitle eyebrow={campus ? `${campus.name} campus` : 'All campuses'} heading="Campus life and events" />
        {galleries.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((g) => <GalleryCard key={g.id} g={g} href={`#${g.anchor}`} />)}
          </div>
        ) : (
          <p className="text-muted-foreground">No event galleries {campus ? `for ${campus.name} ` : ''}yet.{campus && <> <Link className="text-primary-strong underline underline-offset-4" href={campus.path}>Visit the {campus.name} campus page</Link>.</>}</p>
        )}
      </Section>
      {galleries.filter((g) => g.images.length).map((g, i) => (
        <Gallery key={g.id} heading={g.title} images={g.images} variant="grid" anchorId={g.anchor} tone={i % 2 ? 'default' : 'muted'} />
      ))}
    </>
  )
}

/** Campus page strip: the campus's galleries as cards linking into /all-events/. Renders nothing when the campus has none. */
export async function CampusGalleries({ campus, heading = 'Campus life and events', limit = 9 }: { campus: GalleryCampusKey; heading?: string; limit?: number }) {
  const c = galleryCampuses.find((x) => x.key === campus) ?? null
  if (!c) return null
  const list = filterGalleries(await getGalleries(), c, null)
  if (!list.length) return null
  return (
    <Section tone="muted" anchorId="gallery">
      <SectionTitle eyebrow="Gallery" heading={heading} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, limit).map((g) => <GalleryCard key={g.id} g={g} href={allEventsHref(c, null, g.anchor)} />)}
      </div>
      {list.length > limit && (
        <p className="mt-10 text-center">
          <Link href={allEventsHref(c)} className="label-mono text-primary-strong underline underline-offset-4">See all {list.length} {c.name} events</Link>
        </p>
      )}
    </Section>
  )
}
