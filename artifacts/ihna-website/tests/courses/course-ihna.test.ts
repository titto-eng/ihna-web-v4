import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { campusNames, ihnaSlotForLabel, kindOf, prepareIhnaCourse } from '../../scripts/import/course-ihna'
import { deliveryModesOf, durationLookupName, planIhnaCourse } from '../../scripts/import/ihna/wp-courses'
import { loadGroups } from '../../scripts/import/ihna/groups'
import { parseCoursePage } from '../../scripts/import/steps/course-live'
import { parseStaffList, parseStaffProfile } from '../../scripts/import/ihna/staff'
import { COURSE_SIBLINGS } from '@/content/course-siblings'

// Pure tests of the IHNA course mapping over the 21 real bodies (../inventory/data/ihna/courses.json). No database.
type Wp = { id: number; slug: string; link: string; title: { rendered: string }; content: string; modified: string }
const courses = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../inventory/data/ihna/courses.json'), 'utf8')) as Wp[]
const bySlug = (slug: string) => courses.find((c) => c.slug === slug)!
const plans = new Map(courses.map((c) => [c.slug, planIhnaCourse(c, new URL(c.link).pathname)]))

describe('IHNA course layouts', () => {
  it('has the 21 course bodies in three layouts', () => {
    expect(courses).toHaveLength(21)
    const kinds = courses.map((c) => kindOf(c.content))
    expect(kinds.filter((k) => k === 'v2')).toHaveLength(15)
    expect(kinds.filter((k) => k === 'short')).toHaveLength(4)
    expect(kinds.filter((k) => k === 'legacy')).toHaveLength(2)
  })

  it('places >= 98% of the source words of every body, with nothing left outside a section', () => {
    for (const [slug, p] of plans) {
      expect(p.coverage, slug).toBeGreaterThanOrEqual(0.98)
      expect(p.leftOverChars, slug).toBe(0)
    }
  })

  it('labels map to slots; every label of the 21 bodies is known', () => {
    const cases: [string, string][] = [
      ['Why study Diploma of Nursing at IHNA?', 'overview'], ['Mode of Delivery', 'overview'], ['Course Overview', 'overview'],
      ['Fees &amp; Funding', 'fees'], ['Fees and Scholarships', 'fees'], ['VET Student Loans', 'fees'], ['Entry Requirements', 'entry'],
      ['Course Structure', 'structure'], ['How is the Course Assessed?', 'structure'], ['Professional Experience Placement (PEP)', 'placements'],
      ['Articulation Pathways', 'pathways'], ['Recognition of Prior Learning (RPL) &amp; Credit Transfer (CT)', 'pathways'],
      ['Possible Career Outcomes', 'careers'], ['Frequently asked questions', 'faq'], ['Ready to Apply?', 'additional'],
      ['Campuses', 'additional'], ['Course Start Dates', 'removed'], ['Course Start Date', 'removed'],
    ]
    for (const [label, slot] of cases) expect(ihnaSlotForLabel(label).slot, label).toBe(slot)
    for (const [slug, p] of plans) expect(p.mapped.flags.filter((f) => f.startsWith('unknown-tab:')), slug).toEqual([])
  })

  it('cuts the phone duplicate of the tabs, the template sections and the inline CSS/JS', () => {
    const p = prepareIhnaCourse(bySlug('diploma-of-nursing').content)
    const kinds = p.removed.map((r) => r.kind)
    expect(kinds.some((k) => /phone duplicate/.test(k))).toBe(true)
    expect(kinds.some((k) => /template sections/.test(k))).toBe(true)
    const all = JSON.stringify(plans.get('diploma-of-nursing')!.sections)
    expect(all).not.toMatch(/<style|<script|class=|style=|Talk to an/)
    // the tab text appears once, not twice (desktop tabs + phone accordion)
    expect(all.match(/120 hours in the aged-care setting/g)?.length).toBe(1)
  })

  it('removes the expanded start-date output and switches the startDates block on instead (DEC-7)', () => {
    expect(plans.get('diploma-of-nursing')!.showStartDates).toBe(true)
    expect(plans.get('provide-first-aid')!.showStartDates).toBe(true)
    expect(plans.get('provide-cardiopulmonary-resuscitation')!.showStartDates).toBe(false)
    for (const [slug, p] of plans) expect(JSON.stringify(p.sections), slug).not.toMatch(/date-card|Course Start Date/)
  })

  it('reads the key facts from the masthead and the short-course table', () => {
    const don = plans.get('diploma-of-nursing')!.facts
    expect(don).toMatchObject({ code: 'HLT54121', duration: '18 Months', placement: '400 Hours', audience: 'domestic', siblingPath: '/courses/diploma-of-nursing-int/' })
    expect(don.campuses).toEqual(['Melbourne CBD', 'Sydney', 'Perth', 'Brisbane'])
    expect(don.fee).toEqual({ value: '$24,000', detail: 'For 2026 domestic intakes at Melbourne, Sydney and Brisbane' })
    const intl = plans.get('diploma-of-nursing-int')!.facts
    expect(intl).toMatchObject({ audience: 'international', cricos: '108323F', siblingPath: '/courses/diploma-of-nursing/' })
    const cpr = plans.get('provide-cardiopulmonary-resuscitation')!.facts
    expect(cpr).toMatchObject({ duration: '4 Hours', deliveryMode: 'Blended', fee: { value: '$80.00', detail: null } })
    expect(plans.get('certificate-iii-in-individual-support-ageing-and-disability')!.facts.fee).toEqual({ value: '$2,500', detail: 'Pay Upfront: $2,250' })
    expect(plans.get('diploma-of-community-service-to-bachelor-of-social-work')!.facts.fee?.value).toBe('$90,000')
  })

  it('the student-type switch links equal src/content/course-siblings.ts', () => {
    const fromBodies: Record<string, string> = {}
    for (const [slug, p] of plans) {
      if (p.facts.siblingPath && p.facts.audience === 'domestic') fromBodies[slug] = p.facts.siblingPath.replace(/^\/courses\/|\/$/g, '')
      if (p.facts.siblingPath && p.facts.audience === 'international') expect(COURSE_SIBLINGS[p.facts.siblingPath.replace(/^\/courses\/|\/$/g, '')], slug).toBe(slug)
    }
    expect(fromBodies).toEqual(COURSE_SIBLINGS)
  })

  it('helpers: campus names, delivery modes, duration lookups', () => {
    expect(campusNames('Melbourne, Sydney, Perth and Brisbane')).toEqual(['Melbourne CBD', 'Sydney', 'Perth', 'Brisbane'])
    expect(campusNames('Melbourne (Heidelberg) · Perth')).toEqual(['Heidelberg', 'Perth'])
    expect(deliveryModesOf('Blended (Sydney & Perth) · Face to Face & Blended (Melbourne)')).toEqual(['Face to Face', 'Blended'])
    expect(deliveryModesOf('Online theory with face to face Simulation workshop')).toEqual(['Blended'])
    expect(deliveryModesOf('Online')).toEqual(['Online'])
    expect(durationLookupName('18 Months')).toBe('18 Months')
    expect(durationLookupName('Online theory: 10-12 hours · On-campus practical: 6 hours')).toBeNull()
  })
})

describe('IHNA lookups seed (seeds/ihna-course-groups.json)', () => {
  const groups = loadGroups()
  it('assigns every course a school, and the schools follow the Courses menu', () => {
    expect(Object.keys(groups.courses).sort()).toEqual(courses.map((c) => c.slug).sort())
    expect(groups.categories.map((c) => c.name)).toEqual([
      'IHNA School of Nursing', 'IHNA School of Community Services', 'IHNA School of Allied Health and Human Services', 'IHNA Package Courses', 'First Aid', 'Other Courses',
    ])
    const count = (school: string) => Object.values(groups.courses).filter((g) => g.school === school).length
    expect(groups.categories.map((c) => count(c.slug))).toEqual([3, 4, 8, 1, 4, 1])
  })

  it('levels and interests match the live course finder (course-urls.json) for every course it lists', () => {
    const finder = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../ihna-web-2.0/course-urls.json'), 'utf8')) as Record<string, { id: string; name: string; url?: string }[]>
    const levelOf = Object.fromEntries(groups.levels.map((l) => [String(l.legacyId), l.slug]))
    const interestOf = Object.fromEntries(groups.disciplines.map((d) => [String(d.legacyId), d.slug]))
    let checked = 0
    for (const [key, list] of Object.entries(finder)) {
      const m = /^sel3_(\d)_(\d)$/.exec(key)
      if (!m) continue
      for (const item of list) {
        const g = groups.courses[item.url ?? '']
        if (!g) continue // listed by the finder but not a course page here (e.g. retired units)
        if (m[1] === '1') expect(g.level, item.url).toBe(levelOf[m[2]])
        else expect(g.discipline, item.url).toBe(interestOf[m[2]])
        checked++
      }
    }
    expect(checked).toBeGreaterThanOrEqual(20)
  })
})

describe('live page readers', () => {
  it('reads kh_id from the brochure form, then the quick-enquiry field, never the feedback form post id', () => {
    const page = (brochure: string, quick: string) =>
      `<meta property="og:image" content="https://ihna.edu.au/wp-content/uploads/2022/01/don-thumb.jpg" />
       <form id="enquiry"><input type="hidden" name="course_id" id="course" value="${quick}" /></form>
       <form id="brchHndbk_enquiry"><input type="hidden" name="course_id" value="${brochure}" /></form>
       <form id="feed_enquiry"><input type="hidden" name="course_id" value="2152"></form>`
    expect(parseCoursePage(page('363', ''))).toEqual({ khId: 363, khSource: 'brochure-form', heroImage: 'wp-content/uploads/2022/01/don-thumb.jpg' })
    expect(parseCoursePage(page('', '428'))).toMatchObject({ khId: 428, khSource: 'form' })
    expect(parseCoursePage(page('', ''))).toMatchObject({ khId: null, khSource: null })
  })

  it('reads the staff directory order and team, and a profile without its email', () => {
    const list = parseStaffList(`<h2>Our Academic Management Team</h2><h3>Our Academic Staff</h3>
      <div class="col-4"><a href="/staff-profile/?id=33">View profile</a></div><div class="col-4"><a href="/staff-profile/?id=35">View profile</a></div>
      <h3>Management Team</h3><div class="col-4"><a href="/staff-profile/?id=19">View profile</a></div><a href="/academic-staff/?cpage=8">8</a>`)
    expect(list).toEqual({ pages: 8, cards: [{ id: 33, team: 'academic', order: 0 }, { id: 35, team: 'academic', order: 1 }, { id: 19, team: 'management', order: 2 }] })
    const p = parseStaffProfile(`<div class="stProf"><img class="profImage" src="/wp-content/themes/mwt-ihna/assets/images/academic-staff/a.webp"/>
      <p class="stDesig"><small>Academic Director</small></p><h2 class="stNme">Dr A Person</h2>
      <p class="stMail"><span>email: </span><a class="mailID" href="mailto:a@example.com">a@example.com</a>
      <a class="sch_btn" href="">Go</a><a class="orcidID" href="https://orcid.org/0000-0002-0767-5348">x</a></p>
      <a href="" class="linkedInBtn d-none"></a><div class="stprofDet"><p>Bio one.</p><p>Bio two.</p></div></div>`)
    expect(p).toEqual({
      name: 'Dr A Person', position: 'Academic Director', bio: 'Bio one.\n\nBio two.', orcid: 'https://orcid.org/0000-0002-0767-5348', googleScholar: null, linkedin: null,
      photoSrc: '/wp-content/themes/mwt-ihna/assets/images/academic-staff/a.webp',
    })
    expect(JSON.stringify(p)).not.toContain('@')
  })
})
