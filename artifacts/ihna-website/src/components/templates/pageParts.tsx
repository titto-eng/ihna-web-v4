import Link from 'next/link'
import type { HeroLook } from '@/blocks/hero/looks'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Emphasis } from '@/components/Emphasis'
import type { HeroBlock } from '@/payload-types'

// Pieces every template shares: the lead hero, the placeholder for pages with no content yet, banners and section titles.
export type Contact = { phone?: string | null; email?: string | null }
/** A template page's hero; `look` picks an image-hero design (src/blocks/hero/looks.tsx). */
export type HeroProps = Omit<HeroBlock, 'blockType' | 'id' | 'blockName'> & { look?: HeroLook }

/** The page's hero block with template defaults applied (an eyebrow, an image from a lookup) where the page gives none. */
export function leadHero(hero: HeroProps, extra: Partial<HeroProps> = {}): AnyBlock {
  const merged: Record<string, unknown> = { ...hero }
  for (const [k, v] of Object.entries(extra)) if (merged[k] === undefined || merged[k] === null || merged[k] === '') merged[k] = v
  return { blockType: 'hero', ...merged } as AnyBlock
}

export function LeadHero({ hero, extra }: { hero: HeroProps; extra?: Partial<HeroProps> }) {
  return <RenderBlocks blocks={[leadHero(hero, extra)]} />
}

export function EmptyNotice({ contact, title = 'This page is being updated.' }: { contact?: Contact; title?: string }) {
  return (
    <Section spacing="default">
      <div className="mx-auto max-w-2xl rounded-card border border-border bg-card p-8 text-center md:p-12" data-empty-page>
        <h2 className="display text-3xl">{title}</h2>
        <p className="mt-4 text-muted-foreground">
          Full details are coming soon.
          {contact?.phone || contact?.email ? ' Our admissions team can help in the meantime' : ''}
          {contact?.phone ? <> on <a className="font-semibold text-primary-strong underline underline-offset-4" href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a></> : null}
          {contact?.email ? <>{contact.phone ? ' or at ' : ' at '}<a className="font-semibold text-primary-strong underline underline-offset-4" href={`mailto:${contact.email}`}>{contact.email}</a></> : null}
          .
        </p>
        <p className="mt-6"><Link href="/courses/" className="font-semibold text-primary-strong underline underline-offset-4">Browse our courses</Link></p>
      </div>
    </Section>
  )
}

export function Banner({ heading, body, links, tone = 'default' }: { heading: string; body?: string; links: { label: string; href: string; style?: 'primary' | 'secondary' | 'light' }[]; tone?: 'ink' | 'default' }) {
  return <RenderBlocks blocks={[{ blockType: 'cta', variant: 'banner', tone, heading, body, links } as AnyBlock]} />
}

export function SectionTitle({ eyebrow, heading, intro, className = 'mb-10 md:mb-12' }: { eyebrow?: string; heading: string; intro?: string; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="label-mono mb-4 text-accent">{eyebrow}</p>}
      <h2 className="display text-display-md"><Emphasis text={heading} /></h2>
      {intro && <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>}
    </div>
  )
}

/** `#quickContact` only exists on pages that carry the enquiry form; elsewhere the contact page is the enquiry route. */
export const enquireHref = (href: string | null | undefined, fallback = '/contact/') => (!href || href.startsWith('#') ? fallback : href)
