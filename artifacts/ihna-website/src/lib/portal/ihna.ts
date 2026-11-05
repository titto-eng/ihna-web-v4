// IHNA-only public portal reads (50-portal-data §4, §9). Site-specific, like queries.ts. Same rules as index.ts: PORTAL_ENABLED=0
// answers `{ unavailable: true }` synchronously with no connection; otherwise every read is cached (15 min, tag `portal:<scope>`,
// 60 s negative cache) and never throws. Pages and route handlers import from here or from `@/lib/portal`.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cached } from './cache'
import { portalEnabled } from './client'
import { portalToday } from './format'
import * as q from './queries'
import type { Agent, CensusBatch, CensusCampus, CensusCourse, CensusSemester, CensusUnit, Country, HcCourse, PortalInvoice, PortalResult, WebPackage } from './types'

type Maybe<T> = PortalResult<T> | Promise<PortalResult<T>>
const off = <T>(data: T): PortalResult<T> => ({ unavailable: true, data })

/** `[CourseStartDates]`: upcoming intake dates of a course at campus 8 (ISO strings). Tag `portal:<khId>`. */
export const getIntakeDates = (khId: number, today = portalToday()): Maybe<string[]> =>
  portalEnabled() ? cached('intakes', khId, [today], () => q.intakeDates(khId, today), []) : off<string[]>([])

/** `[HandBookUrl]`: the course's student handbook on the portal's document bucket, or null. Tag `portal:<khId>`. */
export const getHandbookUrl = (khId: number): Maybe<string | null> =>
  portalEnabled() ? cached('handbook', khId, [], () => q.handbookUrl(khId), null) : off<string | null>(null)

/** Every enabled country (the old footer list; `getCountries` is the short default list). */
export const getAllCountries = (): Maybe<Country[]> =>
  portalEnabled() ? cached('countries-all', 'countries', [], () => q.countriesAll(), []) : off<Country[]>([])

/** `ihna_web_packages`: enquiry packages (ELICOS/EAP + course bundles) with their KH course id. */
export const getWebPackages = (): Maybe<WebPackage[]> =>
  portalEnabled() ? cached('packages', 'packages', [], () => q.webPackages(), []) : off<WebPackage[]>([])

/** Education agents with a current IHNA agreement in one country (agency contact fields only). Tag `portal:agents`. */
export const getAgents = (countryId: number, today = portalToday()): Maybe<Agent[]> =>
  portalEnabled() ? cached('agents', 'agents', [countryId, today], () => q.agentsByCountry(countryId, today), []) : off<Agent[]>([])

/** HC course row by portal course id (`/hc-course-details/`, `/hc-course-transition/`), enabled courses only. Tag `portal:<id>`. */
export const getHcCourse = (id: number): Maybe<HcCourse | null> =>
  portalEnabled() ? cached('hc-course', id, [], () => q.hcCourse(id), null) : off<HcCourse | null>(null)

/** Ids of the enabled portal courses: the public HC endpoints accept only these (one cached list). Tag `portal:courses`. */
export const getHcCourseIds = (): Maybe<number[]> =>
  portalEnabled() ? cached('hc-course-ids', 'courses', [], () => q.hcCourseIds(), []) : off<number[]>([])

// ---- Unit census pickers and table (`/census-dates-kh/`, `/census-date-details-ajax/`). Tag `portal:census`.

export type CensusSelection = { campus?: number | null; course?: number | null; batch?: number | null; semester?: number | null }
export type CensusData = {
  campuses: CensusCampus[]
  courses: CensusCourse[]
  batches: CensusBatch[]
  semesters: CensusSemester[]
  units: CensusUnit[]
}
const EMPTY_CENSUS: CensusData = { campuses: [], courses: [], batches: [], semesters: [], units: [] }

/**
 * The pickers and the unit table for a selection, read level by level: a level is read only when the value above it is one of that
 * level's options, so every cached read is keyed by real portal ids (an edited URL cannot make a new cache entry or a portal query).
 * `sel` is the selection that was kept; `unknown` is true when a given value was not an option (the AJAX endpoints answer 404).
 * Each list is cached on its own (tag `portal:census`), so the levels above are shared by every deeper selection.
 */
export type CensusRead = PortalResult<CensusData> & { sel: CensusSelection; unknown: boolean }

export async function readCensus(raw: CensusSelection): Promise<CensusRead> {
  const sel: CensusSelection = { campus: null, course: null, batch: null, semester: null }
  const data: CensusData = { ...EMPTY_CENSUS }
  if (!portalEnabled()) return { unavailable: true, data, sel, unknown: false }
  const out = (unavailable: boolean, unknown = false): CensusRead => ({ unavailable, data, sel, unknown })

  const campuses = await cached('census-campuses', 'census', [], () => q.censusCampuses(), [])
  if (campuses.unavailable) return out(true)
  data.campuses = campuses.data
  if (!raw.campus) return out(false)
  if (!data.campuses.some((c) => c.id === raw.campus)) return out(false, true)
  const campus = (sel.campus = raw.campus)

  const courses = await cached('census-courses', 'census', [campus], () => q.censusCourses(campus), [])
  if (courses.unavailable) return out(true)
  data.courses = courses.data
  if (!raw.course) return out(false)
  if (!data.courses.some((c) => c.id === raw.course)) return out(false, true)
  const course = (sel.course = raw.course)

  const batches = await cached('census-batches', 'census', [campus, course], () => q.censusBatches(campus, course), [])
  if (batches.unavailable) return out(true)
  data.batches = batches.data
  if (!raw.batch) return out(false)
  if (!data.batches.some((b) => b.id === raw.batch)) return out(false, true)
  const batch = (sel.batch = raw.batch)

  const semesters = await cached('census-semesters', 'census', [course, batch], () => q.censusSemesters(course, batch), [])
  if (semesters.unavailable) return out(true)
  data.semesters = semesters.data
  if (!raw.semester) return out(false)
  if (!data.semesters.some((x) => x.id === raw.semester)) return out(false, true)
  const semester = (sel.semester = raw.semester)

  const units = await cached('census-units', 'census', [course, batch, semester], () => q.censusUnits(course, batch, semester), [])
  if (units.unavailable) return out(true)
  data.units = units.data
  return out(false)
}

/** `readCensus` without the kept selection (the levels a valid selection opens). */
export async function getCensus(sel: CensusSelection): Promise<PortalResult<CensusData>> {
  const r = await readCensus(sel)
  return { unavailable: r.unavailable, data: r.data }
}

// ---- Invoice prefill for the pay form: only through a link the portal signed (template-pay-online.php:12-60, brief §4 #14).
// The old page read any `?invoice_id=` (sequential) and showed the student's name, email, id and balance. Here the link must carry
// `exp` (unix seconds) and `sig` = hex HMAC-SHA256("invoice:<id>:<exp>") under PORTAL_INVOICE_LINK_KEY; without the key the feature is
// off. A link is refused after `exp`, and when `exp` lies more than PORTAL_INVOICE_LINK_MAX_DAYS (default 30) ahead, so a link that
// leaks (history, forwards, analytics page URLs) stops working. Only the invoice number and amount due come back, never a person.
// Not cached: the amount due changes when a payment lands.

export const INVOICE_LINK_MAX_DAYS = 30

export const invoiceLinkSignature = (id: number, exp: number, key: string): string =>
  createHmac('sha256', key).update(`invoice:${id}:${exp}`).digest('hex')

const maxLinkDays = (env: Record<string, string | undefined>): number => {
  const n = Number(env.PORTAL_INVOICE_LINK_MAX_DAYS)
  return Number.isInteger(n) && n >= 1 && n <= 365 ? n : INVOICE_LINK_MAX_DAYS
}

export function verifyInvoiceLink(
  id: number, exp: string | number | null | undefined, sig: string | null | undefined,
  env: Record<string, string | undefined> = process.env, nowMs = Date.now(),
): boolean {
  const key = env.PORTAL_INVOICE_LINK_KEY?.trim()
  if (!key || !sig || !/^[0-9a-f]{64}$/i.test(sig)) return false
  if (exp === null || exp === undefined || !/^\d{1,12}$/.test(String(exp))) return false
  const expSec = Number(exp)
  const now = Math.floor(nowMs / 1000)
  if (expSec <= now || expSec - now > maxLinkDays(env) * 86_400) return false
  const a = Buffer.from(invoiceLinkSignature(id, expSec, key), 'hex')
  const b = Buffer.from(sig.toLowerCase(), 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

/** `invoice_id`, `exp` and `sig` of a signed link, format-checked (the values the chooser passes on to the pay form). */
export function signedInvoiceParams(idRaw: string | null | undefined, expRaw: string | null | undefined, sigRaw: string | null | undefined) {
  const id = idRaw && /^\d{1,10}$/.test(idRaw) ? idRaw : null
  const exp = expRaw && /^\d{1,12}$/.test(expRaw) ? expRaw : null
  const sig = sigRaw && /^[0-9a-f]{64}$/i.test(sigRaw) ? sigRaw.toLowerCase() : null
  return id && exp && sig ? { invoice_id: id, exp, sig } : null
}

export async function getInvoiceForLink(idRaw: string | null | undefined, expRaw: string | null | undefined, sig: string | null | undefined): Promise<PortalResult<PortalInvoice | null>> {
  if (!idRaw || !/^\d{1,10}$/.test(idRaw)) return { unavailable: false, data: null }
  const id = Number(idRaw)
  if (!verifyInvoiceLink(id, expRaw, sig)) return { unavailable: false, data: null }
  if (!portalEnabled()) return off<PortalInvoice | null>(null)
  try {
    return { unavailable: false, data: await q.invoiceById(id) }
  } catch (e) {
    console.warn(`portal.unavailable ${JSON.stringify({ query: 'invoice', code: (e as { code?: string }).code ?? 'error' })}`)
    return off<PortalInvoice | null>(null)
  }
}

// ---- Formatting and the legacy JSON shape of /census-date-details-ajax/

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `d-M-Y` as the old page printed it ("03-Mar-2025"); a missing date is " - ". */
export function censusDisplayDate(iso: string | null): string {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null
  return m ? `${m[3]}-${MONTHS[Number(m[2]) - 1]}-${m[1]}` : ' - '
}

/** Query-string guard: a positive integer of at most 9 digits, else null (the old page concatenated these into SQL). */
export const idParam = (v: string | string[] | null | undefined): number | null => {
  const s = Array.isArray(v) ? v[0] : v
  return s && /^\d{1,9}$/.test(s) && Number(s) > 0 ? Number(s) : null
}

/**
 * The keys the old endpoint answered for each depth (campus → courses; + course → batches; + batch → semesters; + semester → details).
 * Values are strings, as wpdb returned them.
 */
export function censusAjaxBody(sel: CensusSelection, d: CensusData): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!sel.campus) return out
  out.courses = d.courses.map((c) => ({ course_id: String(c.id), course_name: c.name, course_code: c.code ?? '' }))
  if (!sel.course) return out
  out.batches = d.batches.map((b) => ({ id: String(b.id), batch_name: b.name }))
  if (!sel.batch) return out
  out.semesters = d.semesters.map((s) => ({ semester_id: String(s.id), name: s.name }))
  if (!sel.semester) return out
  out.details = d.units.map((u) => ({
    year: String(u.year), unit_code: u.unitCode, start_date: censusDisplayDate(u.start), end_date: censusDisplayDate(u.end),
    census_date: censusDisplayDate(u.census), eftsl_factor: u.eftslFactor ?? '',
  }))
  return out
}
