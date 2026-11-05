// Site-specific tracking defaults (80-tracking §2 and §9 "IHNA differences"). They apply only where `site.tracking`
// (src/content/site.ts) leaves a value empty. ihm-web carries its own copy (this file is not shared).
export const TRACKING_DEFAULTS = {
  gtmId: 'GTM-M2PBNS', // mwt-ihna/header.php
  clarityId: '9pyrntuztg',
  hubspotPortalId: '26193905', // EU1
  hubspotRegion: 'eu1' as 'na1' | 'eu1',
  /** No Airgentic account on IHNA: the script never loads unless `site.tracking.airgenticId` is filled. */
  airgentic: { accountId: '', serviceId: 'website' },
  /** LiveChat licence, site-wide. The Zopim snippet and the ihna.online chat iframe are not ported. */
  livechatLicence: '12907932',
  /**
   * 80 §9 (grepped in ../ihna-web-2.0): GTM-KC4DVMW replaces the main container on the four Perth fee-free domestic landing pages and
   * the anaesthetic-technology page (index + thanks each); GTM-K3TPCL on one international thank-you page. Paths keep their case.
   */
  gtmOverrides: [
    { pathPrefix: '/study-at-ihna/domestic/certificate-iii-health-services-assistance-Perth-FF/', containerId: 'GTM-KC4DVMW' },
    { pathPrefix: '/study-at-ihna/domestic/certificate-iii-in-pathology-collection-Perth-FF/', containerId: 'GTM-KC4DVMW' },
    { pathPrefix: '/study-at-ihna/domestic/certificate-iii-in-sterilisation-services-Perth-FF/', containerId: 'GTM-KC4DVMW' },
    { pathPrefix: '/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-Perth-FF/', containerId: 'GTM-KC4DVMW' },
    { pathPrefix: '/study-at-ihna/domestic/HLT57921-diploma-of-anaesthetic-technology-and-practice/', containerId: 'GTM-KC4DVMW' },
    { pathPrefix: '/study-at-ihna/certificate3-individual-suport-int-thanks.php', containerId: 'GTM-K3TPCL' },
  ],
  /** HubSpot is skipped on the payment templates (header.php:187). */
  exclusions: [
    { tool: 'hubspot', pathPrefix: '/pay-online/' },
    { tool: 'hubspot', pathPrefix: '/pay/' },
    { tool: 'hubspot', pathPrefix: '/airwallex/' },
    { tool: 'hubspot', pathPrefix: '/secure-pay/' },
  ] as { tool: ToolName; pathPrefix: string }[],
  /**
   * Meta pixels, PageView only, each on the pages of one old WordPress page-id group (header.php: 85/89, 91/95, 111/112, 115).
   * None of those ids is a published page in the REST export, so the paths stay empty until the dump maps them (80 §9); a pixel
   * with no paths never loads.
   */
  metaPixels: [
    { pixelId: '988091695328691', paths: [] as string[] },
    { pixelId: '830252460920799', paths: [] as string[] },
    { pixelId: '867500190574239', paths: [] as string[] },
    { pixelId: '1304174603320589', paths: [] as string[] },
  ],
}

export type ToolName = 'gtm' | 'clarity' | 'hubspot' | 'airgentic' | 'livechat' | 'metaPixel'
