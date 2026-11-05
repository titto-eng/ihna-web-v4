import { BadgeCheck, Clock, GraduationCap, Layers, MapPin, MonitorSmartphone, Wallet, type LucideIcon } from 'lucide-react'
import { AudienceOnly } from '@/components/audience/AudienceOnly'
import type { Audience } from '@/blocks/types'
import { cn } from '@/lib/cn'
import { factListsFor, type FactKey, type FactsCourse, type ResolvedFact } from './facts'

export { audiencesOf, courseFactsFor, factListsFor, hasCourseFacts, FACT_KEYS, FACT_LABELS, type FactKey, type FactsCourse, type ResolvedFact } from './facts'

type Props = {
  course: FactsCourse
  /** Render one audience only. Omitted: the course's audiences; a `both` course renders both lists and the site-wide
   *  audience switch (AudienceProvider + AudienceOnly) shows one. */
  audience?: Audience
  /** Restrict to these facts (display order stays FACT_KEYS order). */
  only?: readonly FactKey[] | null
  className?: string
  /** `strip` (default): the BON mono-label strip. `tiles`: colourful icon cards (course page, under the hero). */
  variant?: 'strip' | 'tiles'
}

const ICON: Record<FactKey, LucideIcon> = { duration: Clock, units: Layers, delivery: MonitorSmartphone, level: GraduationCap, campuses: MapPin, cricos: BadgeCheck, fee: Wallet }
// one brand-blend colour per fact, so the row reads as a set of distinct, scannable cards
const TINT: Record<FactKey, string> = {
  duration: 'from-primary to-mint', units: 'from-ocean to-primary', delivery: 'from-secondary to-sun', level: 'from-primary-strong to-ocean',
  campuses: 'from-coral to-secondary', cricos: 'from-mint to-ocean', fee: 'from-sun to-coral',
}

function FactTiles({ facts, audience, className }: { facts: ResolvedFact[]; audience?: Audience; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]', className)} data-course-facts="" data-audience={audience}>
      {facts.map((f, i) => {
        const Icon = ICON[f.key]
        return (
          <div
            key={f.key}
            data-fact={f.key}
            style={{ animationDelay: `${i * 70}ms` }}
            className="hero-fade-up group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-lg shadow-primary-strong/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/15 md:p-5"
          >
            <span aria-hidden className={cn('absolute -top-10 -right-10 size-24 rounded-full bg-gradient-to-br opacity-15 transition-transform duration-700 group-hover:scale-150', TINT[f.key])} />
            <span aria-hidden className={cn('grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md', TINT[f.key])}>
              <Icon className="size-5" />
            </span>
            <dt className="label-mono mt-4 text-[10px] text-muted-foreground">{f.label}</dt>
            <dd className="mt-1 text-base leading-snug font-semibold text-foreground md:text-lg">{f.value}</dd>
            {f.detail && <dd className="mt-1 text-xs text-muted-foreground">{f.detail}</dd>}
          </div>
        )
      })}
    </dl>
  )
}

function FactStrip({ facts, audience, className }: { facts: ResolvedFact[]; audience?: Audience; className?: string }) {
  return (
    <dl
      className={cn('grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-6 md:grid-cols-3 lg:grid-cols-4', className)}
      data-course-facts=""
      data-audience={audience}
    >
      {facts.map((f) => (
        <div key={f.key} data-fact={f.key}>
          <dt className="label-mono text-muted-foreground">{f.label}</dt>
          <dd className="display mt-1 text-xl md:text-2xl">{f.value}</dd>
          {f.detail && <dd className="mt-1 text-xs text-muted-foreground">{f.detail}</dd>}
        </div>
      ))}
    </dl>
  )
}

const same = (a: ResolvedFact[], b: ResolvedFact[]) => JSON.stringify(a) === JSON.stringify(b)

// BON key-facts strip (bon/index.html, the `dl` under the hero): mono label, display value, muted detail.
// Pure server component: drop it into any hand-written course page with the course doc (depth >= 1).
export function CourseFacts({ course, audience, only, className, variant = 'strip' }: Props) {
  const lists = factListsFor(course, audience, only)
  const FactList = variant === 'tiles' ? FactTiles : FactStrip
  if (!lists.some((l) => l.facts.length)) return null
  if (lists.length === 1) return <FactList facts={lists[0].facts} audience={lists[0].audience} className={className} />
  // both audiences resolve to the same strip: render it once, no switch needed
  if (same(lists[0].facts, lists[1].facts)) return <FactList facts={lists[0].facts} className={className} />
  return (
    <>
      {lists.map((l) => (
        <AudienceOnly key={l.audience} audience={l.audience}>
          {l.facts.length ? <FactList facts={l.facts} audience={l.audience} className={className} /> : null}
        </AudienceOnly>
      ))}
    </>
  )
}
