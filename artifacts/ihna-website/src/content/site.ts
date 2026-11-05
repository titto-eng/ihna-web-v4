// Site settings. Hand-edited code (no CMS global behind it). Keep it plain data.
// IHNA values. Contact lines are from the old theme's footer.php / header.php (mwt-ihna); tracking ids fall back to
// src/components/tracking/defaults.ts while `tracking` below is empty (80-tracking §2, §9).
import type { Media } from '@/payload-types'

export const site = {
  siteName: 'Institute of Health and Nursing Australia',
  shortName: 'IHNA',
  titleTemplate: '%s | IHNA',
  // TODO(ihna): marketing copy for the default meta description.
  defaultDescription: 'Nursing, aged care, disability and health courses at the Institute of Health and Nursing Australia (IHNA).',
  phone: '1800 22 52 83',
  /** From outside Australia (live header, footer and /contact/); the footer's Contact column links it. */
  phoneInternational: '+61 3 9455 4462',
  email: 'enquiry@ihna.edu.au',
  whatsappNumber: null,
  // Brand logo (IHNA_CI.webp, "IHNA Australia – Powered by Arizona State University"), served from public/images/ihna/brand/.
  // `logo` is the full-colour version for light surfaces; `logoLight` swaps the black strapline for white on dark surfaces (footer,
  // video hero). Shaped like a Media doc so SEO helpers (Organization JSON-LD) read it the same way.
  logo: { id: 0, url: '/images/ihna/brand/ihna-logo.webp', width: 1453, height: 665, alt: 'IHNA Australia, powered by Arizona State University' } as unknown as Media,
  logoLight: { url: '/images/ihna/brand/ihna-logo-light.webp', width: 1453, height: 665 },
  /** Square shield mark (favicons, compact header). */
  logoMark: { url: '/images/ihna/brand/ihna-mark.webp', width: 512, height: 512 },
  defaultOgImage: { id: 0, url: '/images/ihna/brand/og-default.jpg', width: 1200, height: 630, alt: 'Institute of Health and Nursing Australia' } as unknown as Media,
  /** footer.php: "Legal entity: Health Careers International Pty Ltd | ACN 106 800 944 | ABN 59 106 800 944 | RTO ID 21985 | CRICOS 03386G". */
  organisation: {
    legalName: 'Health Careers International Pty Ltd',
    cricos: '03386G',
    rto: '21985',
    teqsa: null,
    acn: '106 800 944',
    abn: '59 106 800 944',
    // The Melbourne CBD campus (first on /contact/); used for the Organization JSON-LD.
    address: 'Level 4 and 10, 399 Lonsdale Street, Melbourne VIC 3000',
  },
  /** /contact/ on live (2026-10-21): campus addresses and phones, role mailboxes, the agent list. Role addresses only (rule 4). */
  contact: {
    campuses: [
      { name: 'Melbourne CBD', address: 'Level 4 and 10, 399 Lonsdale Street, Melbourne VIC 3000', phone: '+61 3 9455 4444' },
      { name: 'Melbourne Heidelberg', address: '597-599 Upper Heidelberg Road, Heidelberg Heights VIC 3081', phone: '+61 3 9450 5100' },
      { name: 'Perth CBD', address: 'Level 2 and 4, 12 St Georges Terrace, Perth WA 6000', phone: '+61 8 6212 8200' },
      { name: 'Sydney', address: 'Level 7, 33 Argyle Street, Parramatta NSW 2150', phone: '+61 2 8228 6400' },
      { name: 'Brisbane', address: 'Level 3, 59 Adelaide Street, Brisbane QLD 4000', phone: '+61 7 3123 4000' },
    ],
    mailboxes: [
      { label: 'All campuses and prospective students', email: 'enquiry@ihna.edu.au' },
      { label: 'Student support', email: 'studentsupport@ihna.edu.au' },
      { label: 'Institutional partnerships', email: 'mail@ihna.edu.au' },
    ],
    /** "View Agent List" on /contact/ (the /agent-list/ page is 404 on live). */
    agentListUrl: 'https://online.fliphtml5.com/wmka/utdk/',
    /** "Download Corporate Profile" in the live footer. */
    corporateProfileUrl: 'https://online.fliphtml5.com/wmka/kheh/#p=1',
  },
  /**
   * Social profiles in the live footer's order. LinkedIn: the footer links `institute-of-health-nursing-australia`, the contact page
   * `health-careers`; the footer's URL is used until marketing confirms which is right.
   */
  social: [
    { network: 'x', href: 'https://twitter.com/myihna' },
    { network: 'facebook', href: 'https://www.facebook.com/myIHNA' },
    { network: 'instagram', href: 'https://www.instagram.com/ihna_australia/' },
    { network: 'youtube', href: 'https://www.youtube.com/channel/UCBQ_OiH0WI9ICTrfjxRxNkQ' },
    { network: 'linkedin', href: 'https://www.linkedin.com/company/institute-of-health-nursing-australia/' },
  ],
  courseGuidePdf: null, // TODO(ihna): the IHNA course guide PDF path, if any
  defaultFormKey: 'quick-enquiry',
  /**
   * The site-wide enquiry dialog (`?enquire=1` or `?enquire=<key>`, the WhatsApp button): the form keys it carries, the default key,
   * per-path defaults (`pattern` is a RegExp source matched on the pathname) and the dialog titles. Shared code reads only this.
   */
  enquiryDialog: {
    keys: ['quick-enquiry', 'whatsapp'] as string[],
    defaultKey: 'quick-enquiry',
    pathDefaults: [] as { pattern: string; key: string }[],
    titles: { 'quick-enquiry': 'Talk to our admissions team', whatsapp: 'Chat with us on WhatsApp' } as Record<string, string>,
  },
  /** First-party attribution cookies (41 §4): `last` is written by the campaign landing routes (last touch wins), `first` is only read. */
  attributionCookies: { last: 'ihna_attr', first: 'ihna_attr_first' },
  /** Autoresponders only for a verified reCAPTCHA token (40 §4 step 7, `autoresponderAllowed`): an unverified post never mails an address. */
  autoresponderNeedsCaptcha: true,
  /**
   * Paths (no trailing slash) that take a POST without the slash: a webhook sender does not follow the 308. The proxy rewrites the POST to
   * the slashed route and 308s every other method; next.config.ts leaves these paths out of its trailing-slash redirect (45 §5).
   */
  postWithoutSlash: ['/airwallex-webhook'],
  /** Sender when EMAIL_FROM is unset (40 §6). */
  emailFromDefault: 'no-reply@ihna.edu.au',
  /** Student portal origin: the application-form iframe (DEC-55) when STUDENT_PORTAL_EMBED_ORIGIN is unset. */
  studentPortalOrigin: 'https://student.ihna.edu.au',
  /** The pay form (DEC-11): IHNA's is /pay-online/ (IHM's /makepayment/ is 404 on IHNA). Shared code builds pay links from it. */
  payPath: '/pay-online/',
  quickContactHiddenPaths: [],
  announcement: { active: false, text: null, link: null },
  tracking: { gtmId: null, clarityId: null, hubspotPortalId: null, hubspotRegion: 'eu1', airgenticId: null, livechatLicence: null },
  // DEC-5: hosts iframeEmbed may load (plus the fixed list in src/blocks/embeds.ts); CSP frame-src is built from the same list.
  allowedEmbedHosts: ['my.matterport.com', 'forms.monday.com', 'ihna.online', 'hrms.ihna.edu.au', 'portal.ihna.edu.au', 'student.ihna.edu.au'],
} as const

export type Site = typeof site
