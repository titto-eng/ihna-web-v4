import { crmCampuses, crmCourseByCode, crmCourseByKhId, type CrmCampus } from '@/content/course-crm'
import type { CampusLite, CourseLite, LandingLite } from './lookups'
import type { FormDef, When } from './types'

// Course and campus facts for conditional destinations, payloads and thank-you rules (40 §6). Plain code over the site's CRM
// reference table (src/content/course-crm.ts, empty on a site without one), so a condition never needs a course collection field.

export type CourseFacts = { khId?: number; code?: string; title?: string; dynamicsOption?: string }

const num = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^\d{1,9}$/.test(v.trim()) ? Number(v) : NaN
  return Number.isInteger(n) && n > 0 ? n : undefined
}
const text = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined)

/**
 * The enquiry's course: the CMS course (`khId`, `code`), else the form's `courseKhId` picker, else the landing row's course. Missing
 * pieces are filled from the CRM table (KH id <-> code).
 */
export function courseFactsOf(args: { course?: CourseLite | null; data?: Record<string, unknown>; landing?: LandingLite | null }): CourseFacts {
  const { course, data = {}, landing } = args
  let khId = num(course?.khId) ?? num(data.courseKhId) ?? num(landing?.khId)
  let code = text(course?.code) ?? (course ? undefined : text(landing?.courseCode))
  const row = crmCourseByKhId(khId) ?? (code ? crmCourseByCode(code) : undefined)
  khId = khId ?? row?.khId
  code = code ?? row?.code
  return { khId, code, title: text(course?.title) ?? row?.title, dynamicsOption: text(course?.dynamicsCourseOption) ?? (khId ? crmCourseByKhId(khId)?.dynamicsOption : undefined) }
}

export type CampusFacts = CrmCampus & { key?: string }

/** The enquiry's campus: CMS campus values first, then the form's `campus` select key, the landing row's campus, a fixed key. */
export function campusFactsOf(args: { campus?: CampusLite | null; data?: Record<string, unknown>; landing?: LandingLite | null; fixed?: string | null }): CampusFacts | null {
  const { campus, data = {}, landing, fixed } = args
  const key = [text(data.campus), text(landing?.campusKey), text(fixed)].find((k) => k && crmCampuses[k])
  const row = key ? crmCampuses[key] : undefined
  if (!campus && !row) return null
  return {
    key,
    label: campus?.name ?? row?.label ?? '',
    hubspot: text(campus?.hubspotCampusValue) ?? row?.hubspot,
    kh: num(campus?.portalCampusId) ?? row?.kh,
    dynamics: row?.dynamics,
  }
}

export type WhenCtx = { facts: CourseFacts; data: Record<string, unknown>; landingPath?: string | null }

/** True when every key of `when` holds. An empty condition holds. */
export function matchesWhen(when: When | null | undefined, ctx: WhenCtx): boolean {
  if (!when) return true
  if (when.courseKhIdIn && !(ctx.facts.khId !== undefined && when.courseKhIdIn.includes(ctx.facts.khId))) return false
  if (when.courseCodeIn && !(ctx.facts.code !== undefined && when.courseCodeIn.includes(ctx.facts.code))) return false
  if (when.landingIn && !(ctx.landingPath && when.landingIn.includes(ctx.landingPath))) return false
  if (when.field) {
    const raw = ctx.data[when.field.name]
    const v = typeof raw === 'boolean' ? (raw ? 'true' : '') : text(raw) ?? ''
    if (when.field.present && !v) return false
    if (when.field.in && !when.field.in.includes(v)) return false
  }
  if (when.not && matchesWhen(when.not, ctx)) return false
  return true
}

/** The form's autoresponder variant whose `when` holds, or null (40 §6). */
export function autoresponderVariant(def: Pick<FormDef, 'autoresponder'>, ctx?: WhenCtx | null) {
  return ctx ? def.autoresponder?.variants?.find((v) => matchesWhen(v.when, ctx)) ?? null : null
}
