// One real portal-CRM test submission through the enquiry pipeline (handleEnquire + runDelivery, the code behind POST /api/enquire/),
// with clearly marked test data, plus a Mailpit check of the staff notification (quick-enquiry) and the autoresponder
// (agent-registration, the seeded form that has one and no portalCrm destination). Refuses to run twice. No credentials are involved.
// Run: DISABLE_DB_PUSH=1 npx tsx scripts/dev/enquiry-live-test.ts   (DRY_RUN=0, ENQUIRY_LIVE_ADAPTERS=portalCrm, PORTAL_CRM_URL in .env)
import 'dotenv/config'
import { existsSync, writeFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { handleEnquire } from '../../src/lib/enquiries/process'
import { runDelivery } from '../../src/jobs/deliverEnquiry'
import { adapterMode } from '../../src/lib/adapters'

const OUT = 'scripts/import/out/enquiry-live-test.json'
const PORTAL = 'https://portal.ihm.edu.au/crm/crm_enquiries/applicationFormFromWebsites'
const TEST_EMAIL = 'website-rebuild-test@ihm.edu.au'
const MAILPIT = 'http://localhost:8025/api/v1'

if (existsSync(OUT) && !process.argv.includes('--force')) throw new Error(`${OUT} exists: one real test only (pass --force to override)`)
if (process.env.DRY_RUN !== '0' || (process.env.ENQUIRY_LIVE_ADAPTERS ?? '').trim() !== 'portalCrm' || process.env.PORTAL_CRM_URL !== PORTAL) {
  throw new Error('Expected DRY_RUN=0, ENQUIRY_LIVE_ADAPTERS=portalCrm and the portal URL in .env')
}
for (const a of ['email', 'hubspot', 'admissionsApi', 'portalStakeholder', 'dynamics']) {
  if (adapterMode(a, 'ihm').live) throw new Error(`${a} must not be live for this test`)
}

const payload = await getPayload({ config })
const headers = new Headers({ 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' })
const noQueue = { queueDelivery: async () => {} } // delivery is run below, once, so no stray job is left for a later runner

async function submit(formKey: string, fields: Record<string, unknown>, pageUrl: string) {
  const submissionId = crypto.randomUUID()
  const rawBody = JSON.stringify({ formKey, submissionId, fields, pageUrl, website: '' })
  const res = await handleEnquire({ payload, rawBody, headers, contentType: 'application/json' }, noQueue)
  if (res.status !== 200) throw new Error(`enquire ${formKey}: ${res.status} ${JSON.stringify(res.body)}`)
  const doc = (await payload.find({ collection: 'enquiries', where: { submissionId: { equals: submissionId } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as any
  const run = await runDelivery(payload, doc.id)
  const after = (await payload.findByID({ collection: 'enquiries', id: doc.id, depth: 0, overrideAccess: true })) as any
  return {
    response: res.body, run: { status: run.status, attempted: run.attempted, retryNeeded: run.retryNeeded },
    enquiry: { id: after.id, publicId: after.publicId, submissionId, formKey, status: after.status, captchaStatus: after.captchaStatus },
    deliveries: (after.deliveries ?? []).map((d: any) => ({ adapter: d.adapter, target: d.target, status: d.status, attempts: d.attempts, at: d.at, responseCode: d.responseCode ?? null, externalId: d.externalId ?? null, lastError: d.lastError ?? null, dryRunRequest: d.dryRunRequest ?? null })),
  }
}

async function mailpit(query: string) {
  const list = (await (await fetch(`${MAILPIT}/search?query=${encodeURIComponent(query)}`)).json()) as { messages: { ID: string; Subject: string; To: { Address: string }[]; Created: string }[] }
  return list.messages.map((m) => ({ subject: m.Subject, to: m.To.map((t) => t.Address), created: m.Created }))
}

const started = new Date().toISOString()
const quick = await submit('quick-enquiry', {
  firstName: 'TEST', lastName: 'IGNORE-WEBSITE-REBUILD', email: TEST_EMAIL, phone: '+61 400 000 000', country: 'Australia',
  message: 'Test enquiry from the website rebuild — please ignore and delete', consent: true,
}, 'http://localhost:3000/contact-us/')

writeFileSync(OUT, JSON.stringify({ partial: true, portalCrmUrl: PORTAL, startedAt: started, quickEnquiry: quick }, null, 2) + '\n') // evidence first
const agent = await submit('agent-registration', {
  orgName: 'TEST IGNORE-WEBSITE-REBUILD', address: '1 Test St', country: 'Australia', email: TEST_EMAIL, phone: '+61 400 000 000',
  contact1Name: 'TEST IGNORE-WEBSITE-REBUILD', contact1Email: TEST_EMAIL,
}, 'http://localhost:3000/agent-registration/')

await new Promise((r) => setTimeout(r, 1500))
const staff = await mailpit(`to:${(process.env.ENQUIRY_NOTIFY_TO ?? '').split(/[,;]/)[0].trim()} after:${started.slice(0, 19)}`).catch(() => [])
const auto = await mailpit(`to:${TEST_EMAIL}`).catch(() => [])
const out = {
  note: 'One real portal CRM submission. Staff notification and autoresponder go to local Mailpit (email is not live). Credentials: none exist for this endpoint (inventory/05 §3.1 step 3, §3.5 row 1).',
  portalCrmUrl: PORTAL, startedAt: started, quickEnquiry: quick, agentRegistrationEmailCheck: agent,
  mailpit: { staffNotificationsSince: staff, messagesToTestAddress: auto.filter((m) => m.created >= started) },
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify({ quick: quick.deliveries.map((d: any) => ({ a: d.adapter, s: d.status, c: d.responseCode, e: d.lastError, r: d.dryRunRequest?.response ?? d.dryRunRequest?.reason })), agent: agent.deliveries.map((d: any) => ({ a: d.adapter, t: d.target, s: d.status, e: d.lastError })), mailpit: out.mailpit }, null, 1))
process.exit(0)
