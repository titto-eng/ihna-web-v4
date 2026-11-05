// Showcase kit (05 §4.5): presentational sections for the hand-written pages, so long migrated copy reads as designed sections
// (pillars, value cards, checklists, quotes, split prose, link tiles) instead of one prose column. Plain JSX, server components;
// the text stays exactly as migrated, only its presentation changes. Headings take `*emphasis*` (Emphasis.tsx).
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight, Check, CreditCard, Info, Quote as QuoteIcon, TriangleAlert } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Emphasis } from '@/components/Emphasis'
import { proseClassName } from '@/components/layout/Prose'
import { cn } from '@/lib/cn'
import type { Media } from '@/payload-types'
import { Roadmap, type RoadmapItem } from './roadmap.client'
import { OrgChart, type OrgDotted, type OrgNode } from './orgchart.client'

type Tone = 'default' | 'card' | 'muted' | 'ink' | 'sunrise'
type Base = { eyebrow?: string; heading?: string; intro?: ReactNode; tone?: Tone; anchorId?: string; className?: string }

const isExternal = (href: string) => /^https?:\/\//.test(href)

/** Eyebrow + heading + intro, left aligned or centred. */
export function SectionHead({ eyebrow, heading, intro, onDark, center, className }: { eyebrow?: string; heading?: string; intro?: ReactNode; onDark?: boolean; center?: boolean; className?: string }) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <div className={cn('mb-10 max-w-3xl md:mb-14', center && 'mx-auto text-center', onDark && 'text-ink-foreground', className)}>
      {eyebrow && (
        <p className={cn('label-mono inline-flex items-center gap-3', onDark ? 'text-secondary' : 'text-primary-strong', center && 'justify-center')}>
          <span aria-hidden className="h-px w-8 bg-current" />{eyebrow}
        </p>
      )}
      {heading && <h2 className="display mt-4 text-display-md"><Emphasis text={heading} tone={onDark ? 'secondary' : 'primary'} /></h2>}
      {intro && <div className={cn('mt-5 text-lg leading-relaxed text-pretty', onDark ? 'text-ink-foreground/80' : 'text-muted-foreground')}>{intro}</div>}
    </div>
  )
}

/** Three to four headline statements (vision / mission / purpose …) as large gradient cards. */
export function Pillars({ items, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { items: { label: string; title: string; body?: ReactNode }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ul className={cn('grid gap-5', items.length >= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3')}>
        {items.map((it, i) => (
          <li
            key={it.label}
            className={cn(
              'reveal group relative overflow-hidden rounded-card p-7 transition-all duration-500 hover:-translate-y-1 md:p-9',
              i === 1 ? 'bg-secondary text-ink' : i % 2 === 0 ? 'bg-primary-strong text-ink-foreground' : 'bg-primary text-ink',
            )}
          >
            <span aria-hidden className="absolute -top-14 -right-14 size-44 rounded-full border-[16px] border-white/15 transition-transform duration-700 group-hover:scale-125" />
            <span aria-hidden className="label-mono relative opacity-80">{String(i + 1).padStart(2, '0')} · {it.label}</span>
            <p className="display relative mt-10 text-3xl leading-tight text-balance md:text-[2.15rem]">{it.title}</p>
            {it.body && <div className="relative mt-4 text-sm leading-relaxed opacity-85">{it.body}</div>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Values / features: cards with a big initial letter (or number) and a short text. */
export function ValueCards({ items, eyebrow, heading, intro, tone = 'muted', anchorId, columns = 3, className }: Base & { items: { title: string; body?: ReactNode; mark?: string }[]; columns?: 2 | 3 | 4 }) {
  const dark = tone === 'ink'
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={dark} />
      <ul className={cn('grid gap-5 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3', columns === 4 && 'lg:grid-cols-4')}>
        {items.map((it, i) => (
          <li
            key={it.title}
            className={cn(
              'reveal group relative overflow-hidden rounded-card border p-7 transition-all duration-500 hover:-translate-y-1',
              dark ? 'border-ink-foreground/15 bg-ink-raised' : 'border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
            )}
          >
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-500 group-hover:scale-x-100" />
            <span aria-hidden className={cn('display grid size-14 place-items-center rounded-2xl text-3xl transition-colors duration-300', dark ? 'bg-secondary text-ink' : 'bg-primary/10 text-primary-strong group-hover:bg-secondary group-hover:text-ink')}>
              {it.mark ?? it.title.charAt(0)}
            </span>
            <h3 className={cn('mt-6 text-xl font-semibold', dark && 'text-ink-foreground')} style={{ fontFamily: 'var(--font-sans)' }}>{it.title}</h3>
            {it.body && <div className={cn('mt-2 leading-relaxed [&_a]:font-semibold [&_a]:underline [&_a]:decoration-secondary [&_a]:decoration-2 [&_a]:underline-offset-4 [&_p+p]:mt-2', dark ? 'text-ink-foreground/75 [&_a]:text-secondary' : 'text-muted-foreground [&_a]:text-primary-strong')}>{it.body}</div>}
            <span aria-hidden data-n={String(i + 1).padStart(2, '0')} className="pointer-events-none absolute -right-2 -bottom-6 display text-[7rem] leading-none text-primary/5 before:content-[attr(data-n)]" />
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** A list rendered as check rows (two columns from md). Use `depth` 1 inside another section. */
export function Checklist({ items, heading, eyebrow, intro, tone = 'default', anchorId, columns = 2, className }: Base & { items: ReactNode[]; columns?: 1 | 2 }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ChecklistItems items={items} columns={columns} onDark={tone === 'ink'} />
    </Section>
  )
}

export function ChecklistItems({ items, columns = 2, onDark }: { items: ReactNode[]; columns?: 1 | 2; onDark?: boolean }) {
  return (
    <ul className={cn('not-prose my-6 grid gap-3', columns === 2 && 'md:grid-cols-2')}>
      {items.map((it, i) => (
        <li key={i} className={cn('reveal flex gap-4 rounded-2xl border p-4 md:p-5', onDark ? 'border-ink-foreground/15 bg-white/5 text-ink-foreground/85' : 'border-border bg-card')}>
          <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-white shadow-md shadow-primary/30"><Check className="size-4" /></span>
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  )
}

/** Sticky heading on the left, long copy on the right (≥lg). Good for policy-like or narrative text. */
export function SplitProse({ eyebrow, heading, intro, children, tone = 'default', anchorId, aside, className }: Base & { children: ReactNode; aside?: ReactNode }) {
  const dark = tone === 'ink'
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={dark} className="mb-0 md:mb-0" />
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <div className={cn(proseClassName, 'max-w-none', dark && 'prose-invert')}>{children}</div>
      </div>
    </Section>
  )
}

/** A highlighted statement: a big quote with an optional author, role and portrait. */
export function Statement({ quote, title, lead, author, role, image, tone = 'sunrise', anchorId, children, className }: { quote: ReactNode; title?: string; lead?: ReactNode; author?: string; role?: string; image?: Media; tone?: Tone; anchorId?: string; children?: ReactNode; className?: string }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <figure className="reveal relative mx-auto grid max-w-5xl gap-10 overflow-hidden rounded-card bg-primary-strong p-8 text-ink-foreground shadow-2xl shadow-primary-strong/25 md:p-14 lg:grid-cols-[auto_1fr] lg:items-center">
        <span aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/40 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 size-64 rounded-full bg-secondary/25 blur-3xl" />
        {image?.url && (
          <div className="relative mx-auto w-44 shrink-0 md:w-56">
            <span aria-hidden className="absolute -inset-2 rounded-full bg-gradient-to-br from-secondary to-primary opacity-80 blur-sm" />
            <Image src={image.url ?? ''} alt={image.alt ?? ''} width={image.width ?? 400} height={image.height ?? 400} sizes="224px" className="relative aspect-square w-full rounded-full object-cover ring-4 ring-primary-strong" />
          </div>
        )}
        <div className="relative">
          <QuoteIcon aria-hidden className="size-10 text-secondary" />
          {title && <p className="label-mono mt-4 text-secondary">{title}</p>}
          {lead && <p className="mt-4 text-lg leading-relaxed text-ink-foreground/85">{lead}</p>}
          <blockquote className="display mt-4 text-2xl leading-snug text-pretty md:text-3xl">{quote}</blockquote>
          {children && <div className="mt-6 space-y-4 leading-relaxed text-ink-foreground/80">{children}</div>}
          {(author || role) && (
            <figcaption className="mt-8 flex items-center gap-3">
              <span aria-hidden className="h-0.5 w-10 rounded-full bg-secondary" />
              <span><span className="block font-semibold">{author}</span>{role && <span className="block text-sm text-ink-foreground/70">{role}</span>}</span>
            </figcaption>
          )}
        </div>
      </figure>
    </Section>
  )
}

/** Navigation tiles to related pages (title, optional text), with a hover sweep. */
export function LinkTiles({ items, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { items: { title: string; href: string; body?: string; label?: string }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.href + it.title} className="reveal min-w-0">
            <Link
              href={it.href}
              {...(isExternal(it.href) ? { target: '_blank', rel: 'noopener' } : {})}
              className="group relative flex h-full items-center justify-between gap-6 overflow-hidden rounded-card border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:text-ink-foreground hover:shadow-2xl hover:shadow-primary-strong/25 md:p-7"
            >
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-br from-primary to-primary-strong transition-transform duration-500 ease-out group-hover:scale-y-100" />
              <span className="relative min-w-0 [overflow-wrap:anywhere]">
                <span className="label-mono text-primary-strong transition-colors group-hover:text-secondary">{it.label ?? String(i + 1).padStart(2, '0')}</span>
                <span className="mt-2 block text-xl font-semibold">{it.title}</span>
                {it.body && <span className="mt-1 block text-sm text-muted-foreground transition-colors group-hover:text-ink-foreground/80">{it.body}</span>}
              </span>
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-strong transition-all duration-300 group-hover:rotate-45 group-hover:bg-secondary group-hover:text-ink">
                <ArrowUpRight aria-hidden className="size-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Image beside rich copy, with a framed, layered photo. `imageSide` picks the column. */
export function MediaSplit({ image, imageSide = 'left', eyebrow, heading, children, tone = 'default', anchorId, badge, className }: Base & { image: Media; imageSide?: 'left' | 'right'; children: ReactNode; badge?: { value: string; label: string } }) {
  const dark = tone === 'ink'
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className={cn('reveal relative', imageSide === 'right' && 'lg:order-2')}>
          <span aria-hidden className="absolute -inset-4 -z-0 rotate-2 rounded-card bg-gradient-to-br from-primary/25 to-secondary/30" />
          <Image src={image.url ?? ''} alt={image.alt ?? ''} width={image.width ?? 800} height={image.height ?? 800} sizes="(min-width: 1024px) 45vw, 100vw" className="relative w-full rounded-card object-cover shadow-xl" />
          {badge && (
            <div className="hero-float absolute -right-3 -bottom-6 rounded-2xl bg-secondary px-5 py-4 text-ink shadow-xl md:-right-8">
              <p className="display text-3xl">{badge.value}</p>
              <p className="text-xs font-semibold">{badge.label}</p>
            </div>
          )}
        </div>
        <div>
          <SectionHead eyebrow={eyebrow} heading={heading} onDark={dark} className="mb-6 md:mb-8" />
          <div className={cn(proseClassName, 'max-w-none', dark && 'prose-invert')}>{children}</div>
        </div>
      </div>
    </Section>
  )
}

/** Awards by programme: one row per programme, each award a card with year, result (Winner / Commendation / Finalist) and an optional title. */
export function AwardBoard({ groups, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { groups: { name: string; body?: string; awards: { year: string; result: string; title?: string }[] }[] }) {
  const resultTone = (r: string) =>
    /winner/i.test(r) ? 'bg-secondary text-ink' : /commendation/i.test(r) ? 'bg-primary text-ink' : 'border border-primary-strong/30 text-primary-strong'
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <div className="space-y-12">
        {groups.map((g) => (
          <div key={g.name} className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h3 className="text-xl font-semibold text-primary-strong" style={{ fontFamily: 'var(--font-sans)' }}>{g.name}</h3>
              {g.body && <p className="mt-2 text-muted-foreground">{g.body}</p>}
              <p className="label-mono mt-3 text-[10px] text-muted-foreground">{g.awards.length} {g.awards.length === 1 ? 'recognition' : 'recognitions'}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {g.awards.map((a, i) => (
                <li key={i} className="reveal group relative overflow-hidden rounded-card border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-secondary/60 hover:shadow-xl hover:shadow-secondary/10">
                  <span aria-hidden data-n={a.year} className="pointer-events-none absolute -top-6 -right-4 display text-[6rem] leading-none text-primary/[0.07] transition-colors group-hover:text-secondary/15 before:content-[attr(data-n)]" />
                  <div className="relative flex items-center gap-3">
                    <span aria-hidden className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-secondary to-[#ffb347] text-ink shadow-lg shadow-secondary/30">
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                    </span>
                    <span className="display text-3xl text-primary-strong">{a.year}</span>
                  </div>
                  <span className={cn('relative mt-5 inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase', resultTone(a.result))}>{a.result}</span>
                  <p className="relative mt-3 font-medium leading-snug">{a.title ?? g.name}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

/** Big figures with a heading and text each (e.g. "35,000+ Studied"). */
export function FactBand({ items, eyebrow, heading, intro, tone = 'ink', anchorId, className }: Base & { items: { title: string; body?: ReactNode }[] }) {
  const dark = tone === 'ink'
  return (
    <Section tone={tone} anchorId={anchorId} className={cn('relative overflow-hidden', className)}>
      {dark && <span aria-hidden className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-primary/30 blur-3xl" />}
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={dark} />
      <ul className="relative grid gap-6 md:grid-cols-2">
        {items.map((it) => (
          <li key={it.title} className={cn('reveal rounded-card border p-8', dark ? 'border-ink-foreground/15 bg-white/5' : 'border-border bg-card')}>
            <p className={cn('display text-4xl md:text-5xl', dark ? 'text-secondary' : 'text-primary-strong')}>{it.title}</p>
            {it.body && <div className={cn('mt-4 leading-relaxed', dark ? 'text-ink-foreground/80' : 'text-muted-foreground')}>{it.body}</div>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** People: 4:5 portraits (initials when there is no photo), name and role; the photo lifts and a brand wash appears on hover. */
export function PeopleGrid({ people, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { people: { name: string; role?: string; image?: Media; href?: string }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {people.map((p) => {
          const initials = p.name.replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('')
          const card = (
            <div className="group reveal relative h-full overflow-hidden rounded-card border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-strong/15">
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary to-primary-strong">
                {p.image?.url ? (
                  <Image src={p.image.url} alt={p.image.alt || p.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
                ) : (
                  <span aria-hidden className="display absolute inset-0 grid place-items-center text-6xl text-white/90">{initials}</span>
                )}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-strong/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="p-4 md:p-5">
                <p className="font-semibold leading-snug">{p.name}</p>
                {p.role && <p className="mt-1 text-sm leading-snug text-muted-foreground">{p.role}</p>}
                <span aria-hidden className="mt-3 block h-0.5 w-8 rounded-full bg-secondary transition-all duration-500 group-hover:w-16" />
              </div>
            </div>
          )
          return <li key={p.name}>{p.href ? <Link href={p.href} className="block h-full">{card}</Link> : card}</li>
        })}
      </ul>
    </Section>
  )
}

/** A row of short highlight chips on the brand gradient (e.g. "17+ Years", "30,000+ Students Studied"). */
export function HighlightStrip({ items, anchorId, className }: { items: string[]; anchorId?: string; className?: string }) {
  return (
    <Section tone="default" spacing="compact" anchorId={anchorId} className={className}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <li key={it} className="reveal group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-strong to-primary p-4 text-ink-foreground shadow-lg shadow-primary-strong/15 md:p-5">
            <span aria-hidden className="absolute -top-8 -right-8 size-24 rounded-full border-[10px] border-white/10 transition-transform duration-700 group-hover:scale-125" />
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-ink"><span className="display text-lg">{String(i + 1).padStart(2, '0')}</span></span>
            <span className="relative font-semibold leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Campus contact cards: name, address lines, phone and email, plus an optional map beside them. */
export function ContactCards({ cards, eyebrow, heading, intro, map, tone = 'muted', anchorId, className }: Base & {
  cards: { title: string; lines: string[]; phone?: string; email?: string }[]
  map?: ReactNode
}) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      <div className={cn('grid gap-6', map && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start')}>
        <ul className="grid gap-4">
          {cards.map((c) => (
            <li key={c.title} className="reveal rounded-card border border-border bg-card p-6 shadow-sm md:p-7">
              <p className="label-mono text-[10px] text-primary-strong">Contact Info</p>
              <h3 className="mt-2 font-sans text-xl font-semibold">{c.title}</h3>
              <address className="mt-4 flex gap-3 not-italic text-muted-foreground">
                <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>{c.lines.map((l, i) => <span key={i} className="block">{l}</span>)}</span>
              </address>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.phone && <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-strong transition-colors hover:bg-primary hover:text-ink">Phone: {c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-strong transition-colors hover:bg-primary hover:text-ink">Email: {c.email}</a>}
              </div>
            </li>
          ))}
        </ul>
        {map && <div className="overflow-hidden rounded-card border border-border shadow-sm [&_iframe]:min-h-[22rem]">{map}</div>}
      </div>
    </Section>
  )
}

/** Quick-link hub: one card per topic with its own list of links (e.g. Current Students "Important Info", "Fees & Charges"). */
export function LinkGroups({ groups, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { groups: { title: string; links: { label: string; href: string }[] }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <li key={g.title} className="reveal group relative overflow-hidden rounded-card border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 md:p-7">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary" />
            <div className="flex items-center gap-3">
              <span aria-hidden className="display grid size-11 place-items-center rounded-2xl bg-primary-strong text-lg text-ink-foreground transition-colors group-hover:bg-secondary group-hover:text-ink">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-sans text-xl font-semibold">{g.title}</h3>
            </div>
            <ul className="mt-5 space-y-1">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    {...(isExternal(l.href) ? { target: '_blank', rel: 'noopener' } : {})}
                    className="group/l flex items-center justify-between gap-3 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-primary/10 hover:text-primary-strong"
                  >
                    {l.label}
                    <ArrowUpRight aria-hidden className="size-4 shrink-0 text-primary-strong opacity-40 transition-all group-hover/l:translate-x-0.5 group-hover/l:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Numbered steps on a vertical line (application process, how-to guides). Each step's body can hold paragraphs and lists. */
export function Timeline({ steps, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { steps: { title: string; body?: ReactNode }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} onDark={tone === 'ink'} />
      <ol className="relative mx-auto max-w-4xl">
        <span aria-hidden className="absolute top-2 bottom-2 left-6 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-secondary md:left-8" />
        {steps.map((st, i) => (
          <li key={st.title} className="reveal relative pb-8 pl-16 last:pb-0 md:pl-24">
            <span aria-hidden className="display absolute top-0 left-0 grid size-12 place-items-center rounded-2xl bg-primary-strong text-lg text-ink-foreground shadow-lg shadow-primary-strong/25 ring-4 ring-background md:size-16 md:text-2xl">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="rounded-card border border-border bg-card p-6 shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 md:p-7">
              <h3 className="font-sans text-xl font-semibold">{st.title}</h3>
              {st.body && <div className={cn(proseClassName, 'mt-3 max-w-none text-base [&>*:first-child]:mt-0 [&>*:last-child]:mb-0')}>{st.body}</div>}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/** Partner organisations (universities, …): one wide card each with logo, name, description and pathway list. */
export function PartnerList({ partners, eyebrow, heading, intro, tone = 'default', anchorId, className, columns = 1, linkLabel = 'Visit website' }: Base & {
  /** Text of each partner's website link. */
  linkLabel?: string
  partners: { name: string; logo?: { src: string; alt?: string; width: number; height: number }; body?: ReactNode; listLabel?: string; items?: ReactNode[]; href?: string }[]
  /** Two cards per row from lg (short entries such as memberships); default one wide card per row. */
  columns?: 1 | 2
}) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      <ul className={cn('grid gap-6', columns === 2 && 'lg:grid-cols-2')}>
        {partners.map((pt) => (
          <li key={pt.name} className={cn('reveal grid overflow-hidden rounded-card border border-border bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10', columns === 2 ? 'sm:grid-cols-[11rem_1fr]' : 'md:grid-cols-[16rem_1fr]')}>
            <div className="flex flex-col items-start justify-center gap-4 border-b border-border bg-gradient-to-br from-primary/5 to-secondary/10 p-6 md:border-r md:border-b-0 md:p-8">
              {pt.logo && <Image src={pt.logo.src} alt={pt.logo.alt ?? pt.name} width={pt.logo.width} height={pt.logo.height} unoptimized className="h-12 w-auto md:h-[52px] max-w-full object-contain" />}
              <h3 className="font-sans text-xl font-semibold text-primary-strong">{pt.name}</h3>
            </div>
            <div className="p-6 md:p-8">
              {pt.body && <div className="leading-relaxed text-muted-foreground">{pt.body}</div>}
              {pt.listLabel && <p className="label-mono mt-6 text-[10px] text-primary-strong">{pt.listLabel}</p>}
              {pt.items && pt.items.length > 0 && <ChecklistItems columns={1} items={pt.items} />}
              {pt.href && (
                <Link href={pt.href} target="_blank" rel="noopener" className="group/v mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-strong">
                  {linkLabel} <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover/v:translate-x-0.5 group-hover/v:-translate-y-0.5" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Logo tiles (databases, tools): logo panel, name, optional note and a launch link; tiles without a link show the name only. */
export function LogoTiles({ items, eyebrow, heading, intro, tone = 'default', anchorId, className, linkLabel = 'Launch now' }: Base & {
  items: { title: string; logo: { src: string; alt?: string; width: number; height: number }; body?: ReactNode; href?: string }[]
  linkLabel?: string
}) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.title} className="reveal group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
            <div className="grid h-40 place-items-center bg-gradient-to-br from-primary/5 to-secondary/10 p-6">
              <Image src={it.logo.src} alt={it.logo.alt ?? ''} width={it.logo.width} height={it.logo.height} unoptimized className="h-12 w-auto md:h-[52px] max-w-full object-contain transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-sans text-xl font-semibold text-primary-strong">{it.title}</h3>
              {it.body && <div className="mt-2 leading-relaxed text-muted-foreground">{it.body}</div>}
              {it.href && (
                <Link href={it.href} {...(isExternal(it.href) ? { target: '_blank', rel: 'noopener' } : {})} className="group/v mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary-strong">
                  {linkLabel} <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover/v:translate-x-0.5 group-hover/v:-translate-y-0.5" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** A small "Powered by" style line: a label beside a partner logo kept at logo size. */
export function LogoBadge({ label, logo, tone = 'default', className, dark = false }: { label?: string; logo: { src: string; alt?: string; width: number; height: number }; tone?: Tone; className?: string; /** For a white (light) logo. */ dark?: boolean }) {
  return (
    <Section tone={tone} spacing="compact" className={className}>
      <div className={cn('reveal inline-flex items-center gap-5 rounded-card border px-6 py-4 shadow-sm', dark ? 'border-transparent bg-primary-strong shadow-primary-strong/25' : 'border-border bg-card')}>
        {label && <span className={cn('label-mono', dark ? 'text-secondary' : 'text-primary-strong')}>{label}</span>}
        <Image src={logo.src} alt={logo.alt ?? ''} width={logo.width} height={logo.height} unoptimized className="h-12 w-auto md:h-[52px]" />
      </div>
    </Section>
  )
}

/** Infographics / posters shown whole (never cropped), in a row of up to four, each on a soft frame. */
export function FigureGrid({ images, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { images: { src: string; alt?: string; width: number; height: number }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      <ul className={cn('grid items-start gap-6', images.length > 1 && 'sm:grid-cols-2', images.length === 5 ? 'lg:grid-cols-5' : images.length >= 4 ? 'lg:grid-cols-4' : images.length === 3 && 'lg:grid-cols-3')}>
        {images.map((im) => (
          <li key={im.src} className="reveal overflow-hidden rounded-card border border-border bg-card p-3 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            <Image src={im.src} alt={im.alt ?? ''} width={im.width} height={im.height} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full rounded-xl" />
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Testimonials with full multi-paragraph text: a masonry wall of quote cards, each signed with a photo (or initials). */
export function QuoteWall({ items, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & {
  items: { name: string; role?: string; photo?: { src: string; alt?: string; width: number; height: number }; body: ReactNode }[]
}) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      <ul className="gap-6 md:columns-2 lg:columns-3">
        {items.map((it, i) => (
          <li key={it.name} className="reveal relative mb-6 break-inside-avoid overflow-hidden rounded-card border border-border bg-card p-7 shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', i % 2 ? 'bg-secondary' : 'bg-primary')} />
            <QuoteIcon aria-hidden className="size-8 text-secondary" />
            <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground [&_h3]:mt-4 [&_h3]:font-sans [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc">{it.body}</div>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              {it.photo ? (
                <Image src={it.photo.src} alt={it.photo.alt ?? it.name} width={it.photo.width} height={it.photo.height} sizes="48px" className="size-12 shrink-0 rounded-full object-cover object-top ring-2 ring-primary/20" />
              ) : (
                <span aria-hidden className="display grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-lg text-primary-strong">
                  {it.name.split(/\s+/).map((w) => w.charAt(0)).slice(0, 2).join('')}
                </span>
              )}
              <span>
                <span className="block font-semibold">{it.name}</span>
                {it.role && <span className="block text-sm text-muted-foreground">{it.role}</span>}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** An event write-up: chips (category · date · status), title and story beside a sticky facts card (date, time, venue, host). */
export function EventDetail({ title, chips, facts, children, tone = 'default', anchorId, className, spacing = 'compact' }: {
  title: string
  chips: string[]
  facts: { label: string; value: ReactNode }[]
  children: ReactNode
  tone?: Tone
  anchorId?: string
  className?: string
  spacing?: 'default' | 'compact'
}) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className} spacing={spacing}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="reveal min-w-0">
          <ul className="flex flex-wrap gap-2">
            {chips.map((c, i) => (
              <li key={c} className={cn('label-mono rounded-full px-3 py-1.5 text-[11px]', i === 0 ? 'bg-secondary text-ink' : 'bg-primary/10 text-primary-strong')}>{c}</li>
            ))}
          </ul>
          <h2 className="display mt-5 text-3xl leading-tight text-balance md:text-4xl">{title}</h2>
          <div className={cn(proseClassName, 'mt-6 max-w-none [&>*:first-child]:mt-0')}>{children}</div>
        </div>
        <aside className="reveal lg:sticky lg:top-28 lg:self-start">
          <dl className="overflow-hidden rounded-card bg-primary-strong p-7 text-ink-foreground shadow-xl shadow-primary-strong/20">
            {facts.map((f) => (
              <div key={f.label} className="border-b border-ink-foreground/15 py-4 first:pt-0 last:border-0 last:pb-0">
                <dt className="label-mono text-[11px] text-secondary">{f.label}</dt>
                <dd className="mt-1 font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </Section>
  )
}

/** Key course facts (start date, delivery, location) as a row of tiles with an optional advisor button. Not a section: use it
 *  inside a body column (landing pages) or between sections. */
export function QuickFacts({ items, cta, className, variant = 'facts' }: { items: { label: string; value: ReactNode }[]; cta?: { label: string; href: string }; className?: string; variant?: 'facts' | 'stats' }) {
  const stats = variant === 'stats'
  return (
    <div className={cn('reveal not-prose overflow-hidden rounded-card border border-border bg-card shadow-sm', className)}>
      <dl className={cn('grid', stats ? 'bg-primary-strong [&>div]:shadow-[1px_1px_0_0_rgb(255_255_255/0.15)]' : 'bg-card [&>div]:shadow-[1px_1px_0_0_var(--color-border)]', items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {items.map((f) => (
          <div key={f.label} className={cn('p-5 md:p-6', stats ? 'flex flex-col-reverse text-ink-foreground' : '')}>
            <dt className={cn('label-mono text-[11px]', stats ? 'mt-2 text-ink-foreground/75' : 'text-primary-strong')}>{f.label}</dt>
            <dd className={cn(stats ? 'display text-4xl text-secondary md:text-5xl' : 'mt-2 space-y-1 text-lg leading-snug font-semibold [&_span]:block [&_span]:text-sm [&_span]:font-normal [&_span]:text-muted-foreground')}>{f.value}</dd>
          </div>
        ))}
      </dl>
      {cta && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-gradient-to-r from-primary/5 to-secondary/10 px-5 py-4 md:px-6">
          <span className="text-sm text-muted-foreground">Questions about intakes or eligibility?</span>
          <a href={cta.href} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
            {cta.label} <ArrowUpRight aria-hidden className="size-4" />
          </a>
        </div>
      )}
    </div>
  )
}

/** Confirmation after a form: a centred card with a check mark, the message, and ways to keep going (call, email, browse). */
export function ThankYouCard({ children, phone = '1800 22 52 83', email = 'enquiry@ihna.edu.au', links = [{ label: 'Explore courses', href: '/courses/' }, { label: 'Back to home', href: '/' }], className, icon = 'check' }: {
  children: ReactNode
  /** The badge: `check` (confirmation, default), `info` (notice), `alert` (something went wrong), `card` (payments). */
  icon?: 'check' | 'info' | 'alert' | 'card'
  phone?: string | null
  email?: string | null
  links?: { label: string; href: string }[]
  className?: string
}) {
  return (
    <Section className={className}>
      <div className="reveal relative mx-auto max-w-2xl overflow-hidden rounded-card border border-border bg-card p-8 text-center shadow-xl shadow-primary/10 md:p-12">
        <span aria-hidden className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-primary/10 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-full bg-secondary/15 blur-2xl" />
        <span aria-hidden className={cn('relative mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br text-ink-foreground shadow-lg', icon === 'alert' ? 'from-coral to-secondary shadow-secondary/30' : 'from-primary to-primary-strong shadow-primary/30')}>
          {icon === 'check' && <Check className="size-8" strokeWidth={3} />}
          {icon === 'info' && <Info className="size-8" strokeWidth={2.5} />}
          {icon === 'alert' && <TriangleAlert className="size-8" strokeWidth={2.5} />}
          {icon === 'card' && <CreditCard className="size-8" strokeWidth={2.2} />}
        </span>
        <div className={cn(proseClassName, 'relative mx-auto mt-6 text-center [&>*:first-child]:mt-0 [&>*:last-child]:mb-0')}>{children}</div>
        {(phone || email) && (
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center rounded-full bg-primary-strong px-5 py-2.5 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5">Call {phone}</a>}
            {email && <a href={`mailto:${email}`} className="inline-flex items-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-primary-strong transition-transform hover:-translate-y-0.5">{email}</a>}
          </div>
        )}
        {links.length > 0 && (
          <ul className="relative mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-primary-strong underline decoration-secondary decoration-2 underline-offset-4">{l.label}</Link></li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

/** Document library: groups of document links (policies, procedures, forms) shown as tabs-free sections of PDF tiles. */
export function DocumentGroups({ groups, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { groups: { title: string; docs: { label: string; href: string }[] }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      {groups.length > 1 && (
        <nav aria-label="Jump to" className="mb-10 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.title} href={`#docs-${g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary-strong">
              {g.title} <span className="ml-1 text-muted-foreground">{g.docs.length}</span>
            </a>
          ))}
        </nav>
      )}
      <div className="space-y-12">
        {groups.map((g) => (
          <section key={g.title} id={`docs-${g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="scroll-mt-28">
            <h2 className="mb-5 flex items-center gap-3 font-sans text-xl font-semibold text-primary-strong">
              <span aria-hidden className="h-0.5 w-6 rounded-full bg-secondary" />{g.title}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.docs.map((d) => {
                const pdf = /\.pdf($|[?#])/i.test(d.href)
                return (
                  <li key={d.href + d.label}>
                    <Link
                      href={d.href}
                      {...(isExternal(d.href) || pdf ? { target: '_blank', rel: 'noopener' } : {})}
                      className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                    >
                      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-[10px] font-bold tracking-wider text-primary-strong transition-colors group-hover:bg-secondary group-hover:text-ink">
                        {pdf ? 'PDF' : 'LINK'}
                      </span>
                      <span className="text-sm leading-snug font-medium group-hover:text-primary-strong">{d.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  )
}

/** Price / fee list: groups of rows with a label, an amount and an optional note (e.g. "(per year)"). */
export function PriceList({ groups, eyebrow, heading, intro, tone = 'default', anchorId, className }: Base & { groups: { title: string; rows: { label: string; amount: string; note?: string }[] }[] }) {
  return (
    <Section tone={tone} anchorId={anchorId} className={className}>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />
      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title} className="reveal overflow-hidden rounded-card border border-border bg-card shadow-sm">
            <h3 className="bg-primary-strong px-6 py-4 font-sans text-lg font-semibold text-ink-foreground">{g.title}</h3>
            <dl className="divide-y divide-border">
              {g.rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[1fr_auto] items-baseline gap-4 px-6 py-4 transition-colors hover:bg-primary/5">
                  <dt className="font-medium">{r.label}</dt>
                  <dd className="text-right">
                    <span className="display text-2xl text-primary-strong">{r.amount}</span>
                    {r.note && <span className="block text-xs text-muted-foreground">{r.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  )
}

/** A growth roadmap: milestones on a winding road that draws itself (roadmap.client.tsx), ending at an optional goal star. */
export function GrowthRoadmap({ eyebrow, heading, intro, items, goal, tone = 'muted', anchorId }: { eyebrow?: string; heading?: string; intro?: ReactNode; items: RoadmapItem[]; goal?: { year: string; title: string }; tone?: 'default' | 'muted'; anchorId?: string }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-sun/15 blur-3xl" />
        <span className="absolute -right-40 -bottom-40 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(189_100%_15%/0.07)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} center />
      <div className="px-1 md:px-12 lg:px-16"><Roadmap items={items} goal={goal} /></div>
    </Section>
  )
}

/** A structure chart drawn in code (orgchart.client.tsx): reporting lines, dotted lines, hover to follow a line, fold committees. */
export function StructureChart({ eyebrow, heading, intro, root, dotted, tone = 'muted', anchorId }: { eyebrow?: string; heading?: string; intro?: ReactNode; root: OrgNode; dotted?: OrgDotted[]; tone?: 'default' | 'muted'; anchorId?: string }) {
  return (
    <Section tone={tone} anchorId={anchorId} className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-40 right-0 size-[30rem] rounded-full bg-primary/12 blur-3xl" />
        <span className="absolute -bottom-40 left-0 size-[28rem] rounded-full bg-secondary/12 blur-3xl" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(189_100%_15%/0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>
      <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} center />
      <OrgChart root={root} dotted={dotted} />
    </Section>
  )
}
