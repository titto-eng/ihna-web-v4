// The old WordPress AJAX pages that are live URLs (urls.csv kind=api, 50-portal-data §5 IHNA). Each answers the same kind of JSON as before,
// from parameterised portal reads (src/lib/portal/ihna.ts); every query-string value is a validated integer. Server-only.
// Abuse limits (90 §2): 30 requests per minute per IP across these routes (429), and an id is first checked against a cached list of the
// real ids (countries, enabled courses, the census picker levels): an unknown id answers 404 without a portal query or a new cache entry.
// While the lists are unavailable (portal off or down) the old empty answer is kept.
import { getPayload } from 'payload'
import config from '@/payload.config'
import { rateLimit } from '@/lib/enquiries/rateLimit'
import { clientIp } from '@/lib/security/clientIp'
import { censusAjaxBody, getAgents, getAllCountries, getHcCourse, getHcCourseIds, idParam, readCensus } from './ihna'

type Q = URLSearchParams

export const LEGACY_RATE_LIMIT = 30

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' }

const json = (body: unknown, extra: Record<string, string> = {}) => new Response(JSON.stringify(body), { status: 200, headers: { ...JSON_HEADERS, ...extra } })

/** An id that is not one of the portal's: 404, never cached by a shared cache. */
export const unknownId = () => new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })

/** A bare GET of these pages printed nothing on the old site: an empty 200. */
export const emptyOk = () => new Response(null, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' } })

/** One bucket for every legacy endpoint: null when allowed, else the 429 to answer. */
export async function legacyRateLimited(req: Request, deps: { limit?: typeof rateLimit } = {}): Promise<Response | null> {
  const payload = await getPayload({ config })
  const r = await (deps.limit ?? rateLimit)(payload, clientIp(req.headers), 'portal-legacy', { limit: LEGACY_RATE_LIMIT })
  if (r.allowed) return null
  return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': String(r.retryAfterSeconds), 'Cache-Control': 'no-store' } })
}

/** Wraps a legacy endpoint: the rate limit, then the handler. */
export const legacyRoute = (handler: (q: Q) => Promise<Response>) => async (req: Request): Promise<Response> =>
  (await legacyRateLimited(req)) ?? handler(new URL(req.url).searchParams)

/** `/census-date-details-ajax/?campus=&course=&batch=&semester=` (template-census-date-details-ajax.php). */
export async function censusDetailsResponse(q: Q): Promise<Response> {
  if (!q.has('campus')) return emptyOk()
  const ids = { campus: idParam(q.get('campus')), course: idParam(q.get('course')), batch: idParam(q.get('batch')), semester: idParam(q.get('semester')) }
  // a parameter that is present but not an id (`?course=abc`) is unknown, like an id that is not an option
  for (const k of ['campus', 'course', 'batch', 'semester'] as const) if (q.has(k) && q.get(k) !== '' && ids[k] === null) return unknownId()
  const result = await readCensus(ids)
  if (result.unknown) return unknownId()
  return json(censusAjaxBody(ids, result.data))
}

/** Agency fields the old endpoint returned, without the partner staff person's name, email and phone (rule 4). */
export async function agentDetailsResponse(q: Q): Promise<Response> {
  const country = idParam(q.get('country'))
  if (q.get('country') && !country) return unknownId()
  if (country) {
    const known = await getAllCountries()
    if (!known.unavailable && !known.data.some((c) => c.id === country)) return unknownId()
    if (known.unavailable) return json({ partners: [] }, { 'Access-Control-Allow-Origin': '*' })
  }
  const agents = country ? (await getAgents(country)).data : []
  const partners = agents.map((a) => ({
    id: String(a.id), facility_name: a.name, address: a.address, address_2: a.address2, suburb_town: a.suburb, state: a.state, postcode: a.postcode,
    website: a.website, web_name: a.contactName, web_email: a.email, web_phone_number: a.phone,
  }))
  return json({ partners }, { 'Access-Control-Allow-Origin': '*' }) // public directory, read cross-site as before
}

/**
 * `/hc-course-details/?course_id=&type_id=` (template-hc-course-details.php): the course row. The portal course overviews (summary,
 * overview sections, pathway, brochure and application links) are HTML from `course_overviews` and are not served (rule 5); their keys stay,
 * empty, until a decision on those overviews (50 §10).
 */
export async function hcCourseDetailsResponse(q: Q): Promise<Response> {
  const id = idParam(q.get('course_id'))
  const type = q.get('type_id') === '1' ? '1' : q.get('type_id') === '0' ? '0' : ''
  const known = await knownHcCourse(q, id)
  if (known === 'unknown') return unknownId()
  const c = known === 'ok' && id ? (await getHcCourse(id)).data : null
  return json({
    date_table: '', course_name: c?.name ?? null, course_code: c?.code ?? null, course_summary: '', course_overviews: {}, brochure_link: '',
    application_link: '', path_way_content: {}, refer_friend: c?.referFriend === null || c?.referFriend === undefined ? null : String(c.referFriend),
    old_pd_url: '', course_id: id ? String(id) : '', type_id: type, course_category_id: c?.categoryId === null || c?.categoryId === undefined ? null : String(c.categoryId),
  })
}

/**
 * `/hc-course-transition/?course_id=&type_id=` (template-hc-course-transition.php): course name and code from the portal. Credit transfers,
 * pathways and transition-out text lived in WordPress tables (`wp_existing_*`, `wp_ah_course_units`, `wp_transition_outs`) that are not
 * available (WP database dump), so they answer empty.
 */
export async function hcCourseTransitionResponse(q: Q): Promise<Response> {
  const id = idParam(q.get('course_id'))
  const type = q.get('type_id') === '1' ? '1' : q.get('type_id') === '0' ? '0' : ''
  const known = await knownHcCourse(q, id)
  if (known === 'unknown') return unknownId()
  const c = known === 'ok' && id ? (await getHcCourse(id)).data : null
  return json(
    {
      credit_transfers: {}, pathways: {}, existingCourseUnitData: [], existingCourses: {}, course_id: id ? String(id) : '', type_id: type,
      course_name: c?.name ?? null, course_code: c?.code ?? null, transition_out: null,
    },
    { 'Access-Control-Allow-Origin': '*' },
  )
}

/** `ok` = an enabled portal course; `unknown` = a value that is not one (404); `skip` = no id, or the id list is unavailable. */
async function knownHcCourse(q: Q, id: number | null): Promise<'ok' | 'unknown' | 'skip'> {
  if (!id) return q.get('course_id') ? 'unknown' : 'skip'
  const ids = await getHcCourseIds()
  if (ids.unavailable) return 'skip'
  return ids.data.includes(id) ? 'ok' : 'unknown'
}
