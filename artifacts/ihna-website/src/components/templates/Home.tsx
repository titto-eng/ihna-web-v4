import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Search } from 'lucide-react'
import { CardCarousel } from '@/components/blocks/CardCarousel'
import Image from '@/components/blocks/MediaImage'
import { Section } from '@/components/layout/Section'
import { pickSize } from '@/lib/media-sizes'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { HeroCarousel } from '@/blocks/hero/HeroCarousel'
import { VideoHero, type VideoHeroHighlight, type VideoHeroMedia } from '@/blocks/hero/VideoHero'
import { Button } from '@/components/ui/button'
import type { Post } from '@/payload-types'
import { CourseCard, type CourseCardData } from './courseCards'
import type { Lookup, TestimonialItem } from './data'
import { PostCard } from './BlogListing'
import { HERO_FALLBACK, heroSubheading } from './homeCopy'
import { Banner, SectionTitle, enquireHref, type HeroProps } from './pageParts'
import { site } from '@/content/site'
import { HomeCourseTabs } from './HomeCourseTabs.client'

export type HomeData = {
  /**
   * The page's own hero, or several as a hero carousel (slide one is the h1 and the preloaded image); without one, a
   * placeholder from homeCopy.ts and the first featured course's image.
   */
  hero?: HeroProps | HeroProps[] | null
  /** The page's own stats band; without one, the live counts. */
  stats?: AnyBlock | null
  /** The page's remaining content, rendered after the testimonials. */
  children?: ReactNode
  header?: { primaryCta?: { label?: string | null; href?: string | null } | null } | null
  courses: CourseCardData[]
  schools: Lookup[]
  campuses: Lookup[]
  testimonials: TestimonialItem[]
  posts: Post[]
  /** How many flagged courses the featured carousel shows (default 6); `null` shows every flagged course. */
  featuredLimit?: number | null
  /** The latest-posts band (default: news). IHNA's home shows the blog. */
  latest?: { eyebrow: string; heading: string; href: string; label: string } | null
  counts: { courses: number; campuses: number; staff: number; schools: number }
  /** A constant background video behind the hero slides (the slides become an animated text slider, VideoHero). */
  video?: VideoHeroMedia | null
  /** Up to three figures floating beside the video hero text (desktop). */
  highlights?: VideoHeroHighlight[]
  /** The course search and the courses by school (the old home's tabs), in place of the featured carousel. */
  courseTabs?: HomeCourseTabsData | null
  /** Rendered right after the courses (IHNA: the campus video and campus cards). */
  afterCourses?: ReactNode
  /** Upcoming events (CMS `events`) beside the enquiry form. */
  events?: HomeEvent[]
  /** "What's on" + the enquiry form (the old home's closing pair). */
  whatsOn?: { heading: string; formHeading: string; formIntro?: string; formKey: string } | null
  /** The closing acknowledgement band. */
  acknowledgement?: { heading: string; body: ReactNode; link?: { label: string; href: string } } | null
}

export type HomeEvent = { id: number; title: string; startsAt: string; timeText?: string | null; joinUrl?: string | null }
export type HomeCourseItem = string | { title: string; href: string; image: { src: string; alt: string; width: number; height: number } }
export type HomeCourseTabsData = { heading: string; searchPlaceholder?: string; tabs: { label: string; items: HomeCourseItem[] }[] }

/**
 * `courses.featured` in `featuredOrder` (at most `limit`, every one when `limit` is null); with none flagged, the first `n` domestic
 * courses so the section is never empty.
 */
export function pickFeatured(courses: CourseCardData[], n = 6, limit: number | null = n): CourseCardData[] {
  const flagged = courses.filter((c) => c.featured).sort((a, b) => a.featuredOrder - b.featuredOrder || a.title.localeCompare(b.title))
  if (flagged.length) return limit === null ? flagged : flagged.slice(0, limit)
  const domestic = courses.filter((c) => c.studentType !== 'international' && !c.slug.endsWith('-international'))
  return [...domestic.filter((c) => c.image), ...domestic.filter((c) => !c.image)].slice(0, n)
}

/** One photo per campus (the `campuses.image` lookup), linking to the campus page. Fixed 4:3 frames: no layout shift. */
function CampusStrip({ campuses }: { campuses: Lookup[] }) {
  const items = campuses.flatMap((c) => { const pic = pickSize(c.image, 'card'); return pic ? [{ c, pic }] : [] })
  if (items.length < 2) return null
  return (
    <Section anchorId="campuses">
      <SectionTitle eyebrow="Campuses" heading="Study in the *city* you choose" />
      <ul className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {items.map(({ c, pic }) => (
          <li key={c.id}>
            <Link href={c.detailPath ?? '/campuses/'} className="group relative block aspect-[4/3] overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2">
              <Image src={pic.url} alt={`${c.name} campus`} width={pic.width} height={pic.height} sizes="(min-width: 1024px) 22vw, 45vw" style={{ objectPosition: pic.position }} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />
              <span className="display absolute bottom-4 left-4 text-2xl text-ink-foreground">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** A course that is not an IHNA course page (e.g. an IHM course): a card in the same style, opening the other site. */
function ExternalCourseCard({ item }: { item: Exclude<HomeCourseItem, string> }) {
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl">
      <span className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} sizes="(min-width: 1024px) 30vw, 90vw" className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
        <span className="label-mono absolute top-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-[10px] text-white backdrop-blur">IHM</span>
      </span>
      <span className="flex flex-1 flex-col p-6">
        <span className="font-display text-xl leading-snug text-foreground">{item.title}</span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary-strong">View course <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /><span className="sr-only"> (opens ihm.edu.au in a new tab)</span></span>
      </span>
    </a>
  )
}

/** The old home's course block: a course search, the heading, and the courses by school in tabs. */
function CourseTabsSection({ data, courses }: { data: HomeCourseTabsData; courses: CourseCardData[] }) {
  const bySlug = new Map(courses.map((c) => [c.slug, c]))
  const tabs = data.tabs.map((t) => {
    const cards = t.items.flatMap((it) => {
      if (typeof it !== 'string') return [<ExternalCourseCard key={it.href} item={it} />]
      const c = bySlug.get(it)
      return c ? [<CourseCard key={c.id} course={c} />] : []
    })
    return { label: t.label, count: cards.length, panel: <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{cards}</div> }
  }).filter((t) => t.count > 0)
  const [lead, ...rest] = data.heading.split(' | ')
  return (
    <Section tone="muted" anchorId="featured-courses" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="course-aurora absolute -top-40 -left-32 size-[30rem] rounded-full bg-primary/15 blur-3xl" />
        <span className="course-aurora absolute -right-32 bottom-0 size-[26rem] rounded-full bg-secondary/15 blur-3xl [animation-delay:-8s]" />
      </div>
      <form action="/search/" method="get" role="search" className="mx-auto mb-12 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 pl-5 shadow-[0_20px_40px_-24px_hsl(189_100%_15%/0.5)] transition focus-within:border-primary focus-within:shadow-[0_24px_50px_-24px_hsl(178_100%_31%/0.6)]">
        <Search aria-hidden className="size-5 shrink-0 text-primary-strong" />
        <label htmlFor="home-course-search" className="sr-only">Search</label>
        <input id="home-course-search" type="search" name="q" required placeholder={data.searchPlaceholder ?? 'Search...'} className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground" />
        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-semibold text-ink transition hover:-translate-y-0.5">Search</button>
      </form>
      <h2 className="display mx-auto mb-10 max-w-4xl text-center text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05]">
        {lead}{rest.length > 0 && <> <span className="text-primary-strong italic">{rest.join(' ')}</span></>}
      </h2>
      {tabs.length > 0 && <HomeCourseTabs tabs={tabs} />}
      <div className="mt-10 text-center">
        <Button asChild variant="link"><Link href="/courses/">All courses <ArrowRight aria-hidden /></Link></Button>
      </div>
    </Section>
  )
}

const melbourneDate = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', ...opts }).format(new Date(iso))

/** "What's on" (upcoming events: date box, name, time, "Book a Spot") beside the enquiry form; the form alone when no event is coming up. */
function WhatsOn({ data, events }: { data: NonNullable<HomeData['whatsOn']>; events: HomeEvent[] }) {
  const form = (
    <div>
      <h2 className="display text-[clamp(2rem,4vw,3.2rem)] text-white">{data.formHeading}</h2>
      {data.formIntro && <p className="mt-3 text-lg text-white/80">{data.formIntro}</p>}
      <div className="mt-6"><RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey: data.formKey, spacing: 'none' } as AnyBlock]} ctx={{ depth: 1 }} /></div>
    </div>
  )
  return (
    <Section anchorId="whats-on" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary-strong via-primary-strong to-ink" />
      <span aria-hidden className="course-aurora pointer-events-none absolute -top-40 -left-24 -z-10 size-[30rem] rounded-full bg-primary/40 blur-3xl" />
      <div className={events.length ? 'grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start' : 'mx-auto max-w-3xl'}>
        {events.length > 0 && (
          <div>
            <h2 className="display text-[clamp(2rem,4vw,3.2rem)] text-white">{data.heading}</h2>
            <ul className="mt-8 space-y-4">
              {events.map((e) => (
                <li key={e.id} className="reveal flex gap-5 rounded-[1.5rem] border border-white/15 bg-white/[0.07] p-5 text-white backdrop-blur transition hover:bg-white/[0.12]">
                  <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-secondary text-ink shadow-lg">
                    <span className="font-display text-3xl leading-none">{melbourneDate(e.startsAt, { day: '2-digit' })}</span>
                    <span className="label-mono mt-1 text-[10px]">{melbourneDate(e.startsAt, { month: 'short' })}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-xl leading-snug">{e.title}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-white/75"><Clock aria-hidden className="size-4" />{e.timeText || melbourneDate(e.startsAt, { hour: 'numeric', minute: '2-digit' })}</span>
                    {e.joinUrl && <a href={e.joinUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink transition hover:bg-secondary"><CalendarDays aria-hidden className="size-4" />Book a Spot</a>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {form}
      </div>
    </Section>
  )
}

/** The acknowledgement of the Traditional Owners that closes the home page. */
function Acknowledgement({ data }: { data: NonNullable<HomeData['acknowledgement']> }) {
  return (
    <section aria-labelledby="acknowledgement-heading" className="relative isolate overflow-hidden bg-[linear-gradient(135deg,hsl(16_45%_22%),hsl(189_100%_12%)_55%,hsl(190_60%_9%))] py-16 text-center text-white md:py-20" id="acknowledgement">
      <span aria-hidden className="course-aurora absolute -top-24 left-1/4 -z-10 size-80 rounded-full bg-[hsl(16_70%_45%/0.35)] blur-3xl" />
      <span aria-hidden className="course-aurora absolute -right-20 -bottom-24 -z-10 size-72 rounded-full bg-secondary/25 blur-3xl [animation-delay:-7s]" />
      <div className="mx-auto max-w-3xl px-5">
        <span aria-hidden className="mx-auto mb-6 block h-1 w-16 rounded-full bg-gradient-to-r from-[hsl(16_70%_50%)] via-secondary to-[hsl(42_90%_55%)]" />
        <h2 id="acknowledgement-heading" className="display text-3xl md:text-4xl">{data.heading}</h2>
        <div className="mt-5 text-lg leading-relaxed text-white/85">{data.body}</div>
        {data.link && <Link href={data.link.href} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold transition hover:border-secondary hover:bg-secondary hover:text-ink">{data.link.label}<ArrowRight aria-hidden className="size-4" /></Link>}
      </div>
    </section>
  )
}

// 05 §4.4 Home: hero, featured courses, schools, why us (stats), testimonials, latest posts, CTA.
export function HomeView({ hero: ownHero, stats: ownStats, children, header, courses, schools, campuses, testimonials, posts, counts, latest, featuredLimit, video, highlights, courseTabs, afterCourses, events = [], whatsOn, acknowledgement }: HomeData) {
  const band = latest ?? { eyebrow: 'News', heading: 'Latest *news*', href: '/news/', label: 'All news' }
  const featured = pickFeatured(courses, 6, featuredLimit === undefined ? 6 : featuredLimit)
  const contactHref = enquireHref(header?.primaryCta?.href)
  const heroImage = featured.find((c) => c.image)?.image ?? undefined

  const slides = Array.isArray(ownHero) ? ownHero : []
  const single = Array.isArray(ownHero) ? (ownHero.length === 1 ? ownHero[0] : null) : ownHero
  const hero: AnyBlock = (single ? { blockType: 'hero', ...single } : {
    blockType: 'hero',
    variant: 'split',
    eyebrow: HERO_FALLBACK.eyebrow,
    heading: HERO_FALLBACK.heading,
    subheading: heroSubheading(campuses.map((c) => c.name)),
    image: heroImage,
    ctas: [
      { label: 'Explore courses', href: '/courses/', style: 'primary' },
      { label: header?.primaryCta?.label || 'Enquire now', href: contactHref, style: 'secondary' },
    ],
  }) as AnyBlock

  const stats: AnyBlock = (ownStats ?? {
    blockType: 'stats', tone: 'card', spacing: 'default', heading: `Why *${site.shortName}*`,
    items: [
      { value: String(counts.courses), label: 'Courses' },
      { value: String(counts.campuses), label: 'Campuses' },
      { value: String(counts.schools), label: 'Schools' },
      { value: String(counts.staff), label: 'Academic and professional staff' },
    ].filter((i) => Number(i.value) > 0),
  }) as AnyBlock

  const schoolCards = schools
    .map((s) => ({ s, n: courses.filter((c) => c.school?.slug === s.slug).length }))
    .filter(({ n }) => n > 0)
    .map(({ s, n }) => ({ title: s.name, body: s.description ?? undefined, badge: `${n} ${n === 1 ? 'course' : 'courses'}`, href: s.detailPath ?? `/courses/?school=${s.slug}`, image: s.image }))

  return (
    <>
      {video && (slides.length || single) ? (
        <VideoHero
          media={video}
          highlights={highlights}
          slides={(slides.length ? slides : [single!]).map((s) => ({ eyebrow: s.eyebrow, heading: s.heading ?? '', subheading: s.subheading, ctas: s.ctas }))}
        />
      ) : slides.length > 1 ? <HeroCarousel slides={slides} /> : <RenderBlocks blocks={[hero]} />}

      {courseTabs ? <CourseTabsSection data={courseTabs} courses={courses} /> : featured.length > 0 && (
        <Section tone="muted" anchorId="featured-courses">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
            <SectionTitle eyebrow="Courses" heading="Featured *courses*" className="" />
            <Button asChild variant="link"><Link href="/courses/">All courses <ArrowRight aria-hidden /></Link></Button>
          </div>
          <CardCarousel label="Featured courses">
            {featured.map((c) => <CourseCard key={c.id} course={c} />)}
          </CardCarousel>
        </Section>
      )}

      {afterCourses}

      {schoolCards.length > 0 && (
        <RenderBlocks blocks={[{ blockType: 'cardGrid', heading: 'Study with our *schools*', columns: schoolCards.length >= 3 ? '3' : '2', variant: 'grid', cards: schoolCards } as AnyBlock]} />
      )}

      <RenderBlocks blocks={[stats]} />

      <CampusStrip campuses={campuses} />

      {testimonials.length > 0 && (
        <RenderBlocks blocks={[{ blockType: 'testimonials', tone: 'muted', heading: 'In their *words*', variant: 'carousel', inline: testimonials } as AnyBlock]} />
      )}

      {children}

      {posts.length > 0 && (
        <Section anchorId="latest-news">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
            <SectionTitle eyebrow={band.eyebrow} heading={band.heading} className="" />
            <Button asChild variant="link"><Link href={band.href}>{band.label} <ArrowRight aria-hidden /></Link></Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </Section>
      )}

      {whatsOn && <WhatsOn data={whatsOn} events={events} />}

      <Banner
        heading="Ready to *start*?"
        body="Talk to our admissions team about the right course for you."
        links={[
          { label: header?.primaryCta?.label || 'Enquire now', href: contactHref, style: 'primary' },
          { label: 'Browse courses', href: '/courses/', style: 'light' },
        ]}
      />
      {acknowledgement && <Acknowledgement data={acknowledgement} />}
    </>
  )
}
