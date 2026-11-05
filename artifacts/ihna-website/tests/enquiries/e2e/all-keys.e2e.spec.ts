import { expect, test } from '@playwright/test'
import type { Payload } from 'payload'
import { boot, nonce, uuid } from '../helpers'
import { forms as FORMS, formByKey } from '@/content/forms'
import { landingPages } from '@/content/landing'
import { site } from '@/content/site'
import { planDeliveryRows } from '@/lib/adapters'
import { autoresponderAllowed } from '@/lib/enquiries/captcha'
import { courseFactsOf } from '@/lib/enquiries/conditions'
import { findCampus, findCourse, findLandingByPageUrl, type CourseLite } from '@/lib/enquiries/lookups'
import { computeThankYou } from '@/lib/enquiries/thankYou'
import { SHORT_COURSE_KH_IDS } from '@/content/course-crm'
import type { FormDef } from '@/lib/enquiries/types'

// 40 §8 check 7: every form key of the site's registry (src/content/forms.ts), posted to the running dev server (DRY_RUN=1, localhost,
// no real CRM): one row, the delivery rows the pipeline plans for that submission (conditional destinations included, Dynamics when
// DYNAMICS_ENABLED=1), each recorded as dry_run, and the server-computed thank-you. A landing form is posted from its own landing page,
// so the page's thank-you and conditions apply. Then the conditional destinations and the HubSpot / Dynamics / IHNA Online requests.
let payload: Payload
const tag = nonce()
const BASE = (process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/$/, '')
const submissionIds: string[] = []
let ordinaryCourse: CourseLite

type Delivery = { adapter: string; target: string; status: string; dryRunRequest?: { requests?: { url: string; body: Record<string, unknown> }[]; reason?: string } }
type Row = { formKey: string; status: string; deliveries?: Delivery[] }
const rowOf = async (submissionId: string) =>
  (await payload.find({ collection: 'enquiries', where: { submissionId: { equals: submissionId } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Row | undefined

test.beforeAll(async () => {
  expect(process.env.DRY_RUN ?? '1', 'e2e must run with DRY_RUN=1').toBe('1')
  expect(process.env.ENQUIRY_LIVE_ADAPTERS ?? '', 'e2e must not list live adapters').toBe('')
  payload = await boot()
  // An ordinary (not short, not IHNA Online) course, so the unconditional destinations are what a plain submission plans.
  const dn = (await payload.find({ collection: 'courses', where: { slug: { equals: 'diploma-of-nursing' } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
  expect(dn, 'the imported Diploma of Nursing course').toBeTruthy()
  ordinaryCourse = (await findCourse(payload, dn.id))!
})
test.afterAll(async () => {
  if (payload) await payload.delete({ collection: 'enquiries', where: { submissionId: { in: submissionIds } }, overrideAccess: true }).catch(() => {})
})

/** A valid payload built from the definition: every required field (plus email/phone), nothing else. */
async function validFields(def: FormDef, email: string, over: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const campus = (await payload.find({ collection: 'campuses', limit: 1, depth: 0, overrideAccess: true })).docs[0]
  const out: Record<string, unknown> = {}
  for (const f of def.fields) {
    if (!f.required && !['email', 'phone'].includes(f.name)) continue
    if (f.pattern === '^[0-9]{10}$') out[f.name] = '0412345678'
    else if (f.type === 'email') out[f.name] = f.name === 'email' ? email : `${f.name}-${tag}@example.test`
    else if (f.type === 'tel') out[f.name] = '+61 400 000 000'
    else if (f.name === 'courseKhId') out[f.name] = f.options!.find((o) => o.value === String(ordinaryCourse.khId))?.value ?? f.options!.find((o) => !SHORT_COURSE_KH_IDS.includes(Number(o.value)))!.value
    else if (f.type === 'select' || f.type === 'radio') out[f.name] = f.options![0].value
    else if (f.type === 'checkbox') out[f.name] = true
    else if (f.type === 'country') out[f.name] = 'Australia'
    else if (f.type === 'campus') out[f.name] = String(campus.id)
    else if (f.type === 'course') out[f.name] = String(ordinaryCourse.id)
    else if (f.type === 'textarea') out[f.name] = 'Test message from the e2e suite'
    else if (f.maxLength && f.maxLength <= 4) out[f.name] = '2027'.slice(0, f.maxLength)
    else if (f.pattern?.includes('https')) out[f.name] = 'https://example.test/file.pdf'
    else out[f.name] = f.name === 'name' ? 'Playwright Tester' : 'Playwright'
  }
  if (!('email' in out) && def.fields.some((f) => f.name === 'email')) out.email = email
  if (def.fields.some((f) => f.name === 'phone')) out.phone = out.phone ?? '+61 400 000 000'
  return { ...out, ...over }
}

/** The page a key is posted from: a landing form from its first landing page, every other form from a plain content path. */
const pageFor = (key: string) => {
  const landing = landingPages.find((p) => p.formKey === key)
  return `${BASE}${landing ? landing.path : `/e2e/${key}/`}`
}

/** What the pipeline should plan and answer for this submission (the shared planner and thank-you, with the same context). */
async function expectedFor(def: FormDef, fields: Record<string, unknown>, pageUrl: string) {
  const landing = await findLandingByPageUrl(payload, pageUrl, def.key)
  const course = def.fields.some((f) => f.type === 'course' && fields[f.name]) ? ordinaryCourse : null
  const campusField = def.fields.find((f) => f.type === 'campus' && fields[f.name])
  const campus = campusField ? await findCampus(payload, String(fields[campusField.name])) : null
  const facts = courseFactsOf({ course, data: fields, landing })
  const rows = planDeliveryRows(def, { autoresponder: autoresponderAllowed('unverified'), ctx: { facts, data: fields, landingPath: landing?.path ?? null } })
  const campaignCode = landing?.fixedCampaign ?? (typeof fields.campaignCode === 'string' ? fields.campaignCode : null)
  const thankYou = computeThankYou({ def, data: fields, landing, course, campus, campaignCode, facts, whatsappNumber: site.whatsappNumber ?? null, siteHost: new URL(pageUrl).hostname })
  return { rows: rows.map((r) => `${r.adapter}:${r.target}`).sort(), thankYou }
}

async function post(request: import('@playwright/test').APIRequestContext, key: string, fields: Record<string, unknown>, pageUrl: string) {
  const submissionId = uuid()
  submissionIds.push(submissionId)
  const res = await request.post('/api/enquire/', {
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
    data: { formKey: key, submissionId, fields, pageUrl, _hp_url: '' },
    timeout: 60_000,
  })
  const json = await res.json()
  expect(res.status(), JSON.stringify(json)).toBe(200)
  expect(json.ok).toBe(true)
  return { submissionId, json: json as { ok: boolean; thankYouPath: string | null; enquiryId: string } }
}

/** Waits until every planned delivery is recorded (the dev server runs the job right after the response; the runner picks up the rest). */
async function delivered(submissionId: string, count: number): Promise<Row> {
  await expect.poll(async () => (await rowOf(submissionId))?.deliveries?.filter((d) => d.status === 'dry_run').length, { timeout: 90_000, intervals: [500, 1000, 2000] }).toBe(count)
  return (await rowOf(submissionId))!
}

test(`the registry holds the site's keys (${FORMS.length}), each unique and active or deliberately inactive`, () => {
  expect(new Set(FORMS.map((f) => f.key)).size).toBe(FORMS.length)
  expect(FORMS.length).toBeGreaterThan(0)
})

for (const seedDef of FORMS.filter((f) => f.active !== false)) {
  test(`formKey ${seedDef.key}: one row, its planned dry_run deliveries and the server's thank-you`, async ({ request }) => {
    const def = formByKey(seedDef.key)!
    const email = `e2e-${def.key}-${tag}@example.test`
    const fields = await validFields(def, email)
    const pageUrl = pageFor(def.key)
    const { submissionId, json } = await post(request, def.key, fields, pageUrl)
    const expected = await expectedFor(def, fields, pageUrl)

    const row = await rowOf(submissionId)
    expect(row, 'a row exists').toBeTruthy()
    expect(row!.formKey).toBe(def.key)
    expect(row!.deliveries!.map((d) => `${d.adapter}:${d.target}`).sort()).toEqual(expected.rows)
    if (expected.rows.length) {
      const done = await delivered(submissionId, expected.rows.length)
      expect(done.status).toBe('delivered')
      expect(done.deliveries!.every((d) => d.dryRunRequest)).toBe(true)
    }
    expect(json.thankYouPath).toBe(expected.thankYou)
  })
}

test.describe('conditional destinations and CRM requests (DRY_RUN records)', () => {
  const courseBy = async (slug: string) => {
    const doc = (await payload.find({ collection: 'courses', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
    return { id: String(doc.id), khId: doc.khId as number | null, code: doc.code as string | null }
  }

  test('quick-enquiry: an ordinary course plans HubSpot + both groups, and HubSpot gets the course code (not the KH id)', async ({ request }) => {
    const def = formByKey('quick-enquiry')!
    const fields = await validFields(def, `e2e-qe-${tag}@example.test`)
    const { submissionId, json } = await post(request, def.key, fields, pageFor(def.key))
    const row = await delivered(submissionId, 3)
    expect(row.deliveries!.map((d) => `${d.adapter}:${d.target}`).sort()).toEqual(['email:admissions', 'email:enquiries', 'hubspot:contacts'])
    const hs = row.deliveries!.find((d) => d.adapter === 'hubspot')!.dryRunRequest!
    const props = (hs.requests![0].body.inputs as { properties: Record<string, string> }[])[0].properties
    expect(props.course).toBe(`;${ordinaryCourse.code}`)
    expect(props.course).not.toContain(String(ordinaryCourse.khId))
    expect(json.thankYouPath).toMatch(/^\/quick-enquiry-thanks\/\?course_id=363/)
  })

  test('quick-enquiry: a short course adds the KH portal and the self-enrol autoresponder, and the short-course thank-you', async ({ request }) => {
    const short = await courseBy('provide-cardiopulmonary-resuscitation') // KH 352
    const def = formByKey('quick-enquiry')!
    const fields = await validFields(def, `e2e-qe-short-${tag}@example.test`, { course: short.id })
    const { submissionId, json } = await post(request, def.key, fields, pageFor(def.key))
    const row = await delivered(submissionId, 5)
    expect(row.deliveries!.map((d) => `${d.adapter}:${d.target}`).sort()).toEqual(['email:admissions', 'email:autoresponder', 'email:enquiries', 'hubspot:contacts', 'portalCrm:portal'])
    expect(String(row.deliveries!.find((d) => d.adapter === 'portalCrm')!.dryRunRequest!.requests![0].body.courseId)).toBe('352')
    expect(json.thankYouPath).toBe('/short-course-enquiry-thanks/')
  })

  test('quick-enquiry: an IHNA Online course code adds the ihnaOnline webhook, its key masked', async ({ request }) => {
    const io = await courseBy('certificate-iii-in-individual-support-ageing-and-disability') // CHC33021
    const def = formByKey('quick-enquiry')!
    const fields = await validFields(def, `e2e-qe-io-${tag}@example.test`, { course: io.id })
    const { submissionId } = await post(request, def.key, fields, pageFor(def.key))
    const row = await delivered(submissionId, 4)
    const rec = row.deliveries!.find((d) => d.adapter === 'ihnaOnline')!.dryRunRequest as unknown as { requests: { headers: Record<string, string>; body: Record<string, unknown> }[] }
    expect(rec.requests[0].body).toMatchObject({ course_code: 'CHC33021', source: 'WEBSITE' })
    expect(rec.requests[0].headers['X-Webhook-Key']).toBe('[masked]')
  })

  test('blog-enquiry: Dynamics for an ordinary course (lead + enquiry recorded)', async ({ request }) => {
    test.skip(process.env.DYNAMICS_ENABLED === '0', 'Dynamics is off on this server')
    const def = formByKey('blog-enquiry')!
    const fields = await validFields(def, `e2e-blog-${tag}@example.test`, { course: String(ordinaryCourse.id) })
    const expected = await expectedFor(def, fields, pageFor(def.key))
    expect(expected.rows).toContain('dynamics:leads')
    const { submissionId } = await post(request, def.key, fields, pageFor(def.key))
    const row = await delivered(submissionId, expected.rows.length)
    const dyn = row.deliveries!.find((d) => d.adapter === 'dynamics')!.dryRunRequest!
    expect(dyn.requests!.map((r) => r.url).join(' ')).toMatch(/\/leads.*\/new_enquiries/)
  })

  test('lp-hubspot-note: the HubSpot note follows the contact upsert; posted from its landing page it gets the page thank-you', async ({ request }) => {
    const def = formByKey('lp-hubspot-note')!
    const landing = landingPages.find((p) => p.formKey === def.key)!
    const fields = await validFields(def, `e2e-note-${tag}@example.test`, { residentialStatus: 'Permanent resident', advisorQuestions: '<b>bold</b> & co' })
    const { submissionId, json } = await post(request, def.key, fields, pageFor(def.key))
    const expected = await expectedFor(def, fields, pageFor(def.key))
    const row = await delivered(submissionId, expected.rows.length)
    const hs = row.deliveries!.find((d) => d.adapter === 'hubspot')!.dryRunRequest!
    expect(hs.requests!.map((r) => new URL(r.url).pathname)).toEqual(['/crm/v3/objects/contacts/batch/upsert', '/crm/v3/objects/notes'])
    const note = (hs.requests![1].body.properties as { hs_note_body: string }).hs_note_body
    expect(note).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; co') // visitor text is escaped in the note
    expect(note).toContain('<br>')
    expect(String(json.thankYouPath).startsWith(landing.thankYouPath!)).toBe(true)
  })

  test('lp-dynamics adds the KH portal only from the Adelaide page; lp-course-enquiry the regional group only from a Ballarat page', async ({ request }) => {
    const base = BASE
    const dyn = formByKey('lp-dynamics')!
    const adelaide = await post(request, dyn.key, await validFields(dyn, `e2e-adl-${tag}@example.test`), `${base}/healthcare-courses-adelaide/`)
    const adlRow = (await rowOf(adelaide.submissionId))!
    expect(adlRow.deliveries!.map((d) => d.adapter)).toContain('portalCrm')
    const other = await post(request, dyn.key, await validFields(dyn, `e2e-dyn-${tag}@example.test`), `${base}/e2e/lp-dynamics/`)
    expect((await rowOf(other.submissionId))!.deliveries!.map((d) => d.adapter)).not.toContain('portalCrm')

    const ce = formByKey('lp-course-enquiry')!
    const ballarat = await post(request, ce.key, await validFields(ce, `e2e-bal-${tag}@example.test`), `${base}/healthcare-courses-ballarat/contact.php`)
    expect((await rowOf(ballarat.submissionId))!.deliveries!.map((d) => `${d.adapter}:${d.target}`)).toContain('email:regional')
  })

  test('a form posted from another form\'s landing page keeps its own thank-you (the WhatsApp form on a landing page)', async ({ request }) => {
    const landing = landingPages.find((p) => p.formKey === 'lp-hubspot-note')!
    const def = formByKey('whatsapp')!
    const { json } = await post(request, def.key, await validFields(def, `e2e-wa-${tag}@example.test`), `${BASE}${landing.path}`)
    expect(String(json.thankYouPath)).not.toContain(landing.path)
  })
})

test('/action_page.php is 404 for GET and POST (40 §5)', async ({ request }) => {
  expect((await request.get('/action_page.php')).status()).toBe(404)
  expect((await request.post('/action_page.php', { data: { email: `x-${tag}@example.test` } })).status()).toBe(404)
})
