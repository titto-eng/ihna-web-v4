import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { PortalNotice } from './PortalNotice'
import { LeadHero, type HeroProps } from './pageParts'

// Intake / census calendar pages: the `intakeCalendar` block over the next 12 months (portal fixtures in dev). With no dates, "coming soon".
export function CalendarView({ hero, children, hasDates }: { hero: HeroProps; children?: ReactNode; hasDates: boolean }) {
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'Calendar' }} />
      {children}
      {hasDates ? (
        <RenderBlocks blocks={[{ blockType: 'intakeCalendar', months: 12, tone: 'muted' } as AnyBlock]} />
      ) : (
        <Section tone="muted"><PortalNotice /></Section>
      )}
    </>
  )
}
