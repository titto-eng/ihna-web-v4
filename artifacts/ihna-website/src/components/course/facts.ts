import type { Audience } from '@/blocks/types'
import { namesOf } from '@/components/templates/courseContext'

// Course key facts (duration, units, ...): marketing sets them per course in the CMS (`courses.facts`, and
// `courses.factsInternational` when the course serves both audiences); blanks fall back to the course's own fields.
// Pure: no React, no Payload, so the collection config, the component and scripts can all import it.

export const FACT_KEYS = ['duration', 'units', 'delivery', 'level', 'campuses', 'cricos', 'fee'] as const
export type FactKey = (typeof FACT_KEYS)[number]
export const FACT_LABELS: Record<FactKey, string> = {
  duration: 'Duration', units: 'Units', delivery: 'Delivery', level: 'Level', campuses: 'Campuses', cricos: 'CRICOS code', fee: 'Fees',
}

export type FactInput = { show?: boolean | null; value?: string | null; detail?: string | null } | null | undefined
export type FactsGroup = Partial<Record<FactKey, FactInput>> | null | undefined

/** The course fields the facts read (a `Course` from payload-types fits; depth >= 1 for lookup names). */
export type FactsCourse = {
  studentType?: 'domestic' | 'international' | 'both' | null
  facts?: FactsGroup
  factsInternational?: FactsGroup
  durations?: unknown
  deliveryModes?: unknown
  levels?: unknown
  campuses?: unknown
  units?: number | null
  cricosCode?: string | null
  fees?: { displayAmount?: string | null; note?: string | null } | null
}

export type ResolvedFact = { key: FactKey; label: string; value: string; detail?: string }

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/** What a fact shows when marketing left `value` blank. */
export function factFallback(course: FactsCourse, key: FactKey): { value: string; detail?: string } {
  switch (key) {
    case 'duration': return { value: namesOf(course.durations).join(' · ') }
    case 'delivery': return { value: namesOf(course.deliveryModes).join(' · ') }
    case 'level': return { value: namesOf(course.levels).join(' · ') }
    case 'campuses': return { value: namesOf(course.campuses).join(' · ') }
    case 'units': return { value: typeof course.units === 'number' && course.units > 0 ? `${course.units} ${course.units === 1 ? 'unit' : 'units'}` : '' }
    case 'cricos': return { value: clean(course.cricosCode) }
    case 'fee': return { value: clean(course.fees?.displayAmount), detail: clean(course.fees?.note) || undefined }
  }
}

/** Audiences a course page serves: one for a domestic- or international-only course, both for `both` (the default). */
export const audiencesOf = (course: Pick<FactsCourse, 'studentType'>): Audience[] =>
  course.studentType === 'domestic' ? ['domestic'] : course.studentType === 'international' ? ['international'] : ['domestic', 'international']

/**
 * The sub-group that controls `key` for `audience`: `factsInternational.<key>` when the course serves both audiences,
 * the page shows the international one and that sub-group has a value or is explicitly switched off; else `facts.<key>`.
 */
export function factSource(course: FactsCourse, audience: Audience, key: FactKey): FactInput {
  if (audience === 'international' && course.studentType === 'both') {
    const intl = course.factsInternational?.[key]
    if (intl && (intl.show === false || clean(intl.value))) return intl
  }
  return course.facts?.[key]
}

/** The facts to render, in display order: switched-off facts and facts with no value after the fallback are dropped. */
export function courseFactsFor(course: FactsCourse, audience: Audience = audiencesOf(course)[0]): ResolvedFact[] {
  return FACT_KEYS.flatMap((key): ResolvedFact[] => {
    const src = factSource(course, audience, key)
    if (src?.show === false) return []
    const own = clean(src?.value)
    const fb = own ? null : factFallback(course, key)
    const value = own || fb?.value || ''
    if (!value) return []
    const detail = clean(src?.detail) || fb?.detail
    return [{ key, label: FACT_LABELS[key], value, ...(detail ? { detail } : {}) }]
  })
}

/** One resolved list per audience the strip renders (`audience` pins one), each narrowed to `only` when given. */
export function factListsFor(course: FactsCourse, audience?: Audience | null, only?: readonly FactKey[] | null): { audience: Audience; facts: ResolvedFact[] }[] {
  return (audience ? [audience] : audiencesOf(course)).map((a) => {
    const facts = courseFactsFor(course, a)
    return { audience: a, facts: only?.length ? facts.filter((f) => only.includes(f.key)) : facts }
  })
}

/** True when the strip has at least one fact to show. */
export const hasCourseFacts = (course: FactsCourse, audience?: Audience | null, only?: readonly FactKey[] | null) =>
  factListsFor(course, audience, only).some((l) => l.facts.length > 0)
