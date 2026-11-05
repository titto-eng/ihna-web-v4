import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// The public legacy AJAX endpoints (50 §5, 90 §2) against the portal-mysql fixture: ids are checked against cached lists before any
// deeper read, an unknown id answers 404 without a portal query, and the routes share a 30/min/IP limit.
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn, revalidateTag: () => {} }))
vi.mock('payload', async (orig) => ({ ...(await orig<typeof import('payload')>()), getPayload: async () => ({}) }))
vi.mock('@/payload.config', () => ({ default: {} }))
const spies = vi.hoisted(() => ({ hcCourse: vi.fn(), censusCourses: vi.fn(), censusUnits: vi.fn(), agentsByCountry: vi.fn() }))
vi.mock('@/lib/portal/queries', async (orig) => {
  const real = await orig<typeof import('@/lib/portal/queries')>()
  spies.hcCourse.mockImplementation(real.hcCourse)
  spies.censusCourses.mockImplementation(real.censusCourses)
  spies.censusUnits.mockImplementation(real.censusUnits)
  spies.agentsByCountry.mockImplementation(real.agentsByCountry)
  return { ...real, ...spies }
})

import { resetPortalPool } from '@/lib/portal/client'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'
import { agentDetailsResponse, censusDetailsResponse, hcCourseDetailsResponse, hcCourseTransitionResponse, LEGACY_RATE_LIMIT, legacyRoute } from '@/lib/portal/legacy-endpoints'
import { usePortalFixtureDb } from './env'

const q = (s: string) => new URLSearchParams(s)

beforeAll(() => usePortalFixtureDb())
afterAll(() => resetPortalPool())
beforeEach(() => {
  resetRateLimit()
  for (const s of Object.values(spies)) s.mockClear()
})

describe('legacy endpoints: unknown ids are 404 before any deeper read', () => {
  it('/hc-course-details/ and /hc-course-transition/: an enabled course answers; unknown or disabled ids 404 without a row query', async () => {
    const ok = await hcCourseDetailsResponse(q('course_id=363&type_id=1'))
    expect(ok.status).toBe(200)
    expect(await ok.json()).toMatchObject({ course_name: 'Diploma of Nursing', course_code: 'HLT54121' })
    spies.hcCourse.mockClear()
    for (const id of ['999999', '9203', 'abc']) {
      expect((await hcCourseDetailsResponse(q(`course_id=${id}`))).status, id).toBe(404)
      expect((await hcCourseTransitionResponse(q(`course_id=${id}`))).status, id).toBe(404)
    }
    expect(spies.hcCourse).not.toHaveBeenCalled()
    expect((await hcCourseDetailsResponse(q(''))).status).toBe(200) // no id: the old empty answer
  })

  it('/agent-details/: a known country answers; an unknown country 404s without an agents query', async () => {
    expect((await agentDetailsResponse(q('country=2'))).status).toBe(200)
    spies.agentsByCountry.mockClear()
    expect((await agentDetailsResponse(q('country=424242'))).status).toBe(404)
    expect((await agentDetailsResponse(q('country=1 OR 1=1'))).status).toBe(404)
    expect(spies.agentsByCountry).not.toHaveBeenCalled()
  })

  it('/census-date-details-ajax/: each level must be an option of the level above', async () => {
    const full = await censusDetailsResponse(q('campus=8&course=363&batch=6006&semester=1'))
    expect(full.status).toBe(200)
    expect(Object.keys(await full.json())).toEqual(['courses', 'batches', 'semesters', 'details'])
    spies.censusCourses.mockClear()
    spies.censusUnits.mockClear()
    expect((await censusDetailsResponse(q('campus=77'))).status).toBe(404) // not a picker campus
    expect(spies.censusCourses).not.toHaveBeenCalled()
    expect((await censusDetailsResponse(q('campus=8&course=9203'))).status).toBe(404) // not offered at campus 8
    expect((await censusDetailsResponse(q('campus=8&course=363&batch=6007'))).status).toBe(404) // another course's batch
    expect((await censusDetailsResponse(q('campus=8&course=363&batch=6006&semester=9'))).status).toBe(404)
    expect((await censusDetailsResponse(q("campus=8'--"))).status).toBe(404)
    expect(spies.censusUnits).not.toHaveBeenCalled()
    expect((await censusDetailsResponse(q(''))).status).toBe(200)
  })
})

describe('legacy endpoints: rate limit', () => {
  it(`${LEGACY_RATE_LIMIT} requests per minute per IP, then 429 with Retry-After`, async () => {
    const GET = legacyRoute(async () => new Response('ok'))
    const req = (ip: string) => new Request('http://localhost/agent-details/', { headers: { 'x-forwarded-for': ip } })
    for (let i = 0; i < LEGACY_RATE_LIMIT; i++) expect((await GET(req('203.0.113.9'))).status).toBe(200)
    const over = await GET(req('203.0.113.9'))
    expect(over.status).toBe(429)
    expect(Number(over.headers.get('retry-after'))).toBeGreaterThan(0)
    expect((await GET(req('203.0.113.10'))).status).toBe(200)
  })
})
