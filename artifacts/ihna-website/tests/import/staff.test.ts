import { describe, expect, it } from 'vitest'
import { countSourceEntries, parseProfileScript, parseStaffPage } from '../../scripts/import/lib/staff-parse'
import { staffUnchanged, type StaffData } from '../../scripts/import/steps/staff'

// Staff profile parsing (30-import §7.2 step 4). The inline-script arrays are read by a literal-only acorn walker, never evaluated.
const SCRIPT = `
    // Research Outputs Data
    const researchData = [
        { category: "JOURNAL ARTICLE", title: "Paper one", authors: "A, B (2020)", year: "2020", journal: "J1", articleLink: "https://doi.org/1", viewLink: "https://doi.org/1", description: "" },
        { "category": "CONFERENCE PAPER", "title": "Paper two", "authors": "A", "year": "2021", "journal": "C2" },
    ];
    // // Commented out
    // const grantsData = [ { title: "ignored" } ];
    const grantsData = [];
    const activitiesData = [{ "category": "Award", "title": "Gold medal", "detail": "University", "year": "2024" }, { "category": "Talk", "title": "Keynote", "detail": "", "year": "2025" }];
    const supervisionData = [
        { role: "Principal", title: "Thesis", institution: "IHM", year: "2023" }, // trailing note
        // { role: "Old", title: "Hidden", institution: "X", year: "2001" },
    ];
    const itemsPerPage = 10;`

const PAGE = (script = SCRIPT) => `
<main><section id="profile-page"><div class="row">
 <div class="personal-details-box"><div class="profile-img-box"><img src="/wp-content/themes/mwt-ihm/assets/images/p.webp" class="img-fluid" alt=""></div>
  <div class="details"><h4 class="text-light">Dr Jane Citizen</h4><p class="xsm-text italic-text">PhD; MNurs</p>
   <p><svg><path d="M0"/></svg><a href="https://orcid.org/0000-0001-2345-6789">0000-0001-2345-6789</a></p>
   <p class="designation-text">Lecturer, School of Nursing</p>
   <p><a href="mailto:jane.citizen@ihm.edu.au">jane.citizen@ihm.edu.au</a></p><p><a href="tel:0431030950">call</a></p>
   <p><a href="https://scholar.google.com/citations?user=abc">Google Scholar</a></p><p><a href="https://www.linkedin.com/in/jane">LinkedIn</a></p></div></div>
 <div class="tab-content"><div class="tab-pane" id="about"><div class="details-container"><h4 class="tab-title">BIO</h4><p>First paragraph.</p><p>Second   paragraph.</p>
   <!-- <p>commented bio</p> --></div></div></div>
</div></section></main><script>${script}</script>`

describe('staff-parse', () => {
  it('reads the four arrays with a literal-only walker (quoted or bare keys, comments, empty arrays)', () => {
    const rows = parseProfileScript(SCRIPT)
    expect(rows.research).toHaveLength(2)
    expect(rows.research?.[0]).toMatchObject({ category: 'JOURNAL ARTICLE', title: 'Paper one', journal: 'J1', articleLink: 'https://doi.org/1' })
    expect(rows.research?.[0]).not.toHaveProperty('description') // empty strings are dropped
    expect(rows.grants).toEqual([])
    expect(rows.activities).toHaveLength(2)
    expect(rows.supervision).toEqual([{ role: 'Principal', title: 'Thesis', institution: 'IHM', year: '2023' }])
  })

  it('counts entries independently and agrees with the walker, including one-line arrays and commented-out arrays', () => {
    const counts = countSourceEntries(SCRIPT)
    expect(counts).toEqual({ research: 2, grants: 0, activities: 2, supervision: 1 })
    const rows = parseProfileScript(SCRIPT)
    expect([rows.research?.length, rows.grants?.length, rows.activities?.length, rows.supervision?.length]).toEqual([2, 0, 2, 1])
  })

  it('refuses anything that is not a literal (never evaluates)', () => {
    expect(() => parseProfileScript('const researchData = [{ title: process.exit(1) }]')).toThrow(/non-literal/)
    expect(() => parseProfileScript('const researchData = [{ [k]: "x" }]')).toThrow(/non-literal/)
    expect(() => parseProfileScript('const researchData = [{ title: `a${b}` }]')).toThrow(/template literal/)
  })

  it('extracts name, position, links and bio from a script-variant page and drops email and phone', () => {
    const s = parseStaffPage(PAGE())
    expect(s).toMatchObject({
      variant: 'script', name: 'Dr Jane Citizen', postNominals: 'PhD; MNurs', position: 'Lecturer, School of Nursing',
      orcid: 'https://orcid.org/0000-0001-2345-6789', googleScholar: 'https://scholar.google.com/citations?user=abc', linkedin: 'https://www.linkedin.com/in/jane',
      photoSrc: '/wp-content/themes/mwt-ihm/assets/images/p.webp', personalContactsDropped: 2,
    })
    expect(s.bio).toBe('First paragraph.\n\nSecond paragraph.')
    expect(s.research).toHaveLength(2)
    expect(JSON.stringify(s)).not.toMatch(/jane\.citizen@|0431030950|commented bio/)
  })

  it('reads the static variant (research boxes in the tab pane) and falls back to the page title for the name', () => {
    const html = PAGE('').replace('<h4 class="text-light">Dr Jane Citizen</h4>', '').replace(
      '<div class="tab-content">',
      `<div class="tab-content"><div class="tab-pane" id="reasearchOutputs"><div class="reasearch-output-box"><p class="category-text">JOURNAL ARTICLE</p>
        <p class="journal-title">Static paper</p><p class="authors-name">Citizen J</p><div class="link-container"><a href="https://x.org/a">Article details</a><a href="https://x.org/v">View Article</a></div></div></div>`,
    )
    const s = parseStaffPage(html, 'Dr Jane Citizen')
    expect(s.variant).toBe('static')
    expect(s.nameFromFallback).toBe(true)
    expect(s.name).toBe('Dr Jane Citizen')
    expect(s.research).toEqual([{ category: 'JOURNAL ARTICLE', title: 'Static paper', authors: 'Citizen J', articleLink: 'https://x.org/a', viewLink: 'https://x.org/v' }])
  })
})

describe('staffUnchanged (the step skips a doc that already holds the parsed profile)', () => {
  const data: StaffData = {
    name: 'Dr Jane Citizen', position: 'Lecturer', postNominals: 'PhD', bio: 'First.\n\nSecond.', linkedin: 'https://www.linkedin.com/in/jane', googleScholar: '', orcid: '',
    research: [{ category: 'JOURNAL ARTICLE', title: 'Paper one', year: '2020' }], grants: [], activities: [{ category: 'Award', title: 'Gold medal' }], supervision: [],
    slug: 'dr-jane-citizen', legacyId: 4242, active: true,
  }
  // what Payload returns at depth 0: row ids, nulls for empty text, defaults, timestamps, fields the step does not own
  const stored = {
    id: 7, _status: 'published', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-02T00:00:00.000Z', photo: 31, school: null, email: null, sortOrder: 0, courses: [12],
    name: 'Dr Jane Citizen', position: 'Lecturer', postNominals: 'PhD', bio: 'First.\n\nSecond.', linkedin: 'https://www.linkedin.com/in/jane', googleScholar: null, orcid: null,
    research: [{ id: '68f0a1', category: 'JOURNAL ARTICLE', title: 'Paper one', authors: null, year: '2020', journal: null }], grants: [], activities: [{ id: '68f0a2', category: 'Award', title: 'Gold medal', detail: null }], supervision: [],
    slug: 'dr-jane-citizen', legacyId: 4242, active: true,
  }

  it('is true when the stored doc equals the parsed profile apart from ids, nulls and fields the step does not write', () => {
    expect(staffUnchanged(stored, data)).toBe(true)
  })

  it('is false for a new person, a draft, or any changed text, link or list row', () => {
    expect(staffUnchanged(undefined, data)).toBe(false)
    expect(staffUnchanged({ ...stored, _status: 'draft' }, data)).toBe(false)
    expect(staffUnchanged({ ...stored, bio: 'Edited in the admin.' }, data)).toBe(false)
    expect(staffUnchanged(stored, { ...data, orcid: 'https://orcid.org/0000-0001-2345-6789' })).toBe(false)
    expect(staffUnchanged(stored, { ...data, research: [...data.research, { category: 'BOOK', title: 'New chapter' }] })).toBe(false)
    expect(staffUnchanged({ ...stored, active: false }, data)).toBe(false)
  })
})
