import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PortalUnavailable, resetPortalPool, runQuery } from '@/lib/portal/client'
import { censusTable, describeStartDates } from '@/lib/portal/format'
import * as q from '@/lib/portal/queries'
import { AS_OF, usePortalFixtureDb } from './env'

// Against the portal-mysql fixture container (50-portal-data §8 checks 1, 2, 3, 10).
const dir = path.resolve(__dirname, '../../scripts/import/fixtures/portal')
const fixtures = fs.readdirSync(path.join(dir, 'census')).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, 'census', f), 'utf8')) as {
  wpId: number; path: string; khId: number; asOf: string; rows: { intake: string; start: string; end: string; census: string; orientation: string }[]
})

beforeAll(() => usePortalFixtureDb())
afterAll(() => resetPortalPool())

describe('census (Q2) reproduces the live tables for the 10 fixture courses', () => {
  it('has the 10 courses', () => expect(fixtures).toHaveLength(10))
  for (const f of fixtures) {
    it(f.path, async () => {
      expect(f.asOf).toBe(AS_OF)
      const rows = censusTable(await q.censusDates(f.khId, AS_OF))
      expect(rows).toEqual(f.rows) // rows, order and formatted strings
    })
  }
  it('formatted output snapshot', async () => {
    const out: Record<string, unknown> = {}
    for (const f of fixtures) out[f.path] = censusTable(await q.censusDates(f.khId, AS_OF))
    expect(out).toMatchSnapshot()
  })
  it('osce-for-rns is the empty case', async () => {
    expect(await q.censusDates(61, AS_OF)).toEqual([])
  })
})

describe('census edge branches', () => {
  it('keeps the first row per start_date; ignores semester 2 and closed enrolment', async () => {
    const rows = await q.censusDates(9105, AS_OF)
    expect(rows.map((r) => [r.start, r.census])).toEqual([['2026-11-02', '2026-12-02'], ['2027-02-01', '2027-03-03']])
    expect(await q.censusDates(9104, AS_OF)).toEqual([])
    expect(await q.censusDates(9107, AS_OF)).toEqual([]) // semester 2 only; enrolment closed
  })
})

describe('start dates (Q1) branches', () => {
  it('domestic: face to face, online and blended, rolling rules per mode', async () => {
    const f2f = describeStartDates(await q.startDates(9101, AS_OF), 'domestic', 9101)
    expect(f2f.map((c) => c.campusName)).toEqual(['Melbourne', 'Sydney'])
    expect(f2f[0].sections[0].label).toBe('Face to Face Delivery')
    expect(f2f[0].sections[0].entries.map((e) => e.text)).toEqual([
      'Nov 2, 2026', 'Feb 1, 2027', 'Enrol any time — every Monday from Sep 7, 2026 onwards',
    ])
    expect(f2f[1].sections[0].entries.map((e) => e.text)).toEqual(['Nov 9, 2026', 'Enrol any time — every Wednesday from Aug 5, 2026 onwards'])
    expect(f2f[0].sections[0].entries[0].href).toBe('?startDate=Nov%202%2C%202026&campus=Melbourne#quickContact')

    const mixed = describeStartDates(await q.startDates(9102, AS_OF), 'domestic', 9102)
    expect(mixed).toHaveLength(1) // campus 2's only blended rolling has lapsed
    expect(mixed[0].sections.map((s) => [s.mode, s.entries.map((e) => e.text)])).toEqual([
      ['online', ['Nov 2, 2026', 'Enrol any time']], // two rolling rows collapse to one line
      ['blended', ['Dec 7, 2026', 'Enrol any time']],
    ])
  })

  it('international is face to face only (no section, no heading, when there is none)', async () => {
    expect(describeStartDates(await q.startDates(9102, AS_OF), 'international', 9102)).toEqual([])
    const intl = describeStartDates(await q.startDates(9101, AS_OF), 'international', 9101)
    expect(intl.every((c) => c.sections.every((s) => s.mode === 'f2f'))).toBe(true)
  })

  it('kh 29 (EPIQ-RN): fixed dates link to the enquiry form with the date, rolling dates are hidden', async () => {
    const [campus] = describeStartDates(await q.startDates(29, AS_OF), 'domestic', 29)
    expect(campus.sections.map((s) => s.mode)).toEqual(['f2f', 'blended'])
    for (const s of campus.sections) {
      expect(s.entries.map((e) => e.kind)).toEqual(['fixed'])
      expect(s.entries[0].href).toMatch(/^\?startDate=[^&]+&campus=[^#]+#quickContact$/)
    }
    expect(campus.sections[0].entries[0].href).toMatch(/^\?startDate=Nov%2016%2C%202026&campus=/)
  })

  it('past dates, show_in_website=0, other partner, inactive, disabled, ended rolling, missing batch dates: nothing', async () => {
    expect(describeStartDates(await q.startDates(9104, AS_OF), 'domestic', 9104)).toEqual([])
  })

  it('the `mode` filter narrows the sections', async () => {
    const data = await q.startDates(9102, AS_OF)
    expect(describeStartDates(data, 'domestic', 9102, 'online')[0].sections.map((s) => s.mode)).toEqual(['online'])
  })
})

describe('start dates equivalence: the combined query equals the six legacy WHERE clauses per campus', () => {
  const legacy = {
    fixed: "SELECT start_date FROM course_batches WHERE partner_id = 1 AND status LIKE 'Active' AND enable = 1 AND start_date >= ? AND course_id = ? AND campus_id = ? AND intake_id = 1 AND mod_of_delivery_id = ? AND show_in_website = 1 ORDER BY start_date",
    rolling: "SELECT start_date FROM course_batches WHERE partner_id = 1 AND status LIKE 'Active' AND enable = 1 AND end_date >= ? AND course_id = ? AND campus_id = ? AND intake_id = 2 AND mod_of_delivery_id = ? AND show_in_website = 1 ORDER BY start_date",
    rollingBlended: "SELECT cb.start_date FROM course_batches cb INNER JOIN course_batch_dates cbd ON cb.id = cbd.course_batch_id WHERE cb.partner_id = 1 AND cb.status LIKE 'Active' AND cb.enable = 1 AND cb.end_date >= ? AND cbd.enrollment_end_date >= ? AND cb.course_id = ? AND cb.campus_id = ? AND cb.intake_id = 2 AND cb.mod_of_delivery_id = 3 AND cb.show_in_website = 1 ORDER BY cb.start_date",
  }
  const strings = async (sql: string, params: (string | number)[]) => (await runQuery<{ start_date: string } & import('mysql2/promise').RowDataPacket>(sql, params)).map((r) => r.start_date)

  for (const khId of [9101, 9102, 29, 9104, 9105, 9107, 41, 74]) {
    it(`course ${khId}`, async () => {
      const combined = await q.startDates(khId, AS_OF)
      for (const campus of combined.campuses) {
        const modes = [['f2f', 1], ['online', 2], ['blended', 3]] as const
        for (const [key, mode] of modes) {
          expect(campus[key].fixed).toEqual(await strings(legacy.fixed, [AS_OF, khId, campus.campusId, mode]))
          const rolling = mode === 3
            ? await strings(legacy.rollingBlended, [AS_OF, AS_OF, khId, campus.campusId])
            : await strings(legacy.rolling, [AS_OF, khId, campus.campusId, mode])
          expect(campus[key].rolling).toEqual(rolling)
        }
      }
    })
  }
})

describe('calendar (Q3), countries (Q4), course (Q5)', () => {
  it('November 2026, domestic vs international', async () => {
    const dom = await q.intakeCalendar('2026-11-01', '2026-11-30', 0, AS_OF, null) // every campus (IHNA's default is campus 8)
    const intl = await q.intakeCalendar('2026-11-01', '2026-11-30', 1, AS_OF, null)
    expect(dom.some((e) => e.khId === 9102)).toBe(false) // online-only in November (mode 2) and domestic flag; blended starts in December
    expect(dom.some((e) => e.khId === 9106)).toBe(false) // course disabled
    expect(intl.some((e) => e.khId === 9102)).toBe(false) // not offered to international
    const nov2 = dom.filter((e) => e.date === '2026-11-02' && e.khId === 9101)
    expect(nov2).toHaveLength(1) // deduped per day on (course, campus)
    expect(dom.filter((e) => e.khId === 9105).map((e) => e.campusId)).toEqual([1, 2])
    expect(dom.find((e) => e.khId === 29)?.mode).toBe('f2f')
    expect(dom.map((e) => e.date)).toEqual([...dom.map((e) => e.date)].sort())
  })
  it('countries: enabled defaults by id; by id', async () => {
    expect((await q.countries()).map((c) => c.name)).toEqual(['Australia', 'India', 'Nepal', 'Philippines'])
    expect(await q.countryById(5)).toEqual({ id: 5, name: 'New Zealand' })
    expect(await q.countryById(404)).toBeNull()
  })
  it('course by kh_id', async () => {
    const c = await q.courseByKhId(41)
    expect(c?.name).toBe('Master of Nursing')
    expect(c?.crmCourseId).toBe('100000041')
    expect(await q.courseByKhId(123456)).toBeNull()
  })
})

describe('driver', () => {
  it('a real slow query is cut at the timeout', async () => {
    usePortalFixtureDb(300)
    const t = Date.now()
    await expect(runQuery('SELECT SLEEP(?) AS s', [3])).rejects.toBeInstanceOf(PortalUnavailable)
    expect(Date.now() - t).toBeLessThan(1500)
    usePortalFixtureDb()
  })
  it('the read user cannot write', async () => {
    await expect(runQuery('INSERT INTO countries (id, country_name) VALUES (?, ?)', [777, 'x'])).rejects.toBeInstanceOf(PortalUnavailable)
  })
})
