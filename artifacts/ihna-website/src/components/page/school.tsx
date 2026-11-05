import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import {
  Accessibility, Activity, Ambulance, ArrowUpRight, BadgeDollarSign, BedDouble, BookOpen, Brain, Briefcase, ClipboardCheck,
  ClipboardList, Cross, GraduationCap, HandHeart, HandHelping, HeartHandshake, House, LifeBuoy, MapPinned, MessageCircleHeart,
  Network, Pill, Presentation, ShieldCheck, Siren, Sparkles, Stethoscope, TrendingUp, Users, UsersRound,
} from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Emphasis } from '@/components/Emphasis'
import { cn } from '@/lib/cn'

// The school pages' sections (/school-of-nursing/, /school-of-community-services/, ...). They take the page's own words as props
// and children and add only layout, icons and motion. Colours follow `--school`, the school's accent that SchoolView sets on the
// page (teal for nursing, mint for community services, ocean for allied health, coral for first aid, gold for education).

const accent = 'var(--school, var(--color-primary))'

function Heading({ eyebrow, heading, lead, center, onDark }: { eyebrow?: string; heading?: string; lead?: ReactNode; center?: boolean; onDark?: boolean }) {
  if (!eyebrow && !heading && !lead) return null
  return (
    <div className={cn('max-w-3xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p className={cn('label-mono inline-flex items-center gap-3', onDark ? 'text-secondary' : 'text-primary-strong', center && 'justify-center')}>
          <span aria-hidden className="h-0.5 w-8 rounded-full bg-[var(--school,var(--color-primary))]" />{eyebrow}
        </p>
      )}
      {heading && <h2 className={cn('display mt-4 text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02]', onDark && 'text-ink-foreground')}><Emphasis text={heading} tone={onDark ? 'secondary' : 'primary'} /></h2>}
      {lead && <div className={cn('mt-5 font-display text-xl leading-snug text-pretty md:text-2xl', onDark ? 'text-ink-foreground/85' : 'text-primary-strong')}>{lead}</div>}
    </div>
  )
}

/** The school's opening paragraph as a large statement beside a turning accent ring. */
export function SchoolIntro({ children }: { children: ReactNode }) {
  return (
    <Section spacing="default" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute top-1/2 -left-40 -z-10 size-[30rem] -translate-y-1/2 rounded-full opacity-20 blur-3xl" style={{ background: accent }} />
      <div className="grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
        <div aria-hidden className="relative mx-auto size-28 md:size-40">
          <span className="course-spin absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: accent }} />
          <span className="absolute inset-3 rounded-full bg-gradient-to-br from-secondary/90 to-[var(--school,var(--color-primary))] shadow-2xl" />
          <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-white md:text-8xl">&ldquo;</span>
        </div>
        <div className="reveal font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.35] font-light text-foreground [&_strong]:font-normal [&_strong]:text-primary-strong">
          {children}
        </div>
      </div>
    </Section>
  )
}

const ROLE_ICONS: [RegExp, typeof Stethoscope][] = [
  [/paramedic|ems|emergency medical|ambulance/i, Ambulance],
  [/first aid trainer|instructor|trainer/i, Presentation],
  [/first aid officer/i, Cross],
  [/health and safety/i, ShieldCheck],
  [/disaster/i, LifeBuoy],
  [/emergency relief|crisis/i, Siren],
  [/volunteer/i, HandHelping],
  [/mental health/i, Brain],
  [/rehabilitation/i, Activity],
  [/acute care/i, BedDouble],
  [/nurse|nursing/i, Stethoscope],
  [/ndis|disability/i, Accessibility],
  [/aged care|patient care/i, HeartHandshake],
  [/residential/i, House],
  [/case manager/i, ClipboardList],
  [/manager|coordinator/i, Network],
  [/social worker/i, HandHeart],
  [/counsel/i, MessageCircleHeart],
  [/youth/i, Sparkles],
  [/family/i, House],
  [/drug|alcohol/i, Pill],
  [/supervisor/i, ClipboardCheck],
  [/educator|teacher|leader/i, BookOpen],
  [/community/i, Users],
]
const roleIcon = (role: string) => ROLE_ICONS.find(([re]) => re.test(role))?.[1] ?? Briefcase

/**
 * Career roles: the heading and lead line beside the page's job-role picture in a tilted frame, then the roles as numbered tiles
 * that rise in turn and light up on hover. `note` is the page's text after the list.
 */
export function CareerRoles({ eyebrow, heading, lead, intro, roles, note, image, anchorId = 'careers', tone = 'muted' }: { eyebrow?: string; heading: string; lead?: ReactNode; intro?: ReactNode; roles: string[]; note?: ReactNode; image?: { src: string; alt: string; width: number; height: number }; anchorId?: string; tone?: 'muted' | 'default' }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-48 -bottom-48 -z-10 size-[34rem] rounded-full bg-secondary/15 blur-3xl" />
      <div className={cn('grid gap-12', image && 'lg:grid-cols-[1.1fr_0.9fr] lg:items-center')}>
        <div>
          <Heading eyebrow={eyebrow} heading={heading} lead={lead} />
          {intro && <div className="mt-4 text-lg text-muted-foreground">{intro}</div>}
        </div>
        {image && (
          <div className="reveal relative mx-auto w-full max-w-xl">
            <span aria-hidden className="absolute -inset-3 rotate-3 rounded-[2rem] border-2 border-dashed" style={{ borderColor: accent }} />
            <span aria-hidden className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-gradient-to-br from-secondary/25 to-transparent" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card shadow-2xl shadow-primary-strong/20">
              <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 1024px) 40vw, 92vw" className="h-auto w-full transition-transform duration-700 hover:scale-[1.04]" />
            </div>
          </div>
        )}
      </div>
      <ol className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roles.map((role, i) => {
          const Icon = roleIcon(role)
          return (
            <li key={role} className="reveal group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 pr-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-primary-strong/15" style={{ animationDelay: `${(i % 4) * 60}ms` } as CSSProperties}>
              <span aria-hidden className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-br from-[var(--school,var(--color-primary))] to-primary-strong transition-transform duration-500 ease-out group-hover:translate-y-0" />
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-colors duration-300 group-hover:bg-white/15" style={{ background: accent }}>
                <Icon aria-hidden className="size-6" strokeWidth={1.7} />
              </span>
              <span className="relative min-w-0 font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-white">{role}</span>
              <span aria-hidden className="label-mono relative ml-auto text-[10px] text-muted-foreground transition-colors group-hover:text-white/70">{String(i + 1).padStart(2, '0')}</span>
            </li>
          )
        })}
      </ol>
      {note && <div className="mt-10 max-w-3xl text-lg leading-relaxed text-muted-foreground [&_strong]:text-foreground">{note}</div>}
    </Section>
  )
}

const STAT_ICONS = [TrendingUp, UsersRound, MapPinned, BadgeDollarSign]

/**
 * The four labour-market cards (future job growth, occupational size, regions, salary) as tall gradient cards on a deep band: an
 * icon tile, the card's own title and text, and its source link. A light sweeps across a card on hover.
 */
export function InsightStats({ eyebrow, heading, cards }: { eyebrow?: string; heading?: string; cards: { title: string; body: string; href?: string }[] }) {
  return (
    <Section tone="ink" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="course-aurora absolute -top-40 -left-24 size-[36rem] rounded-full opacity-40 blur-3xl" style={{ background: accent }} />
        <span className="course-aurora absolute -right-32 -bottom-40 size-[30rem] rounded-full bg-secondary/25 blur-3xl [animation-delay:-7s]" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(180_30%_99%/0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>
      {(eyebrow || heading) && <div className="mb-12"><Heading eyebrow={eyebrow} heading={heading} onDark /></div>}
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length]
          const body = (
            <>
              <span aria-hidden className="course-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl text-white shadow-lg ring-1 ring-white/20" style={{ background: i % 2 ? 'var(--color-secondary)' : accent }}>
                  <Icon aria-hidden className="size-7" strokeWidth={1.6} />
                </span>
                <span aria-hidden className="font-display text-5xl text-white/10">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="mt-8 block font-display text-2xl leading-tight text-white">{c.title}</span>
              <span className="mt-4 block flex-1 text-[15px] leading-relaxed text-ink-foreground/80">{c.body}</span>
              {c.href && (
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary">
                  View source <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              )}
            </>
          )
          const cls = 'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-gradient-to-b from-white/10 to-white/[0.03] p-7 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-white/30 hover:shadow-2xl hover:shadow-black/40'
          return (
            <li key={c.title} className="reveal" style={{ animationDelay: `${i * 80}ms` } as CSSProperties}>
              {c.href ? <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}<span className="sr-only"> (opens in a new tab)</span></a> : <div className={cls}>{body}</div>}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Further study: the lead line and the next qualifications as a rising staircase of steps. */
export function StudySteps({ eyebrow, heading, lead, steps, tone = 'default' }: { eyebrow?: string; heading: string; lead?: ReactNode; steps: ReactNode[]; tone?: 'default' | 'muted' }) {
  return (
    <Section tone={tone} className="relative isolate overflow-hidden">
      <Heading eyebrow={eyebrow} heading={heading} lead={lead} />
      <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
        {steps.map((s, i) => (
          <li key={i} className="reveal group relative" style={{ animationDelay: `${i * 90}ms` } as CSSProperties}>
            <div className={cn('relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-6 text-white shadow-xl transition-transform duration-500 group-hover:-translate-y-2', ['lg:min-h-48', 'lg:min-h-60', 'lg:min-h-72', 'lg:min-h-84'][i % 4])}
              style={{ background: `linear-gradient(160deg, ${['var(--color-primary)', 'var(--school, var(--color-mint))', 'var(--color-ocean)', 'var(--color-primary-strong)'][i % 4]}, var(--color-ink))` }}>
              <span aria-hidden className="absolute -top-8 -right-8 size-28 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-150" />
              <span className="flex items-center gap-3">
                <GraduationCap aria-hidden className="size-6 text-secondary" />
                <span aria-hidden className="label-mono text-[10px] text-white/60">Step {i + 1}</span>
              </span>
              <span className="mt-10 block font-display text-xl leading-snug">{s}</span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/** Growth and demand points: each point as a card with a trend icon; links inside the points stay links. */
export function GrowthPoints({ eyebrow, heading, points, tone = 'muted' }: { eyebrow?: string; heading: string; points: ReactNode[]; tone?: 'default' | 'muted' }) {
  return (
    <Section tone={tone} className="relative isolate overflow-hidden">
      <Heading eyebrow={eyebrow} heading={heading} />
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {points.map((p, i) => (
          <li key={i} className="reveal group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: `${i * 90}ms` } as CSSProperties}>
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-25 transition-transform duration-500 group-hover:scale-x-100" style={{ background: `linear-gradient(90deg, ${accent}, var(--color-secondary))` }} />
            <TrendingUp aria-hidden className="size-9 text-secondary-strong" strokeWidth={1.6} />
            <div className="mt-5 leading-relaxed text-muted-foreground [&_a]:font-semibold [&_a]:text-primary-strong [&_a]:underline [&_a]:underline-offset-4 [&_a]:[overflow-wrap:anywhere] [&_strong]:text-foreground">{p}</div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** A salary table as a board: one row per role with the salary in a pill and the sources beside it. */
export function SalaryBoard({ eyebrow, heading, columns, rows, tone = 'default' }: { eyebrow?: string; heading: string; columns: [string, string, string]; rows: { role: string; salary: string; source: ReactNode }[]; tone?: 'default' | 'muted' }) {
  return (
    <Section tone={tone}>
      <Heading eyebrow={eyebrow} heading={heading} />
      <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-xl shadow-primary-strong/10">
        <table className="w-full border-collapse text-left">
          <thead className="hidden bg-primary-strong text-ink-foreground md:table-header-group">
            <tr>{columns.map((c) => <th key={c} scope="col" className="px-6 py-4 font-semibold">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.role} className="reveal grid gap-2 border-t border-border px-6 py-5 transition-colors first:border-t-0 hover:bg-muted/50 md:table-row md:p-0" style={{ animationDelay: `${i * 70}ms` } as CSSProperties}>
                <th scope="row" className="font-display text-lg font-normal md:px-6 md:py-5">
                  <span className="label-mono block text-[10px] text-muted-foreground md:hidden">{columns[0]}</span>{r.role}
                </th>
                <td className="md:px-6 md:py-5">
                  <span className="label-mono block text-[10px] text-muted-foreground md:hidden">{columns[1]}</span>
                  <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-1.5 font-semibold text-secondary-strong md:mt-0">
                    <BadgeDollarSign aria-hidden className="size-4" />{r.salary}
                  </span>
                </td>
                <td className="text-sm text-muted-foreground md:px-6 md:py-5 [&_a]:font-semibold [&_a]:text-primary-strong [&_a]:underline [&_a]:underline-offset-4">
                  <span className="label-mono block text-[10px] md:hidden">{columns[2]}</span>{r.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
