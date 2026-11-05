import Link from 'next/link'
import { Children, cloneElement, Fragment, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import {
  ArrowRight, ArrowUpRight, Award, BadgeCheck, BookOpen, Briefcase, CalendarDays, CircleDollarSign, ClipboardCheck, Compass, Download,
  FileText, Globe2, GraduationCap, HandHeart, Handshake, HeartHandshake, IdCard, Landmark, Lightbulb, Mail, Medal, MessageCircle,
  Network, Repeat, Route, Scale, School, ShieldCheck, Sparkles, Star, Trophy, UserCheck, Users, type LucideIcon,
} from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Emphasis } from '@/components/Emphasis'
import { proseClassName } from '@/components/layout/Prose'
import { cn } from '@/lib/cn'
import { CountUp } from './countup.client'
import { Rich } from './blocks'

// Feature sections for code pages: richer, animated layouts (icon cards, journeys, document cards, action tiles, event cards, an
// award timeline, count-up stats and sectioned panels). They take the page's own words as props and children and add only icons,
// layout and motion. `palette="earth"` swaps the brand-blend colours for warm ochre / terracotta tones (First Nations pages).

type Tone = 'default' | 'muted' | 'ink' | 'sunrise' | 'card'
type Palette = 'brand' | 'earth'
type Head = { eyebrow?: string; heading?: string; intro?: ReactNode; tone?: Tone; anchorId?: string; palette?: Palette; center?: boolean }

const PALETTES: Record<Palette, string[]> = {
  brand: ['var(--color-primary)', 'var(--color-ocean)', 'var(--color-secondary)', 'var(--color-mint)', 'var(--color-primary-strong)', 'var(--color-coral)'],
  earth: ['hsl(16 62% 44%)', 'hsl(33 93% 48%)', 'hsl(178 100% 28%)', 'hsl(4 58% 38%)', 'hsl(42 80% 42%)', 'hsl(189 100% 15%)'],
}
const colour = (p: Palette, i: number) => PALETTES[p][i % PALETTES[p].length]

const ICONS: [RegExp, LucideIcon][] = [
  [/award|winner|excellen|recogn/i, Trophy], [/scholar|fee|cost|price|financ|fund/i, CircleDollarSign], [/admission|apply|enrol/i, UserCheck],
  [/council|voice|governance|represent/i, Landmark], [/mentor/i, HeartHandshake], [/partner|collaborat|relationship/i, Handshake],
  [/communit/i, Users], [/respect|cultur|perspective|honou?r/i, HandHeart], [/safe|quality|accredit|endorse|standard/i, ShieldCheck],
  [/opportunit|pathway|route|journey/i, Route], [/train|learn|educat|study|course|diploma|bachelor/i, GraduationCap],
  [/employ|career|work|recruit|staff/i, Briefcase], [/report|working group|plan|framework|structur/i, ClipboardCheck],
  [/event|week|celebrat|gathering|forum|workshop/i, CalendarDays], [/share|idea|contact|email/i, MessageCircle], [/update|news/i, Sparkles],
  [/more|visit|explore/i, Compass], [/inclusiv|social/i, Users], [/innovat/i, Lightbulb], [/transfer|credit|recogn|prior/i, Repeat],
  [/international|global|national/i, Globe2], [/identif|usi/i, IdCard], [/legal|law|consumer|complain|appeal/i, Scale], [/network/i, Network],
  [/school/i, School], [/book|library|read/i, BookOpen],
]
export const iconFor = (text: string): LucideIcon => ICONS.find(([re]) => re.test(text))?.[1] ?? BadgeCheck

function SectionHeading({ eyebrow, heading, intro, onDark, center }: { eyebrow?: string; heading?: string; intro?: ReactNode; onDark?: boolean; center?: boolean }) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <div className={cn('mb-10 max-w-3xl md:mb-14', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p className={cn('label-mono inline-flex items-center gap-3', onDark ? 'text-secondary' : 'text-primary-strong', center && 'justify-center')}>
          <span aria-hidden className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary" />{eyebrow}
        </p>
      )}
      {heading && <h2 className={cn('display mt-4 text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02]', onDark && 'text-ink-foreground')}><Emphasis text={heading} tone={onDark ? 'secondary' : 'primary'} /></h2>}
      {intro && <div className={cn('mt-5 text-lg leading-relaxed text-pretty', onDark ? 'text-ink-foreground/80' : 'text-muted-foreground')}>{intro}</div>}
    </div>
  )
}

const Glow = ({ palette = 'brand' }: { palette?: Palette }) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    <span className="course-aurora absolute -top-40 -left-32 size-[32rem] rounded-full opacity-25 blur-3xl" style={{ background: colour(palette, 0) }} />
    <span className="course-aurora absolute -right-32 -bottom-40 size-[28rem] rounded-full opacity-20 blur-3xl [animation-delay:-8s]" style={{ background: colour(palette, 1) }} />
  </div>
)

/** Feature cards: an icon tile, number, title and body; tones cycle through the palette; cards lift and shine on hover. */
export function FeatureCards({ items, columns = 3, eyebrow, heading, intro, tone = 'default', anchorId, palette = 'brand', center }: Head & { items: { title: string; body?: ReactNode; icon?: LucideIcon; mark?: string }[]; columns?: 2 | 3 | 4 }) {
  const dark = tone === 'ink'
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <Glow palette={palette} />
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} onDark={dark} center={center} />
      <ul className={cn('grid gap-5 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3', columns === 4 && 'lg:grid-cols-4')}>
        {items.map((it, i) => {
          const Icon = it.icon ?? iconFor(`${it.title} ${typeof it.body === 'string' ? it.body : ''}`)
          const c = colour(palette, i)
          return (
            <li key={`${it.title}-${i}`} className="reveal" style={{ '--c': c } as CSSProperties}>
              <article className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-7 transition-all duration-500 hover:-translate-y-2',
                dark ? 'border-white/12 bg-white/[0.06] text-ink-foreground backdrop-blur hover:border-white/30' : 'border-border bg-card shadow-[0_18px_40px_-28px_hsl(189_100%_15%/0.5)] hover:shadow-[0_30px_60px_-30px_hsl(189_100%_15%/0.55)]',
              )}>
                <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-30 transition-transform duration-500 group-hover:scale-x-100" style={{ background: `linear-gradient(90deg, ${c}, var(--color-secondary))` }} />
                <span aria-hidden className="absolute -top-16 -right-16 size-40 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150" style={{ background: c }} />
                <span className="flex items-center justify-between">
                  <span aria-hidden className="flex size-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${c}, color-mix(in oklab, ${c} 60%, black))` }}>
                    {it.mark ? <span className="font-display text-lg font-semibold">{it.mark}</span> : <Icon className="size-7" strokeWidth={1.6} />}
                  </span>
                  <span aria-hidden className={cn('font-display text-4xl', dark ? 'text-white/10' : 'text-foreground/[0.07]')}>{String(i + 1).padStart(2, '0')}</span>
                </span>
                <h3 className={cn('mt-6 font-display text-2xl leading-tight', dark ? 'text-white' : 'text-foreground')}>{it.title}</h3>
                {it.body && <div className={cn('mt-3 flex-1 leading-relaxed [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_li]:mt-1.5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5', dark ? 'text-ink-foreground/80 [&_a]:text-secondary' : 'text-muted-foreground [&_a]:text-primary-strong')}>{it.body}</div>}
              </article>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Short points as icon tiles that rise in turn (a richer checklist). */
export function IconChecks({ items, eyebrow, heading, intro, tone = 'muted', anchorId, palette = 'brand', columns = 3 }: Head & { items: ReactNode[]; columns?: 2 | 3 }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <Glow palette={palette} />
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ul className={cn('grid gap-4 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
        {items.map((it, i) => {
          const c = colour(palette, i)
          const Icon = iconFor(typeof it === 'string' ? it : '')
          return (
            <li key={i} className="reveal group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:w-1.5" style={{ background: c }} />
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110" style={{ background: c }}>
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <span className="pt-1.5 leading-relaxed font-medium text-foreground">{it}</span>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** A journey: numbered stops on a line that draws itself (horizontal from md, vertical on phones). */
export function JourneySteps({ steps, eyebrow, heading, intro, tone = 'default', anchorId, palette = 'brand' }: Head & { steps: { title: string; body?: ReactNode }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <Glow palette={palette} />
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ol className={cn('journey relative grid gap-8 md:gap-6', steps.length >= 4 ? 'md:grid-cols-2 lg:grid-cols-3' : steps.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {steps.map((s, i) => {
          const c = colour(palette, i)
          return (
            <li key={`${s.title}-${i}`} className="reveal group relative pl-16 md:pl-0">
              {i < steps.length - 1 && (
                // the connector to the next stop: down on phones; across on wider screens when all stops share one row
                <span aria-hidden className={cn('journey-line absolute top-14 bottom-[-2rem] left-6 w-0.5', steps.length <= 3 ? 'md:top-6 md:right-[-1.5rem] md:bottom-auto md:left-14 md:h-0.5 md:w-auto' : 'md:hidden')} style={{ background: `linear-gradient(180deg, ${c}, ${colour(palette, i + 1)})` }} />
              )}
              <span aria-hidden className="absolute top-0 left-0 flex size-12 items-center justify-center rounded-full font-display text-xl text-white shadow-lg ring-8 ring-background transition-transform duration-500 group-hover:scale-110 md:relative" style={{ background: c }}>
                {i + 1}
              </span>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl md:mt-6">
                <h3 className="font-display text-xl leading-snug text-foreground">{s.title}</h3>
                {s.body && <div className="mt-2 leading-relaxed text-muted-foreground [&_a]:font-semibold [&_a]:text-primary-strong [&_a]:underline">{s.body}</div>}
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

/** Downloadable documents as cards: a file badge, the label, the file title and a download button. */
export function DocCards({ items, eyebrow, heading, intro, tone = 'muted', anchorId, palette = 'brand' }: Head & { items: { title: string; href: string; label?: string }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <Glow palette={palette} />
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} />
      <ul className="grid gap-5 md:grid-cols-2">
        {items.map((d, i) => (
          <li key={d.href} className="reveal">
            <a href={d.href} className="group relative flex items-center gap-5 overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl md:p-8">
              <span aria-hidden className="absolute inset-0 -z-0 translate-x-[-101%] bg-gradient-to-r from-primary/8 to-secondary/10 transition-transform duration-700 group-hover:translate-x-0" />
              <span aria-hidden className="relative flex h-20 w-16 shrink-0 flex-col items-center justify-end rounded-xl pb-2 text-[11px] font-bold tracking-wider text-white shadow-lg" style={{ background: `linear-gradient(160deg, ${colour(palette, i)}, color-mix(in oklab, ${colour(palette, i)} 55%, black))` }}>
                <FileText className="mb-auto mt-3 size-7" strokeWidth={1.5} />PDF
              </span>
              <span className="relative min-w-0 flex-1">
                {d.label && <span className="label-mono block text-[10px] text-secondary-strong">{d.label}</span>}
                <span className="mt-1 block font-semibold break-words text-foreground">{d.title}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-strong">
                  <Download aria-hidden className="size-4 transition-transform group-hover:translate-y-0.5" /> Download
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Calls to action as tiles on a gradient band (each tile: icon, title, body with its own links). */
export function ActionTiles({ items, eyebrow, heading, intro, anchorId, palette = 'brand' }: Head & { items: { title: string; body?: ReactNode; href?: string }[] }) {
  return (
    <Section tone="ink" anchorId={anchorId} className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colour(palette, 5)}, ${colour(palette, 0)} 60%, ${colour(palette, 1)})` }} />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(0_0%_100%/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <span className="course-aurora absolute -top-32 right-0 size-[26rem] rounded-full bg-white/10 blur-3xl" />
      </div>
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} onDark center />
      <ul className={cn('mx-auto grid max-w-5xl gap-5', items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {items.map((it, i) => {
          const Icon = iconFor(it.title)
          const inner = (
            <>
              <span aria-hidden className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"><Icon className="size-7" strokeWidth={1.6} /></span>
              <span className="mt-5 block font-display text-2xl text-white">{it.title}</span>
              {it.body && <span className="mt-2 block leading-relaxed text-white/85 [&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4">{it.body}</span>}
              {it.href && <ArrowUpRight aria-hidden className="absolute top-6 right-6 size-5 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
            </>
          )
          const cls = 'group relative block h-full overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/15'
          return <li key={`${it.title}-${i}`} className="reveal">{it.href ? <a href={it.href} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>}</li>
        })}
      </ul>
    </Section>
  )
}

/** Events: each card with its frequency / date badge, title, text and link. */
export function EventCards({ items, eyebrow, heading, intro, tone = 'default', anchorId, palette = 'brand' }: Head & { items: { when: string; detail?: string; title: string; body: string; href?: string }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <Glow palette={palette} />
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} />
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((e, i) => {
          const c = colour(palette, i)
          const body = (
            <>
              <span className="flex items-center gap-3">
                <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: c }}><CalendarDays className="size-6" strokeWidth={1.7} /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold" style={{ color: `color-mix(in oklab, ${c} 75%, black)` }}>{e.when}</span>
                  {e.detail && <span className="block text-xs text-muted-foreground">{e.detail}</span>}
                </span>
              </span>
              <span className="mt-5 block font-display text-xl leading-snug text-foreground">{e.title}</span>
              <span className="mt-2 block flex-1 leading-relaxed text-muted-foreground">{e.body}</span>
              {e.href && <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-strong">{e.href.startsWith('mailto:') ? <><Mail aria-hidden className="size-4" /> Get in touch</> : <>Find out more <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" /></>}</span>}
            </>
          )
          const cls = 'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl'
          return (
            <li key={`${e.title}-${i}`} className="reveal">
              {e.href ? (e.href.startsWith('/') ? <Link href={e.href} className={cls}>{body}</Link> : <a href={e.href} className={cls}>{body}</a>) : <div className={cls}>{body}</div>}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Awards along a timeline per program: trophies for winners, medals for commendations, stars for finalists. */
export function AwardTimeline({ groups, eyebrow, heading, intro, tone = 'default', anchorId }: Head & { groups: { name: string; awards: { year: string; result: string; title?: string }[] }[] }) {
  const kind = (r: string) => (/winner/i.test(r) ? { Icon: Trophy, c: 'var(--color-secondary)', ring: 'ring-secondary/30' } : /commend/i.test(r) ? { Icon: Medal, c: 'var(--color-primary)', ring: 'ring-primary/30' } : { Icon: Star, c: 'var(--color-ocean)', ring: 'ring-ocean/30' })
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <Glow />
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} />
      <div className="space-y-14">
        {groups.map((g) => (
          <div key={g.name} className="reveal">
            <h3 className="flex items-center gap-3 font-display text-2xl text-foreground md:text-3xl">
              <span aria-hidden className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-coral text-ink shadow-lg"><Award className="size-6" /></span>
              {g.name}
            </h3>
            <ol className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <span aria-hidden className="absolute top-8 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-secondary via-primary to-ocean lg:block" />
              {g.awards.map((a, i) => {
                const k = kind(a.result)
                return (
                  <li key={`${a.year}-${a.result}-${i}`} className="group relative">
                    <span aria-hidden className={cn('relative z-10 mx-auto flex size-16 items-center justify-center rounded-full bg-card shadow-xl ring-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 lg:mx-0', k.ring)}>
                      <k.Icon className="size-7" style={{ color: k.c }} strokeWidth={1.7} />
                    </span>
                    <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl lg:text-left">
                      <p className="font-display text-3xl leading-none text-foreground">{a.year}</p>
                      <p className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold text-ink" style={{ background: `color-mix(in oklab, ${k.c} 30%, white)` }}>{a.result}</p>
                      {a.title && <p className="mt-3 text-sm leading-snug text-muted-foreground">{a.title}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </Section>
  )
}

/** Big figures that count up when they come into view (a value like "35,000+" or "220+"; text values stay as they are). */
export function CountStats({ items, eyebrow, heading, intro, tone = 'ink', anchorId }: Head & { items: { value?: string; label: string; body?: ReactNode }[] }) {
  const dark = tone === 'ink'
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      {dark && <Glow />}
      <SectionHeading eyebrow={eyebrow} heading={heading} intro={intro} onDark={dark} />
      <ul className={cn('grid gap-5 sm:grid-cols-2', items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : '')}>
        {items.map((s, i) => (
          <li key={`${s.label}-${i}`} className={cn('reveal group relative overflow-hidden rounded-[1.75rem] border p-7 transition-all duration-500 hover:-translate-y-1.5', dark ? 'border-white/12 bg-white/[0.06] backdrop-blur' : 'border-border bg-card shadow-sm hover:shadow-xl')}>
            <span aria-hidden className="absolute -top-10 -right-10 size-32 rounded-full opacity-20 blur-2xl transition-transform duration-700 group-hover:scale-150" style={{ background: colour('brand', i) }} />
            {s.value ? (
              <p className={cn('font-display text-[clamp(2.6rem,5vw,4rem)] leading-none', dark ? 'text-secondary' : 'text-primary-strong')}><CountUp value={s.value} /></p>
            ) : (
              <span aria-hidden className={cn('flex size-16 items-center justify-center rounded-2xl', dark ? 'bg-white/10 text-secondary' : 'bg-primary/10 text-primary-strong')}><Globe2 className="size-9" strokeWidth={1.5} /></span>
            )}
            <p className={cn('mt-3 font-semibold leading-snug', dark ? 'text-white' : 'text-foreground')}>{s.label}</p>
            {s.body && <div className={cn('mt-2 text-sm leading-relaxed', dark ? 'text-ink-foreground/75' : 'text-muted-foreground')}>{s.body}</div>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ---------- Panels: long prose split into cards at each h3/h4 ----------

type El = ReactElement<{ children?: ReactNode; depth?: number }>
const textOf = (n: ReactNode): string => {
  if (n == null || typeof n === 'boolean') return ''
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(textOf).join('')
  if (isValidElement(n)) return textOf((n as El).props.children)
  return ''
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)

/**
 * Panels: the content of a long tab or page (prose children, and kit blocks such as `<Table>` in between) laid out as cards, one
 * per `h4` (and the opening `h3` as a lead banner), with a sticky contents list on wide screens. `<Rich>` wrappers among the
 * children are unwrapped, so a route file keeps its markup and only swaps the wrapper.
 */
export function Panels({ children, palette = 'brand' }: { children: ReactNode; palette?: Palette }) {
  // flatten: <Rich> wrappers (any element whose children are prose) and fragments open up into their children
  const flat: ReactNode[] = []
  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (n) => {
      if (!isValidElement(n)) { if (n != null && n !== '') flat.push(n); return }
      const el = n as El
      if (el.type === Rich || el.type === Fragment) walk(el.props.children)
      else flat.push(cloneElement(el, { key: `n${flat.length}` }))
    })
  }
  walk(children)
  type Group = { title: string | null; lead: boolean; nodes: ReactNode[] }
  const groups: Group[] = [{ title: null, lead: true, nodes: [] }]
  for (const n of flat) {
    const t = isValidElement(n) ? (n as El).type : null
    if (t === 'h4' || t === 'h3') {
      const title = textOf(n)
      // a lone h4 straight after another h4 (a section title above a sub-title) stays inside the new card
      groups.push({ title, lead: t === 'h3', nodes: [] })
      continue
    }
    // kit blocks (a <Table>, a <Cta> …) keep their own styling: kept out of the prose rules
    const node = isValidElement(n) && typeof (n as El).type !== 'string' ? <div key={`b-${groups.length}-${groups[groups.length - 1].nodes.length}`} className="not-prose my-6">{n}</div> : n
    groups[groups.length - 1].nodes.push(node)
  }
  const lead = groups.filter((g) => g.lead && (g.title || g.nodes.length))
  const cards = groups.filter((g) => !g.lead)
  return (
    <div>
      {lead.map((g, i) => (
        <div key={`lead-${i}`} className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-strong to-ink p-7 text-ink-foreground shadow-xl md:p-10">
          <span aria-hidden className="course-aurora absolute -top-24 -right-16 size-72 rounded-full bg-primary/40 blur-3xl" />
          <span aria-hidden className="course-aurora absolute -bottom-24 left-1/3 size-56 rounded-full bg-secondary/25 blur-3xl [animation-delay:-6s]" />
          {g.title && <h3 className="not-prose relative font-display text-3xl text-white md:text-4xl">{g.title}</h3>}
          <div className={cn(proseClassName, 'relative mt-4 max-w-none text-ink-foreground/85 prose-invert prose-strong:text-secondary prose-a:text-secondary')}>{g.nodes}</div>
        </div>
      ))}
      {cards.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="In this section" className="not-prose hidden lg:block">
            <ol className="sticky top-28 space-y-1 border-l-2 border-border">
              {cards.map((g, i) => (
                <li key={`nav-${i}`}>
                  <a href={`#${slug(g.title ?? '')}`} className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-4 text-sm leading-snug text-muted-foreground transition hover:border-secondary hover:text-primary-strong">{g.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="space-y-6">
            {cards.map((g, i) => {
              const c = colour(palette, i)
              const Icon = iconFor(g.title ?? '')
              // a heading with no text of its own (a group title over the next headings) is a divider, not a card
              if (!g.nodes.length) {
                return (
                  <h4 key={`card-${i}`} id={slug(g.title ?? '')} className="not-prose reveal flex scroll-mt-28 items-center gap-3 pt-4 font-display text-2xl text-primary-strong md:text-3xl">
                    <span aria-hidden className="h-0.5 w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />{g.title}
                  </h4>
                )
              }
              return (
                <section key={`card-${i}`} id={slug(g.title ?? '')} className="reveal scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_18px_40px_-30px_hsl(189_100%_15%/0.5)]">
                  <header className="not-prose flex items-center gap-4 border-b border-border px-6 py-5 md:px-8" style={{ background: `linear-gradient(90deg, color-mix(in oklab, ${c} 12%, transparent), transparent)` }}>
                    <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md" style={{ background: c }}><Icon className="size-5" strokeWidth={1.8} /></span>
                    <h4 className="font-display text-xl leading-snug text-foreground md:text-2xl">{g.title}</h4>
                    <span aria-hidden className="label-mono ml-auto text-[10px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  </header>
                  <div className={cn(proseClassName, 'max-w-none px-6 py-6 md:px-8 [&_.not-prose]:my-4')}>{g.nodes}</div>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


/** Program picker: big cards (region, program name) that jump to the program's tab or section; sits just under the banner. */
export function ProgramPicker({ items }: { items: { label: string; region?: string; href: string }[] }) {
  return (
    <div className="relative z-10 mx-auto -mt-10 w-full max-w-site px-5 md:-mt-14 md:px-8">
      <ul className={cn('grid gap-4', items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {items.map((it, i) => {
          const c = colour('brand', i)
          return (
            <li key={it.href} className="hero-fade-up" style={{ '--d': `${200 + i * 120}ms` } as CSSProperties}>
              <a href={it.href} className="group relative flex h-full items-center gap-4 overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 shadow-[0_24px_50px_-28px_hsl(189_100%_15%/0.6)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_60px_-28px_hsl(189_100%_15%/0.7)] md:p-6">
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: `linear-gradient(90deg, ${c}, var(--color-secondary))` }} />
                <span aria-hidden className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: c }}>
                  <span className="absolute inset-0 animate-ping rounded-2xl opacity-20 [animation-duration:2.6s]" style={{ background: c }} />
                  <Landmark className="relative size-7" strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  {it.region && <span className="label-mono block text-[10px] text-secondary-strong">{it.region}</span>}
                  <span className="mt-1 block font-display text-xl leading-snug text-foreground">{it.label}</span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-primary-strong transition-transform group-hover:translate-x-1" />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
