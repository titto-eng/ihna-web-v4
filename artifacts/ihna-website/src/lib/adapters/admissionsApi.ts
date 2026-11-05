import type { Adapter, Planned } from './types'
import { compact, envRef, sendPlannedHttp, str } from './util'
import { contactFrom } from '@/lib/enquiries/contact'

// Admissions API for the four Bachelor of Nursing landing pages (40 §6 "admissionsApi"; inventory/05 §3.4 "G5").
// JSON POST with `X-API-Key`. The API dedupes on `submission_id`, so retries are safe. A 400 is not retryable and the `email`
// destination of the form is the backup.
const BON_CAMPUS: Record<string, { api: string; city: string }> = {
  sydney: { api: 'Sydney (Argyle St)', city: 'Sydney' },
  brisbane: { api: 'Brisbane (CBD)', city: 'Brisbane' },
  melbourne: { api: 'Melbourne CBD', city: 'Melbourne' },
  perth: { api: 'Perth (SGT)', city: 'Perth' },
}

export const admissionsApiAdapter: Adapter = {
  name: 'admissionsApi',
  enabled: () => true,
  targets: () => ['admissions'],
  plan(input): Planned {
    const env = input.env ?? process.env
    const missing: string[] = []
    const { enquiry: e, campus } = input
    const c = contactFrom(e.data)
    const mapped = BON_CAMPUS[(campus?.slug ?? '').toLowerCase()]
    const u = e.utm
    const body = compact({
      first_name: e.firstName ?? c.firstName,
      last_name: e.lastName ?? c.lastName,
      email: e.email ?? c.email,
      mobile: e.phone ?? c.phone,
      mobile_country_code: str(e.data.mobileCountryCode),
      course_code: 'BN',
      campus: mapped?.api ?? campus?.name,
      heard_about: mapped ? `BON ${mapped.city} - Google Ads` : undefined,
      promo_code: '',
      message: str(e.data.message) ?? '',
      submission_id: e.submissionId,
      page_url: str(e.pageUrl),
      utm_source: str(u?.utmSource), utm_medium: str(u?.utmMedium), utm_campaign: str(u?.utmCampaign), utm_content: str(u?.utmContent), utm_term: str(u?.utmTerm),
    })
    // `promo_code` and `message` are sent even when empty, as the old payload did.
    body.promo_code = ''
    body.message = str(e.data.message) ?? ''
    const headers: Record<string, string> = { 'X-API-Key': envRef('ADMISSIONS_API_KEY', env, missing) }
    return { transport: 'http', requests: [{ method: 'POST', url: envRef('ADMISSIONS_API_URL', env, missing), headers, encoding: 'json', body, note: 'admissions API website lead' }], missingEnv: missing }
  },
  send: (planned) => sendPlannedHttp(planned),
}
