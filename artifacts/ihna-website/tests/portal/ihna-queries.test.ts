import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { resetPortalPool } from '@/lib/portal/client'
import { censusAjaxBody, censusDisplayDate, idParam, invoiceLinkSignature, verifyInvoiceLink } from '@/lib/portal/ihna'
import * as q from '@/lib/portal/queries'
import { AS_OF, usePortalFixtureDb } from './env'

// IHNA-only reads against the portal-mysql fixture (docker/portal-fixtures/ihna.{schema,data}.sql). 50-portal-data §8 (IHNA).
beforeAll(() => usePortalFixtureDb())
afterAll(() => resetPortalPool())

describe('intake dates ([CourseStartDates], campus 8)', () => {
  it('upcoming semester 0/1 starts at campus 8, distinct, ascending; other campus, hidden, semester 2 and past rows excluded', async () => {
    expect(await q.intakeDates(363, AS_OF)).toEqual(['2026-11-09', '2026-12-07', '2027-02-08'])
    expect(await q.intakeDates(363, AS_OF, 1)).toEqual(['2026-11-16'])
    expect(await q.intakeDates(9201, AS_OF)).toEqual([])
  })
})

describe('monthly calendar (Q3) is campus 8 by default', () => {
  it('November 2026: only campus-8 batches', async () => {
    const nov = await q.intakeCalendar('2026-11-01', '2026-11-30', null, AS_OF)
    expect(nov.every((e) => e.campusId === 8)).toBe(true)
    expect(nov.map((e) => [e.date, e.khId, e.mode])).toEqual([['2026-11-09', 363, 'f2f']])
    const dec = await q.intakeCalendar('2026-12-01', '2026-12-31', null, AS_OF)
    expect(dec.map((e) => [e.date, e.khId, e.mode, e.campusName])).toEqual([['2026-12-07', 363, 'blended', 'Fixture Campus Eight']])
  })
})

describe('unit census pickers and table', () => {
  it('campuses: template rows, status 1-3, campus 2 excluded, by name', async () => {
    expect(await q.censusCampuses()).toEqual([{ id: 8, name: 'Fixture Campus Eight' }])
  })
  it('courses at campus 8: enabled, from 2018, by name', async () => {
    expect(await q.censusCourses(8)).toEqual([
      { id: 363, name: 'Diploma of Nursing', code: 'HLT54121' },
      { id: 9201, name: 'Fixture Census Course', code: 'FIX9201' },
    ])
    expect(await q.censusCourses(2)).toEqual([{ id: 9201, name: 'Fixture Census Course', code: 'FIX9201' }]) // the picker hides campus 2, the read does not
  })
  it('batches and semesters', async () => {
    expect(await q.censusBatches(8, 363)).toEqual([{ id: 6006, name: 'DN-2025-MAR' }, { id: 6001, name: 'DN-2026-NOV' }]) // by batch name
    expect(await q.censusBatches(8, 9201)).toEqual([{ id: 6007, name: 'FIX-2025-JUL' }]) // status 4 excluded
    expect(await q.censusSemesters(363, 6006)).toEqual([{ id: 1, name: 'Semester 1' }, { id: 2, name: 'Semester 2' }])
  })
  it('unit table: units of the semester, by census date; first timetable start; semester end; student rows ignored', async () => {
    const units = await q.censusUnits(363, 6006, 1)
    expect(units).toEqual([
      { year: 2025, unitCode: 'HLTENN035', start: '2025-03-03', end: '2025-08-29', census: '2025-04-11', eftslFactor: '0.0625' },
      { year: 2025, unitCode: 'HLTENN036', start: '2025-04-07', end: '2025-08-29', census: '2025-05-16', eftslFactor: '0.0500' },
      { year: 2025, unitCode: 'CHCDIV001', start: null, end: '2025-08-29', census: '2025-05-16', eftslFactor: '0.0500' },
    ])
    expect((await q.censusUnits(363, 6006, 2)).map((u) => u.unitCode)).toEqual(['HLTENN037'])
    const missing = await q.censusUnits(9201, 6007, 1)
    expect(missing).toEqual([{ year: 2025, unitCode: 'FIXU101', start: '2025-07-21', end: '2025-12-12', census: null, eftslFactor: '0.1250' }])
  })
  it('legacy JSON shape per depth, d-M-Y dates, " - " for none', async () => {
    const sel = { campus: 8, course: 363, batch: 6006, semester: 1 }
    const data = { campuses: await q.censusCampuses(), courses: await q.censusCourses(8), batches: await q.censusBatches(8, 363), semesters: await q.censusSemesters(363, 6006), units: await q.censusUnits(363, 6006, 1) }
    const body = censusAjaxBody(sel, data)
    expect(Object.keys(body)).toEqual(['courses', 'batches', 'semesters', 'details'])
    expect(body).toMatchSnapshot()
    expect(censusAjaxBody({ campus: 8 }, data)).toEqual({ courses: body.courses })
    expect(censusAjaxBody({}, data)).toEqual({})
    expect(censusDisplayDate(null)).toBe(' - ')
    expect(censusDisplayDate('2025-03-03')).toBe('03-Mar-2025')
  })
  it('id guard: only plain positive integers', () => {
    expect(idParam('8')).toBe(8)
    for (const bad of ["8' OR 1=1 --", '0', '-1', '1e3', '', undefined, '12345678901']) expect(idParam(bad)).toBeNull()
  })
})

describe('countries, packages, agents, handbook, hc course', () => {
  it('all enabled countries by name', async () => {
    expect((await q.countriesAll()).map((c) => c.name)).toEqual(['Australia', 'India', 'Nepal', 'New Zealand', 'Philippines'])
  })
  it('ihna_web_packages', async () => {
    const p = await q.webPackages()
    expect(p.map((x) => [x.id, x.khId])).toEqual([[1, 76], [2, 71], [3, 71], [4, 76], [5, 71], [7, 75]])
  })
  it('agents: current IHNA agents of the country, once each, agency fields only (no partner staff)', async () => {
    const india = await q.agentsByCountry(2, AS_OF)
    expect(india.map((a) => a.name)).toEqual(['Fixture Agency Alpha', 'Fixture Agency Delta'])
    expect(JSON.stringify(india)).not.toMatch(/contact\.person|Fixture Contact Person|00099/)
    expect(Object.keys(india[0]).sort()).toEqual(['address', 'address2', 'contactName', 'email', 'id', 'name', 'phone', 'postcode', 'state', 'suburb', 'website'])
    expect((await q.agentsByCountry(3, AS_OF)).map((a) => a.name)).toEqual(['Fixture Agency Gamma']) // expires today: still listed
    expect(await q.agentsByCountry(3, '2026-10-17')).toEqual([])
    expect(await q.agentsByCountry(404, AS_OF)).toEqual([])
  })
  it('handbook: type-1 document of the course, URL-encoded; none when the file is empty', async () => {
    expect(await q.handbookUrl(363)).toBe('https://ihna-prod.s3-ap-southeast-2.amazonaws.com/uploads/course_documents/Fixture%20Student%20Handbook.pdf')
    expect(await q.handbookUrl(9201)).toBeNull()
    expect(await q.handbookUrl(41)).toBeNull()
  })
  it('hc course row and course by kh id with its code', async () => {
    expect(await q.hcCourse(363)).toEqual({ id: 363, code: 'HLT54121', name: 'Diploma of Nursing', categoryId: 3, referFriend: 1 })
    expect(await q.hcCourse(1)).toBeNull()
    expect(await q.hcCourse(9203)).toBeNull() // disabled courses are not listed
    expect((await q.courseByKhId(363))?.courseCode).toBe('HLT54121')
  })

  it('hc course ids: the enabled courses only (the public endpoints\' allow-list)', async () => {
    const ids = await q.hcCourseIds()
    expect(ids).toEqual(expect.arrayContaining([363, 9201, 9202]))
    expect(ids).not.toContain(9203)
  })
})

describe('invoice for the pay form', () => {
  it('number and amount due incl. surcharge; nothing about the student', async () => {
    expect(await q.invoiceById(9901)).toEqual({ id: 9901, invoiceNumber: 'FIX-INV-9901', dueCents: 121851 })
    expect(await q.invoiceById(9902)).toEqual({ id: 9902, invoiceNumber: 'FIX-INV-9902', dueCents: 30000 })
    expect(await q.invoiceById(1)).toBeNull()
  })
  it('signed links only: no key, no or wrong signature, expired or too long-lived → refused', () => {
    const env = { PORTAL_INVOICE_LINK_KEY: 'fixture-key' }
    const now = Date.UTC(2026, 9, 21) // fixed clock
    const exp = now / 1000 + 7 * 86_400
    const sig = invoiceLinkSignature(9901, exp, 'fixture-key')
    expect(verifyInvoiceLink(9901, exp, sig, env, now)).toBe(true)
    expect(verifyInvoiceLink(9901, String(exp), sig, env, now)).toBe(true)
    expect(verifyInvoiceLink(9902, exp, sig, env, now)).toBe(false)
    expect(verifyInvoiceLink(9901, exp + 1, sig, env, now)).toBe(false) // exp is signed
    expect(verifyInvoiceLink(9901, exp, sig, {}, now)).toBe(false)
    expect(verifyInvoiceLink(9901, exp, null, env, now)).toBe(false)
    expect(verifyInvoiceLink(9901, exp, 'zz', env, now)).toBe(false)
    expect(verifyInvoiceLink(9901, null, sig, env, now)).toBe(false)
    // expired: refused after exp
    expect(verifyInvoiceLink(9901, exp, sig, env, (exp + 1) * 1000)).toBe(false)
    // lifetime: more than 30 days ahead is refused; PORTAL_INVOICE_LINK_MAX_DAYS widens it
    const far = now / 1000 + 45 * 86_400
    const farSig = invoiceLinkSignature(9901, far, 'fixture-key')
    expect(verifyInvoiceLink(9901, far, farSig, env, now)).toBe(false)
    expect(verifyInvoiceLink(9901, far, farSig, { ...env, PORTAL_INVOICE_LINK_MAX_DAYS: '60' }, now)).toBe(true)
  })
})
