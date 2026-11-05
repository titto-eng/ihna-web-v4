import type { Adapter, Planned } from './types'
import { compact, envRef, sendPlannedHttp, str } from './util'
import { countryKhId, fixedKhCourseByForm, selectKhCourseByForm } from '@/content/course-crm'
import { campusFactsOf, courseFactsOf } from '@/lib/enquiries/conditions'
import { contactFrom } from '@/lib/enquiries/contact'

// Portal CRM (40 §6 "portalCrm"; inventory/05-ihm-enquiries-integrations.md §3.1 step 3 and §3.5 row 1):
// form POST to the portal's applicationFormFromWebsites endpoint. Fixed fields campaignId, createdBy and modified_user_id = 1.
// Auth: none. Report 05 §3.1 step 3 and §3.5 row 1 show a bare form POST (no header, no token) and §2.4 lists no portal-CRM credential.
// PORTAL_CRM_API_KEY stays optional (sent as `X-API-Key` if ever set) in case the portal adds one. The old handler ignored the response,
// so no success shape is documented: any 2xx is success and the body excerpt is kept on the delivery row (live.ts).
// Retries on network errors, 5xx and 429 only (see util.classify).
// Site data (src/content/course-crm.ts, empty on IHM): the KH course id of a landing page or KH picker, the KH campus id of a campus
// select key, the KH country id of a country name (else the name), `ihna_web_package_id` from `packageId`, and the phone as
// `<phoneCode> - <phone>` when the form asks for a calling code (the international pages).

// KH course ids that the old handlers fixed per form because the form had no course picker of its own: the site's
// `fixedKhCourseByForm` / `selectKhCourseByForm` (src/content/course-crm.ts; empty on IHNA, whose forms carry a KH picker or a landing id).

export function portalCourseId(formKey: string, data: Record<string, unknown>, khId?: number | null): number | undefined {
  if (khId) return khId
  if (fixedKhCourseByForm[formKey]) return fixedKhCourseByForm[formKey]
  const sel = selectKhCourseByForm[formKey]
  const v = sel ? str(data[sel.field])?.toLowerCase() : undefined
  return v ? sel!.values[v] : undefined
}

export const portalCrmAdapter: Adapter = {
  name: 'portalCrm',
  enabled: () => true,
  targets: () => ['portal'],
  plan(input): Planned {
    const env = input.env ?? process.env
    const missing: string[] = []
    const { enquiry: e, course, campus, landing, destination } = input
    const c = contactFrom(e.data)
    const headers: Record<string, string> = {}
    const key = env.PORTAL_CRM_API_KEY?.trim()
    if (key) headers['X-API-Key'] = key
    const type = e.studentType ?? c.studentType ?? landing?.studentType ?? destination.config?.studentType ?? undefined
    const student = type === 'international' ? '1' : type === 'domestic' ? '0' : undefined
    const facts = courseFactsOf({ course, data: e.data, landing })
    const campusFacts = campusFactsOf({ campus, data: e.data, landing, fixed: destination.config?.campusFixed })
    const phone = e.phone ?? c.phone
    const phoneCode = str(e.data.phoneCode)
    const country = e.country ?? c.country
    const body = compact({
      courseId: portalCourseId(e.formKey, e.data, course?.khId ?? facts.khId),
      specialisation_index: str(course?.splId),
      firstName: e.firstName ?? c.firstName,
      lastName: e.lastName ?? c.lastName,
      phone: phoneCode && phone ? `${phoneCode} - ${phone}` : phone,
      email: e.email ?? c.email,
      country: country ? countryKhId(country) ?? country : undefined,
      campus: campusFacts?.kh ?? undefined,
      description: str(e.data.message),
      enquirySourceId: input.sourceId,
      student_type: student,
      partner_id: str(e.data.agentCode),
      ihna_web_package_id: str(e.data.packageId),
      ip_address: str(e.ip),
      campaignId: 1,
      createdBy: 1,
      modified_user_id: 1,
    })
    return {
      transport: 'http',
      requests: [{ method: 'POST', url: envRef('PORTAL_CRM_URL', env, missing), headers, encoding: 'form', body, note: 'portal CRM applicationFormFromWebsites' }],
      missingEnv: missing,
    }
  },
  send: (planned) => sendPlannedHttp(planned),
}
