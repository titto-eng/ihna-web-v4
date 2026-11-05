import { randomBytes } from 'node:crypto'
import type { Payload } from 'payload'
import { autoresponderAllowed, verifyCaptcha } from './captcha'
import { site } from '@/content/site'
import { resolveCampaign } from './campaign'
import { courseFactsOf, type CourseFacts } from './conditions'
import { contactFrom } from './contact'
import { siteUrl } from './config'
import {
  findCampus, findCourse, findLandingByPageUrl, loadFormDefinition, loadRouting,
  type CampusLite, type CourseLite, type LandingLite,
} from './lookups'
import { rateLimit } from './rateLimit'
import { attributionOf, clientIp, envelopeSchema, hutkFromCookie, MAX_BODY_BYTES, parseAttributionCookie } from './request'
import { buildEnquirySchema, fieldErrors } from './schema'
import { computeThankYou } from './thankYou'
import type { DeliveryRow, FormDef } from './types'
import { planDeliveryRows } from '@/lib/adapters'

export type EnquireResponse = { status: number; body: Record<string, unknown>; headers?: Record<string, string> }
export type QueueFn = (payload: Payload, enquiryId: number | string) => Promise<void>
export type EnquireDeps = { queueDelivery: QueueFn }

export const SAVE_FAILED_MESSAGE = 'We could not save your enquiry. Please try again in a moment, or contact us by phone or email.'

type Status = 'received' | 'held' | 'spam'

const fail = (status: number, error: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>): EnquireResponse => ({
  status, body: { ok: false, error, ...extra }, headers,
})

async function nextFor(payload: Payload, def: FormDef, args: {
  data: Record<string, unknown>; landing: LandingLite | null; course: CourseLite | null; campus: CampusLite | null; campaignCode: string | null
}): Promise<string | null> {
  const routing = def.thankYou?.type === 'whatsapp' ? await loadRouting(payload) : null
  const facts: CourseFacts = courseFactsOf({ course: args.course, data: args.data, landing: args.landing })
  return computeThankYou({ def, ...args, facts, whatsappNumber: routing?.whatsappNumber, siteHost: new URL(siteUrl()).hostname })
}

/** Resolve the single `course` / `campus` field of a form (id as string). Returns a fieldError when the id does not exist. */
async function resolveRelations(payload: Payload, def: FormDef, values: Record<string, unknown>) {
  const errors: Record<string, string> = {}
  let course: CourseLite | null = null
  let campus: CampusLite | null = null
  for (const f of def.fields) {
    const v = values[f.name]
    if (v === undefined || v === '') continue
    if (f.type === 'course' && !course) {
      course = await findCourse(payload, v as string)
      if (!course) errors[f.name] = 'Choose a valid course'
    }
    if (f.type === 'campus' && !campus) {
      campus = await findCampus(payload, v as string)
      if (!campus) errors[f.name] = 'Choose a valid campus'
    }
  }
  return { course, campus, errors }
}

const isUniqueViolation = (e: unknown): boolean => {
  const err = e as { code?: string; cause?: { code?: string }; message?: string; data?: { errors?: { message?: string }[] } } | null
  return err?.code === '23505' || err?.cause?.code === '23505' || /unique|duplicate/i.test(`${err?.message ?? ''} ${err?.data?.errors?.map((x) => x.message).join(' ') ?? ''}`)
}

async function existingBySubmission(payload: Payload, submissionId: string) {
  const res = await payload.find({ collection: 'enquiries', where: { submissionId: { equals: submissionId } }, limit: 1, depth: 0, overrideAccess: true, pagination: false })
  return (res.docs[0] ?? null) as unknown as { id: number; publicId?: string; formKey: string; data?: Record<string, unknown>; pageUrl?: string; campaignCode?: string; course?: number | null; campus?: number | null } | null
}

/**
 * The whole pipeline of `POST /api/enquire/` (40 §4). Order: parse, rate limit, form lookup, honeypot, validate, captcha,
 * INSERT (rule 2: nothing else happens before the row exists), queue `deliverEnquiry`, answer with the server-computed thank-you.
 */
export async function handleEnquire(args: { payload: Payload; rawBody: string; headers: Headers; contentType?: string | null }, deps: EnquireDeps): Promise<EnquireResponse> {
  const { payload, headers } = args
  if (Buffer.byteLength(args.rawBody) > MAX_BODY_BYTES) return fail(413, 'too_large')

  let json: unknown
  try {
    json = args.contentType?.includes('application/x-www-form-urlencoded') ? formToEnvelope(args.rawBody) : JSON.parse(args.rawBody)
  } catch {
    return fail(400, 'validation', { message: 'The request body is not valid JSON.' })
  }
  const parsed = envelopeSchema.safeParse(json)
  if (!parsed.success) {
    const unknown = parsed.error.issues.some((i) => i.path[0] === 'formKey')
    return fail(400, unknown ? 'unknown_form' : 'validation', { fieldErrors: fieldErrors(parsed.error) })
  }
  const env = parsed.data
  const ip = clientIp(headers)
  const cookieHeader = headers.get('cookie')

  const rate = await rateLimit(payload, ip, env.formKey)
  if (!rate.allowed) return fail(429, 'rate_limited', { message: 'Too many submissions. Please wait a minute and try again.' }, { 'Retry-After': String(rate.retryAfterSeconds) })

  const def = await loadFormDefinition(payload, env.formKey)
  if (!def) return fail(400, 'unknown_form')

  // Idempotent on submissionId: a retry of the same submission answers like the first and queues nothing new.
  const dup = await existingBySubmission(payload, env.submissionId)
  if (dup) return duplicateResponse(payload, def, dup)

  const landing = await findLandingByPageUrl(payload, env.pageUrl, def.key)

  // Honeypot: stored as spam, no deliveries, and the bot sees an ordinary success.
  if (def.honeypot !== false && env._hp_url && env._hp_url.trim() !== '') {
    try {
      await payload.create({
        collection: 'enquiries', overrideAccess: true,
        data: { publicId: randomBytes(6).toString('hex'), submissionId: env.submissionId, formKey: def.key, status: 'spam', honeypot: true, captchaStatus: 'unverified', pageUrl: env.pageUrl, source: 'api', ip, deliveries: [] },
      })
    } catch (e) {
      if (!isUniqueViolation(e)) console.error('[enquire] spam row not stored', e instanceof Error ? e.message : e)
    }
    return { status: 200, body: { ok: true, thankYouPath: await nextFor(payload, def, { data: {}, landing, course: null, campus: null, campaignCode: null }) } }
  }

  const result = buildEnquirySchema(def).safeParse(env.fields)
  if (!result.success) return fail(400, 'validation', { fieldErrors: fieldErrors(result.error) })
  const values = result.data as Record<string, unknown>

  const rel = await resolveRelations(payload, def, values)
  if (Object.keys(rel.errors).length) return fail(400, 'validation', { fieldErrors: rel.errors })

  const captcha = await verifyCaptcha({ required: def.captcha !== false, token: env.captchaToken, ip })
  const held = captcha.held
  const status: Status = held ? 'held' : 'received'

  const { campaignCode } = await resolveCampaign(payload, {
    bodyCampaign: env.campaign, cookieHeader, landing, promoCode: typeof values.promoCode === 'string' ? values.promoCode : undefined,
    // a staff page's `campaignCode` select: its options are the allowed codes, so the schema already validated it
    fieldCode: def.fields.some((f) => f.name === 'campaignCode' && f.type === 'select') && typeof values.campaignCode === 'string' ? values.campaignCode : undefined,
  })

  const cookieAttr = parseAttributionCookie(cookieHeader, site.attributionCookies.last)
  const attr = { ...attributionOf(cookieAttr), ...attributionOf(env) }
  const contact = contactFrom(values)
  const facts = courseFactsOf({ course: rel.course, data: values, landing })
  const deliveries: DeliveryRow[] = planDeliveryRows(def, { held, autoresponder: autoresponderAllowed(captcha.status), ctx: { facts, data: values, landingPath: landing?.path ?? null } })

  const data = {
    publicId: randomBytes(6).toString('hex'),
    submissionId: env.submissionId,
    formKey: def.key,
    status,
    captchaStatus: captcha.status,
    captchaScore: captcha.score,
    honeypot: false,
    ...contact,
    course: rel.course?.id ?? undefined,
    campus: rel.campus?.id ?? undefined,
    campaignCode: campaignCode ?? undefined,
    utm: {
      utmSource: attr.utm_source, utmMedium: attr.utm_medium, utmCampaign: attr.utm_campaign, utmTerm: attr.utm_term, utmContent: attr.utm_content,
      gclid: attr.gclid, gbraid: attr.gbraid, wbraid: attr.wbraid, fbclid: attr.fbclid, msclkid: attr.msclkid,
      referrer: env.referrer, landingPath: env.landingPath,
    },
    hutk: env.hutk ?? hutkFromCookie(cookieHeader),
    data: values,
    pageUrl: env.pageUrl,
    source: 'api' as const,
    ip,
    deliveries,
  }

  let created: { id: number | string; publicId?: string | null }
  try {
    created = (await payload.create({ collection: 'enquiries', data: data as never, overrideAccess: true })) as unknown as typeof created
  } catch (e) {
    if (isUniqueViolation(e)) {
      const again = await existingBySubmission(payload, env.submissionId)
      if (again) return duplicateResponse(payload, def, again)
    }
    console.error('[enquire] INSERT failed', e instanceof Error ? e.message : e)
    return fail(500, 'save_failed', { message: SAVE_FAILED_MESSAGE })
  }

  // The row is safe. A queue failure never loses it: the row stays `received` and "Retry" / the sweeper re-queues it.
  if (!held && deliveries.length) {
    try {
      await deps.queueDelivery(payload, created.id)
    } catch (e) {
      console.error(`[enquire] enquiry ${created.publicId} saved but deliverEnquiry could not be queued`, e instanceof Error ? e.message : e)
    }
  }

  const next = await nextFor(payload, def, { data: values, landing, course: rel.course, campus: rel.campus, campaignCode })
  return { status: 200, body: { ok: true, enquiryId: created.publicId, thankYouPath: next } }
}

async function duplicateResponse(payload: Payload, def: FormDef, dup: NonNullable<Awaited<ReturnType<typeof existingBySubmission>>>): Promise<EnquireResponse> {
  const landing = await findLandingByPageUrl(payload, dup.pageUrl, def.key)
  const course = await findCourse(payload, dup.course ?? undefined)
  const campus = await findCampus(payload, dup.campus ?? undefined)
  const next = await nextFor(payload, def, { data: dup.data ?? {}, landing, course, campus, campaignCode: dup.campaignCode ?? null })
  return { status: 200, body: { ok: true, enquiryId: dup.publicId, thankYouPath: next, duplicate: true } }
}

/** No-JS body: `fields[name]=value` or bare `name=value` pairs map into the same envelope. */
function formToEnvelope(raw: string): Record<string, unknown> {
  const params = new URLSearchParams(raw)
  const meta = new Set(['formKey', 'submissionId', 'campaign', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'hutk', 'referrer', 'landingPath', 'pageUrl', '_hp_url', 'captchaToken'])
  const out: Record<string, unknown> = {}
  const fields: Record<string, string> = {}
  for (const [k, v] of params) {
    const m = /^fields\[(.+)\]$/.exec(k)
    if (m) fields[m[1]] = v
    else if (meta.has(k)) out[k] = v
    else fields[k] = v
  }
  return { ...out, fields }
}
