// IHNA's portal reads (50-portal-data §4, §9) against `ihna_portal`: the five shared reads Q1-Q5, then the IHNA-only reads
// (intake dates, unit census, packages, agents, handbooks, invoices, hc course rows). Site-specific file (SHARED-FILES.md).
// Every statement is a constant string with `?` placeholders. No interpolation, no concatenation, no template literals:
// tests/portal/no-raw-sql.test.ts greps this folder for that. Base filter B = partner_id=1 AND status='Active'
// AND enable=1 AND show_in_website=1 (written out in each statement so each can be read on its own).
import type { RowDataPacket } from 'mysql2/promise'
import { runQuery } from './client'
import type {
  Agent, CalendarEntry, CampusStartDates, CensusBatch, CensusCampus, CensusCourse, CensusRow, CensusSemester, CensusUnit, Country, DateSection, HcCourse,
  PortalCourse, PortalInvoice, StartDates, WebPackage,
} from './types'

const emptySection = (): DateSection => ({ fixed: [], rolling: [] })

// ---------------------------------------------------------------- Q1 StartDates (functions.php:1309-1470)

const SQL_CAMPUSES = 'SELECT id, campus_name FROM campuses ORDER BY id'

const SQL_START_DATES =
  "SELECT cb.campus_id, cb.mod_of_delivery_id, cb.intake_id, cb.start_date FROM course_batches cb " +
  "WHERE cb.partner_id = 1 AND cb.status = 'Active' AND cb.enable = 1 AND cb.show_in_website = 1 AND cb.course_id = ? " +
  "AND ((cb.intake_id = 1 AND cb.start_date >= ?) OR (cb.intake_id = 2 AND cb.end_date >= ? AND (cb.mod_of_delivery_id <> 3 OR EXISTS " +
  "(SELECT 1 FROM course_batch_dates d WHERE d.course_batch_id = cb.id AND d.enrollment_end_date >= ?)))) " +
  "ORDER BY cb.start_date, cb.id"

type CampusRow = RowDataPacket & { id: number; campus_name: string }
type StartRow = RowDataPacket & { campus_id: number; mod_of_delivery_id: number; intake_id: number; start_date: string }

/** One query, partitioned by campus x mode x intake in TS (the legacy code ran six queries per campus). */
export async function startDates(khId: number, today: string): Promise<StartDates> {
  const [campuses, rows] = await Promise.all([
    runQuery<CampusRow>(SQL_CAMPUSES),
    runQuery<StartRow>(SQL_START_DATES, [khId, today, today, today]),
  ])
  const byCampus = new Map<number, CampusStartDates>()
  for (const c of campuses) {
    byCampus.set(c.id, { campusId: c.id, campusName: c.campus_name, f2f: emptySection(), online: emptySection(), blended: emptySection() })
  }
  for (const r of rows) {
    const campus = byCampus.get(r.campus_id)
    if (!campus) continue
    const section = r.mod_of_delivery_id === 1 ? campus.f2f : r.mod_of_delivery_id === 2 ? campus.online : r.mod_of_delivery_id === 3 ? campus.blended : null
    if (!section) continue
    ;(r.intake_id === 1 ? section.fixed : section.rolling).push(r.start_date)
  }
  return { campuses: [...byCampus.values()] }
}

// ---------------------------------------------------------------- Q2 Census (ihm-census-dates-sc.php:12)

const SQL_CENSUS =
  "SELECT cb.id, cb.start_date, cb.graduation_day, cb.orientation_date, d.semester_census_date FROM course_batches cb " +
  "JOIN course_batch_dates d ON d.course_batch_id = cb.id AND d.semester IN (0, 1) " +
  "WHERE cb.partner_id = 1 AND cb.status = 'Active' AND cb.enable = 1 AND cb.show_in_website = 1 AND cb.course_id = ? " +
  "AND cb.end_date >= ? AND d.enrollment_end_date >= ? ORDER BY cb.start_date, cb.id, d.course_batch_id"

type CensusSqlRow = RowDataPacket & {
  id: number
  start_date: string
  graduation_day: string | null
  orientation_date: string | null
  semester_census_date: string | null
}

/** First row per start_date wins (replaces the legacy non-deterministic GROUP BY). End = graduation_day. */
export async function censusDates(khId: number, today: string): Promise<CensusRow[]> {
  const rows = await runQuery<CensusSqlRow>(SQL_CENSUS, [khId, today, today])
  const seen = new Set<string>()
  const out: CensusRow[] = []
  for (const r of rows) {
    if (seen.has(r.start_date)) continue
    seen.add(r.start_date)
    out.push({ start: r.start_date, end: r.graduation_day ?? '', census: r.semester_census_date ?? '', orientation: r.orientation_date ?? '' })
  }
  return out
}

// ---------------------------------------------------------------- Q3 Intake calendar (template-monthly-calendar.php:36-133)

/** IHNA's monthly calendar shows one campus (template-monthly-calendar.php:58, `campus_id = 8`; its name comes from `campuses`). */
export const CALENDAR_CAMPUS_ID = 8

const SQL_CALENDAR =
  "SELECT cb.course_id, cb.campus_id, cb.start_date, cb.intake_id, cb.mod_of_delivery_id, c.course_name, ca.campus_name " +
  "FROM course_batches cb JOIN courses c ON c.id = cb.course_id AND c.enable = 1 JOIN campuses ca ON ca.id = cb.campus_id " +
  "WHERE cb.partner_id = 1 AND cb.status = 'Active' AND cb.enable = 1 AND cb.show_in_website = 1 " +
  "AND cb.start_date BETWEEN ? AND ? AND cb.intake_id IN (1, 2) AND cb.mod_of_delivery_id IN (1, 3) AND (? IS NULL OR cb.campus_id = ?) " +
  "AND (? IS NULL OR (? = 0 AND c.application_form5 = 1) OR (? = 1 AND c.application_form6 = 1)) " +
  "AND (NOT (cb.intake_id = 2 AND cb.mod_of_delivery_id = 3) OR EXISTS " +
  "(SELECT 1 FROM course_batch_dates d WHERE d.course_batch_id = cb.id AND d.enrollment_end_date >= ?)) " +
  "ORDER BY cb.start_date, cb.course_id"

type CalendarRow = RowDataPacket & {
  course_id: number
  campus_id: number
  start_date: string
  intake_id: number
  mod_of_delivery_id: number
  course_name: string
  campus_name: string
}

/**
 * One query per month. `studentType`: 0 domestic, 1 international, null both. Deduped per day on (course, campus).
 * `campusId`: IHNA reads campus 8 only (CALENDAR_CAMPUS_ID, the default); null = every campus.
 */
export async function intakeCalendar(from: string, to: string, studentType: 0 | 1 | null, today: string, campusId: number | null = CALENDAR_CAMPUS_ID): Promise<CalendarEntry[]> {
  const rows = await runQuery<CalendarRow>(SQL_CALENDAR, [from, to, campusId, campusId, studentType, studentType, studentType, today])
  const seen = new Set<string>()
  const out: CalendarEntry[] = []
  for (const r of rows) {
    const key = `${r.start_date}|${r.course_id}|${r.campus_id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      date: r.start_date,
      khId: r.course_id,
      courseName: r.course_name,
      campusId: r.campus_id,
      campusName: r.campus_name,
      intake: r.intake_id === 2 ? 'rolling' : 'fixed',
      mode: r.mod_of_delivery_id === 3 ? 'blended' : 'f2f',
    })
  }
  return out
}

// ---------------------------------------------------------------- Q4 Countries (quick-enquiry.php:451)

const SQL_COUNTRIES = 'SELECT id, country_name FROM countries WHERE enable = 1 AND default_country = 1 ORDER BY id'
const SQL_COUNTRY_BY_ID = 'SELECT id, country_name FROM countries WHERE id = ?'

type CountryRow = RowDataPacket & { id: number; country_name: string }

export async function countries(): Promise<Country[]> {
  return (await runQuery<CountryRow>(SQL_COUNTRIES)).map((r) => ({ id: r.id, name: r.country_name }))
}

export async function countryById(id: number): Promise<Country | null> {
  const r = (await runQuery<CountryRow>(SQL_COUNTRY_BY_ID, [id]))[0]
  return r ? { id: r.id, name: r.country_name } : null
}

// ---------------------------------------------------------------- Q5 Course by kh_id (quick-enquiry.php:10)

const SQL_COURSE =
  'SELECT id, course_name, course_code, crm_courseid, crm_staff_id, application_form_flag, application_form2, application_form3, ' +
  'application_form4, application_form7, application_form9 FROM courses WHERE id = ?'

type CourseRow = RowDataPacket & {
  id: number
  course_name: string
  course_code: string | null
  crm_courseid: string | null
  crm_staff_id: string | null
  application_form_flag: number | null
  application_form2: number | null
  application_form3: number | null
  application_form4: number | null
  application_form7: number | null
  application_form9: number | null
}

export async function courseByKhId(khId: number): Promise<PortalCourse | null> {
  const r = (await runQuery<CourseRow>(SQL_COURSE, [khId]))[0]
  if (!r) return null
  return {
    khId: r.id,
    name: r.course_name,
    courseCode: r.course_code,
    crmCourseId: r.crm_courseid,
    crmStaffId: r.crm_staff_id,
    formFlags: { flag: r.application_form_flag, flag2: r.application_form2, flag3: r.application_form3, flag4: r.application_form4, flag7: r.application_form7, flag9: r.application_form9 },
  }
}

// ================================================================ IHNA-only reads (50-portal-data §9)

// ---------------------------------------------------------------- Q6 Intake dates ([CourseStartDates], functions.php:1305)

const SQL_INTAKE_DATES =
  'SELECT DISTINCT cbd.start_date FROM course_batches cb JOIN course_batch_dates cbd ON cbd.course_batch_id = cb.id ' +
  "WHERE cb.status = 'active' AND cb.enable = 1 AND cbd.semester IN (0, 1) AND cb.course_id = ? AND cbd.start_date >= ? " +
  'AND cb.show_in_website = 1 AND cb.campus_id = ? ORDER BY cbd.start_date'

type DateRow = RowDataPacket & { start_date: string }

/** Upcoming semester-0/1 start dates of a course at one campus (default 8, as the shortcode), ISO strings, ascending. */
export async function intakeDates(khId: number, today: string, campusId: number = CALENDAR_CAMPUS_ID): Promise<string[]> {
  return (await runQuery<DateRow>(SQL_INTAKE_DATES, [khId, today, campusId])).map((r) => r.start_date)
}

// ---------------------------------------------------------------- Q7 Unit census (template-census-date-kh.php:10, template-census-date-details-ajax.php)
// The batch filter shared by every census picker: template rows only (user_id = 0), batch status 1-3, batches from 2018.

const SQL_CENSUS_CAMPUSES =
  'SELECT DISTINCT cb.campus_id, c.campus_name FROM course_batches cb JOIN campuses c ON c.id = cb.campus_id ' +
  'JOIN course_unit_of_studies cus ON cus.course_batch_id = cb.id AND cus.user_id = 0 ' +
  'WHERE cb.batch_status_id IN (1, 2, 3) AND c.id NOT IN (2) ORDER BY c.campus_name'

const SQL_CENSUS_COURSES =
  'SELECT DISTINCT cb.course_id, c.course_name, c.course_code FROM course_batches cb JOIN courses c ON c.id = cb.course_id AND c.enable = 1 ' +
  'JOIN course_unit_of_studies cus ON cus.course_batch_id = cb.id AND cus.user_id = 0 ' +
  'WHERE cb.batch_status_id IN (1, 2, 3) AND cb.campus_id = ? AND cb.start_date >= ? ORDER BY c.course_name'

const SQL_CENSUS_BATCHES =
  'SELECT DISTINCT cb.id, cb.batch_name FROM course_batches cb ' +
  'JOIN course_unit_of_studies cus ON cus.course_batch_id = cb.id AND cus.user_id = 0 ' +
  'WHERE cb.campus_id = ? AND cb.course_id = ? AND cb.batch_status_id IN (1, 2, 3) AND cb.start_date >= ? ORDER BY cb.batch_name'

const SQL_CENSUS_SEMESTERS =
  'SELECT DISTINCT cus.semester_id, s.name FROM course_unit_of_studies cus JOIN semesters s ON s.id = cus.semester_id ' +
  'WHERE cus.course_id = ? AND cus.course_batch_id = ? AND cus.user_id = 0 ORDER BY s.name'

// One statement for the unit table: the legacy per-row queries for the unit start (MIN timetable start) became a correlated subquery.
// `cu.semester = ?` (the unit's own semester), as the old page filtered; the semester picker lists `cus.semester_id`.
const SQL_CENSUS_UNITS =
  'SELECT DISTINCT cus.id, YEAR(cb.start_date) AS year, cb.start_date, cu.id AS course_unit_id, cu.unit_code, cus.census_date, cus.eftsl_factor, ' +
  '(SELECT MIN(t.start_date_time) FROM course_unit_timetable_details t WHERE t.course_batch_id = cb.id AND t.course_unit_id = cu.id) AS unit_start ' +
  'FROM course_unit_of_studies cus JOIN semesters s ON s.id = cus.semester_id ' +
  'JOIN course_batches cb ON cb.id = cus.course_batch_id AND cb.start_date >= ? ' +
  'JOIN course_unit_of_study_units cusu ON cusu.course_unit_of_study_id = cus.course_unit_of_study_id ' +
  'JOIN course_units cu ON cu.id = cusu.course_unit_id AND cu.semester = ? ' +
  'WHERE cus.course_id = ? AND cus.course_batch_id = ? AND cus.user_id = 0 ORDER BY cus.census_date, cus.id, cu.id'

const SQL_SEMESTER_END =
  'SELECT semester_end_date FROM course_batch_dates WHERE course_batch_id = ? AND semester = ? AND sem_flag = 1 ORDER BY id LIMIT 1'

/** Batches that started before this date are not listed (the old `YEAR(cb.start_date) >= '2018'`). */
export const CENSUS_FROM = '2018-01-01'

type CensusCampusRow = RowDataPacket & { campus_id: number; campus_name: string }
type CensusCourseRow = RowDataPacket & { course_id: number; course_name: string; course_code: string | null }
type CensusBatchRow = RowDataPacket & { id: number; batch_name: string | null }
type CensusSemesterRow = RowDataPacket & { semester_id: number; name: string }
type CensusUnitSqlRow = RowDataPacket & {
  id: number; year: number; start_date: string; course_unit_id: number; unit_code: string; census_date: string | null; eftsl_factor: string | null; unit_start: string | null
}
type SemesterEndRow = RowDataPacket & { semester_end_date: string | null }

export async function censusCampuses(): Promise<CensusCampus[]> {
  return (await runQuery<CensusCampusRow>(SQL_CENSUS_CAMPUSES)).map((r) => ({ id: r.campus_id, name: r.campus_name }))
}

export async function censusCourses(campusId: number): Promise<CensusCourse[]> {
  return (await runQuery<CensusCourseRow>(SQL_CENSUS_COURSES, [campusId, CENSUS_FROM])).map((r) => ({ id: r.course_id, name: r.course_name, code: r.course_code }))
}

export async function censusBatches(campusId: number, courseId: number): Promise<CensusBatch[]> {
  return (await runQuery<CensusBatchRow>(SQL_CENSUS_BATCHES, [campusId, courseId, CENSUS_FROM])).map((r) => ({ id: r.id, name: r.batch_name ?? '' }))
}

export async function censusSemesters(courseId: number, batchId: number): Promise<CensusSemester[]> {
  return (await runQuery<CensusSemesterRow>(SQL_CENSUS_SEMESTERS, [courseId, batchId])).map((r) => ({ id: r.semester_id, name: r.name }))
}

const isoDate = (v: string | null | undefined): string | null => (v && /^\d{4}-\d{2}-\d{2}/.test(v) && !v.startsWith('0000') ? v.slice(0, 10) : null)

/** The unit table: one row per unit, ISO dates (null when the portal has none), the batch's semester end as the unit end. */
export async function censusUnits(courseId: number, batchId: number, semester: number): Promise<CensusUnit[]> {
  const [rows, ends] = await Promise.all([
    runQuery<CensusUnitSqlRow>(SQL_CENSUS_UNITS, [CENSUS_FROM, semester, courseId, batchId]),
    runQuery<SemesterEndRow>(SQL_SEMESTER_END, [batchId, semester]),
  ])
  const end = isoDate(ends[0]?.semester_end_date)
  return rows.map((r) => ({
    year: Number(r.year),
    unitCode: r.unit_code,
    start: isoDate(r.unit_start),
    end,
    census: isoDate(r.census_date),
    eftslFactor: r.eftsl_factor === null ? null : String(r.eftsl_factor),
  }))
}

// ---------------------------------------------------------------- Q8 Countries, full list (footer.php:7)

const SQL_COUNTRIES_ALL = 'SELECT id, country_name FROM countries WHERE enable = 1 ORDER BY country_name'

export async function countriesAll(): Promise<Country[]> {
  return (await runQuery<CountryRow>(SQL_COUNTRIES_ALL)).map((r) => ({ id: r.id, name: r.country_name }))
}

// ---------------------------------------------------------------- Q9 ihna_web_packages (functions.php:368)

const SQL_PACKAGES = 'SELECT id, name, ihna_course_id FROM ihna_web_packages ORDER BY id'

type PackageRow = RowDataPacket & { id: number; name: string; ihna_course_id: number | null }

export async function webPackages(): Promise<WebPackage[]> {
  return (await runQuery<PackageRow>(SQL_PACKAGES)).map((r) => ({ id: r.id, name: r.name, khId: r.ihna_course_id }))
}

// ---------------------------------------------------------------- Q10 Agent directory (template-agent-details.php:13)
// Agency contact fields only (the partner's published web name, email and phone). The old join to partner_staffs (a person's
// name, email and phone) is not read (rule 4, plan §4.5). DISTINCT replaces the old GROUP BY.

const SQL_AGENTS =
  'SELECT DISTINCT p.id, p.facility_name, p.address, p.address_2, p.suburb_town, p.state, p.postcode, p.website, p.web_name, p.web_email, p.web_phone_number ' +
  'FROM partners p JOIN partner_association_accesses a ON a.partner_id = p.id AND a.enable = 1 AND a.partner_association_id = 2 ' +
  'JOIN countries c ON c.id = p.country AND c.enable = 1 ' +
  'WHERE p.country = ? AND p.enable = 1 AND p.partner_type_id = 5 AND p.agreement_status = 5 AND p.agreement_expiry_date >= ? ' +
  'ORDER BY p.facility_name, p.id'

type AgentRow = RowDataPacket & {
  id: number; facility_name: string; address: string | null; address_2: string | null; suburb_town: string | null; state: string | null
  postcode: string | null; website: string | null; web_name: string | null; web_email: string | null; web_phone_number: string | null
}

export async function agentsByCountry(countryId: number, today: string): Promise<Agent[]> {
  return (await runQuery<AgentRow>(SQL_AGENTS, [countryId, today])).map((r) => ({
    id: r.id, name: r.facility_name, address: r.address, address2: r.address_2, suburb: r.suburb_town, state: r.state, postcode: r.postcode,
    website: r.website, contactName: r.web_name, email: r.web_email, phone: r.web_phone_number,
  }))
}

// ---------------------------------------------------------------- Q11 Student handbook ([HandBookUrl], functions.php:1530)

const SQL_HANDBOOK =
  'SELECT d.document_file FROM course_document_categories c JOIN course_documents d ON d.course_document_category_id = c.id ' +
  'WHERE c.course_id = ? AND d.course_document_type = 1 ORDER BY d.id LIMIT 1'

/** Public bucket path of the portal's course documents (functions.php:1536). Not a secret. */
export const PORTAL_DOCUMENTS_BASE = 'https://ihna-prod.s3-ap-southeast-2.amazonaws.com/uploads/course_documents/'

type HandbookRow = RowDataPacket & { document_file: string | null }

export async function handbookUrl(khId: number): Promise<string | null> {
  const file = (await runQuery<HandbookRow>(SQL_HANDBOOK, [khId]))[0]?.document_file?.trim()
  return file ? PORTAL_DOCUMENTS_BASE + encodeURIComponent(file) : null
}

// ---------------------------------------------------------------- Q12 Invoice for the pay form (template-pay-online.php:29)
// Invoice number and amount due (plus the surcharge already raised on it) only. The old second query (student name, email and id
// by user id) is not ported: callers reach this read only through a signed link (src/lib/portal/ihna.ts getInvoiceForLink).

const SQL_INVOICE =
  'SELECT i.id, i.invoice_number, i.due_amount, p.surcharge_amount FROM invoices i ' +
  'LEFT JOIN invoice_payments p ON p.student_id = i.user_id AND p.invoice_id = i.id WHERE i.id = ? ORDER BY i.created DESC, p.id DESC LIMIT 1'

type InvoiceRow = RowDataPacket & { id: number; invoice_number: string; due_amount: string | null; surcharge_amount: string | null }

/** DECIMAL string ("1200.50") to integer cents; null or junk is 0. */
const decimalCents = (v: string | null): number => {
  const m = v === null ? null : /^(-?\d+)(?:\.(\d{1,2}))?/.exec(String(v))
  return m ? Number(m[1]) * 100 + (m[1].startsWith('-') ? -1 : 1) * Number((m[2] ?? '').padEnd(2, '0')) : 0
}

export async function invoiceById(id: number): Promise<PortalInvoice | null> {
  const r = (await runQuery<InvoiceRow>(SQL_INVOICE, [id]))[0]
  if (!r) return null
  const cents = decimalCents(r.due_amount) + decimalCents(r.surcharge_amount) // COALESCE(due, 0) + COALESCE(surcharge, 0)
  return { id: r.id, invoiceNumber: r.invoice_number, dueCents: cents > 0 ? cents : 0 }
}

// ---------------------------------------------------------------- Q13 HC course row (template-hc-course-details.php:16, template-hc-course-transition.php:61)

const SQL_HC_COURSE = 'SELECT id, course_code, course_name, course_category_id, refer_friend FROM courses WHERE id = ? AND enable = 1'
const SQL_HC_COURSE_IDS = 'SELECT id FROM courses WHERE enable = 1 ORDER BY id'

type HcCourseRow = RowDataPacket & { id: number; course_code: string | null; course_name: string; course_category_id: number | null; refer_friend: number | null }

export async function hcCourse(id: number): Promise<HcCourse | null> {
  const r = (await runQuery<HcCourseRow>(SQL_HC_COURSE, [id]))[0]
  return r ? { id: r.id, code: r.course_code, name: r.course_name, categoryId: r.course_category_id, referFriend: r.refer_friend } : null
}

type IdRow = RowDataPacket & { id: number }

/** Ids of the enabled courses (the allow-list of the public HC endpoints). */
export async function hcCourseIds(): Promise<number[]> {
  return (await runQuery<IdRow>(SQL_HC_COURSE_IDS)).map((r) => r.id)
}
