import type { Adapter, Planned, PlannedHttp, SendResult } from './types'
import { classify, compact, envRef, httpSend, networkError, str } from './util'
import { dynamicsMap } from '@/content/dynamics-map'
import { dynamicsCampaignId, leadSource } from '@/lib/enquiries/campaign'
import { campusFactsOf, courseFactsOf } from '@/lib/enquiries/conditions'
import { isDynamicsEnabled } from '@/lib/enquiries/config'
import { contactFrom } from '@/lib/enquiries/contact'

// Dynamics 365 (40 §6 "dynamics"; DEC-12; inventory/05 §3.1 "dcap special case"). Shared code, enabled only by DYNAMICS_ENABLED=1
// (IHM has no live user and no IHM formKey has this destination). Client-credentials flow (the old password grant is gone).
// `leads` first, then `new_enquiries`. The stored lead id (`externalId`) lets a retry resume at the second insert. The bodies follow the
// site's map (src/content/dynamics-map.ts): university option, campus / course / package / student-type options, the campaign bind
// from the campaign table (41) and pass-through lead fields. A site with an empty map sends the plain IHM body.
const API = 'api/data/v9.2'

export const dynamicsAdapter: Adapter = {
  name: 'dynamics',
  enabled: (env = process.env) => isDynamicsEnabled(env),
  targets: () => ['leads'],
  plan(input): Planned {
    const env = input.env ?? process.env
    const missing: string[] = []
    const base = envRef('DYNAMICS_URL', env, missing).replace(/\/$/, '')
    const tenant = envRef('DYNAMICS_TENANT_ID', env, missing)
    const { enquiry: e, course, campus, landing, destination } = input
    const c = contactFrom(e.data)
    const first = e.firstName ?? c.firstName
    const last = e.lastName ?? c.lastName
    const fullName = [first, last].filter(Boolean).join(' ')
    const map = dynamicsMap
    const facts = courseFactsOf({ course, data: e.data, landing })
    const pkg = str(e.data.packageId)
    const courseOption = (pkg ? map.packageOptions[pkg] : undefined) ?? str(course?.dynamicsCourseOption) ?? (facts.khId ? map.courseOptions[facts.khId] : undefined)
    const campusKey = campusFactsOf({ campus, data: e.data, landing, fixed: destination.config?.campusFixed })?.key
    const studentType = e.studentType ?? c.studentType ?? landing?.studentType ?? destination.config?.studentType ?? undefined
    const campaignGuid = map.campaignFallbackCode !== null ? dynamicsCampaignId(input.campaign, map.campaignFallbackCode) : undefined
    const extra: Record<string, unknown> = {}
    for (const [field, attr] of Object.entries(map.leadFields)) {
      const v = e.data[field]
      if (typeof v === 'boolean') extra[attr] = v
      else if (str(v)) extra[attr] = str(v)
    }
    const subject = str(destination.config?.dynamicsSubject) ?? map.defaultSubject ?? `Enquiry from ${input.form.name ?? input.form.key}`

    const token: PlannedHttp = {
      method: 'POST',
      url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      headers: {},
      encoding: 'form',
      body: { grant_type: 'client_credentials', client_id: envRef('DYNAMICS_CLIENT_ID', env, missing), client_secret: envRef('DYNAMICS_CLIENT_SECRET', env, missing), scope: `${base}/.default` },
      note: 'client-credentials token',
    }
    const lead: PlannedHttp = {
      method: 'POST', url: `${base}/${API}/leads`, headers: { Authorization: 'Bearer <token>' }, encoding: 'json',
      body: compact({
        firstname: first, lastname: last, fullname: fullName,
        address1_country: e.country ?? c.country, emailaddress1: e.email ?? c.email, mobilephone: e.phone ?? c.phone,
        new_courseinterested: courseOption, subject,
        new_preferredcampus: campusKey ? map.campusOptions[campusKey] : undefined,
        new_studenttype: studentType && map.studentTypeOptions ? map.studentTypeOptions[studentType as 'domestic' | 'international'] : undefined,
        new_questionsorcomm: map.messageOnLead ? str(e.data.message) : undefined,
        'campaignid@odata.bind': campaignGuid ? `/campaigns(${campaignGuid})` : undefined,
        ...extra,
      }),
      note: 'lead',
    }
    const enquiry: PlannedHttp = {
      method: 'POST', url: `${base}/${API}/new_enquiries`, headers: { Authorization: 'Bearer <token>' }, encoding: 'json',
      body: compact({
        new_name: map.enquiryName ?? fullName, new_description: str(e.data.message),
        new_campaign: map.sendNewCampaign ? leadSource(input.campaign) : undefined,
        new_interesteduniversities: map.interestedUniversities, new_courseinterested: courseOption,
        'new_Lead@odata.bind': '/leads(<lead-id>)',
      }),
      note: 'enquiry linked to the lead',
    }
    return { transport: 'http', requests: [token, lead, enquiry], missingEnv: missing }
  },
  async send(planned, input): Promise<SendResult> {
    if (planned.transport !== 'http') return { ok: false, retryable: false, error: 'not an http plan' }
    if (planned.missingEnv?.length) return { ok: false, retryable: false, error: `missing configuration: ${planned.missingEnv.join(', ')}` }
    const [tokenReq, leadReq, enquiryReq] = planned.requests
    let leadId = input.existing?.externalId ?? undefined
    try {
      const t = await httpSend(tokenReq)
      const tc = classify(t.status)
      if (!tc.ok) return tc
      const accessToken = (JSON.parse(t.text) as { access_token?: string }).access_token
      if (!accessToken) return { ok: false, retryable: false, error: 'token response had no access_token' }
      const auth = { Authorization: `Bearer ${accessToken}`, Prefer: 'return=representation' }

      if (!leadId) {
        const l = await httpSend({ ...leadReq, headers: { ...leadReq.headers, ...auth } })
        const lc = classify(l.status)
        if (!lc.ok) return lc
        leadId = (JSON.parse(l.text) as { leadid?: string }).leadid
        if (!leadId) return { ok: false, retryable: false, error: 'lead response had no leadid' }
      }
      const body = { ...enquiryReq.body, 'new_Lead@odata.bind': `/leads(${leadId})` }
      const q = await httpSend({ ...enquiryReq, headers: { ...enquiryReq.headers, ...auth }, body })
      const qc = classify(q.status)
      return { ...qc, externalId: leadId }
    } catch (e) {
      return { ...(networkError(e) as Extract<SendResult, { ok: false }>), externalId: leadId }
    }
  },
}
