import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Briefcase, ClipboardCheck, Info, Layers, Mail, MessageCircleQuestion, Phone, Route, Sparkles, Stethoscope, Wallet, type LucideIcon } from 'lucide-react'
import { hasBrochure } from '@/lib/courses/brochure'
import type { Course } from '@/payload-types'
import { CtaLink, type CtaItem } from '@/components/CtaLink'
import { CourseHero } from '@/components/course/CourseHero'
import { CourseVideoHero } from '@/components/course/CourseVideoHero'
import { courseFilm } from '@/content/course-videos'
import { CourseChips, CourseRoadmap } from '@/components/course/CourseRoadmap.client'
import { courseFactsFor } from '@/components/course/facts'
import { site } from '@/content/site'
import { CourseJsonLd } from '@/components/seo/Course'
import { CourseFacts, hasCourseFacts } from '@/components/course/CourseFacts'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { namesOf } from '@/components/templates/courseContext'
import { cn } from '@/lib/cn'
import type { BlockCtx } from '@/blocks/types'
import { groupVideoRuns } from '@/blocks/testimonials/video'

type Slot = 'overview' | 'entry' | 'structure' | 'careers' | 'placements' | 'pathways' | 'faq' | 'fees' | 'additional'
type CourseSection = NonNullable<Course['sections']>[number]

// BON order (05-design-system §4.4 CourseDetail): pathways -> overview -> placements -> curriculum -> admissions -> fees -> careers -> FAQ.
const ORDER: Slot[] = ['pathways', 'overview', 'placements', 'structure', 'entry', 'fees', 'careers', 'faq', 'additional']
const EYEBROW: Record<Slot, string> = {
  pathways: 'Pathways', overview: 'About the course', placements: 'Placements', structure: 'Curriculum', entry: 'Admissions',
  fees: 'Fees and dates', careers: 'Careers', faq: 'Questions', additional: 'More information',
}

type Props = {
  course: Course
  /** `courseShared.layout` (DEC-22), rendered after the course's own blocks. */
  shared?: AnyBlock[] | null
  /** `courseShared.stats`: the figures band above the enquiry form; none when empty. */
  sharedStats?: SharedStat[] | null
  /** The other-audience page of the same course (domestic <-> international), when it exists. */
  sibling?: { label: string; path: string } | null
}

/** True when a block of `type` appears anywhere in `blocks` (sections, tabs, accordions). */
const hasBlock = (blocks: unknown, type: string): boolean =>
  Array.isArray(blocks) &&
  blocks.some((b) => {
    if (!b || typeof b !== 'object') return false
    const o = b as { blockType?: string; tabs?: { blocks?: unknown }[]; items?: { blocks?: unknown }[] }
    return o.blockType === type || o.tabs?.some((t) => hasBlock(t.blocks, type)) || o.items?.some((i) => hasBlock(i.blocks, type)) || false
  })

const first = (names: string[]) => names[0] ?? null

export type SharedStat = { value?: string | null; label?: string | null }

/** The `courseShared.stats` band as a `stats` block, or null when no figure has both a value and a label. */
export function sharedStatsBlock(stats: SharedStat[] | null | undefined): AnyBlock | null {
  const items = (stats ?? []).flatMap((s) => (s.value?.trim() && s.label?.trim() ? [{ value: s.value.trim(), label: s.label.trim() }] : []))
  return items.length ? ({ blockType: 'stats', tone: 'card', spacing: 'compact', anchorId: 'course-stats', items } as AnyBlock) : null
}

// Chapter look per slot: an icon and a brand-blend gradient (theme tokens), so each part of the page is recognisable at a glance.
const LOOK: Record<Slot, { icon: LucideIcon; tint: string }> = {
  pathways: { icon: Route, tint: 'from-ocean to-primary' },
  overview: { icon: Sparkles, tint: 'from-primary to-mint' },
  placements: { icon: Stethoscope, tint: 'from-coral to-secondary' },
  structure: { icon: Layers, tint: 'from-primary-strong to-ocean' },
  entry: { icon: ClipboardCheck, tint: 'from-mint to-primary' },
  fees: { icon: Wallet, tint: 'from-secondary to-sun' },
  careers: { icon: Briefcase, tint: 'from-ocean to-mint' },
  faq: { icon: MessageCircleQuestion, tint: 'from-sun to-coral' },
  additional: { icon: Info, tint: 'from-primary to-ocean' },
}

/** One chapter of the course page: numbered label, icon tile, heading, then the course's own blocks on a raised card. */
function Chapter({ slot, index, title, children }: { slot: Slot; index: number; title: string; children: ReactNode }) {
  const { icon: Icon, tint } = LOOK[slot]
  const n = String(index + 1).padStart(2, '0')
  return (
    <section id={`section-${slot}`} className="group/ch reveal scroll-mt-36 lg:scroll-mt-28" data-course-slot={slot}>
      <header className="relative mb-6 flex items-end gap-4 md:mb-8 md:gap-5">
        <span aria-hidden className={cn('grid size-14 shrink-0 -rotate-6 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-xl transition-transform duration-500 group-hover/ch:rotate-0 group-hover/ch:scale-105 md:size-16', tint)}>
          <Icon className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="label-mono text-[11px] text-primary-strong">
            <span className="text-secondary-strong">{n}</span> · {EYEBROW[slot]}
          </p>
          <h2 className="display mt-1 text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] text-balance">{title}</h2>
        </div>
        <span aria-hidden data-n={n} className="display pointer-events-none absolute -top-8 right-0 hidden text-[7rem] leading-none text-primary/[0.06] before:content-[attr(data-n)] md:block" />
      </header>
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-xl shadow-primary-strong/[0.04] sm:p-7 md:p-10">
        <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', tint)} />
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  )
}

export function CourseDetail({ course, shared, sharedStats, sibling }: Props) {
  const ctx: BlockCtx = { depth: 0, course }
  const nested: BlockCtx = { depth: 1, course }
  const sections = (course.sections ?? []) as CourseSection[]
  const bySlot = new Map<Slot, CourseSection>(sections.map((s) => [s.slot as Slot, s]))
  const allLayouts = sections.map((s) => s.layout)
  const ensure = (type: string) => !allLayouts.some((l) => hasBlock(l, type))

  const ctas: CtaItem[] = [
    ...(course.applyLink ? [{ label: 'Apply now', href: course.applyLink, style: 'primary' as const }] : []),
    { label: 'Enquire now', href: '#quickContact', style: course.applyLink ? ('secondary' as const) : ('primary' as const) },
  ]
  const apply = course.applyLink ? { label: 'Apply now', href: course.applyLink } : null
  const enquire = { label: 'Enquire now', href: '#quickContact' }
  const eyebrow = first(namesOf(course.categories)) ?? first(namesOf([course.school])) ?? 'Course'

  const data = (type: string, extra: Record<string, unknown> = {}): AnyBlock => ({ blockType: type, ...extra }) as AnyBlock
  const dataBlocks = (...types: AnyBlock[]) => <RenderBlocks blocks={types} ctx={ctx} />
  const nestedBlocks = (...types: AnyBlock[]) => <RenderBlocks blocks={types} ctx={nested} />

  // fees region: the course's fee fields, the start dates when switched on (DEC-7), and the census table (the live default)
  const feeBlocks: AnyBlock[] = [
    ...(ensure('feesTable') ? [data('feesTable')] : []),
    ...(course.showStartDates && ensure('startDates') ? [data('startDates', { mode: 'all' })] : []),
    ...(ensure('censusDates') ? [data('censusDates')] : []),
  ]

  // chapters: the slots the course has (in ORDER); the fees chapter also exists when only the fee data blocks do
  const chapters = ORDER.filter((slot) => (bySlot.get(slot)?.layout?.length ?? 0) > 0 || (slot === 'fees' && feeBlocks.length > 0))
  const roadmap = chapters.map((slot) => ({ id: `section-${slot}`, label: bySlot.get(slot)?.title || EYEBROW[slot] }))
  const fee = courseFactsFor(course as never, course.studentType === 'international' ? 'international' : 'domestic').find((f) => f.key === 'fee')
  const tel = site.phone.replace(/[^\d+]/g, '')
  const statsBand = sharedStatsBlock(sharedStats)
  // the "talk to an advisor" break sits after the second chapter, where readers start weighing the decision
  const breakAfter = chapters[1]
  const film = courseFilm(course.slug)

  return (
    <article className="pb-20 lg:pb-0" data-course={course.slug}>
      {/* a course with its own film opens with the video banner; the others keep the photo banner */}
      {film ? (
        <CourseVideoHero course={course} film={film} eyebrow={eyebrow} apply={apply} enquire={enquire} sibling={sibling} />
      ) : (
        <CourseHero course={course} eyebrow={eyebrow} apply={apply} enquire={enquire} sibling={sibling} />
      )}

      {/* key facts: colourful tiles lifted over the hero's edge (marketing's `courses.facts`, src/components/course/CourseFacts.tsx) */}
      {ensure('courseFacts') && hasCourseFacts(course) && (
        <div className="relative z-10 -mt-14 md:-mt-20" data-course-block="courseFacts">
          <div className="mx-auto w-full max-w-site px-5 md:px-8">
            <CourseFacts course={course} variant="tiles" />
          </div>
        </div>
      )}

      {roadmap.length > 1 && <div className="mt-8"><CourseChips items={roadmap} /></div>}

      <div className="mx-auto grid w-full max-w-site gap-12 px-5 py-12 md:px-8 md:py-20 lg:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            {roadmap.length > 1 && <CourseRoadmap items={roadmap} />}
            <div className="relative overflow-hidden rounded-3xl bg-primary-strong p-6 text-ink-foreground shadow-2xl shadow-primary-strong/25">
              <span aria-hidden className="absolute -top-16 -right-16 size-40 rounded-full bg-secondary/30 blur-2xl" />
              {fee && (
                <div className="relative mb-5">
                  <p className="label-mono text-[10px] text-ink-foreground/70">{fee.label}</p>
                  <p className="display mt-1 text-3xl text-secondary">{fee.value}</p>
                  {fee.detail && <p className="mt-1 text-xs text-ink-foreground/70">{fee.detail}</p>}
                </div>
              )}
              <div className="relative space-y-2.5">
                {apply && (
                  <a href={apply.href} className="course-glow flex items-center justify-between rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
                    {apply.label} <ArrowUpRight aria-hidden className="size-4" />
                  </a>
                )}
                <a href={enquire.href} className={cn('flex items-center justify-between rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5', apply ? 'border border-ink-foreground/30 hover:border-secondary' : 'course-glow bg-secondary text-ink')}>
                  {enquire.label} <ArrowRight aria-hidden className="size-4" />
                </a>
                <a href={`tel:${tel}`} className="flex items-center gap-2 px-1 pt-2 text-sm text-ink-foreground/80 hover:text-secondary">
                  <Phone aria-hidden className="size-4" /> {site.phone}
                </a>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-16 md:space-y-24">
          {chapters.map((slot, i) => {
            const s = bySlot.get(slot)
            return (
              <div key={slot} className="space-y-16 md:space-y-24">
                <Chapter slot={slot} index={i} title={s?.title || EYEBROW[slot]}>
                  {/* consecutive student videos render as one testimonials carousel, not a stack of players (DEC-71) */}
                  {s?.layout?.length ? <RenderBlocks blocks={groupVideoRuns(s.layout as AnyBlock[]) as AnyBlock[]} ctx={nested} /> : null}
                  {slot === 'fees' && feeBlocks.length > 0 && nestedBlocks(...feeBlocks)}
                </Chapter>
                {slot === breakAfter && chapters.length > 2 && (
                  <div className="reveal relative overflow-hidden rounded-[2rem] bg-sunrise-glow p-7 text-ink-foreground shadow-2xl shadow-primary/20 md:flex md:items-center md:justify-between md:gap-8 md:p-10">
                    <span aria-hidden className="course-spin absolute -right-20 -bottom-24 size-72 rounded-full border-[28px] border-white/10" />
                    <div className="relative">
                      <p className="label-mono text-[11px] text-ink-foreground/80">{eyebrow}</p>
                      <p className="display mt-2 text-2xl leading-tight md:text-3xl">Questions about {course.title}?</p>
                    </div>
                    <div className="relative mt-6 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
                      <a href={enquire.href} className="inline-flex items-center gap-2 rounded-full bg-ink-foreground px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
                        {enquire.label} <ArrowRight aria-hidden className="size-4" />
                      </a>
                      <a href={`tel:${tel}`} className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/40 px-6 py-3 text-sm font-semibold hover:bg-ink-foreground/10">
                        <Phone aria-hidden className="size-4" /> {site.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {ensure('courseManagers') && dataBlocks(data('courseManagers'))}
      {ensure('relatedCourses') && dataBlocks(data('relatedCourses', { limit: 6 }))}
      {shared?.length ? <RenderBlocks blocks={shared} ctx={ctx} /> : null}
      {hasBrochure(course) && ensure('brochureDownload') && dataBlocks(data('brochureDownload'))}
      {statsBand && <RenderBlocks blocks={[statsBand]} ctx={ctx} />}

      {/* enquiry: a brand panel beside the form */}
      <section id="quickContact" className="scroll-mt-24 bg-muted py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-site gap-8 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-0">
          <div className="relative overflow-hidden rounded-[2rem] bg-sunrise-glow p-8 text-ink-foreground shadow-2xl shadow-primary/20 md:p-12 lg:pr-20">
            <span aria-hidden className="course-spin absolute -top-24 -left-24 size-80 rounded-full border-[32px] border-white/10" />
            <div className="relative">
              <p className="label-mono text-[11px] text-ink-foreground/80">{eyebrow}</p>
              <h2 className="display mt-3 text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.02]">Enquire about this course</h2>
              <p className="mt-4 text-lg text-ink-foreground/90">{course.title}</p>
              <ul className="mt-8 space-y-3 text-sm">
                <li>
                  <a href={`tel:${tel}`} className="inline-flex items-center gap-3 font-semibold hover:text-ink">
                    <span className="grid size-9 place-items-center rounded-full bg-white/15"><Phone aria-hidden className="size-4" /></span>{site.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 font-semibold hover:text-ink">
                    <span className="grid size-9 place-items-center rounded-full bg-white/15"><Mail aria-hidden className="size-4" /></span>{site.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative lg:my-10 lg:-ml-10 [&_[data-form-key]]:max-w-none [&_[data-form-key]]:rounded-[2rem] [&_[data-form-key]]:shadow-2xl [&_[data-form-key]]:shadow-primary-strong/10">
            {nestedBlocks(data('enquiryForm', { formKey: 'quick-enquiry', variant: 'inline', tone: 'default', spacing: 'none', anchorId: 'course-enquiry-form' }))}
          </div>
        </div>
      </section>

      <RenderBlocks blocks={[data('cta', { heading: `Ready to *start*?`, body: course.title, variant: 'banner', tone: 'ink', links: ctas })]} ctx={ctx} />

      <div className={cn('fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden')}>
        {ctas.map((c) => (
          <div key={c.href} className="flex-1 [&_a]:w-full"><CtaLink cta={c} /></div>
        ))}
      </div>
      <CourseJsonLd course={course} />
    </article>
  )
}
