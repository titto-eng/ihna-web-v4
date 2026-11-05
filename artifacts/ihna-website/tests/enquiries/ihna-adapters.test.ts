import { afterEach, describe, expect, it, vi } from 'vitest'
import { requiredEnv, runAdapter, type AdapterInput } from '@/lib/adapters'
import { ihnaOnlineAdapter, ihnaOnlineLeadId } from '@/lib/adapters/ihnaOnline'
import { campaignAttribution } from '@/lib/enquiries/campaign'
import { formByKey } from '@/content/forms'
import { dynamicsMap } from '@/content/dynamics-map'

// IHNA's adapter configuration: the new ihnaOnline webhook (DRY_RUN-safe, live.ts requiredEnv) and the site maps the shared
// HubSpot, Dynamics and portal CRM adapters read (src/content/hubspot-map.ts, dynamics-map.ts, course-crm.ts).
const routing = { recipientGroups: [], alertTo: [], defaultSourceId: 2 }
const LIVE = { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'ihnaOnline,hubspot,dynamics,portalCrm', IHNA_ONLINE_WEBHOOK_URL: 'https://io.example.test/api/webhooks/leads/', IHNA_ONLINE_WEBHOOK_KEY: 'test-key-123', NODE_ENV: 'test' }

function input(formKey: string, data: Record<string, unknown>, extra: Partial<AdapterInput> = {}): AdapterInput {
  const form = formByKey(formKey)!
  return {
    enquiry: { id: 7, publicId: 'abc123def456', submissionId: '3f1c2a8e-9b7d-4c5e-8a1f-2b3c4d5e6f70', formKey, email: String(data.email ?? 'asha@example.test'), firstName: 'Asha', lastName: 'Rao', phone: '0400000000', data: { email: 'asha@example.test', ...data }, campaignCode: null, pageUrl: 'https://ihna.edu.au/x/' },
    form, destination: form.destinations[0], target: 'leads', course: null, campus: null, routing, sourceId: 2, ...extra,
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('ihnaOnline adapter (DRY_RUN guard)', () => {
  it('needs the webhook URL and key to go live', () => {
    expect(requiredEnv('ihnaOnline', undefined, {})).toEqual(['IHNA_ONLINE_WEBHOOK_URL', 'IHNA_ONLINE_WEBHOOK_KEY'])
  })

  it('DRY_RUN=1 records the request with the key masked and sends nothing', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const out = await runAdapter({ ...input('lp-ihna-online', { campus: 'brisbane' }, { landing: { path: '/l/', courseCode: 'CHC33021', khId: 408 } }), env: { ...LIVE, DRY_RUN: '1' } })
    expect(out.status).toBe('dry_run')
    expect(fetchSpy).not.toHaveBeenCalled()
    const rec = out.dryRunRequest as { requests: { url: string; headers: Record<string, string>; body: Record<string, unknown> }[]; reason: string }
    expect(rec.reason).toBe('DRY_RUN=1')
    expect(rec.requests[0].headers['X-Webhook-Key']).toBe('[masked]')
    expect(JSON.stringify(rec)).not.toContain('test-key-123')
    expect(rec.requests[0].body).toMatchObject({ course_code: 'CHC33021', source: 'WEBSITE', first_name: 'Asha', email: 'asha@example.test', utm_source: 'IHNA Website' })
  })

  it('stays a dry run when not listed in ENQUIRY_LIVE_ADAPTERS or when a variable is missing', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const notListed = await runAdapter({ ...input('lp-ihna-online', {}), env: { ...LIVE, ENQUIRY_LIVE_ADAPTERS: 'email' } })
    expect(notListed.note).toMatch(/not listed/)
    const missing = await runAdapter({ ...input('lp-ihna-online', {}), env: { ...LIVE, IHNA_ONLINE_WEBHOOK_KEY: '' } })
    expect(missing.note).toBe('missing: IHNA_ONLINE_WEBHOOK_KEY')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('live: one JSON POST with the key header; the lead id comes from the submission id, not personal data', async () => {
    const fetchSpy = vi.fn(async () => new Response('{"ok":true}', { status: 201 }))
    vi.stubGlobal('fetch', fetchSpy)
    const i = { ...input('lp-ihna-online', {}), env: LIVE }
    const out = await runAdapter(i)
    expect(out.status).toBe('sent')
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(LIVE.IHNA_ONLINE_WEBHOOK_URL)
    expect((init.headers as Record<string, string>)['X-Webhook-Key']).toBe('test-key-123')
    const body = JSON.parse(String(init.body)) as { lead_id: string }
    expect(body.lead_id).toBe(ihnaOnlineLeadId(i.enquiry.submissionId))
    expect(body.lead_id).toMatch(/^ihna-web-[0-9a-f]{32}$/)
    expect(body.lead_id).not.toContain('asha')
  })

  it('a 4xx is dead, a 5xx retryable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('bad', { status: 400 })))
    expect((await runAdapter({ ...input('lp-ihna-online', {}), env: LIVE })).status).toBe('dead')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 503 })))
    expect((await runAdapter({ ...input('lp-ihna-online', {}), env: LIVE })).status).toBe('failed')
    expect(ihnaOnlineAdapter.targets({ adapter: 'ihnaOnline' })).toEqual(['leads'])
  })
})

describe('IHNA site maps in the shared adapters', () => {
  const dry = { DRY_RUN: '1', NODE_ENV: 'production' }
  const bodyOf = (out: { dryRunRequest?: unknown }, i = 0) => (out.dryRunRequest as { requests: { url: string; body: Record<string, unknown> }[] }).requests[i]

  it('HubSpot: IHNA properties, the campaign table source and a note on the contact', async () => {
    const i = input('lp-hubspot-note', { campus: 'perth-sgt', residentialStatus: 'Permanent resident', whereHear: 'Instagram' }, {
      destination: formByKey('lp-hubspot-note')!.destinations[0], target: 'contacts', landing: { path: '/l/', courseCode: 'HLT54121', khId: 363 },
      campaign: campaignAttribution('fbperth', { campaignFallback: 'lp_default' }),
    })
    const out = await runAdapter({ ...i, env: dry })
    const props = (bodyOf(out).body.inputs as { properties: Record<string, string> }[])[0].properties
    expect(props).toMatchObject({ campus: '4', course: ';HLT54121', campaign_source: 'Facebook Ad Perth', hs_lead_status: 'NEW', how_did_you_hear_about_us: 'Instagram', referral_url: 'https://ihna.edu.au/x/' })
    expect(props).not.toHaveProperty('where_did_you_hear_about_us')
    expect(out.hsSourceFallback).toBe(false)
    const note = bodyOf(out, 1)
    expect(note.url).toBe('https://api.hubapi.com/crm/v3/objects/notes')
    expect(JSON.stringify(note.body)).toContain('Residential status: Permanent resident')
  })

  it('HubSpot hosts are overridable (EU1)', async () => {
    const i = input('lp-hubspot', {}, { destination: { adapter: 'hubspot' }, target: 'contacts' })
    const out = await runAdapter({ ...i, env: { ...dry, HUBSPOT_API_BASE: 'https://api-eu1.hubapi.com/' } })
    expect(bodyOf(out).url).toBe('https://api-eu1.hubapi.com/crm/v3/objects/contacts/batch/upsert')
  })

  it('HubSpot send: the note is created with the contact id from the upsert', async () => {
    const calls: { url: string; body: string }[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, body: String(init.body) })
      return new Response(url.endsWith('/batch/upsert') ? '{"results":[{"id":"9876"}]}' : '{"id":"1"}', { status: 200 })
    }))
    const i = input('scholarship', { scholarshipReasons: 'I want to help people', intakeMonth: 'March', intakeYear: '2027' }, { destination: formByKey('scholarship')!.destinations[0], target: 'contacts' })
    const out = await runAdapter({ ...i, env: { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot', HUBSPOT_ACCESS_TOKEN: 'pat-test' } })
    expect(out).toMatchObject({ status: 'sent', externalId: '9876|note:1' })
    expect(calls[1].url).toMatch(/\/crm\/v3\/objects\/notes$/)
    expect(calls[1].body).toContain('"id":"9876"')
    expect(calls[1].body).toContain('I want to help people')
  })

  it('HubSpot course: a CMS course sends its code (hubspotCourseId, else the code), never a KH id', async () => {
    const courseOf = (o: Record<string, unknown>) => ({ id: 1, title: 'Course', ...o }) as AdapterInput['course']
    const propsFor = async (course: AdapterInput['course']) => {
      const out = await runAdapter({ ...input('quick-enquiry', {}, { destination: { adapter: 'hubspot' }, target: 'contacts', course }), env: dry })
      return (bodyOf(out).body.inputs as { properties: Record<string, string> }[])[0].properties
    }
    expect((await propsFor(courseOf({ khId: 363, code: 'HLT54121', hubspotCourseId: 'HLT54121' }))).course).toBe(';HLT54121')
    expect((await propsFor(courseOf({ khId: 363, code: 'HLT54121', hubspotCourseId: null }))).course).toBe(';HLT54121')
    const noCode = await propsFor(courseOf({ khId: 999999, code: null, hubspotCourseId: null }))
    expect(noCode.course ?? '').not.toContain('999999')
  })

  it('HubSpot note: visitor text is HTML-escaped and lines are joined with <br>', async () => {
    const i = input('scholarship', { scholarshipReasons: '<img src=x onerror=alert(1)> & more', intakeMonth: 'March', intakeYear: '2027' }, { destination: formByKey('scholarship')!.destinations[0], target: 'contacts' })
    const out = await runAdapter({ ...i, env: dry })
    const body = (bodyOf(out, 1).body.properties as { hs_note_body: string }).hs_note_body
    expect(body).toContain('&lt;img src=x onerror=alert(1)&gt; &amp; more')
    expect(body).not.toContain('<img')
    expect(body).toContain('<br>')
    expect(body).not.toContain('\n')
  })

  it('HubSpot retry: a note already created is not posted again when the Forms API failed', async () => {
    const env = { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot', HUBSPOT_ACCESS_TOKEN: 'pat-test', HUBSPOT_FORM_GUID: 'guid-1', HUBSPOT_PORTAL_ID: '26193905' }
    const calls: string[] = []
    let formsStatus = 503
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      calls.push(url)
      if (url.endsWith('/batch/upsert')) return new Response('{"results":[{"id":"9876"}]}', { status: 200 })
      if (url.endsWith('/crm/v3/objects/notes')) return new Response('{"id":"555"}', { status: 201 })
      return new Response('{}', { status: formsStatus })
    }))
    const i = input('scholarship', { scholarshipReasons: 'Why', intakeMonth: 'March', intakeYear: '2027' }, { destination: formByKey('scholarship')!.destinations[0], target: 'contacts' })
    const first = await runAdapter({ ...i, env })
    expect(first).toMatchObject({ status: 'failed', externalId: '9876|note:555' })
    expect(calls.filter((u) => u.endsWith('/notes'))).toHaveLength(1)
    formsStatus = 200
    calls.length = 0
    const existing = { adapter: 'hubspot', target: 'contacts', status: 'failed', attempts: 1, externalId: first.externalId }
    const second = await runAdapter({ ...i, existing: existing as never, env })
    expect(second).toMatchObject({ status: 'sent', externalId: '9876|note:555' })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('/submissions/v3/integration/secure/submit/26193905/guid-1')
  })

  it('Dynamics: IHNA university option, campus / student type / course options, campaign bind and new_campaign', async () => {
    const i = input('lp-dynamics', { campus: 'melbourne-heidelberg', sixYearsEducation: true, message: 'Hi' }, {
      destination: formByKey('lp-dynamics')!.destinations[0], landing: { path: '/l/', courseCode: 'HLT54121', khId: 363, studentType: 'international' },
      campaign: campaignAttribution('gamelb', { campaignFallback: 'lp_default' }),
    })
    const out = await runAdapter({ ...i, env: { ...dry, DYNAMICS_ENABLED: '1' } })
    const lead = bodyOf(out, 1).body
    const enquiry = bodyOf(out, 2).body
    expect(lead).toMatchObject({ new_preferredcampus: 100000004, new_studenttype: 100000000, new_courseinterested: '100000038', new_6yearsofeducation: true, subject: 'Enquiry from Landing page', new_questionsorcomm: 'Hi' })
    expect(lead['campaignid@odata.bind']).toMatch(/^\/campaigns\([0-9a-f-]{36}\)$/)
    expect(enquiry).toMatchObject({ new_interesteduniversities: dynamicsMap.interestedUniversities, new_campaign: 'Google Ad Melbourne', new_name: 'Enquiry from IHNA Website' })
  })

  it('portal CRM: KH course and campus ids, KH country id, package id, calling code and student type', async () => {
    const i = input('lp-kh-int', { country: 'India', phoneCode: '+91', campus: 'melbourne-heidelberg', packageId: '7' }, {
      destination: formByKey('lp-kh-int')!.destinations[0], target: 'portal', landing: { path: '/l/', courseCode: 'CHC33015', khId: 67 }, sourceId: 597,
    })
    const body = bodyOf(await runAdapter({ ...i, env: dry })).body
    expect(body).toMatchObject({ courseId: 67, campus: 1, country: 99, phone: '+91 - 0400000000', student_type: '1', enquirySourceId: 597, ihna_web_package_id: '7', campaignId: 1 })
  })
})
