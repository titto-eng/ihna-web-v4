import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import type { StaffCard } from './data'
import { StaffGrid } from './School'
import { LeadHero, SectionTitle, type HeroProps } from './pageParts'

// /staff-profile/ and /academic-staff/: every active staff member, grouped by school, linking to /staff-profile/?id=N (DEC-111).
export function StaffDirectoryView({ hero, children, staff }: { hero: HeroProps; children?: ReactNode; staff: StaffCard[] }) {
  const groups = new Map<string, StaffCard[]>()
  for (const s of staff) {
    const key = s.school?.name ?? 'Academic and professional staff'
    groups.set(key, [...(groups.get(key) ?? []), s])
  }
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'People' }} />
      {children}
      {[...groups.entries()].map(([name, rows], i) => (
        <Section key={name} tone={i % 2 ? 'muted' : 'default'} spacing="compact">
          <SectionTitle eyebrow={`${rows.length} ${rows.length === 1 ? 'person' : 'people'}`} heading={name} />
          <StaffGrid staff={rows} />
        </Section>
      ))}
      {staff.length === 0 && <Section><p className="text-muted-foreground">Staff profiles will appear here.</p></Section>}
    </>
  )
}
