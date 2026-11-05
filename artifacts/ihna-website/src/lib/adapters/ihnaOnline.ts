import { createHash } from 'node:crypto'
import type { Adapter, Planned } from './types'
import { compact, envRef, sendPlannedHttp, str } from './util'
import { hubspotMap } from '@/content/hubspot-map'
import { hubspotCampaignSource } from '@/lib/enquiries/campaign'
import { courseFactsOf } from '@/lib/enquiries/conditions'
import { contactFrom } from '@/lib/enquiries/contact'

// IHNA Online leads webhook (40 §6 "ihnaOnline"; brief §1 family 1, functions.php ~709-770): JSON POST to IHNA_ONLINE_WEBHOOK_URL with
// the header `X-Webhook-Key: IHNA_ONLINE_WEBHOOK_KEY`; 200/201 = accepted (any 2xx is sent, see util.classify). The `lead_id` is
// derived from the enquiry's `submissionId` (never from personal data), so a retry sends the same id and the portal can dedupe.
// Sends only through the live switch (live.ts): DRY_RUN=1 records the request with the key masked.
export const ihnaOnlineLeadId = (submissionId: string): string => `ihna-web-${createHash('sha256').update(submissionId).digest('hex').slice(0, 32)}`

export const ihnaOnlineAdapter: Adapter = {
  name: 'ihnaOnline',
  enabled: () => true,
  targets: () => ['leads'],
  plan(input): Planned {
    const env = input.env ?? process.env
    const missing: string[] = []
    const { enquiry: e, course, form, landing, destination } = input
    const c = contactFrom(e.data)
    const facts = courseFactsOf({ course, data: e.data, landing })
    const source = hubspotCampaignSource(destination.config, input.campaign, landing, hubspotMap.defaultCampaignSource)
    const whereHear = [str(e.data.whereHear), str(e.data.whereHearOther)].filter(Boolean).join(' - ') || undefined
    const phone = e.phone ?? c.phone
    const u = e.utm
    const body = compact({
      lead_id: ihnaOnlineLeadId(e.submissionId),
      first_name: e.firstName ?? c.firstName,
      last_name: e.lastName ?? c.lastName,
      email: e.email ?? c.email,
      phone,
      mobile: phone,
      course_code: facts.code,
      message: str(e.data.message),
      preferred_intake: str(e.data.preferredIntake),
      how_did_you_hear: whereHear,
      utm_source: str(u?.utmSource) ?? source.value,
      utm_medium: str(u?.utmMedium),
      utm_campaign: str(u?.utmCampaign) ?? e.campaignCode ?? undefined,
      campaign_name: e.campaignCode ?? undefined,
      form_name: form.name ?? form.key,
      source: 'WEBSITE',
    })
    const headers: Record<string, string> = { 'X-Webhook-Key': envRef('IHNA_ONLINE_WEBHOOK_KEY', env, missing) }
    return { transport: 'http', requests: [{ method: 'POST', url: envRef('IHNA_ONLINE_WEBHOOK_URL', env, missing), headers, encoding: 'json', body, note: 'IHNA Online leads webhook' }], missingEnv: missing }
  },
  send: (planned) => sendPlannedHttp(planned),
}
