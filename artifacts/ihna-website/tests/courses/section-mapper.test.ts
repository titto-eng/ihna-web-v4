import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { extract } from '../../scripts/import/html-to-blocks'
import { KH_EVIDENCE, resolveKhId, SYNTHETIC_KH_IDS, TEST_COURSE_WP_IDS } from '../../scripts/import/kh-id'
import { hoist } from '../../scripts/import/steps/wp-courses'
import { deliveryName, durationMonths, levelName, schoolOf } from '../../scripts/import/steps/lookups'
import { introParagraph, mapCourse, prepareCourseHtml, slotForLabel, wordCoverage, type Proto } from '../../scripts/import/section-mapper'

const courses = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../inventory/data/ihm/courses.json'), 'utf8')) as {
  id: number; slug: string; link: string; content: string
}[]
const byId = (id: number) => courses.find((c) => c.id === id)!

function mapped(id: number) {
  const c = byId(id)
  const prepared = prepareCourseHtml(c.content)
  const ex = extract(prepared.html, { url: c.link, wpType: 'courses' })
  const m = mapCourse(ex.layout as Proto[], { switcherDefinition: prepared.facts.switcherDefinition, testimonials: prepared.testimonials })
  return { prepared, ex, m }
}

describe('tab label vocabulary (30-import §7.2 step 6)', () => {
  const cases: [string, string][] = [
    ['Course Details', 'overview'], ['Learning Objectives', 'overview'],
    ['Admission Requirements', 'entry'], ['Entry Requirement', 'entry'], ['Inherent Requirements', 'entry'],
    ['Course Units', 'structure'], ['Course Structure &amp; Fees', 'structure'], ['Training Details', 'structure'],
    ['Where will this take me?', 'careers'], ['Career Outcomes', 'careers'], ['Employment opportunities for Graduates', 'careers'],
    ['Professional Experience Placement', 'placements'], ['Social work field education', 'placements'],
    ['Pathways', 'pathways'], ['Credit Transfer', 'pathways'],
    ['Frequently Asked Questions', 'faq'],
    ['FEE-HELP', 'fees'], ['Fees &amp; Scholarships', 'fees'], ['Fees and Charges', 'fees'],
    ['Course Start Dates', 'removed'], ['Start Date', 'removed'], ['Start Dates', 'removed'],
    ['Are you Ready to Apply?', 'additional'], ['What you Need to Know', 'additional'], ['Institutional Partnership', 'additional'],
    ['Professional Recognition', 'additional'], ['Australian Nursing Registration Process', 'additional'],
  ]
  for (const [label, slot] of cases) it(`${label} -> ${slot}`, () => expect(slotForLabel(label).slot).toBe(slot))
  it('an unknown label goes to additional and is not "known"', () => {
    expect(slotForLabel('Quick Tips')).toEqual({ slot: 'additional', known: false, extension: false })
  })
})

describe('start dates and shortcode output (30 §7.1, 50 §7)', () => {
  it('[StartDates] is never live: every occurrence sits inside an HTML comment', () => {
    const live = courses.map((c) => prepareCourseHtml(c.content).startDates)
    expect(live.every((s) => s.live === 0)).toBe(true)
    expect(live.filter((s) => s.tokens > 0)).toHaveLength(20)
  })

  it('/courses/diabetes-nursing/ has the named slots and no start-date list text', () => {
    const { m } = mapped(868)
    const slots = m.sections.map((s) => s.slot)
    for (const s of ['overview', 'entry', 'structure', 'careers', 'faq', 'fees']) expect(slots).toContain(s)
    expect(JSON.stringify(m.sections)).not.toMatch(/start-date-ul/)
    // the census table is gone from the body and replaced by a data block in the fees slot
    const fees = m.sections.find((s) => s.slot === 'fees')!
    expect(fees.blocks.at(-1)).toEqual({ blockType: 'courseData', kind: 'censusDates' })
    expect(JSON.stringify(m.sections)).not.toMatch(/Census Date/)
    // the manager cards are replaced by the data block; no email survives (rule 4)
    expect(m.sections.find((s) => s.slot === 'additional')!.blocks.at(-1)).toEqual({ blockType: 'courseData', kind: 'courseManagers' })
    expect(JSON.stringify(m.sections)).not.toMatch(/helen\.almond|parul@/) // manager emails; a role inbox in running text (ihmaccounts@) is not personal data
  })

  it('the "Course Start Dates" tab is removed, not placed', () => {
    const { m } = mapped(868)
    expect(m.tabs.find((t) => t.label === 'Course Start Dates')?.slot).toBe('removed')
    expect(m.removedStartDates).toBeGreaterThan(0)
  })

  it('page chrome becomes fields: facts, buttons, switcher', () => {
    const { prepared, m } = mapped(3767)
    expect(prepared.facts).toMatchObject({ deliveryMode: 'Blended Delivery', aqfLevel: '07', cricos: '118071E', campuses: ['Melbourne', 'Sydney', 'Brisbane', 'Perth'] })
    expect(prepared.facts.duration).toMatch(/^3 Year full-time/)
    expect(prepared.facts.applyLink).toMatch(/courses\.ihm\.edu\.au\/admissions\/apply/)
    expect(prepared.facts.siblingInternationalPath).toBe('/courses/bachelor-of-nursing-international/')
    expect(m.chromeCtasDropped).toBeGreaterThan(0)
    expect(m.sections.find((s) => s.slot === 'entry')?.blocks.length).toBeGreaterThan(0) // the student-type definition sentence
  })
})

describe('coverage (DEC-15f)', () => {
  it('every one of the 26 bodies keeps >= 98% of its source words after intended removals', () => {
    for (const c of courses) {
      const { prepared, m } = mapped(c.id)
      const wc = wordCoverage(prepared.html, m.sections.flatMap((s) => s.blocks), [...m.tabs.map((t) => t.label), ...m.sections.map((s) => s.title), ...m.chromeCtaLabels])
      expect(wc.coverage, `${c.slug}: missing ${wc.missing.slice(0, 8).join(' ')}`).toBeGreaterThanOrEqual(0.98)
    }
  })
  it('NCLEX body (malformed `<b/>`) still yields its tab set', () => {
    const { m } = mapped(305)
    expect(m.tabs.length).toBeGreaterThanOrEqual(8)
    expect(m.sections.map((s) => s.slot)).toEqual(expect.arrayContaining(['structure', 'entry', 'faq', 'fees']))
  })
  it('a body without tabs is placed by its own headings', () => {
    const { m } = mapped(5463)
    expect(m.flags).toContain('no-course-tabs')
    expect(m.sections.map((s) => s.slot)).toEqual(expect.arrayContaining(['overview', 'entry']))
  })
})

describe('kh_id stopgap (DEC-8)', () => {
  it('resolves exactly the courses the old theme proves, each with evidence', () => {
    expect(KH_EVIDENCE.map((e) => e.wpId).sort((a, b) => a - b)).toEqual([96, 305, 307, 340, 837, 838, 858, 862, 1547, 6355])
    for (const e of KH_EVIDENCE) expect(e.evidence.some((x) => /\.php:\d+/.test(x) || /in-body/.test(x))).toBe(true)
    expect(resolveKhId(96)?.khId).toBe(41)
    expect(resolveKhId(868)).toBeNull()
  })
  it('synthetic fixture ids never collide with real ones and never belong to a resolved course', () => {
    for (const [wpId, kh] of Object.entries(SYNTHETIC_KH_IDS)) {
      expect(kh).toBeGreaterThanOrEqual(9000)
      expect(resolveKhId(Number(wpId))).toBeNull()
    }
    expect(TEST_COURSE_WP_IDS).toEqual([1476, 1478])
  })
})

describe('shared fragments (DEC-15a, DEC-22)', () => {
  it('hoists only what appears in every course, once', () => {
    const plans = [1, 2, 3].map((i) => ({
      wp: { id: i }, sections: [{ slot: 'additional', title: '', blocks: [{ blockType: 'cta', label: 'Same', href: '/x/' }, { blockType: 'cta', label: `Only ${i}`, href: '/y/' }] }],
    })) as unknown as Parameters<typeof hoist>[0]
    const { shared } = hoist(plans, 3)
    expect(shared).toEqual([{ blockType: 'cta', label: 'Same', href: '/x/' }])
    expect(hoist(plans.slice(0, 2), 3).shared).toEqual([])
  })
})

describe('provisional lookup derivation', () => {
  it('names and months', () => {
    expect(levelName('07')).toBe('AQF Level 7')
    expect(deliveryName('Blended Delivery')).toBe('Online (Blended)')
    expect(deliveryName('On Campus')).toBe('On Campus')
    expect(durationMonths('2 years full time 4 years part time')).toBe(24)
    expect(durationMonths('26 Weeks')).toBe(6)
    expect(schoolOf('Bachelor of Social Work')).toBe('School of Social Work')
    expect(schoolOf('Master of Nursing')).toBe('School of Nursing')
  })
})

describe('hero subheading', () => {
  it('is the first real intro paragraph (>= 40 words), never toggle or facts-strip text', () => {
    for (const c of courses) {
      const { m } = mapped(c.id)
      const sub = introParagraph(m.sections)
      if (!sub) continue
      expect(sub.split(/\s+/).length, c.slug).toBeGreaterThanOrEqual(40)
      expect(sub, c.slug).not.toMatch(/Select Student Type|considers you|Delivery Mode:|AQF Level:|Course Duration|CRICOS/i)
    }
    expect(introParagraph(mapped(10402).m.sections)).toMatch(/^The Bachelor of Nursing program at IHM/)
  })
  it('the international-student definition sits in the entry slot', () => {
    expect(mapped(10402).m.sections.find((s) => s.slot === 'entry')?.blocks.some((b) => /considers you an/.test(JSON.stringify(b)))).toBe(true)
  })
})
