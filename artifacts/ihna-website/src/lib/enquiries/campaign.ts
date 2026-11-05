import { campaignByCode, type CampaignCode } from '@/content/campaign-codes'
import { site } from '@/content/site'
import { cleanText, CODE_PATTERN, parseAttributionCookie } from './request'
import type { LandingLite, RoutingLite } from './lookups'
import type { DestinationDef, FormDef } from './types'

export type CampaignResolution = {
  /** Raw code as received (valid format only), stored on the enquiry row and shown to staff (DEC-41, DEC-62). */
  campaignCode: string | null
}

/**
 * Resolution order (41 §4): the landing row's `fixedCampaign`, a `promo_code` field, a `campaignCode` select field (staff pages; the
 * select's options are the allowed codes), body `campaign`, the `site.attributionCookies` (last, first). An invalid code (anything outside
 * `^[A-Za-z0-9_-]{2,64}$`) is ignored, never stored or reflected. A valid code is stored raw, known to the table or not.
 */
export async function resolveCampaign(
  _payload: unknown,
  args: { bodyCampaign?: string; cookieHeader?: string | null; landing?: LandingLite | null; promoCode?: string; fieldCode?: string },
): Promise<CampaignResolution> {
  const candidates = [
    cleanText(args.landing?.fixedCampaign ?? undefined, 64),
    cleanText(args.promoCode, 64),
    cleanText(args.fieldCode, 64),
    cleanText(args.bodyCampaign, 64),
    parseAttributionCookie(args.cookieHeader, site.attributionCookies.last).campaign,
    parseAttributionCookie(args.cookieHeader, site.attributionCookies.first).campaign,
  ]
  const code = candidates.find((c) => c && CODE_PATTERN.test(c)) ?? null
  return { campaignCode: code }
}

/**
 * What a stored code means for the destinations (41 §4): `row` is the code's table row (src/content/campaign-codes.ts), `fallback`
 * the row of the landing page's or the form's `campaignFallback` (`lp_default` on landing pages, `default` on the WP-family forms).
 * Null when the site has no table or neither row exists: the destinations then use the form defaults only (IHM).
 */
export type CampaignAttribution = { code: string | null; row: CampaignCode | null; fallback: CampaignCode | null }

export function campaignAttribution(code: string | null | undefined, form: Pick<FormDef, 'campaignFallback'>, landing?: LandingLite | null): CampaignAttribution | null {
  const row = campaignByCode(code)
  const fbCode = landing?.campaignFallback ?? form.campaignFallback ?? null
  const fallback = campaignByCode(fbCode)
  if (!row && !fallback) return null
  return { code: code ?? null, row, fallback }
}

const nonBlank = (v: string | null | undefined): string | undefined => (v && v.trim() !== '' ? v.trim() : undefined)

/** Staff-email and Dynamics `new_campaign` text: the code's row, else the fallback row. */
export const leadSource = (a: CampaignAttribution | null | undefined): string | undefined => nonBlank(a?.row?.leadSrc) ?? nonBlank(a?.fallback?.leadSrc)
export const leadDescription = (a: CampaignAttribution | null | undefined): string | undefined => nonBlank(a?.row?.leadDesc) ?? nonBlank(a?.fallback?.leadDesc)

/**
 * Portal `enquirySourceId`, first match wins (41 §4): the form's fixedSourceId, the code's table source, the form's defaultSourceId,
 * the fallback row's source, then the site default (`enquiry-routing.ts`). Without a campaign table this is IHM's order (DEC-41).
 */
export function resolveSourceId(config: DestinationDef['config'], routing: Pick<RoutingLite, 'defaultSourceId'>, attribution?: CampaignAttribution | null): number {
  if (typeof config?.fixedSourceId === 'number') return config.fixedSourceId
  if (typeof attribution?.row?.enquirySourceId === 'number') return attribution.row.enquirySourceId
  if (typeof config?.defaultSourceId === 'number') return config.defaultSourceId
  if (typeof attribution?.fallback?.enquirySourceId === 'number') return attribution.fallback.enquirySourceId
  return routing.defaultSourceId ?? 24
}

/**
 * HubSpot `campaign_source` (41 §6): the destination's fixed value, the landing page's hard-coded value, the code's table value, the
 * form default, the fallback row's value, then the site default. `fallback` is true when neither a fixed value nor the code decided.
 */
export function hubspotCampaignSource(
  config: DestinationDef['config'], attribution: CampaignAttribution | null | undefined, landing: LandingLite | null | undefined, siteDefault: string,
): { value: string; fallback: boolean } {
  const fixed = nonBlank(config?.hubspotCampaignSourceFixed) ?? nonBlank(landing?.hubspotCampaignSource)
  if (fixed) return { value: fixed, fallback: false }
  const fromCode = nonBlank(attribution?.row?.hsCampaignSource)
  if (fromCode) return { value: fromCode, fallback: false }
  return { value: nonBlank(config?.hubspotCampaignSourceDefault) ?? nonBlank(attribution?.fallback?.hsCampaignSource) ?? siteDefault, fallback: true }
}

/** Dynamics campaign GUID (41 §6): the code's, else the fallback row's, else the site's fallback code's (`default`). */
export function dynamicsCampaignId(attribution: CampaignAttribution | null | undefined, fallbackCode: string | null): string | undefined {
  return nonBlank(attribution?.row?.dynamicsCampaignId) ?? nonBlank(attribution?.fallback?.dynamicsCampaignId) ?? nonBlank(campaignByCode(fallbackCode)?.dynamicsCampaignId)
}
