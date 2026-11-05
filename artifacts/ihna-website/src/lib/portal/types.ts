// Typed results of the portal queries (50-portal-data §2). Dates are `YYYY-MM-DD` strings, never `Date`.

export type DateSection = { fixed: string[]; rolling: string[] }

export type CampusStartDates = {
  campusId: number
  campusName: string
  f2f: DateSection
  online: DateSection
  blended: DateSection
}

export type StartDates = { campuses: CampusStartDates[] }

/** One row of the census table, raw ISO dates (format.ts turns them into the live display strings). */
export type CensusRow = { start: string; end: string; census: string; orientation: string }

export type CalendarEntry = {
  date: string
  khId: number
  courseName: string
  campusId: number
  campusName: string
  intake: 'fixed' | 'rolling'
  mode: 'f2f' | 'blended'
}

export type Country = { id: number; name: string }

export type PortalCourse = {
  khId: number
  name: string
  /** IHNA reads it (functions.php:377); IHM's portal row has no code column in use. */
  courseCode?: string | null
  crmCourseId: string | null
  crmStaffId: string | null
  formFlags: { flag: number | null; flag2: number | null; flag3: number | null; flag4: number | null; flag7: number | null; flag9: number | null }
}

/** Every public function returns this: a page never sees an exception (50 §4 Failure). */
export type PortalResult<T> = { unavailable: boolean; data: T }

export type StudentType = 'domestic' | 'international'

// ---- IHNA-only reads (50-portal-data §9). Dates are ISO strings or null.

export type CensusCampus = { id: number; name: string }
export type CensusCourse = { id: number; name: string; code: string | null }
export type CensusBatch = { id: number; name: string }
export type CensusSemester = { id: number; name: string }
/** One unit of the census table (template-census-date-details-ajax.php:149-208). */
export type CensusUnit = { year: number; unitCode: string; start: string | null; end: string | null; census: string | null; eftslFactor: string | null }

export type WebPackage = { id: number; name: string; khId: number | null }

/** An education agency listed for a country: agency contact fields only, never a person's own email or phone. */
export type Agent = {
  id: number; name: string; address: string | null; address2: string | null; suburb: string | null; state: string | null; postcode: string | null
  website: string | null; contactName: string | null; email: string | null; phone: string | null
}

export type PortalInvoice = { id: number; invoiceNumber: string; dueCents: number }

export type HcCourse = { id: number; code: string | null; name: string; categoryId: number | null; referFriend: number | null }
