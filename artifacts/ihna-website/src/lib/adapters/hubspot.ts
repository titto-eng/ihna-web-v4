import type { Adapter, Planned, PlannedHttp, SendResult } from './types'
import { classify, compact, envRef, escapeHtml, httpSend, networkError, str } from './util'
import { hubspotMap } from '@/content/hubspot-map'
import { hubspotCampaignSource } from '@/lib/enquiries/campaign'
import { campusFactsOf, courseFactsOf } from '@/lib/enquiries/conditions'
import { envValue } from '@/lib/enquiries/config'
import { contactFrom } from '@/lib/enquiries/contact'

// HubSpot (40 §6 "hubspot", 05 §1, §3.4). CRM v3 upsert on `email` replaces the old v1 createOrUpdate and its string-concatenated
// JSON. HubSpot's public docs (https://developers.hubspot.com/docs/api-reference/crm-contacts-v3/batch/post-crm-v3-objects-contacts-batch-upsert)
// define the upsert as `POST /crm/v3/objects/contacts/batch/upsert` with `inputs: [{ id: <email>, idProperty: 'email', properties }]`;
// the single `POST /crm/v3/objects/contacts` is create-only (409 when the email exists), so the batch endpoint with one input is used.
// Needs the private-app scope `crm.objects.contacts.write` and the custom properties below to exist in the portal (else HubSpot answers 400).
// Site-specific property names, constants and the default `campaign_source` are src/content/hubspot-map.ts.
// A destination with `hubspotNote` also creates a note (`POST /crm/v3/objects/notes`, scope `crm.objects.contacts.write`) associated
// with the upserted contact (association type 202, note -> contact); the v1 engagements API the old site used is retired.
// `hutk` is always stored on the enquiry (DEC-13) but sent only through the Forms API, and only when HUBSPOT_FORM_GUID is set: the
// Contacts API cannot take it. Forms submit (https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-authenticated):
// `POST api.hsforms.com/submissions/v3/integration/secure/submit/{portalId}/{formGuid}`, Bearer token, scope `forms`.
// Hosts: HUBSPOT_API_BASE / HUBSPOT_FORMS_BASE override the global hosts (an EU1 portal may need the EU host for the Forms API).
export const HUBSPOT_BASE = 'https://api.hubapi.com'
export const HUBSPOT_FORMS_BASE = 'https://api.hsforms.com'
export const DEFAULT_CAMPAIGN_SOURCE = hubspotMap.defaultCampaignSource
export const CONTACT_ID_PLACEHOLDER = '<contact-id>'
const NOTE_TO_CONTACT = 202

const base = (name: string, fallback: string, env: Record<string, string | undefined>) => (envValue(name, env) ?? fallback).replace(/\/+$/, '')

export const hubspotAdapter: Adapter = {
  name: 'hubspot',
  enabled: () => true,
  targets: () => ['contacts'],
  plan(input): Planned {
    const env = input.env ?? process.env
    const missing: string[] = []
    const { enquiry: e, course, campus, form, destination, landing } = input
    const contact = contactFrom(e.data)
    const email = e.email ?? contact.email ?? ''
    const apiBase = base('HUBSPOT_API_BASE', HUBSPOT_BASE, env)

    // 41 §6: fixed source, then the campaign table, then the form default; `hsSourceFallback` records when a default decided.
    const source = hubspotCampaignSource(destination.config, input.campaign, landing, DEFAULT_CAMPAIGN_SOURCE)
    const hsSourceFallback = source.fallback

    // CMS course: its HubSpot id, else the course code (site map `courseValue: 'code'`, IHNA) or the KH id (unset, IHM); a landing
    // page's fixed course or a KH picker: the course code. With `code` a KH id is never sent as the course.
    const facts = courseFactsOf({ course, data: e.data, landing })
    const byCode = (hubspotMap as { courseValue?: 'code' | 'khId' }).courseValue === 'code'
    const courseValue = course
      ? str(course.hubspotCourseId) ?? (byCode ? str(course.code) ?? facts.code : course.khId ? String(course.khId) : undefined)
      : facts.code
    const campusFacts = campusFactsOf({ campus, data: e.data, landing, fixed: destination.config?.campusFixed })
    const whereHear = [str(e.data.whereHear), str(e.data.whereHearOther)].filter(Boolean).join(' - ') || undefined
    const mapped: Record<string, string | undefined> = {}
    for (const f of form.fields) {
      const prop = f.hubspotProperty ?? hubspotMap.fieldProperties[f.name]
      if (prop) mapped[prop] = typeof e.data[f.name] === 'boolean' ? (e.data[f.name] ? 'true' : 'false') : str(e.data[f.name])
    }
    const studentType = e.studentType ?? contact.studentType ?? landing?.studentType ?? destination.config?.studentType ?? undefined
    const properties = compact({
      ...hubspotMap.constants,
      ...mapped,
      firstname: e.firstName ?? contact.firstName,
      lastname: e.lastName ?? contact.lastName,
      email,
      phone: e.phone ?? contact.phone,
      campus: str(campusFacts?.hubspot),
      course: courseValue ? `;${courseValue}` : undefined,
      course_specialization: course?.splId ? `;${course.splId}` : undefined,
      campaign_source: source.value,
      [hubspotMap.whereHearProperty]: whereHear,
      ...(hubspotMap.studentTypeProperty && studentType ? { [hubspotMap.studentTypeProperty]: studentType } : {}),
      ...(hubspotMap.pageUrlProperty && e.pageUrl ? { [hubspotMap.pageUrlProperty]: e.pageUrl } : {}),
    })

    const token = envRef('HUBSPOT_ACCESS_TOKEN', env, missing)
    const requests: PlannedHttp[] = [{
      method: 'POST',
      url: `${apiBase}/crm/v3/objects/contacts/batch/upsert`,
      headers: { Authorization: `Bearer ${token}` },
      encoding: 'json',
      body: { inputs: [{ idProperty: 'email', id: email, properties }] },
      note: 'contacts upsert on email',
    }]

    const noteFields = destination.config?.hubspotNote?.fields ?? []
    if (noteFields.length) {
      const lines = noteFields.flatMap((name) => {
        const f = form.fields.find((x) => x.name === name)
        const v = e.data[name]
        if (v === undefined || v === null || v === '') return []
        const shown = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : f?.options?.find((o) => o.value === String(v))?.label ?? String(v)
        return [`${escapeHtml(f?.label?.trim() || name)}: ${escapeHtml(shown)}`]
      })
      if (lines.length) {
        requests.push({
          method: 'POST',
          url: `${apiBase}/crm/v3/objects/notes`,
          headers: { Authorization: `Bearer ${token}` },
          encoding: 'json',
          body: {
            properties: { hs_timestamp: new Date().toISOString(), hs_note_body: [escapeHtml(`${form.name ?? form.key} (${e.publicId ?? e.id})`), ...lines].join('<br>') },
            associations: [{ to: { id: CONTACT_ID_PLACEHOLDER }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: NOTE_TO_CONTACT }] }],
          },
          note: 'note on the contact (id from the upsert)',
        })
      }
    }

    const guid = envValue('HUBSPOT_FORM_GUID', env)
    if (guid) {
      const portalId = envRef('HUBSPOT_PORTAL_ID', env, missing)
      requests.push({
        method: 'POST',
        url: `${base('HUBSPOT_FORMS_BASE', HUBSPOT_FORMS_BASE, env)}/submissions/v3/integration/secure/submit/${portalId}/${guid}`,
        headers: { Authorization: `Bearer ${token}` },
        encoding: 'json',
        body: {
          fields: Object.entries(properties).filter(([k]) => ['email', 'firstname', 'lastname', 'phone'].includes(k)).map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
          context: compact({ hutk: e.hutk, pageUri: e.pageUrl ?? undefined, pageName: form.name ?? form.key }),
        },
        note: e.hutk ? 'forms submit carrying hutk (DEC-13)' : 'forms submit (no hutk on this enquiry)',
      })
    }
    return { transport: 'http', requests, hsSourceFallback, missingEnv: missing }
  },
  // The contact id from the upsert response (`results[0].id`) is kept as the delivery's externalId and fills the note's association.
  // Once the note exists its id is added (`<contactId>|note:<noteId>`), so a retry after a later failure (the Forms API) resumes past
  // both steps and never posts the note twice.
  async send(planned, input): Promise<SendResult> {
    if (planned.transport !== 'http') return { ok: false, retryable: false, error: 'not an http plan' }
    if (planned.missingEnv?.length) return { ok: false, retryable: false, error: `missing configuration: ${planned.missingEnv.join(', ')}` }
    const stored = parseExternalId(input.existing?.externalId)
    let contactId = stored.contactId
    let noteId = stored.noteId
    const marker = () => formatExternalId(contactId, noteId)
    let last: SendResult = { ok: true }
    for (const [i, r] of planned.requests.entries()) {
      const isNote = r.url.endsWith('/crm/v3/objects/notes')
      // a retry after the upsert succeeded resumes with the stored contact id; a note already created is not posted again
      if (i === 0 && contactId && planned.requests.length > 1) continue
      if (isNote && noteId) continue
      const req = isNote
        ? (contactId ? { ...r, body: JSON.parse(JSON.stringify(r.body).replace(CONTACT_ID_PLACEHOLDER, contactId)) as Record<string, unknown> } : null)
        : r
      if (!req) return { ok: false, retryable: false, error: 'no contact id for the note', externalId: marker() }
      try {
        const out = await httpSend(req)
        last = classify(out.status, out.text)
        if (last.ok && i === 0) {
          try { contactId = str((JSON.parse(out.text) as { results?: { id?: unknown }[] }).results?.[0]?.id) ?? contactId } catch { /* keep */ }
        }
        if (last.ok && isNote) {
          try { noteId = str((JSON.parse(out.text) as { id?: unknown }).id) ?? 'created' } catch { noteId = 'created' }
        }
      } catch (err) {
        return { ...(networkError(err) as Extract<SendResult, { ok: false }>), externalId: marker() }
      }
      if (!last.ok) return { ...last, externalId: marker() }
    }
    const ext = marker()
    return ext ? { ...last, externalId: ext } : last
  },
}

/** `externalId` of a HubSpot delivery: `<contactId>` or `<contactId>|note:<noteId>`. */
export function parseExternalId(v: string | null | undefined): { contactId?: string; noteId?: string } {
  if (!v) return {}
  const [contactId, ...rest] = v.split('|')
  const note = rest.find((p) => p.startsWith('note:'))
  return { contactId: contactId || undefined, noteId: note ? note.slice(5) || undefined : undefined }
}
export const formatExternalId = (contactId?: string, noteId?: string): string | undefined =>
  contactId ? (noteId ? `${contactId}|note:${noteId}` : contactId) : undefined
