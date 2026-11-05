import { describe, expect, it } from 'vitest'
import { campaignByCode, campaignCodes } from '@/content/campaign-codes'
import { campaignAttribution, dynamicsCampaignId, hubspotCampaignSource, leadDescription, leadSource, resolveCampaign, resolveSourceId } from '@/lib/enquiries/campaign'

// IHNA campaign table (41 §2, src/content/campaign-codes.ts, generated once from campaign_codes.php) and how a stored code becomes
// the KH source, the HubSpot campaign_source, the Dynamics campaign bind and the staff email rows.
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('campaign table', () => {
  it('has the 57 unique codes of campaign_codes.php, with lp_default and default', () => {
    expect(campaignCodes).toHaveLength(57)
    expect(new Set(campaignCodes.map((c) => c.code)).size).toBe(57)
    expect(campaignByCode('lp_default')).toMatchObject({ enquirySourceId: 597, hsCampaignSource: 'IHNA Landing Pages' })
    expect(campaignByCode('default')).toMatchObject({ enquirySourceId: 2, leadSrc: 'IHNA Web Site', leadDesc: 'Enquiry from IHNA Website' })
  })

  it('35 codes are full (KH source + Dynamics GUID), 22 partial (neither)', () => {
    const full = campaignCodes.filter((c) => c.enquirySourceId !== null && c.dynamicsCampaignId !== null)
    const partial = campaignCodes.filter((c) => c.enquirySourceId === null && c.dynamicsCampaignId === null)
    expect(full).toHaveLength(35)
    expect(partial).toHaveLength(22)
  })

  it('holds identifiers only: every campaign id is a GUID, every value is short plain text (no credential)', () => {
    for (const c of campaignCodes) {
      expect(c.code).toMatch(/^[A-Za-z0-9_-]{2,64}$/)
      if (c.dynamicsCampaignId) expect(c.dynamicsCampaignId).toMatch(GUID)
      for (const v of [c.leadSrc, c.leadDesc, c.hsCampaignSource]) if (v) expect(v).toMatch(/^[\w .&:–-]{1,80}$/)
    }
    expect(JSON.stringify(campaignCodes)).not.toMatch(/token|secret|password|bearer|key/i)
  })

  it('codes are case-sensitive and the later duplicate gadbrislocaliq wins', () => {
    expect(campaignByCode('GA')).toBeNull()
    expect(campaignByCode('gadbrislocaliq')).toMatchObject({ line: 327 })
  })
})

describe('attribution (41 §4)', () => {
  const landingForm = { campaignFallback: 'lp_default' }
  const wpForm = { campaignFallback: 'default' }
  const routing = { defaultSourceId: 2 }

  it('a full code sets the KH source, HubSpot source, Dynamics GUID and the lead source', () => {
    const a = campaignAttribution('gasyd', landingForm)
    expect(resolveSourceId({}, routing, a)).toBe(594)
    expect(hubspotCampaignSource({}, a, null, 'IHNA Website')).toEqual({ value: 'Google Ad Sydney', fallback: false })
    expect(dynamicsCampaignId(a, 'default')).toBe(campaignByCode('gasyd')!.dynamicsCampaignId)
    expect(leadSource(a)).toBe('Google Ad Sydney')
  })

  it('a partial code keeps its HubSpot source; KH source and GUID fall back to the page/form fallback row', () => {
    const a = campaignAttribution('fbmelblp', landingForm)
    expect(resolveSourceId({}, routing, a)).toBe(597)
    expect(hubspotCampaignSource({}, a, null, 'IHNA Website').value).toBe('Facebook Ad Melbourne LP')
    expect(dynamicsCampaignId(a, 'default')).toBe(campaignByCode('lp_default')!.dynamicsCampaignId)
  })

  it('an unknown or missing code: lp_default on landing forms, default on WP forms; the raw code is still stored', async () => {
    expect(resolveSourceId({}, routing, campaignAttribution('zzunknown', landingForm))).toBe(597)
    expect(resolveSourceId({}, routing, campaignAttribution(null, wpForm))).toBe(2)
    expect(hubspotCampaignSource({}, campaignAttribution(null, landingForm), null, 'IHNA Website')).toEqual({ value: 'IHNA Landing Pages', fallback: true })
    expect(leadDescription(campaignAttribution(null, wpForm))).toBe('Enquiry from IHNA Website')
    expect((await resolveCampaign(null, { bodyCampaign: 'zzunknown' })).campaignCode).toBe('zzunknown')
  })

  it('order: fixed source beats the code; the code beats the form default; the landing row\'s code wins over the visitor', async () => {
    const a = campaignAttribution('gasyd', wpForm)
    expect(resolveSourceId({ fixedSourceId: 1 }, routing, a)).toBe(1)
    expect(resolveSourceId({ defaultSourceId: 5 }, routing, a)).toBe(594)
    expect(resolveSourceId({ defaultSourceId: 5 }, routing, campaignAttribution(null, wpForm))).toBe(5)
    expect(hubspotCampaignSource({ hubspotCampaignSourceFixed: 'Website Brochure Download' }, a, null, 'x').value).toBe('Website Brochure Download')
    expect(hubspotCampaignSource({}, a, { path: '/x/', hubspotCampaignSource: 'IHNA Online Google Ad' }, 'x').value).toBe('IHNA Online Google Ad')
    expect((await resolveCampaign(null, { bodyCampaign: 'gasyd', landing: { path: '/study-at-ihna/tollfree/', fixedCampaign: 'tollfree' } })).campaignCode).toBe('tollfree')
    expect((await resolveCampaign(null, { bodyCampaign: 'gasyd', fieldCode: 'fbbrisbane' })).campaignCode).toBe('fbbrisbane')
  })

  it('a site without a table keeps IHM behaviour (no attribution)', () => {
    expect(campaignAttribution('gasyd', {})).not.toBeNull() // IHNA has the row
    expect(campaignAttribution('nope', {})).toBeNull()
    expect(resolveSourceId({}, { defaultSourceId: 24 }, null)).toBe(24)
  })
})
