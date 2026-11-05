import Link from 'next/link'
import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Card, CardContent } from '@/components/ui/card'
import type { Course } from '@/payload-types'
import { Banner, EmptyNotice, LeadHero, SectionTitle, type Contact, type HeroProps } from './pageParts'

type MicroPage = { title: string; path: string }
type View = { hero: HeroProps; children?: ReactNode; empty?: boolean; contact?: Contact }

// A micro-credential page: its content, then the matching course's facts and census dates when a course exists for it.
export function MicroCredentialView({ hero, children, course, contact, empty = false }: View & { course: Course | null }) {
  const ctx = { depth: 0, course }
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'Micro-credential' }} />
      {children}
      {course ? (
        <>
          <RenderBlocks blocks={[{ blockType: 'courseFacts' } as AnyBlock]} ctx={ctx} />
          <RenderBlocks blocks={[{ blockType: 'censusDates' } as AnyBlock]} ctx={ctx} />
        </>
      ) : (
        empty && <EmptyNotice contact={contact} title="Details for this micro-credential are coming soon." />
      )}
      <Banner
        heading="Build your *specialty*"
        links={[
          { label: 'Enquire now', href: '/contact/', style: 'primary' },
          ...(course ? [{ label: 'View the course', href: course.path ?? `/courses/${course.slug}/`, style: 'light' as const }] : [{ label: 'All micro-credentials', href: '/micro-credentials/', style: 'light' as const }]),
        ]}
      />
    </>
  )
}

// Hub pages (/micro-credentials/ and its children): a card per micro-credential below the hub's own content.
export function MicroCredentialsHubView({ hero, children, items, contact, empty = false }: View & { items: MicroPage[] }) {
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'Micro-credentials' }} />
      {children}
      {items.length > 0 ? (
        <Section tone="muted" anchorId="micro-credentials">
          <SectionTitle eyebrow="Specialties" heading="Choose a *micro-credential*" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <li key={c.path}>
                <Link href={c.path} className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2">
                  <Card className="h-full gap-0 py-0 transition-transform duration-300 hover:-translate-y-0.5"><CardContent className="p-6"><h3 className="display text-2xl leading-snug">{c.title}</h3></CardContent></Card>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        empty && <EmptyNotice contact={contact} />
      )}
      {empty && items.length === 0 && (
        <p className="pb-16 text-center"><Link href="/micro-credentials/" className="font-semibold text-primary-strong underline underline-offset-4">All micro-credentials</Link></p>
      )}
    </>
  )
}
