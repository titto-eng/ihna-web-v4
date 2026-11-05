import { describe, expect, it } from 'vitest'
import { activeTags, buildTrackingConfig, hubspotScriptUrl } from '@/components/tracking/config'
import { assertNoPii, brochureDownload, eventRegistration, generateLead, pageViewVirtual, purchase } from '@/components/tracking/datalayer'
import { readHutk } from '@/components/tracking/hutk'
import { buildCsp, embedHostSources } from '@/lib/seo/csp'

describe('tracking config (IHNA defaults, 80 §9)', () => {
  const cfg = buildTrackingConfig({ gtmId: 'GTM-M2PBNS', clarityId: '9pyrntuztg', hubspotPortalId: '26193905', hubspotRegion: 'eu1' }, true)

  it('loads the default tags everywhere: GTM, Clarity, HubSpot EU1 and LiveChat; no Airgentic, no pixel without a mapped path', () => {
    expect(activeTags(cfg, '/')).toEqual({
      gtmId: 'GTM-M2PBNS', clarityId: '9pyrntuztg', hubspot: { portalId: '26193905', region: 'eu1' }, airgentic: undefined, livechatLicence: '12907932', metaPixelIds: [],
    })
    expect(hubspotScriptUrl(cfg.hubspot!)).toBe('https://js-eu1.hs-scripts.com/26193905.js')
  })

  it('the Perth fee-free landing pages and the international thank-you page swap the GTM container', () => {
    expect(activeTags(cfg, '/study-at-ihna/domestic/certificate-iii-in-pathology-collection-Perth-FF/').gtmId).toBe('GTM-KC4DVMW')
    expect(activeTags(cfg, '/study-at-ihna/domestic/certificate-iii-in-pathology-collection-Perth-FF/thanks.php').gtmId).toBe('GTM-KC4DVMW')
    expect(activeTags(cfg, '/study-at-ihna/domestic/HLT57921-diploma-of-anaesthetic-technology-and-practice/').gtmId).toBe('GTM-KC4DVMW')
    expect(activeTags(cfg, '/study-at-ihna/certificate3-individual-suport-int-thanks.php').gtmId).toBe('GTM-K3TPCL')
    expect(activeTags(cfg, '/study-at-ihna/certificate3-individual-suport-int.php').gtmId).toBe('GTM-M2PBNS')
    expect(activeTags(cfg, '/study-at-ihna/domestic/certificate-iii-in-pathology-collection-melbourne/').gtmId).toBe('GTM-M2PBNS')
  })

  it('payment pages load no HubSpot (header.php:187)', () => {
    for (const p of ['/pay-online/', '/pay/receipt/1', '/airwallex/', '/secure-pay/']) expect(activeTags(cfg, p).hubspot).toBeUndefined()
    expect(activeTags(cfg, '/pay-online/').gtmId).toBe('GTM-M2PBNS')
  })

  it('a Meta pixel loads only on its mapped paths', () => {
    const c = buildTrackingConfig({ metaPixels: [{ pixelId: '988091695328691', paths: [{ path: '/some-landing-page/' }] }, { pixelId: 'bad id', paths: [{ path: '/' }] }] }, true)
    expect(activeTags(c, '/some-landing-page/').metaPixelIds).toEqual(['988091695328691'])
    expect(activeTags(c, '/some-landing-page').metaPixelIds).toEqual(['988091695328691'])
    expect(activeTags(c, '/').metaPixelIds).toEqual([])
    expect(activeTags(buildTrackingConfig({ exclusions: [{ tool: 'metaPixel', pathPrefix: '/' }], metaPixels: [{ pixelId: '988091695328691', paths: [{ path: '/x/' }] }] }, true), '/x/').metaPixelIds).toEqual([])
  })

  it('loads nothing when TRACKING_ENABLED is off', () => {
    expect(activeTags(buildTrackingConfig(null, false), '/')).toEqual({ metaPixelIds: [] })
  })

  it('takes ids, overrides and exclusions from settings, ignoring malformed values', () => {
    const c = buildTrackingConfig(
      { gtmId: 'GTM-AAA', clarityId: '"><script>', hubspotRegion: 'na1', hubspotPortalId: '39853473', livechatLicence: 'x y', gtmOverrides: [{ pathPrefix: '/x', containerId: 'GTM-BBB' }, { pathPrefix: 'nope', containerId: 'GTM-C' }], exclusions: [{ tool: 'livechat', pathPrefix: '/pay' }, { tool: 'evil', pathPrefix: '/' }] },
      true,
    )
    expect(c.clarityId).toBe('9pyrntuztg') // invalid -> site default, never injected
    expect(c.livechatLicence).toBe('12907932')
    expect(activeTags(c, '/x/y/').gtmId).toBe('GTM-BBB')
    expect(activeTags(c, '/pay/receipt/1').livechatLicence).toBeUndefined()
    expect(activeTags(c, '/').livechatLicence).toBe('12907932')
    expect(c.exclusions).toHaveLength(1)
    expect(hubspotScriptUrl(c.hubspot!)).toBe('https://js.hs-scripts.com/39853473.js')
  })
})

describe('dataLayer builders', () => {
  it('generate_lead carries only opaque fields', () => {
    expect(generateLead({ formKey: 'quick-enquiry', campaign: 'c1', courseCode: 'BN01', campus: 'Melbourne', studentType: 'domestic', enquiryRef: 'abc123' })).toEqual({
      event: 'generate_lead', form_key: 'quick-enquiry', campaign: 'c1', course_code: 'BN01', campus: 'Melbourne', student_type: 'domestic', enquiry_ref: 'abc123',
    })
    expect(brochureDownload({ formKey: 'b', courseCode: 'X' })).toMatchObject({ event: 'brochure_download' })
    expect(eventRegistration({ eventSlug: 'open-day' })).toMatchObject({ event: 'event_registration', event_slug: 'open-day' })
    expect(pageViewVirtual('/a/', 'A')).toMatchObject({ event: 'page_view_virtual', page_path: '/a/' })
  })

  it('purchase uses server values, AUD and GA4 item shape', () => {
    expect(purchase({ transactionId: '550e8400-e29b-41d4-a716-446655440000', value: 123.45, paymentType: 'airwallex', items: [{ itemId: 'invoice', itemName: 'Invoice', price: 123.45 }] })).toEqual({
      event: 'purchase', transaction_id: '550e8400-e29b-41d4-a716-446655440000', value: 123.45, currency: 'AUD', payment_type: 'airwallex', items: [{ item_id: 'invoice', item_name: 'Invoice', price: 123.45 }],
    })
  })

  it('rejects PII-shaped keys and email-like values', () => {
    expect(() => assertNoPii({ event: 'x', email: 'a@b.co' })).toThrow(/PII key/)
    expect(() => assertNoPii({ event: 'x', items: [{ phone: '1' }] })).toThrow(/PII key/)
    expect(() => assertNoPii({ event: 'x', note: 'mail me at jo@example.com' })).toThrow(/email-like/)
    expect(() => generateLead({ formKey: 'f', campaign: 'jo@example.com' })).toThrow(/email-like/)
    expect(() => assertNoPii({ event: 'purchase', items: [{ item_name: 'Invoice' }] })).not.toThrow()
  })
})

describe('hutk', () => {
  it('reads hubspotutk from a cookie string', () => {
    expect(readHutk('a=1; hubspotutk=abc123; b=2')).toBe('abc123')
    expect(readHutk('xhubspotutk=no')).toBe('')
    expect(readHutk('')).toBe('')
  })
})

describe('CSP', () => {
  it('builds frame-src from the fixed list plus allowedEmbedHosts, and drops junk', () => {
    const hosts = embedHostSources(['my.matterport.com', 'https://forms.monday.com/x', 'ihna.online', "evil.com; script-src *", '', null])
    expect(hosts).toEqual(['https://my.matterport.com', 'https://forms.monday.com', 'https://ihna.online'])
    const { reportOnly, enforced } = buildCsp({ embedHosts: hosts })
    const frame = reportOnly.split('; ').find((d) => d.startsWith('frame-src'))!
    for (const h of ['https://www.youtube-nocookie.com', 'https://player.vimeo.com', 'https://www.google.com', 'https://chat.airgentic.com', 'https://www.googletagmanager.com', 'https://my.matterport.com', 'https://ihna.online']) expect(frame).toContain(h)
    expect(reportOnly).toContain('https://js.hs-scripts.com')
    expect(reportOnly).toContain('https://www.clarity.ms')
    expect(reportOnly).toContain('https://js-eu1.hs-scripts.com')
    expect(reportOnly).toContain('https://cdn.livechatinc.com')
    expect(reportOnly).toContain('https://connect.facebook.net')
    expect(reportOnly).not.toContain('evil.com')
    expect(reportOnly).not.toContain("'unsafe-eval'")
    expect(enforced).toBe("object-src 'none'; base-uri 'self'; frame-ancestors 'self'")
  })

  it('the admin policy has no third-party host', () => {
    expect(buildCsp({ admin: true }).reportOnly).not.toMatch(/https:\/\//)
  })
})
