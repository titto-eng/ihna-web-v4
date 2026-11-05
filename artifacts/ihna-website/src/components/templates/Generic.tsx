import Link from 'next/link'
import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Card, CardContent } from '@/components/ui/card'
import type { Lookup } from './data'
import { CourseCard, type CourseCardData } from './courseCards'
import { site } from '@/content/site'
import { Banner, LeadHero, SectionTitle, type HeroProps } from './pageParts'

type View = { title: string; hero: HeroProps; children?: ReactNode }

// Contact: the page's own content (address cards come with it), then campus cards from the lookup, then the enquiry form.
export function ContactView({ hero, children, campuses, formKey = 'quick-enquiry', campusPaths = {}, ownForm = false }: View & { campuses: Lookup[]; formKey?: string; campusPaths?: Record<string, string>; ownForm?: boolean }) {
  return (
    <>
      <LeadHero hero={hero} />
      {children}
      {campuses.length > 0 && (
        <Section tone="card" spacing="compact" anchorId="campuses">
          <SectionTitle eyebrow="Campuses" heading="Visit a *campus*" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {campuses.map((c) => (
              <li key={c.id}>
                {campusPaths[c.slug] ? (
                  <Link href={campusPaths[c.slug]} className="block rounded-card border border-border bg-background p-5 font-semibold hover:border-primary hover:text-primary-strong">{c.name}</Link>
                ) : (
                  <span className="block rounded-card border border-border bg-background p-5 font-semibold">{c.name}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {!ownForm && <RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey, heading: 'Send us a message', variant: 'card', anchorId: 'quickContact', tone: 'muted' } as AnyBlock]} />}
    </>
  )
}

// landing pages at a normal URL (e.g. /bachelor-of-nursing/): the page's content plus courses whose title matches.
export function LandingView({ hero, children, courses }: View & { courses: CourseCardData[] }) {
  return (
    <>
      <LeadHero hero={hero} />
      {children}
      {courses.length > 0 && (
        <Section tone="muted" anchorId="courses">
          <SectionTitle eyebrow="Courses" heading="Related *courses*" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((c) => <CourseCard key={c.id} course={c} />)}</div>
        </Section>
      )}
      <Banner heading="Questions about this *course*?" links={[{ label: 'Enquire now', href: '/contact/', style: 'primary' }, { label: 'All courses', href: '/courses/', style: 'light' }]} />
    </>
  )
}

// alumni hub (/alumni/): registration is the only alumni route that exists outside the alumni module.
export function AlumniHubView({ hero, children, ownForms = [], empty = false }: View & { ownForms?: string[]; empty?: boolean }) {
  const has = (key: string) => ownForms.includes(key)
  const forms: AnyBlock[] = [
    ...(has('alumni-story') ? [] : [{ blockType: 'enquiryForm', formKey: 'alumni-story', heading: 'Share your story', variant: 'card', anchorId: 'share-your-story', tone: 'muted' } as AnyBlock]),
    ...(has('alumni-signup') ? [] : [{ blockType: 'enquiryForm', formKey: 'alumni-signup', heading: `Stay in touch with ${site.shortName}`, variant: 'card', anchorId: 'alumni-signup', tone: 'default' } as AnyBlock]),
  ]
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'Alumni' }} />
      {children}
      {empty && (
        <Section tone="muted">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="gap-0 py-0"><CardContent className="space-y-3 p-8">
              <h2 className="display text-3xl">Join the alumni network</h2>
              <p className="text-muted-foreground">Graduates of {site.shortName} can register to stay connected.</p>
              <Link href="/alumni-registration/" className="font-semibold text-primary-strong underline underline-offset-4">Register</Link>
            </CardContent></Card>
            <Card className="gap-0 py-0"><CardContent className="space-y-3 p-8">
              <h2 className="display text-3xl">Share your story</h2>
              <p className="text-muted-foreground">Tell current students where your {site.shortName} qualification took you.</p>
              <Link href="#share-your-story" className="font-semibold text-primary-strong underline underline-offset-4">Get in touch</Link>
            </CardContent></Card>
          </div>
        </Section>
      )}
      {forms.length > 0 && <RenderBlocks blocks={forms} />}
    </>
  )
}
