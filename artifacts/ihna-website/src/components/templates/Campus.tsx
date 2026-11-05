import Link from 'next/link'
import type { ReactNode } from 'react'
import { MapPin, Phone } from 'lucide-react'
import Image from '@/components/blocks/MediaImage'
import { Section } from '@/components/layout/Section'
import { pickSize } from '@/lib/media-sizes'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Card, CardContent } from '@/components/ui/card'
import type { CampusContact } from '@/content/campuses'
import { CourseCard, type CourseCardData } from './courseCards'
import type { Lookup } from './data'
import { LeadHero, SectionTitle, type Contact, type HeroProps } from './pageParts'

const tel = (n: string) => n.replace(/[^\d+]/g, '')
/** +61 2 8228 6402 from +61282286402; anything else is shown as stored. */
const pretty = (n: string) => n.replace(/^\+61(\d)(\d{4})(\d{4})$/, '+61 $1 $2 $3')

function ContactCards({ contacts, contact }: { contacts: CampusContact[]; contact?: Contact }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((c) => (
        <Card key={c.name} className="gap-0 py-0">
          <CardContent className="space-y-3 p-6">
            <h3 className="display text-2xl">{c.name}</h3>
            <p className="flex gap-2 text-muted-foreground"><MapPin aria-hidden className="mt-1 size-4 shrink-0 text-primary-strong" />{c.address}</p>
            {(c.tel ?? contact?.phone) && (
              <p className="flex gap-2"><Phone aria-hidden className="mt-1 size-4 shrink-0 text-primary-strong" /><a className="font-semibold underline-offset-4 hover:underline" href={`tel:${tel((c.tel ?? contact?.phone)!)}`}>{pretty(c.tel ?? contact?.phone ?? '')}</a></p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type CampusProps = { title: string; hero: HeroProps; children?: ReactNode; campus: Lookup | null; contacts: CampusContact[]; courses: CourseCardData[]; contact?: Contact; formKey?: string }

// 05 §4.4 Campus: hero full-image → address and contact → the page's own content (map, gallery, video) → courses at the campus → enquiry form.
export function CampusView({ title, hero, children, campus, contacts, courses, contact, formKey = 'quick-enquiry' }: CampusProps) {
  const image = campus?.image
  const here = campus ? courses.filter((c) => c.campus.some((x) => x.slug === campus.slug)) : []
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'Campus', ...(image && !hero.image ? { variant: 'full', image } : {}) }} />
      {contacts.length > 0 && (
        <Section tone="muted" anchorId="visit" spacing="compact">
          <SectionTitle eyebrow="Visit" heading={`Find us in *${campus?.name ?? title}*`} />
          <ContactCards contacts={contacts} contact={contact} />
        </Section>
      )}
      {children}
      {here.length > 0 && (
        <Section tone="muted" anchorId="courses">
          <SectionTitle eyebrow="Courses" heading={`Study at ${campus?.name}`} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {here.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </Section>
      )}
      <RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey, heading: `Enquire about studying in ${campus?.name ?? title}`, variant: 'card', anchorId: 'quickContact', tone: 'muted' } as AnyBlock]} />
    </>
  )
}

export type CampusListingCard = { campus: Lookup; contacts: CampusContact[]; path: string | null }

// /campuses/: one card per campus lookup row, linking to its detail page.
export function CampusListingView({ hero, children, cards }: { hero: HeroProps; children?: ReactNode; cards: CampusListingCard[] }) {
  return (
    <>
      <LeadHero hero={hero} />
      {children}
      {cards.length > 0 && (
        <Section tone="muted">
          <div className="grid gap-6 md:grid-cols-2">
            {cards.map(({ campus, contacts, path }) => {
              const pic = pickSize(campus.image, 'card')
              const inner = (
                <Card className="h-full gap-0 overflow-hidden py-0 transition-transform duration-300 hover:-translate-y-0.5">
                  {pic && <Image src={pic.url} alt={`${campus.name} campus`} width={pic.width} height={pic.height} sizes="(min-width: 768px) 45vw, 90vw" style={{ objectPosition: pic.position }} className="aspect-[16/9] w-full object-cover" />}
                  <CardContent className="space-y-2 p-6">
                    <h3 className="display text-3xl">{campus.name}</h3>
                    {contacts.map((c) => <p key={c.name} className="text-muted-foreground">{c.address}</p>)}
                  </CardContent>
                </Card>
              )
              return path ? <Link key={campus.id} href={path} className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2">{inner}</Link> : <div key={campus.id}>{inner}</div>
            })}
          </div>
        </Section>
      )}
    </>
  )
}
