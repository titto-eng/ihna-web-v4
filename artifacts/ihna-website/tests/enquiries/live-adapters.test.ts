import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adapterMode, planDeliveryRows, runAdapter, type AdapterInput } from '@/lib/adapters'
import { resolveSourceId } from '@/lib/enquiries/campaign'
import type { DestinationDef, FormDef } from '@/lib/enquiries/types'

// DEC-50: per-adapter live switch (ENQUIRY_LIVE_ADAPTERS), and request shapes against the contracts:
// portal CRM = inventory/05-ihm-enquiries-integrations.md §3.1 step 3 and §3.5 row 1; HubSpot = developers.hubspot.com
// (CRM v3 contacts batch upsert; Forms v3 secure submit); admissions = 05 §3.4 G5.
const fx = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/quick-enquiry.json'), 'utf8')) as Pick<AdapterInput, 'routing' | 'course' | 'campus' | 'enquiry'>
const adm = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/lp-admissions.json'), 'utf8')) as typeof fx
const form = { key: 'quick-enquiry', name: 'Quick enquiry', fields: [], destinations: [] } as unknown as FormDef

const input = (f: typeof fx, destination: DestinationDef, target: string, env: Record<string, string | undefined>): AdapterInput => ({
  enquiry: f.enquiry, form, destination, target, course: f.course, campus: f.campus, routing: f.routing,
  sourceId: resolveSourceId(destination.config, f.routing), env,
})
const base = { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://ihm.edu.au' }
const ALL = 'email,hubspot,portalCrm,portalStakeholder,admissionsApi'

afterEach(() => vi.restoreAllMocks())

describe('adapter selection: listed + credentials present -> live; otherwise dry with the reason', () => {
  const cases: [string, Record<string, string>, string | undefined, boolean, string?][] = [
    ['DRY_RUN=1 forces record even when listed and configured', { DRY_RUN: '1', ENQUIRY_LIVE_ADAPTERS: ALL, PORTAL_CRM_URL: 'https://p.test/x' }, 'portalCrm', false, 'DRY_RUN=1'],
    ['DRY_RUN unset counts as 1', { ENQUIRY_LIVE_ADAPTERS: ALL, PORTAL_CRM_URL: 'https://p.test/x' }, 'portalCrm', false, 'DRY_RUN=1'],
    ['not listed', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'email', PORTAL_CRM_URL: 'https://p.test/x' }, 'portalCrm', false, 'not listed in ENQUIRY_LIVE_ADAPTERS (email)'],
    ['empty list', { DRY_RUN: '0', PORTAL_CRM_URL: 'https://p.test/x' }, 'portalCrm', false, 'not listed in ENQUIRY_LIVE_ADAPTERS (empty)'],
    ['listed, URL present', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'portalCrm', PORTAL_CRM_URL: 'https://p.test/x' }, 'portalCrm', true],
    ['list is case-insensitive and tolerant of spaces', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: ' EMAIL , portalcrm ', PORTAL_CRM_URL: 'https://p.test/x' }, 'portalCrm', true],
    ['portalCrm needs no credential, only the URL', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'portalCrm' }, 'portalCrm', false, 'missing: PORTAL_CRM_URL'],
    ['hubspot without a token', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot' }, 'hubspot', false, 'missing: HUBSPOT_ACCESS_TOKEN'],
    ['hubspot with a token', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot', HUBSPOT_ACCESS_TOKEN: 't' }, 'hubspot', true],
    ['hubspot with a form guid also needs the portal id', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot', HUBSPOT_ACCESS_TOKEN: 't', HUBSPOT_FORM_GUID: 'g' }, 'hubspot', false, 'missing: HUBSPOT_PORTAL_ID'],
    ['blank values count as missing', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot', HUBSPOT_ACCESS_TOKEN: '  ' }, 'hubspot', false, 'missing: HUBSPOT_ACCESS_TOKEN'],
    ['admissionsApi needs URL and key', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'admissionsApi' }, 'admissionsApi', false, 'missing: ADMISSIONS_API_URL, ADMISSIONS_API_KEY'],
    ['admissionsApi with both', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'admissionsApi', ADMISSIONS_API_URL: 'https://a.test', ADMISSIONS_API_KEY: 'k' }, 'admissionsApi', true],
    ['email needs Resend or SMTP', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'email' }, 'email', false, 'missing: RESEND_API_KEY|SMTP_HOST'],
    ['email with SMTP_HOST', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'email', SMTP_HOST: 'smtp.example.test' }, 'email', true],
    ['email with Resend', { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'email', RESEND_API_KEY: 'k' }, 'email', true],
  ]
  it.each(cases)('%s', (_n, env, adapter, live, reason) => {
    const mode = adapterMode(adapter!, undefined, env)
    expect(mode.live).toBe(live)
    if (!live) expect(mode).toEqual({ live: false, reason })
  })

  it('the stakeholder portals are checked per target', () => {
    const env = { DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'portalStakeholder', PORTAL_IHM_STAKEHOLDER_URL: 'https://ihm.test' }
    expect(adapterMode('portalStakeholder', 'ihm', env).live).toBe(true)
    expect(adapterMode('portalStakeholder', 'ihna', env)).toEqual({ live: false, reason: 'missing: PORTAL_IHNA_STAKEHOLDER_URL' })
  })

  it('runAdapter: a listed adapter sends, an unlisted one records with the reason and calls nothing', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('ok', { status: 200 }))
    const env = { ...base, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'portalCrm', PORTAL_CRM_URL: 'https://portal.example.test/crm', HUBSPOT_ACCESS_TOKEN: 't' }
    const portal = await runAdapter(input(fx, { adapter: 'portalCrm', config: {} }, 'portal', env))
    expect(portal.status).toBe('sent')
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockClear()
    const hs = await runAdapter(input(fx, { adapter: 'hubspot', config: {} }, 'contacts', env))
    expect(hs).toMatchObject({ status: 'dry_run', note: 'not listed in ENQUIRY_LIVE_ADAPTERS (portalCrm)', dryRunRequest: { reason: 'not listed in ENQUIRY_LIVE_ADAPTERS (portalCrm)' } })
    const noToken = await runAdapter(input(fx, { adapter: 'hubspot', config: {} }, 'contacts', { ...env, ENQUIRY_LIVE_ADAPTERS: 'portalCrm,hubspot', HUBSPOT_ACCESS_TOKEN: undefined }))
    expect(noToken).toMatchObject({ status: 'dry_run', note: 'missing: HUBSPOT_ACCESS_TOKEN' })
    expect(spy).not.toHaveBeenCalled()
  })

  it('DRY_RUN=1 sends nothing for any listed adapter', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    const env = { ...base, DRY_RUN: '1', ENQUIRY_LIVE_ADAPTERS: ALL, PORTAL_CRM_URL: 'https://portal.example.test/crm', HUBSPOT_ACCESS_TOKEN: 't', ADMISSIONS_API_URL: 'https://a.test', ADMISSIONS_API_KEY: 'k' }
    for (const [adapter, target, f] of [['portalCrm', 'portal', fx], ['hubspot', 'contacts', fx], ['admissionsApi', 'admissions', adm]] as const) {
      const out = await runAdapter(input(f, { adapter, config: {} }, target, env))
      expect(out).toMatchObject({ status: 'dry_run', note: 'DRY_RUN=1' })
    }
    expect(spy).not.toHaveBeenCalled()
  })

  it('delivery rows are still planned for every adapter regardless of the switch', () => {
    expect(planDeliveryRows({ ...form, destinations: [{ adapter: 'portalCrm', config: {} }, { adapter: 'hubspot', config: {} }] } as FormDef).map((r) => r.adapter)).toEqual(['portalCrm', 'hubspot'])
  })
})

describe('portal CRM request = report 05 §3.1 step 3 / §3.5 row 1', () => {
  const env = { ...base, DRY_RUN: '1', PORTAL_CRM_URL: 'https://portal.ihm.edu.au/crm/crm_enquiries/applicationFormFromWebsites' }
  it('is a form-encoded POST with no credential, the documented fields and the fixed 1s', async () => {
    const out = await runAdapter(input(fx, { adapter: 'portalCrm', config: {} }, 'portal', env))
    const [req] = (out.dryRunRequest as { requests: { method: string; url: string; headers: Record<string, string>; encoding: string; body: Record<string, unknown> }[] }).requests
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://portal.ihm.edu.au/crm/crm_enquiries/applicationFormFromWebsites')
    expect(req.encoding).toBe('form')
    expect(req.headers).toEqual({}) // 05 §3.1: bare POST, no header, no token
    expect(req.body).toMatchObject({ campaignId: 1, createdBy: 1, modified_user_id: 1 })
    const allowed = ['courseId', 'specialisation_index', 'firstName', 'lastName', 'phone', 'email', 'country', 'campus', 'description', 'enquirySourceId', 'student_type', 'partner_id', 'ip_address', 'campaignId', 'createdBy', 'modified_user_id']
    expect(Object.keys(req.body).filter((k) => !allowed.includes(k))).toEqual([])
    for (const k of ['courseId', 'firstName', 'email', 'phone', 'enquirySourceId']) expect(req.body, k).toHaveProperty(k)
  })

  it('goes out urlencoded with those same fields', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('ok', { status: 200 }))
    await runAdapter(input(fx, { adapter: 'portalCrm', config: {} }, 'portal', { ...env, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'portalCrm' }))
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe(env.PORTAL_CRM_URL)
    const i = init as RequestInit
    expect(i.method).toBe('POST')
    expect((i.headers as Record<string, string>)['content-type']).toBe('application/x-www-form-urlencoded')
    const sent = new URLSearchParams(String(i.body))
    expect(sent.get('campaignId')).toBe('1')
    expect(sent.get('createdBy')).toBe('1')
    expect(sent.get('modified_user_id')).toBe('1')
    expect(sent.get('firstName')).toBe(fx.enquiry.firstName)
    expect(sent.get('email')).toBe(fx.enquiry.email)
  })
})

describe('HubSpot request shapes (CRM v3 contacts upsert, Forms v3 secure submit)', () => {
  const env = { ...base, DRY_RUN: '1', HUBSPOT_ACCESS_TOKEN: 'SECRET-TOKEN' }
  const dest: DestinationDef = { adapter: 'hubspot', config: { hubspotCampaignSourceDefault: 'IHM website' } }
  type Req = { method: string; url: string; headers: Record<string, string>; encoding: string; body: Record<string, any> }
  const plan = async (e: Record<string, string>, enquiry = fx.enquiry) => ((await runAdapter(input({ ...fx, enquiry }, dest, 'contacts', e))).dryRunRequest as { requests: Req[] }).requests

  it('upserts one contact by email through /crm/v3/objects/contacts/batch/upsert with a Bearer token (masked in the record)', async () => {
    const [req, ...rest] = await plan(env)
    expect(rest).toEqual([])
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert')
    expect(req.encoding).toBe('json')
    expect(req.headers).toEqual({ Authorization: 'Bearer [masked]' })
    expect(req.body.inputs).toHaveLength(1)
    const [input0] = req.body.inputs
    expect(input0).toMatchObject({ idProperty: 'email', id: fx.enquiry.email })
    expect(input0.properties).toMatchObject({ email: fx.enquiry.email, firstname: fx.enquiry.firstName, lastname: fx.enquiry.lastName, campaign_source: 'IHM website' })
    expect(JSON.stringify(req)).not.toContain('SECRET-TOKEN')
  })

  it('sends the real Authorization header and JSON body when live', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{"results":[{"id":"9"}]}', { status: 200 }))
    const out = await runAdapter(input(fx, dest, 'contacts', { ...env, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot' }))
    expect(out).toMatchObject({ status: 'sent', externalId: '9' })
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert')
    const i = init as RequestInit
    expect((i.headers as Record<string, string>).Authorization).toBe('Bearer SECRET-TOKEN')
    expect((i.headers as Record<string, string>)['content-type']).toBe('application/json')
    expect(JSON.parse(String(i.body)).inputs[0].idProperty).toBe('email')
  })

  it('HTTP 400/409 from HubSpot is dead, 429 and 5xx are retried', async () => {
    const live = { ...env, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'hubspot' }
    for (const [code, status] of [[400, 'dead'], [401, 'dead'], [409, 'dead'], [429, 'failed'], [502, 'failed']] as const) {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{"message":"x"}', { status: code }))
      expect((await runAdapter(input(fx, dest, 'contacts', live))).status).toBe(status)
    }
  })

  it('adds the Forms API submission (secure endpoint) only when HUBSPOT_FORM_GUID is set, with hutk in context when stored', async () => {
    expect(await plan(env)).toHaveLength(1)
    const withHutk = { ...fx.enquiry, hutk: 'hutk-abc', pageUrl: 'https://ihm.edu.au/contact-us/' }
    const reqs = await plan({ ...env, HUBSPOT_FORM_GUID: 'form-guid-1', HUBSPOT_PORTAL_ID: '39853473' }, withHutk)
    expect(reqs.map((r) => r.url)).toEqual([
      'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert',
      'https://api.hsforms.com/submissions/v3/integration/secure/submit/39853473/form-guid-1',
    ])
    const forms = reqs[1]
    expect(forms.method).toBe('POST')
    expect(forms.headers).toEqual({ Authorization: 'Bearer [masked]' })
    expect(forms.body.context).toMatchObject({ hutk: 'hutk-abc', pageUri: 'https://ihm.edu.au/contact-us/' })
    for (const f of forms.body.fields) expect(f).toEqual({ objectTypeId: '0-1', name: expect.any(String), value: expect.any(String) })
    expect(forms.body.fields.map((f: { name: string }) => f.name)).toEqual(expect.arrayContaining(['email', 'firstname', 'lastname']))
  })

  it('submits the form without hutk when the enquiry has none', async () => {
    const reqs = await plan({ ...env, HUBSPOT_FORM_GUID: 'form-guid-1', HUBSPOT_PORTAL_ID: '39853473' }, { ...fx.enquiry, hutk: null })
    expect(reqs).toHaveLength(2)
    expect(reqs[1].body.context).not.toHaveProperty('hutk')
  })
})

describe('admissions API request = report 05 §3.4 G5', () => {
  it('JSON POST with X-API-Key, course_code BN and the submission id for server-side dedupe', async () => {
    const env = { ...base, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'admissionsApi', ADMISSIONS_API_URL: 'https://courses.example.test/admissions/api/website/leads/', ADMISSIONS_API_KEY: 'ADM-SECRET' }
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{"id":"L1"}', { status: 201 }))
    const out = await runAdapter(input(adm, { adapter: 'admissionsApi', config: {} }, 'admissions', env))
    expect(out.status).toBe('sent')
    const [url, init] = spy.mock.calls[0]
    const i = init as RequestInit
    expect(url).toBe(env.ADMISSIONS_API_URL)
    expect((i.headers as Record<string, string>)['X-API-Key']).toBe('ADM-SECRET')
    const body = JSON.parse(String(i.body))
    expect(body).toMatchObject({ course_code: 'BN', submission_id: adm.enquiry.submissionId, promo_code: '' })
    expect(JSON.stringify(out)).not.toContain('ADM-SECRET')
  })
})
