import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'csv-parse/sync'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adapters, planDeliveryRows, runAdapter, type AdapterInput } from '@/lib/adapters'
import { resolveSourceId } from '@/lib/enquiries/campaign'
import type { DestinationDef, FormDef } from '@/lib/enquiries/types'
import { formByKey, forms as FORM_SEEDS } from '@/content/forms'

// The pipeline is tested against the ihm-v2.1 form definitions (every adapter and thank-you type), not the site's own registry.
vi.mock('@/content/forms', () => import('./fixtures/forms'))
// ...and ihm-web's site maps, so the shared pipeline is checked with IHM's configuration (IHNA's: tests/enquiries/ihna-*.test.ts).
vi.mock('@/content/campaign-codes', async () => (await import('./fixtures/site-ihm')).campaignCodesModule)
vi.mock('@/content/hubspot-map', async () => (await import('./fixtures/site-ihm')).hubspotModule)
vi.mock('@/content/dynamics-map', async () => (await import('./fixtures/site-ihm')).dynamicsModule)
vi.mock('@/content/course-crm', async () => (await import('./fixtures/site-ihm')).courseCrmModule)
vi.mock('@/content/enquiry-routing', () => ({ enquiryRouting: { recipientGroups: [], alertTo: [], defaultSourceId: 24 } }))

// DRY_RUN output of every adapter against fixtures derived from enquiries.csv (rows named in each fixture) for five formKeys.
const FIXTURES = resolve(__dirname, 'fixtures')
const CSV = parse(readFileSync(resolve(__dirname, '../../../inventory/v2/ihm/enquiries.csv'), 'utf8'), { columns: true, skip_empty_lines: true, relax_column_count: true }) as Record<string, string>[]

// NODE_ENV=production keeps Mailpit out of it; nothing is sent in a dry run in any case.
const DRY_ENV = { DRY_RUN: '1', NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://ihm.edu.au' }

type Fixture = {
  formKey: string; csvRows: number[]; comment: string
  routing: AdapterInput['routing']; course: AdapterInput['course']; campus: AdapterInput['campus']
  enquiry: AdapterInput['enquiry']
  expected: Record<string, Record<string, unknown>>
  hsSourceFallback?: Record<string, boolean>
}
const fixtures: Fixture[] = readdirSync(FIXTURES).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(resolve(FIXTURES, f), 'utf8')) as Fixture)

const formDef = (key: string): FormDef => formByKey(key)!

function inputFor(fx: Fixture, destination: DestinationDef, target: string, env: Record<string, string | undefined> = DRY_ENV): AdapterInput {
  return {
    enquiry: fx.enquiry, form: formDef(fx.formKey), destination, target, course: fx.course, campus: fx.campus, routing: fx.routing,
    sourceId: resolveSourceId(destination.config, fx.routing), env,
  }
}

const strip = (record: Record<string, unknown>) => {
  const { html: _html, text: _text, ...rest } = (record.message ?? {}) as Record<string, unknown>
  return rest
}

afterEach(() => vi.restoreAllMocks())

describe('fixtures are derived from enquiries.csv', () => {
  it('covers five representative formKeys', () => expect(fixtures.map((f) => f.formKey).sort()).toEqual(['agent-registration', 'blog-enquiry', 'lp-admissions', 'nclex-magnet', 'quick-enquiry']))

  it.each(fixtures.map((f) => [f.formKey, f] as const))('%s: seeded destinations match the destinations column of its CSV row', (_key, fx) => {
    const row = CSV[fx.csvRows[0] - 1]
    const csvTokens = row.destinations.split(/;\s*/).map((t) => t.trim())
    const seed = FORM_SEEDS.find((s) => s.key === fx.formKey)!
    const seeded = new Set(seed.destinations.map((d) => d.adapter))
    const wants: Record<string, string> = { 'portal-crm': 'portalCrm', hubspot: 'hubspot', email: 'email', 'admissions-api': 'admissionsApi', 'other:portal-stakeholder-ihm': 'portalStakeholder' }
    for (const t of csvTokens) if (wants[t]) expect(seeded.has(wants[t] as never), `${fx.formKey}: CSV says ${t}`).toBe(true)
    // and nothing is seeded that the CSV does not list (the Lambda proxy and the WhatsApp redirect are replaced by hubspot / thankYou)
    expect([...seeded].every((a) => Object.values(wants).includes(a))).toBe(true)
  })

  it('blog 544, nclex 710 and the admission popup source 1 are in the CSV routing text and in the seeds', () => {
    const rowText = (n: number) => `${CSV[n - 1].routing_rule} ${CSV[n - 1].crm_ids_or_endpoints}`
    const fixed = (k: string) => FORM_SEEDS.find((s) => s.key === k)!.destinations.find((d) => d.adapter === 'portalCrm')!.config!.fixedSourceId
    expect(fixed('blog-enquiry')).toBe(544)
    expect(fixed('nclex-magnet')).toBe(710)
    expect(fixed('admission-popup')).toBe(1)
    expect(rowText(1)).toMatch(/promo_code/)
  })
})

describe('DRY_RUN records the exact request and sends nothing', () => {
  for (const fx of fixtures) {
    describe(fx.formKey, () => {
      const def = formDef(fx.formKey)
      const rows = planDeliveryRows(def as FormDef)

      it('plans exactly the expected delivery rows', () => {
        expect(rows.map((r) => `${r.adapter}:${r.target}`).sort()).toEqual(Object.keys(fx.expected).sort())
        expect(rows.every((r) => r.status === 'pending' && r.attempts === 0)).toBe(true)
      })

      for (const [key, expected] of Object.entries(fx.expected)) {
        it(`${key} matches its fixture`, async () => {
          const fetchSpy = vi.spyOn(globalThis, 'fetch')
          const [adapter, target] = key.split(':')
          const destination = target === 'autoresponder' ? ({ adapter: 'email', config: null } as DestinationDef) : def.destinations.find((d) => d.adapter === adapter)!
          const out = await runAdapter(inputFor(fx, destination, target))
          expect(out.status).toBe('dry_run')
          expect(fetchSpy).not.toHaveBeenCalled()
          const record = out.dryRunRequest as Record<string, unknown>
          if (adapter === 'email') {
            const { htmlIncludes, ...rest } = expected as { htmlIncludes: string[] } & Record<string, unknown>
            expect(strip(record)).toMatchObject({ ...rest })
            for (const needle of htmlIncludes) expect((record.message as { html: string }).html).toContain(needle)
          } else {
            const { reason, ...rest } = record
            expect(reason).toBe('DRY_RUN=1') // the row says why nothing was sent
            expect(rest).toEqual(expected)
          }
          if (fx.hsSourceFallback && key in fx.hsSourceFallback) expect(out.hsSourceFallback).toBe(fx.hsSourceFallback[key])
        })
      }
    })
  }

  it('never records a credential value', async () => {
    const fx = fixtures.find((f) => f.formKey === 'quick-enquiry')!
    const env = { ...DRY_ENV, HUBSPOT_ACCESS_TOKEN: 'SECRET-TOKEN-VALUE', PORTAL_CRM_API_KEY: 'SECRET-PORTAL-KEY', ADMISSIONS_API_KEY: 'SECRET-ADM' }
    for (const d of formDef('quick-enquiry').destinations.filter((x) => x.adapter !== 'email')) {
      const out = await runAdapter(inputFor(fx, d, d.adapter === 'hubspot' ? 'contacts' : 'portal', env))
      expect(JSON.stringify(out.dryRunRequest)).not.toMatch(/SECRET-/)
    }
    const adm = fixtures.find((f) => f.formKey === 'lp-admissions')!
    const out = await runAdapter(inputFor(adm, { adapter: 'admissionsApi', config: {} }, 'admissions', env))
    expect(JSON.stringify(out.dryRunRequest)).not.toMatch(/SECRET-/)
    expect(JSON.stringify(out.dryRunRequest)).toContain('[masked]')
  })
})

describe('hubspot (DEC-13)', () => {
  const fx = () => fixtures.find((f) => f.formKey === 'quick-enquiry')!
  const dest: DestinationDef = { adapter: 'hubspot', config: { hubspotCampaignSourceDefault: 'IHM website' } }

  it('adds the Forms API request carrying hutk only when HUBSPOT_FORM_GUID is set', async () => {
    const withHutk = { ...fx(), enquiry: { ...fx().enquiry, hutk: 'abc123hutk' } }
    const off = await runAdapter(inputFor(withHutk, dest, 'contacts'))
    expect((off.dryRunRequest as { requests: unknown[] }).requests).toHaveLength(1)
    const on = await runAdapter(inputFor(withHutk, dest, 'contacts', { ...DRY_ENV, HUBSPOT_FORM_GUID: 'guid-1', HUBSPOT_PORTAL_ID: '123' }))
    const reqs = (on.dryRunRequest as { requests: { url: string; body: { context: { hutk: string } } }[] }).requests
    expect(reqs).toHaveLength(2)
    expect(reqs[1].url).toBe('https://api.hsforms.com/submissions/v3/integration/secure/submit/123/guid-1')
    expect(reqs[1].body.context.hutk).toBe('abc123hutk')
  })

  it('stored hutk is not sent through the Contacts API', async () => {
    const withHutk = { ...fx(), enquiry: { ...fx().enquiry, hutk: 'abc123hutk' } }
    const out = await runAdapter(inputFor(withHutk, dest, 'contacts'))
    expect(JSON.stringify(out.dryRunRequest)).not.toContain('abc123hutk')
  })
})

describe('dynamics (DEC-12)', () => {
  const fx = () => fixtures.find((f) => f.formKey === 'quick-enquiry')!
  const dest: DestinationDef = { adapter: 'dynamics', config: {} }
  const env = { ...DRY_ENV, DYNAMICS_ENABLED: '1', DYNAMICS_TENANT_ID: 'tenant-x', DYNAMICS_CLIENT_ID: 'client-x', DYNAMICS_CLIENT_SECRET: 'SECRET-DYN', DYNAMICS_URL: 'https://org.crm.example.test' }

  it('is off by default and no IHM formKey names it', () => {
    expect(adapters.dynamics.enabled({})).toBe(false)
    expect(FORM_SEEDS.flatMap((s) => s.destinations).some((d) => d.adapter === 'dynamics')).toBe(false)
    const def = { ...formDef('quick-enquiry'), destinations: [dest] } as FormDef
    expect(planDeliveryRows(def, { env: {} })).toEqual([])
    expect(planDeliveryRows(def, { env: { DYNAMICS_ENABLED: '1' } })).toEqual([{ adapter: 'dynamics', target: 'leads', status: 'pending', attempts: 0 }])
  })

  it('records the client-credentials token request, the lead and the linked enquiry, with the secret masked', async () => {
    const course = { ...fx().course!, dynamicsCourseOption: '100000093' }
    const out = await runAdapter(inputFor({ ...fx(), course }, dest, 'leads', env))
    const reqs = (out.dryRunRequest as { requests: { url: string; body: Record<string, unknown> }[] }).requests
    expect(reqs.map((r) => r.url)).toEqual([
      'https://login.microsoftonline.com/tenant-x/oauth2/v2.0/token',
      'https://org.crm.example.test/api/data/v9.2/leads',
      'https://org.crm.example.test/api/data/v9.2/new_enquiries',
    ])
    expect(reqs[0].body).toMatchObject({ grant_type: 'client_credentials', client_id: 'client-x', client_secret: '[masked]' })
    expect(reqs[1].body).toMatchObject({ emailaddress1: 'asha.nair@example.test', new_courseinterested: '100000093' })
    expect(JSON.stringify(out.dryRunRequest)).not.toContain('SECRET-DYN')
  })

  // ihm-web's map has no `campaignFallbackCode`, so nothing is bound; IHNA's map binds the campaign table's GUID (DEC-101),
  // checked in ihna-adapters.test.ts.
  it('binds no campaign with ihm-web\'s map (no campaignFallbackCode)', async () => {
    const out = await runAdapter(inputFor(fx(), dest, 'leads', env))
    const reqs = (out.dryRunRequest as { requests: { body: Record<string, unknown> }[] }).requests
    expect(reqs[1].body).not.toHaveProperty('campaignid@odata.bind')
    expect(reqs[2].body).not.toHaveProperty('new_campaign')
  })

  it('a retry resumes at the second insert when the lead id is stored', async () => {
    const calls: string[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      calls.push(String(url))
      if (String(url).includes('/token')) return new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 })
      return new Response(null, { status: 204 })
    })
    const out = await runAdapter({ ...inputFor(fx(), dest, 'leads', { ...env, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'dynamics' }), existing: { adapter: 'dynamics', target: 'leads', externalId: 'lead-1', status: 'failed' } })
    expect(out.status).toBe('sent')
    expect(out.externalId).toBe('lead-1')
    expect(calls.some((c) => c.endsWith('/leads'))).toBe(false)
    expect(calls.some((c) => c.endsWith('/new_enquiries'))).toBe(true)
  })
})

describe('sending (DRY_RUN=0, fetch mocked)', () => {
  const fx = () => fixtures.find((f) => f.formKey === 'quick-enquiry')!
  const live = { ...DRY_ENV, DRY_RUN: '0', ENQUIRY_LIVE_ADAPTERS: 'email,hubspot,portalCrm,portalStakeholder,admissionsApi,dynamics', PORTAL_CRM_URL: 'https://portal.example.test/crm', HUBSPOT_ACCESS_TOKEN: 't', ADMISSIONS_API_URL: 'https://adm.example.test', ADMISSIONS_API_KEY: 'k', PORTAL_IHM_STAKEHOLDER_URL: 'https://ihm-stk.example.test', PORTAL_IHNA_STAKEHOLDER_URL: 'https://ihna-stk.example.test' }
  const portal: DestinationDef = { adapter: 'portalCrm', config: {} }

  it.each([[200, 'sent'], [201, 'sent'], [500, 'failed'], [503, 'failed'], [429, 'failed'], [400, 'dead'], [404, 'dead'], [401, 'dead']] as const)('portalCrm HTTP %i -> %s', async (code, status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>secret body</html>', { status: code }))
    const out = await runAdapter(inputFor(fx(), portal, 'portal', live))
    expect(out.status).toBe(status)
    if (status !== 'sent') {
      expect(out.lastError).toBe(`HTTP ${code}`)
      expect(out.lastError).not.toContain('secret body')
    }
  })

  it('a network error is retryable; a missing URL means the adapter only records and says why', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'))
    expect((await runAdapter(inputFor(fx(), portal, 'portal', live))).status).toBe('failed')
    spy.mockClear()
    const none = await runAdapter(inputFor(fx(), portal, 'portal', { ...live, PORTAL_CRM_URL: undefined }))
    expect(none).toMatchObject({ status: 'dry_run', note: 'missing: PORTAL_CRM_URL' })
    expect(spy).not.toHaveBeenCalled()
  })

  it('keeps a short tag-free excerpt of the response on the row, and the HubSpot contact id as externalId', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html><body><p>Lead 12345 created</p></body></html>', { status: 200 }))
    const out = await runAdapter(inputFor(fx(), portal, 'portal', live))
    expect(out).toMatchObject({ status: 'sent', responseCode: 200, dryRunRequest: { live: true, response: { code: 200, body: 'Lead 12345 created' } } })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 'COMPLETE', results: [{ id: '501', properties: {} }] }), { status: 200 }))
    const hs = await runAdapter(inputFor(fx(), { adapter: 'hubspot', config: {} }, 'contacts', live))
    expect(hs).toMatchObject({ status: 'sent', externalId: '501' })
  })

  it('posts the planned form body to the configured URL', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }))
    await runAdapter(inputFor(fx(), portal, 'portal', live))
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://portal.example.test/crm')
    expect(String((init as RequestInit).body)).toContain('enquirySourceId=24&')
  })

  it('admissions API: 400 is not retryable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"error":"bad"}', { status: 400 }))
    const adm = fixtures.find((f) => f.formKey === 'lp-admissions')!
    expect((await runAdapter(inputFor(adm, { adapter: 'admissionsApi', config: {} }, 'admissions', live))).status).toBe('dead')
  })

  it('portal stakeholder answering "fail" is dead; a missing portal URL is dead', async () => {
    const ag = fixtures.find((f) => f.formKey === 'agent-registration')!
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('fail', { status: 200 }))
    expect((await runAdapter(inputFor(ag, { adapter: 'portalStakeholder', config: {} }, 'ihm', live))).status).toBe('dead')
    expect((await runAdapter(inputFor(ag, { adapter: 'portalStakeholder', config: {} }, 'ihna', live))).status).toBe('dead')
    const none = await runAdapter(inputFor(ag, { adapter: 'portalStakeholder', config: {} }, 'ihna', { ...live, PORTAL_IHNA_STAKEHOLDER_URL: undefined }))
    expect(none).toMatchObject({ status: 'dry_run', note: 'missing: PORTAL_IHNA_STAKEHOLDER_URL' })
  })
})
