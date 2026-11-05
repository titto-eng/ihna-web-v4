import { describe, expect, it } from 'vitest'
import { adapters, planDeliveryRows } from '@/lib/adapters'
import { courseFactsOf, matchesWhen } from '@/lib/enquiries/conditions'
import { computeThankYou, isLocalPath } from '@/lib/enquiries/thankYou'
import { findLandingByPageUrl } from '@/lib/enquiries/lookups'
import { autoresponderAllowed } from '@/lib/enquiries/captcha'
import type { FormDef } from '@/lib/enquiries/types'
import { forms, formByKey } from '@/content/forms'
import { enquiryRouting } from '@/content/enquiry-routing'
import { campaignByCode } from '@/content/campaign-codes'
import { IHNA_ONLINE_COURSE_CODES, SHORT_COURSE_KH_IDS } from '@/content/course-crm'

// IHNA's own form registry (src/content/forms.ts): the keys of brief-forms-campaigns §5, their destinations, conditions and thank-you
// paths. The count comes from the site (40 §8), not from IHM's 25.
const IHNA_KEYS = [
  'quick-enquiry', 'course-brochure', 'blog-enquiry', 'scholarship', 'alumni-signup', 'alumni-story', 'agent-registration', 'event-registration',
  'whatsapp', 'lp-enquiry', 'online-learning', 'referral-application', 'global-partner', 'employer-eoi', 'skilldemy-enquiry',
  'corporate-registration', 'jobs-eoi', 'library-enquiry', 'quick-feedback', 'business-enquiry', 'walkin-enquiry', 'lp-hubspot-note',
  'lp-hubspot', 'lp-dynamics', 'lp-kh-int', 'lp-ihna-online', 'lp-course-enquiry', 'lp-mail-only', 'event-lp',
  // not in the brief: the live /rpl-and-credit-transfer/ page (server-only PHP)
  'rpl-enquiry',
]

const def = (key: string): FormDef => formByKey(key)!
const ctx = (data: Record<string, unknown>, landingPath: string | null = null) => ({ facts: courseFactsOf({ data }), data, landingPath })
const planned = (key: string, data: Record<string, unknown>, landingPath: string | null = null) =>
  planDeliveryRows(def(key), { ctx: ctx(data, landingPath), env: { DYNAMICS_ENABLED: '1' } }).map((r) => `${r.adapter}:${r.target}`)

describe('IHNA form registry', () => {
  it(`has exactly the ${IHNA_KEYS.length} IHNA keys`, () => {
    expect(forms.map((f) => f.key).sort()).toEqual([...IHNA_KEYS].sort())
  })

  it.each(forms.map((f) => [f.key, f] as const))('%s: destinations, groups, thank-you and campaign fallback are valid', (_k, f) => {
    const groups = new Set(enquiryRouting.recipientGroups.map((g) => g.key))
    expect(f.destinations.length).toBeGreaterThan(0)
    for (const d of f.destinations) {
      expect(Object.keys(adapters)).toContain(d.adapter)
      if (d.adapter === 'email') expect(groups.has(d.config?.recipientGroup ?? ''), `${f.key}: ${d.config?.recipientGroup}`).toBe(true)
      if (d.when?.field) expect(f.fields.some((x) => x.name === d.when!.field!.name), `${f.key}: when.field`).toBe(true)
    }
    if (f.thankYou?.type !== 'inline' && f.thankYou?.type !== 'whatsapp') expect(isLocalPath(f.thankYou?.path), f.key).toBe(true)
    for (const r of f.thankYou?.rules ?? []) expect(isLocalPath(r.path)).toBe(true)
    if (f.campaignFallback) expect(campaignByCode(f.campaignFallback), f.key).not.toBeNull()
    expect(f.emailSubject, `${f.key}: subject in IHNA voice`).toBeTruthy()
    expect(JSON.stringify(f)).not.toMatch(/IHM\b|Institute of Health and Management|Team IHM/)
  })

  it('no form asks for a file: the CV and attachment fields are https links (40 §10)', () => {
    for (const key of ['jobs-eoi', 'quick-feedback']) {
      const link = def(key).fields.find((f) => /Url$/.test(f.name))!
      expect(link.type).toBe('text')
      expect(new RegExp(link.pattern!).test('https://drive.example.test/cv.pdf')).toBe(true)
      expect(new RegExp(link.pattern!).test('javascript:alert(1)')).toBe(false)
    }
  })

  it('recipient groups are role names with no address typed from the old code (DEC-19)', () => {
    for (const g of enquiryRouting.recipientGroups) expect([...g.to, ...g.cc]).toEqual([])
    expect(enquiryRouting.defaultSourceId).toBe(campaignByCode('default')!.enquirySourceId)
  })
})

describe('conditional destinations (40 §6)', () => {
  it('quick-enquiry: HubSpot and both email groups always; nothing conditional without a matching course', () => {
    expect(planned('quick-enquiry', {})).toEqual(['hubspot:contacts', 'email:enquiries', 'email:admissions'])
  })

  it('quick-enquiry: a short course (KH id) adds the KH portal and the self-enrol autoresponder', () => {
    for (const kh of SHORT_COURSE_KH_IDS) {
      const rows = planned('quick-enquiry', { courseKhId: String(kh) })
      expect(rows).toContain('portalCrm:portal')
      expect(rows).toContain('email:autoresponder')
      expect(rows).not.toContain('ihnaOnline:leads')
    }
  })

  it('quick-enquiry: an IHNA Online course code adds the IHNA Online webhook', () => {
    for (const code of IHNA_ONLINE_COURSE_CODES) {
      const facts = { code }
      expect(matchesWhen({ courseCodeIn: IHNA_ONLINE_COURSE_CODES }, { facts, data: {} })).toBe(true)
      const rows = planDeliveryRows(def('quick-enquiry'), { ctx: { facts, data: {} } }).map((r) => `${r.adapter}:${r.target}`)
      expect(rows).toContain('ihnaOnline:leads')
    }
  })

  it('quick-enquiry: the pathway group needs KH 75 AND a pathway; KH 400 adds the anaesthetic technology group', () => {
    const facts75 = { khId: 75 }
    const rows = (data: Record<string, unknown>, facts: { khId: number }) => planDeliveryRows(def('quick-enquiry'), { ctx: { facts, data } }).map((r) => r.target)
    expect(rows({}, facts75)).not.toContain('health-careers-pathways')
    expect(rows({ pathwayEnquiry: 'Bachelor of Nursing' }, facts75)).toContain('health-careers-pathways')
    expect(rows({}, { khId: 400 })).toContain('anaesthetic-technology')
  })

  it('blog-enquiry: Dynamics for ordinary courses, the KH portal for short courses', () => {
    expect(planned('blog-enquiry', {})).toContain('dynamics:leads')
    expect(planned('blog-enquiry', {})).not.toContain('portalCrm:portal')
    const short = planDeliveryRows(def('blog-enquiry'), { ctx: { facts: { khId: 352 }, data: {} }, env: { DYNAMICS_ENABLED: '1' } }).map((r) => r.adapter)
    expect(short).toContain('portalCrm')
    expect(short).not.toContain('dynamics')
  })

  it('walk-in: HubSpot for ordinary courses; KH + self-enrol for short courses (no HubSpot)', () => {
    expect(planned('walkin-enquiry', { courseKhId: '363' })).toEqual(['email:enquiries', 'hubspot:contacts'])
    expect(planned('walkin-enquiry', { courseKhId: '352' })).toEqual(['email:enquiries', 'portalCrm:portal', 'email:autoresponder'])
  })

  it('lp-dynamics adds the KH portal only on the Adelaide page; lp-course-enquiry the regional group only on Ballarat pages', () => {
    expect(planned('lp-dynamics', {}, '/healthcare-courses-adelaide/')).toContain('portalCrm:portal')
    expect(planned('lp-dynamics', {}, '/study-at-ihna/flinders-pathways/')).not.toContain('portalCrm:portal')
    expect(planned('lp-course-enquiry', {}, '/healthcare-courses-ballarat/contact.php')).toContain('email:regional')
    expect(planned('lp-course-enquiry', {}, '/study-at-ihna/tollfree/')).not.toContain('email:regional')
  })

  it('without a context (no course known) a conditional destination is not planned', () => {
    expect(planDeliveryRows(def('quick-enquiry')).map((r) => r.adapter)).not.toContain('portalCrm')
  })
})

describe('thank-you paths (exact old paths, GTM counts conversions on them)', () => {
  const ty = (key: string, data: Record<string, unknown> = {}, extra: Partial<Parameters<typeof computeThankYou>[0]> = {}) =>
    computeThankYou({ def: def(key), data, landing: null, course: null, campus: null, campaignCode: null, facts: courseFactsOf({ data }), ...extra })

  it('quick-enquiry goes to /quick-enquiry-thanks/ with the GTM query; a short course to /short-course-enquiry-thanks/', () => {
    expect(ty('quick-enquiry', { campus: 'brisbane' }, { campaignCode: 'gasyd' })).toBe('/quick-enquiry-thanks/?campaign_id=gasyd&campus=brisbane')
    expect(ty('quick-enquiry', {}, { facts: { khId: 352 } })).toBe('/short-course-enquiry-thanks/')
  })

  it('the WP-family forms keep their old pages', () => {
    expect(ty('blog-enquiry')).toBe('/blog/thanks/')
    expect(ty('scholarship')).toBe('/scholarship-thanks/')
    expect(ty('referral-application')).toBe('/referral-application-thanks/')
    expect(ty('global-partner')).toBe('/partner-application-thanks/')
    expect(ty('employer-eoi')).toBe('/partner-application-thanks/')
    expect(ty('jobs-eoi')).toBe('/expression-of-interest-thanks/')
    expect(ty('event-registration')).toBe('/thanks-events/')
    expect(ty('walkin-enquiry')).toBeNull()
  })

  it('a landing row decides, keeping the campaign code', () => {
    const landing = { path: '/study-at-ihna/domestic/diploma-nursing-sydney/', thankYouPath: '/study-at-ihna/domestic/diploma-nursing-sydney/thanks.php' }
    expect(ty('lp-hubspot-note', { intent: 'brochure' }, { landing, campaignCode: 'fbsyd' })).toBe('/study-at-ihna/domestic/diploma-nursing-sydney/thanks.php?campaign=fbsyd&intent=brochure')
  })
})

describe('landing rows apply only to the page\'s own form (40 §4)', () => {
  const page = 'https://ihna.edu.au/study-at-ihna/domestic/diploma-nursing-melbourne/'
  it('the landing form gets the row; the dialog and WhatsApp forms on the same page do not', async () => {
    const own = await findLandingByPageUrl(null, page, 'lp-hubspot-note')
    expect(own?.thankYouPath).toMatch(/thanks\.php$/)
    expect(await findLandingByPageUrl(null, page, 'whatsapp')).toBeNull()
    expect(await findLandingByPageUrl(null, page, 'quick-enquiry')).toBeNull()
    expect(await findLandingByPageUrl(null, `${page}gaperth/`, 'quick-enquiry')).toBeNull()
  })
  it('WhatsApp posted from a landing page keeps its own thank-you', async () => {
    const landing = await findLandingByPageUrl(null, page, 'whatsapp')
    const out = computeThankYou({ def: def('whatsapp'), data: {}, landing, course: null, campus: null, campaignCode: null, facts: {} })
    expect(out).not.toContain('thanks.php')
  })
})

describe('autoresponders fail closed without a verified captcha (IHNA)', () => {
  it('production: only `ok` plans the autoresponder; dev without a secret still does', () => {
    const prod = { NODE_ENV: 'production', RECAPTCHA_SECRET_KEY: 's' }
    expect(autoresponderAllowed('ok', prod)).toBe(true)
    expect(autoresponderAllowed('unverified', prod)).toBe(false)
    expect(autoresponderAllowed('unverified', { NODE_ENV: 'production' })).toBe(false)
    expect(autoresponderAllowed('unverified', { NODE_ENV: 'development', RECAPTCHA_SECRET_KEY: 's' })).toBe(false)
    expect(autoresponderAllowed('unverified', { NODE_ENV: 'development' })).toBe(true)
    expect(planDeliveryRows(def('agent-registration'), { autoresponder: false }).map((r) => r.target)).not.toContain('autoresponder')
    expect(planDeliveryRows(def('agent-registration')).map((r) => r.target)).toContain('autoresponder')
  })
})
