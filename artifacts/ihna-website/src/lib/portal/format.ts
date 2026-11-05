// Display formats and the pure presentation rules for portal data (50-portal-data §4).
// All "today" and date arithmetic runs in Australia/Melbourne (@date-fns/tz), never in the server's zone.
import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { crc32 } from 'node:zlib'
import type { CalendarEntry, CampusStartDates, CensusRow, DateSection, StartDates, StudentType } from './types'

export const portalTz = (): string => process.env.PORTAL_TZ ?? 'Australia/Melbourne'

/** Today as `YYYY-MM-DD` in the portal zone. It is passed to queries as a parameter (replaces CURDATE()). */
export const portalToday = (now: Date = new Date()): string => format(new TZDate(now, portalTz()), 'yyyy-MM-dd')

const at = (iso: string): TZDate | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? new TZDate(Number(m[1]), Number(m[2]) - 1, Number(m[3]), portalTz()) : null
}
const fmt = (iso: string | null | undefined, pattern: string): string => {
  const d = iso ? at(iso) : null
  return d ? format(d, pattern) : ''
}

export const formatStartDate = (iso: string) => fmt(iso, 'MMM d, yyyy') // "Nov 2, 2026"
export const formatCensusDate = (iso: string) => fmt(iso, 'dd-MM-yyyy') // "02-11-2026" (as the live table)
export const formatIntake = (iso: string) => fmt(iso, 'MMMM yyyy') // "November 2026"
export const weekdayOf = (iso: string) => fmt(iso, 'EEEE')

export type CensusTableRow = { intake: string; start: string; end: string; census: string; orientation: string }

/** The five columns of the live `[IHMCensusDate]` table, as strings. */
export const censusTable = (rows: CensusRow[]): CensusTableRow[] =>
  rows.map((r) => ({
    intake: formatIntake(r.start),
    start: formatCensusDate(r.start),
    end: formatCensusDate(r.end),
    census: formatCensusDate(r.census),
    orientation: formatCensusDate(r.orientation),
  }))

// ------------------------------------------------------------------ StartDates presentation

export type StartDateEntry = { text: string; href: string; kind: 'fixed' | 'rolling' }
export type StartDateSection = { mode: 'f2f' | 'online' | 'blended'; label: string; entries: StartDateEntry[] }
export type StartDateCampus = { campusId: number; campusName: string; sections: StartDateSection[] }

export const MODE_LABEL = { f2f: 'Face to Face Delivery', online: 'Online Delivery', blended: 'Online (Blended) Delivery' } as const
export const EPIQRN_KH_ID = 29
export type StartMode = 'all' | 'f2f' | 'online' | 'blended'

const enquiryHref = (date: string, campus: string) => `?startDate=${encodeURIComponent(date)}&campus=${encodeURIComponent(campus)}#quickContact`

function section(mode: 'f2f' | 'online' | 'blended', s: DateSection, campus: CampusStartDates, khId: number): StartDateSection | null {
  const entries: StartDateEntry[] = []
  const epiq = khId === EPIQRN_KH_ID
  for (const d of s.fixed) {
    const label = formatStartDate(d)
    // every fixed date, kh 29 (EPIQ-RN) included, links to the enquiry form with the date: the site has no application page for it
    entries.push({ text: label, kind: 'fixed', href: enquiryHref(label, campus.campusName) })
  }
  if (!epiq && s.rolling.length) {
    if (mode === 'f2f') {
      for (const d of s.rolling) entries.push({ text: `Enrol any time — every ${weekdayOf(d)} from ${formatStartDate(d)} onwards`, kind: 'rolling', href: '#quickContact' })
    } else {
      entries.push({ text: 'Enrol any time', kind: 'rolling', href: '#quickContact' }) // one line for online and blended
    }
  }
  return entries.length ? { mode, label: MODE_LABEL[mode], entries } : null
}

/**
 * International = face to face only; domestic = face to face, online and blended. A campus heading appears only when one of
 * its shown sections has dates (the legacy precedence bug at functions.php:1388 is not copied).
 */
export function describeStartDates(data: StartDates, studentType: StudentType, khId: number, mode: StartMode = 'all'): StartDateCampus[] {
  const out: StartDateCampus[] = []
  for (const c of data.campuses) {
    const candidates: [StartMode & ('f2f' | 'online' | 'blended'), DateSection][] = [['f2f', c.f2f]]
    if (studentType === 'domestic') candidates.push(['online', c.online], ['blended', c.blended])
    const sections = candidates
      .filter(([m]) => mode === 'all' || mode === m)
      .map(([m, s]) => section(m, s, c, khId))
      .filter((s): s is StartDateSection => s !== null)
    if (sections.length) out.push({ campusId: c.campusId, campusName: c.campusName, sections })
  }
  return out
}

// ------------------------------------------------------------------ Calendar colours (template-monthly-calendar.php:3-34, 105-109)

/** `'#' + first 6 hex chars of crc32(course_name)`, exactly as the legacy `substr(dechex(crc32($name)), 0, 6)`. */
export const calendarColour = (courseName: string): string => `#${crc32(Buffer.from(courseName)).toString(16).slice(0, 6)}`

/** Black or white text: legacy contrast ratio against black, gamma 2.2, threshold 5 (integer ratio). */
export function contrastTextColour(hex: string): '#000000' | '#FFFFFF' {
  const c = (i: number) => parseInt(hex.slice(i, i + 2).padEnd(2, '0'), 16) / 255
  const lum = (r: number, g: number, b: number) => 0.2126 * r ** 2.2 + 0.7152 * g ** 2.2 + 0.0722 * b ** 2.2
  const l1 = lum(c(1), c(3), c(5))
  const l2 = 0
  const ratio = Math.trunc(l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05))
  return ratio > 5 ? '#000000' : '#FFFFFF'
}

export const calendarLabel = (e: Pick<CalendarEntry, 'mode' | 'intake'>): string =>
  e.mode === 'f2f' ? 'Face to Face' : e.intake === 'rolling' ? 'Online (Blended) : Enrol any time' : 'Online (Blended)'
