import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { RenderBlocks } from '@/components/RenderBlocks'
import type { Post } from '@/payload-types'
import { PostCard } from './BlogListing'
import { Banner, LeadHero, SectionTitle, type HeroProps } from './pageParts'

export type EventRow = { id: number; title: string; startsAt: string; venue: string | null; joinUrl: string | null }

const fmt = (iso: string) => new Intl.DateTimeFormat('en-AU', { dateStyle: 'full', timeZone: 'Australia/Melbourne' }).format(new Date(iso))

// /news-and-events/ (live: tabbed news + events): latest news cards and the upcoming events from the `events` collection.
export function EventsListingView({ hero, children, posts, events, ownForm = false }: { hero: HeroProps; children?: ReactNode; posts: Post[]; events: EventRow[]; ownForm?: boolean }) {
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'News and events' }} />
      {children}
      <Section tone="muted" anchorId="events">
        <SectionTitle eyebrow="Events" heading="Upcoming *events*" />
        {events.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-card border border-border bg-card p-6">
                <p className="label-mono text-accent"><time dateTime={e.startsAt}>{fmt(e.startsAt)}</time></p>
                <h3 className="display mt-2 text-2xl">{e.title}</h3>
                {e.venue && <p className="mt-1 text-muted-foreground">{e.venue}</p>}
                {e.joinUrl && /^https?:\/\//.test(e.joinUrl) && <a href={e.joinUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-primary-strong underline underline-offset-4">Join</a>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">There are no upcoming events right now. Check back soon.</p>
        )}
      </Section>
      {!ownForm && (
        <RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey: 'event-registration', heading: 'Register your interest in an event', variant: 'card', anchorId: 'register', tone: 'default' }]} />
      )}
      {posts.length > 0 && (
        <Section anchorId="news">
          <SectionTitle eyebrow="News" heading="Latest *news*" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </Section>
      )}
      <Banner heading="Stay *connected*" links={[{ label: 'All news', href: '/news/', style: 'primary' }, { label: 'Contact us', href: '/contact/', style: 'light' }]} />
    </>
  )
}
