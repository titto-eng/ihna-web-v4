// Public API of the portal module. Blocks and routes import from `@/lib/portal`, never from client.ts or queries.ts.
// PORTAL_ENABLED=0 (the default until real portal access exists): every read below returns `{ unavailable: true }`
// synchronously, with no connection, no query and no await, and the blocks render their static fallback.
import { cache } from 'react'
import { cached } from './cache'
import { portalEnabled } from './client'
import { portalToday } from './format'
import * as q from './queries'
import type { CalendarEntry, CensusRow, Country, PortalCourse, PortalResult, StartDates } from './types'

export { revalidatePortal } from './cache'
export { PortalUnavailable, portalEnabled } from './client'
export * from './format'
export type * from './types'

type Maybe<T> = PortalResult<T> | Promise<PortalResult<T>>

const off = <T>(data: T): PortalResult<T> => ({ unavailable: true, data })

/** Everything a course page needs from the portal, read once (census + start dates), tag `portal:<khId>`, 15 min. */
export type CoursePortal = { census: CensusRow[]; startDates: StartDates }
const EMPTY_COURSE: CoursePortal = { census: [], startDates: { campuses: [] } }

// `cache` shares one read between the route, the blocks and the JSON-LD within a request; `cached` shares it across requests.
const loadCoursePortal = cache((khId: number, today: string): Promise<PortalResult<CoursePortal>> =>
  cached(
    'bundle', khId, [today],
    async () => {
      const [census, startDates] = await Promise.all([q.censusDates(khId, today), q.startDates(khId, today)])
      return { census, startDates }
    },
    EMPTY_COURSE,
  ),
)

export const getCoursePortal = (khId: number, today = portalToday()): Maybe<CoursePortal> =>
  portalEnabled() ? loadCoursePortal(khId, today) : off(EMPTY_COURSE)

export function getStartDates(khId: number, today = portalToday()): Maybe<StartDates> {
  if (!portalEnabled()) return off(EMPTY_COURSE.startDates)
  return loadCoursePortal(khId, today).then((r) => ({ unavailable: r.unavailable, data: r.data.startDates }))
}

export function getCensusDates(khId: number, today = portalToday()): Maybe<CensusRow[]> {
  if (!portalEnabled()) return off<CensusRow[]>([])
  return loadCoursePortal(khId, today).then((r) => ({ unavailable: r.unavailable, data: r.data.census }))
}

export function getIntakeCalendar(year: number, month: number, studentType: 0 | 1 | null, today = portalToday()): Maybe<CalendarEntry[]> {
  if (!portalEnabled()) return off<CalendarEntry[]>([])
  const mm = String(month).padStart(2, '0')
  const last = String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, '0')
  const from = `${year}-${mm}-01`
  const to = `${year}-${mm}-${last}`
  return cached('calendar', 'calendar', [from, studentType, today], () => q.intakeCalendar(from, to, studentType, today), [])
}

export const getCountries = (): Maybe<Country[]> =>
  portalEnabled() ? cached('countries', 'countries', [], () => q.countries(), []) : off<Country[]>([])

export const getCourseByKhId = (khId: number): Maybe<PortalCourse | null> =>
  portalEnabled() ? cached('course', khId, [], () => q.courseByKhId(khId), null) : off<PortalCourse | null>(null)
