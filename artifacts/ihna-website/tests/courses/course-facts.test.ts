import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CourseFacts, courseFactsFor, hasCourseFacts, type FactsCourse } from '@/components/course/CourseFacts'
import { CourseFacts as CourseFactsBlock } from '@/blocks/courseFacts/Component'

// Key facts (courses.facts / factsInternational): resolution rules and the shared component. No database.

const lookups: FactsCourse = {
  studentType: 'both',
  durations: [{ name: '3 years full-time' }],
  deliveryModes: [{ name: 'On Campus' }],
  levels: [{ name: 'AQF Level 7' }],
  campuses: [{ name: 'Melbourne' }, { name: 'Sydney' }],
  units: 24,
  cricosCode: '118071E',
  fees: { displayAmount: '$12,000 per semester', note: 'Indicative, 2027.' },
}
const course = (over: Partial<FactsCourse> = {}): FactsCourse => ({ ...lookups, ...over })
const byKey = (c: FactsCourse, a: 'domestic' | 'international') => Object.fromEntries(courseFactsFor(c, a).map((f) => [f.key, f]))
const html = (c: FactsCourse, props: Record<string, unknown> = {}) => renderToStaticMarkup(createElement(CourseFacts, { course: c, ...props }))

describe('courseFactsFor: fallbacks', () => {
  it('blank values fall back to the lookups, units, cricosCode and fees (note as the fee detail), in display order', () => {
    const facts = courseFactsFor(course(), 'domestic')
    expect(facts.map((f) => f.key)).toEqual(['duration', 'units', 'delivery', 'level', 'campuses', 'cricos', 'fee'])
    const f = byKey(course(), 'domestic')
    expect(f.duration.value).toBe('3 years full-time')
    expect(f.units.value).toBe('24 units')
    expect(f.delivery.value).toBe('On Campus')
    expect(f.level.value).toBe('AQF Level 7')
    expect(f.campuses.value).toBe('Melbourne · Sydney')
    expect(f.cricos.value).toBe('118071E')
    expect(f.fee).toMatchObject({ label: 'Fees', value: '$12,000 per semester', detail: 'Indicative, 2027.' })
  })
  it('a marketing value wins over the fallback, keeps its own detail, and drops the fallback detail', () => {
    const c = course({ facts: { duration: { value: '3 years', detail: 'or part-time equivalent' }, fee: { value: 'From $12,000' } } })
    const f = byKey(c, 'domestic')
    expect(f.duration).toMatchObject({ value: '3 years', detail: 'or part-time equivalent' })
    expect(f.fee.value).toBe('From $12,000')
    expect(f.fee.detail).toBeUndefined()
  })
  it('facts with no value after the fallback are skipped; ids (unpopulated lookups) are ignored', () => {
    const c: FactsCourse = { studentType: 'domestic', durations: [7], units: null, cricosCode: '  ', fees: null }
    expect(courseFactsFor(c, 'domestic')).toEqual([])
    expect(hasCourseFacts(c)).toBe(false)
    expect(byKey({ units: 1 }, 'domestic').units.value).toBe('1 unit')
  })
})

describe('courseFactsFor: show switch', () => {
  it('show=false removes a fact even when it has a value or a fallback', () => {
    const c = course({ facts: { cricos: { show: false }, duration: { show: false, value: '3 years' } } })
    const keys = courseFactsFor(c, 'domestic').map((f) => f.key)
    expect(keys).not.toContain('cricos')
    expect(keys).not.toContain('duration')
    expect(keys).toContain('units')
  })
  it('show null/undefined (rows saved before the field existed) counts as shown', () => {
    expect(byKey(course({ facts: { units: { show: null, value: null } } }), 'domestic').units.value).toBe('24 units')
  })
})

describe('courseFactsFor: international override', () => {
  const both = course({
    facts: { fee: { value: '$9,000 per semester' }, duration: { value: '3 years', detail: 'or part-time equivalent' } },
    factsInternational: { fee: { value: '$15,000 per semester', detail: 'international tuition' }, cricos: { show: false }, duration: { detail: 'intl detail only' } },
  })
  it('factsInternational wins for the international audience when it has a value or an explicit show=false', () => {
    const intl = byKey(both, 'international')
    expect(intl.fee).toMatchObject({ value: '$15,000 per semester', detail: 'international tuition' })
    expect(intl.cricos).toBeUndefined()
  })
  it('an international sub-group with neither a value nor show=false falls through to facts', () => {
    expect(byKey(both, 'international').duration).toMatchObject({ value: '3 years', detail: 'or part-time equivalent' })
  })
  it('the domestic audience ignores factsInternational', () => {
    const dom = byKey(both, 'domestic')
    expect(dom.fee.value).toBe('$9,000 per semester')
    expect(dom.cricos.value).toBe('118071E')
  })
  it('a domestic-only (or international-only) course ignores factsInternational for every audience', () => {
    for (const studentType of ['domestic', 'international'] as const) {
      const c = { ...both, studentType }
      expect(byKey(c, 'international').fee.value).toBe('$9,000 per semester')
      expect(byKey(c, 'international').cricos.value).toBe('118071E')
    }
  })
})

describe('<CourseFacts>', () => {
  it('renders the BON dl: mono label, display value, muted detail', () => {
    const out = html(course({ studentType: 'domestic', facts: { duration: { value: '3 years full-time', detail: 'or part-time equivalent' } } }))
    expect(out.match(/<dl/g)).toHaveLength(1)
    expect(out).toContain('data-audience="domestic"')
    expect(out).toMatch(/<dt class="label-mono[^"]*">Duration<\/dt><dd class="display[^"]*">3 years full-time<\/dd><dd class="[^"]*text-muted-foreground">or part-time equivalent<\/dd>/)
    expect(out).not.toContain('data-audience-version')
  })
  it('a both-audience course with an international override renders one dl per audience behind the audience switch', () => {
    const out = html(course({ factsInternational: { fee: { value: '$15,000' } } }))
    expect(out.match(/<dl/g)).toHaveLength(2)
    expect(out).toContain('data-audience-version="domestic"')
    expect(out).toContain('data-audience-version="international"')
    expect(out).toContain('$15,000')
  })
  it('both audiences resolving to the same facts render a single dl without the switch wrapper', () => {
    const out = html(course())
    expect(out.match(/<dl/g)).toHaveLength(1)
    expect(out).not.toContain('data-audience-version')
  })
  it('audience pins one list; only narrows the facts; nothing to show renders nothing', () => {
    const c = course({ factsInternational: { fee: { value: '$15,000' } } })
    const intl = html(c, { audience: 'international', only: ['fee', 'duration'] })
    expect(intl.match(/<dl/g)).toHaveLength(1)
    expect(intl).toContain('$15,000')
    expect(intl).not.toContain('118071E')
    expect(html({ studentType: 'domestic' })).toBe('')
  })
  it('the courseFacts block wraps the same component and honours block.show and ctx.audience', () => {
    const c = { id: 1, ...course({ factsInternational: { fee: { value: '$15,000' } } }) }
    const render = (block: object, ctx: object) => renderToStaticMarkup(CourseFactsBlock({ block, ctx } as never) ?? createElement('i'))
    const out = render({ show: ['units'] }, { depth: 0, course: c, audience: 'international' })
    expect(out).toContain('data-course-block="courseFacts"')
    expect(out).toContain('24 units')
    expect(out).not.toContain('$15,000')
    expect(render({}, { depth: 0, course: { id: 2, studentType: 'domestic' } })).toBe('<i></i>')
  })
})
