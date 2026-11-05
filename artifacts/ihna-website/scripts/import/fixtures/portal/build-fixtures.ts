/**
 * Build the portal fixtures (50-portal-data §7, steps 1-2). Run: npx tsx scripts/import/fixtures/portal/build-fixtures.ts
 *
 * 1. Reads the 10 fixture courses from ../inventory/data/ihm/courses.json, strips HTML comments (the StartDates shortcode is
 *    commented out on every course body), and parses the expanded `[IHMCensusDate]` table into
 *    scripts/import/fixtures/portal/census/<slug>.json ({wpId, path, khId, asOf, rows}). These are what the live pages showed.
 * 2. Writes docker/portal-fixtures/data.sql: batch rows that reproduce each table at `asOf`, plus synthetic courses for every
 *    StartDates / calendar / census branch (3 modes x fixed/rolling, international, kh 29, past dates, show_in_website=0,
 *    partner_id<>1, inactive, disabled course, expired enrolment, semester=2, duplicate start dates).
 * Regenerated wholesale and idempotent (same input, same bytes). No personal data: course tables only.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { resolveKhId, SYNTHETIC_KH_IDS } from '../../kh-id'

const here = path.dirname(fileURLToPath(import.meta.url))
const hci = path.resolve(here, '../../../../..')
const web = path.resolve(here, '../../../..')
const COURSES_JSON = path.join(hci, 'inventory/data/ihm/courses.json')

/** Date the inventory capture was taken (courses.json mtime, 2026-10-16). The live census tables were expanded then. */
export const AS_OF = '2026-10-16'

export const FIXTURE_SLUGS = [
  'master-of-nursing', 'master-of-nursing-online', 'master-of-nursing-international',
  'bachelor-of-social-work', 'bachelor-of-social-work-international',
  'nclex-for-rns', 'diabetes-nursing',
  'graduate-certificate-in-advanced-nursing-acute-care-nursing',
  'graduate-certificate-in-advanced-nursing-australian-nursing-practice',
  'osce-for-rns',
] as const

type WpCourse = { id: number; slug: string; link: string; title: { rendered: string }; content: string }
export type CensusFixture = {
  wpId: number
  path: string
  khId: number
  khIdSynthetic: boolean
  asOf: string
  rows: { intake: string; start: string; end: string; census: string; orientation: string }[]
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const iso = (dmy: string) => {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dmy)
  if (!m) throw new Error(`bad date ${dmy}`)
  return `${m[3]}-${m[2]}-${m[1]}`
}
const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const courses = JSON.parse(fs.readFileSync(COURSES_JSON, 'utf8')) as WpCourse[]
const bySlug = new Map(courses.map((c) => [c.slug, c]))
const decode = (s: string) => cheerio.load(`<p>${s}</p>`)('p').text()

function parseCensus(c: WpCourse): CensusFixture['rows'] {
  const $ = cheerio.load(c.content.replace(/<!--[\s\S]*?-->/g, ''))
  const table = $('table').toArray().find((t) => /census date/i.test($(t).text()) && /course intake/i.test($(t).text()))
  if (!table) return []
  return $(table).find('tbody tr').toArray().map((tr) => {
    const td = $(tr).find('td').toArray().map((x) => norm($(x).text()))
    return { intake: td[0], start: td[1], end: td[2], census: td[3], orientation: td[4] }
  })
}

// ------------------------------------------------------------------ rows

type Course = { id: number; name: string; enable?: number; hours?: number | null; dom: number; intl: number; crm?: string | null; staff?: string | null }
type Batch = { id: number; course: number; campus: number; partner?: number; status?: string; enable?: number; show?: number; intake: 1 | 2; mode: 1 | 2 | 3; start: string; end: string; grad: string | null; orient: string | null }
type BatchDate = { id: number; batch: number; enrolEnd: string | null; census: string | null; semester: number }

const campuses = [[1, 'Melbourne'], [2, 'Sydney'], [3, 'Brisbane'], [4, 'Perth']] as const
const countryRows = [
  [1, 'Australia', 1, 1], [2, 'India', 1, 1], [3, 'Nepal', 1, 1], [4, 'Philippines', 1, 1], [5, 'New Zealand', 1, 0], [6, 'Retired Country', 0, 1],
] as const
const dbCourses: Course[] = []
const batches: Batch[] = []
const dates: BatchDate[] = []
let batchId = 1000
let dateId = 5000

const addBatch = (b: Omit<Batch, 'id'>, d?: Partial<Omit<BatchDate, 'id' | 'batch'>> | null, extra: Omit<BatchDate, 'id' | 'batch'>[] = []) => {
  const id = batchId++
  batches.push({ id, ...b })
  if (d !== null) dates.push({ id: dateId++, batch: id, enrolEnd: addDays(AS_OF, 30), census: addDays(b.start, 30), semester: 1, ...d })
  for (const e of extra) dates.push({ id: dateId++, batch: id, ...e })
  return id
}

// -- the 10 fixture courses: one fixed batch per live census row (End = graduation_day), plus a semester-2 date row that must be ignored
const MODE_BY_SLUG: Record<string, 1 | 2 | 3> = { 'master-of-nursing-online': 2, 'diabetes-nursing': 2, 'graduate-certificate-in-advanced-nursing-acute-care-nursing': 2 }
const fixtures: CensusFixture[] = []
for (const slug of FIXTURE_SLUGS) {
  const c = bySlug.get(slug)
  if (!c) throw new Error(`missing course ${slug}`)
  const khId = resolveKhId(c.id)?.khId ?? SYNTHETIC_KH_IDS[c.id]
  if (!khId) throw new Error(`no kh id for ${slug}`)
  const rows = parseCensus(c)
  const intl = /international/.test(slug)
  dbCourses.push({ id: khId, name: decode(c.title.rendered).replace(/\s+/g, ' '), hours: slug === 'osce-for-rns' ? 16 : null, dom: intl ? 0 : 1, intl: intl ? 1 : slug.includes('master') || slug.includes('nclex') || slug.includes('osce') ? 1 : 0, crm: String(100000000 + khId), staff: String(200 + (khId % 50)) })
  const mode = MODE_BY_SLUG[slug] ?? 1
  const campus = mode === 2 ? 1 : 1
  for (const r of rows) {
    const start = iso(r.start), end = iso(r.end), census = iso(r.census), orient = iso(r.orientation)
    const label = new Date(`${start}T00:00:00Z`).toLocaleString('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    if (label !== r.intake) throw new Error(`${slug}: intake label "${r.intake}" != "${label}"`)
    addBatch(
      { course: khId, campus, intake: 1, mode, start, end, grad: end, orient },
      { census, enrolEnd: census >= AS_OF ? census : addDays(AS_OF, 14), semester: 1 },
      [{ enrolEnd: addDays(AS_OF, 120), census: addDays(census, 90), semester: 2 }],
    )
  }
  fixtures.push({ wpId: c.id, path: new URL(c.link).pathname, khId, khIdSynthetic: !resolveKhId(c.id), asOf: AS_OF, rows: rows.map((r) => ({ ...r })) })
}

// -- synthetic branch courses (ids 9101+ and the real EPIQ-RN id 29)
dbCourses.push(
  { id: 9101, name: 'Fixture Face to Face Course', hours: 800, dom: 1, intl: 1 },
  { id: 9102, name: 'Fixture Online and Blended Course', hours: 400, dom: 1, intl: 0 },
  { id: 29, name: 'Entry Program for Internationally Qualified Registered Nurses (EPIQ-RN)', hours: 120, dom: 1, intl: 1 },
  { id: 9104, name: 'Fixture Excluded Rows Course', dom: 1, intl: 1 },
  { id: 9105, name: 'Fixture Duplicate Start Dates Course', dom: 1, intl: 1 },
  { id: 9106, name: 'Fixture Disabled Course', enable: 0, dom: 1, intl: 1 },
  { id: 9107, name: 'Fixture Census Exclusions Course', dom: 1, intl: 1 },
)
const B = (course: number, campus: number, intake: 1 | 2, mode: 1 | 2 | 3, start: string, end: string, extra: Partial<Batch> = {}) =>
  ({ course, campus, intake, mode, start, end, grad: end, orient: start, ...extra }) as Omit<Batch, 'id'>

// 9101: face to face, two campuses; fixed + rolling
addBatch(B(9101, 1, 1, 1, '2026-11-02', '2027-05-03'))
addBatch(B(9101, 1, 1, 1, '2027-02-01', '2027-08-02'))
addBatch(B(9101, 2, 1, 1, '2026-11-09', '2027-05-10'))
addBatch(B(9101, 1, 2, 1, '2026-09-07', '2027-12-31')) // Monday
addBatch(B(9101, 2, 2, 1, '2026-08-05', '2027-12-31')) // Wednesday
// 9102: online fixed + two rolling (one line), blended fixed + rolling (valid) + a campus whose only blended rolling has lapsed
addBatch(B(9102, 1, 1, 2, '2026-11-02', '2027-05-03'))
addBatch(B(9102, 1, 2, 2, '2026-06-01', '2027-06-30'))
addBatch(B(9102, 1, 2, 2, '2026-07-01', '2027-06-30'))
addBatch(B(9102, 1, 1, 3, '2026-12-07', '2027-06-07'))
addBatch(B(9102, 1, 2, 3, '2026-10-05', '2027-06-30'), { enrolEnd: '2026-12-31' })
addBatch(B(9102, 2, 2, 3, '2026-10-05', '2027-06-30'), { enrolEnd: '2026-10-01' }) // lapsed: campus 2 must not appear
// 29 (EPIQ-RN): fixed F2F + blended link to /epiqrn-application/, rolling F2F hidden
addBatch(B(29, 1, 1, 1, '2026-11-16', '2027-02-15'))
addBatch(B(29, 1, 2, 1, '2026-08-03', '2027-12-31'))
addBatch(B(29, 1, 1, 3, '2027-01-18', '2027-04-19'))
// 9104: every row below must be invisible to StartDates and the calendar, and (no course_batch_dates row) to census
addBatch(B(9104, 1, 1, 1, '2026-09-01', '2026-12-01'), null) // fixed, start in the past
addBatch(B(9104, 1, 1, 1, '2026-12-07', '2027-06-07', { show: 0 }), null) // show_in_website = 0
addBatch(B(9104, 1, 1, 1, '2026-12-14', '2027-06-14', { partner: 2 }), null) // another partner
addBatch(B(9104, 1, 1, 1, '2026-12-21', '2027-06-21', { status: 'Inactive' }), null)
addBatch(B(9104, 1, 1, 1, '2027-01-04', '2027-07-04', { enable: 0 }), null)
addBatch(B(9104, 1, 2, 1, '2026-01-05', '2026-09-30'), null) // rolling, ended
addBatch(B(9104, 1, 2, 3, '2026-10-05', '2027-06-30'), null) // blended rolling with no course_batch_dates row
// 9107: census-only exclusions (a fixed future start is visible to StartDates, so tests read census only)
addBatch(B(9107, 1, 1, 1, '2027-02-08', '2027-08-08'), null, [{ enrolEnd: addDays(AS_OF, 120), census: '2027-03-08', semester: 2 }]) // semester 2 only
addBatch(B(9107, 1, 1, 1, '2027-03-01', '2027-09-01'), { census: '2027-03-31', enrolEnd: '2026-10-01', semester: 1 }) // enrolment closed
// 9105: two batches share a start date (first wins), a second distinct start
addBatch(B(9105, 1, 1, 1, '2026-11-02', '2027-05-03'), { census: '2026-12-02' })
addBatch(B(9105, 2, 1, 1, '2026-11-02', '2027-05-03'), { census: '2026-12-03' })
addBatch(B(9105, 1, 1, 1, '2027-02-01', '2027-08-02'), { census: '2027-03-03' })
// 9106: course disabled in the courses table (calendar drops it)
addBatch(B(9106, 1, 1, 1, '2026-11-02', '2027-05-03'))

// ------------------------------------------------------------------ output

const q = (v: string | number | null) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${v.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`)
const insert = (table: string, cols: string[], rows: (string | number | null)[][]) =>
  `INSERT INTO ${table} (${cols.join(', ')}) VALUES\n${rows.map((r) => `  (${r.map(q).join(', ')})`).join(',\n')};\n`

const sql = [
  '-- GENERATED by scripts/import/fixtures/portal/build-fixtures.ts. Do not edit; regenerate.',
  `-- asOf ${AS_OF}: run the queries with today = '${AS_OF}'. Synthetic course ids are 9xxx, real ids are used where the old theme proves them.`,
  'SET NAMES utf8mb4;',
  insert('campuses', ['id', 'campus_name'], campuses.map((c) => [...c])),
  insert('countries', ['id', 'country_name', 'enable', 'default_country'], countryRows.map((c) => [...c])),
  insert(
    'courses',
    ['id', 'course_name', 'enable', 'normal_hours', 'application_form5', 'application_form6', 'crm_courseid', 'crm_staff_id', 'application_form_flag', 'application_form2', 'application_form3', 'application_form4', 'application_form7', 'application_form9'],
    dbCourses.map((c) => [c.id, c.name, c.enable ?? 1, c.hours ?? null, c.dom, c.intl, c.crm ?? null, c.staff ?? null, 1, 1, 0, 0, 1, 0]),
  ),
  insert(
    'course_batches',
    ['id', 'course_id', 'campus_id', 'partner_id', 'status', 'enable', 'show_in_website', 'intake_id', 'mod_of_delivery_id', 'start_date', 'end_date', 'graduation_day', 'orientation_date'],
    batches.map((b) => [b.id, b.course, b.campus, b.partner ?? 1, b.status ?? 'Active', b.enable ?? 1, b.show ?? 1, b.intake, b.mode, b.start, b.end, b.grad, b.orient]),
  ),
  insert('course_batch_dates', ['id', 'course_batch_id', 'enrollment_end_date', 'semester_census_date', 'semester'], dates.map((d) => [d.id, d.batch, d.enrolEnd, d.census, d.semester])),
].join('\n')

fs.writeFileSync(path.join(web, 'docker/portal-fixtures/data.sql'), sql)
fs.mkdirSync(path.join(here, 'census'), { recursive: true })
for (const f of fixtures) fs.writeFileSync(path.join(here, 'census', `${path.basename(f.path.replace(/\/$/, ''))}.json`), JSON.stringify(f, null, 2) + '\n')
fs.writeFileSync(
  path.join(here, 'fixture-courses.json'),
  JSON.stringify(fixtures.map((f) => ({ slug: path.basename(f.path.replace(/\/$/, '')), wpId: f.wpId, path: f.path, khId: f.khId, khIdSynthetic: f.khIdSynthetic, censusRows: f.rows.length })), null, 2) + '\n',
)
console.log(`fixtures: ${fixtures.length} courses, ${batches.length} batches, ${dates.length} date rows, asOf ${AS_OF}`)
