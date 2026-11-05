import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { brochureHrefFor, brochureHrefOf, hasBrochure } from '@/lib/courses/brochure'
import { findCourse } from '@/lib/enquiries/lookups'
import { computeThankYou } from '@/lib/enquiries/thankYou'
import type { FormDef } from '@/lib/enquiries/types'
import { boot, Cleanup, makeStaff, nonce, rejectsWith } from '../collections/helpers'

// DEC-69: the course brochure is a `documents` row (category brochure); `brochureUrl` is the legacy fallback.

const n = nonce()
const pdf = (label: string) => {
  const data = Buffer.from(`%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n% ${label}\nxref\n0 1\n0000000000 65535 f \ntrailer << /Root 1 0 R >>\nstartxref\n0\n%%EOF\n`)
  return { data, mimetype: 'application/pdf', name: `test-${n}-${label}.pdf`, size: data.length }
}
const pathFor = (label: string) => `/brochures/test-${n}/${label}.pdf`

describe('brochure resolution (pure)', () => {
  it('prefers the populated document, then brochureUrl, then null', async () => {
    const doc = { id: 7, publicPath: '/brochures/IHM_NEW_Brochures/BON.pdf' }
    expect(await brochureHrefFor({ brochure: doc, brochureUrl: '/brochures/old.pdf' })).toBe(doc.publicPath)
    expect(await brochureHrefFor({ brochure: null, brochureUrl: ' /brochures/old.pdf ' })).toBe('/brochures/old.pdf')
    expect(await brochureHrefFor({ brochure: null, brochureUrl: '' })).toBeNull()
    expect(await brochureHrefFor(null)).toBeNull()
    expect(brochureHrefOf({ brochure: doc, brochureUrl: '/brochures/old.pdf' })).toBe(doc.publicPath)
  })
  it('hasBrochure is true for a document id, a populated document or a legacy URL', () => {
    expect(hasBrochure({ brochure: 3 })).toBe(true)
    expect(hasBrochure({ brochure: { id: 3, publicPath: '/brochures/a.pdf' } })).toBe(true)
    expect(hasBrochure({ brochureUrl: '/brochures/a.pdf' })).toBe(true)
    expect(hasBrochure({ brochure: null, brochureUrl: '  ' })).toBe(false)
    expect(hasBrochure(undefined)).toBe(false)
  })
})

describe('courses.brochure (Local API)', () => {
  let payload: Payload
  const cleanup = new Cleanup()
  let marketing: Awaited<ReturnType<typeof makeStaff>>
  let finance: Awaited<ReturnType<typeof makeStaff>>
  let courseId: number
  let brochureId: number
  let policyId: number
  const brochurePath = pathFor('course-guide')

  beforeAll(async () => {
    payload = await boot()
    marketing = await makeStaff(payload, cleanup, 'marketing', `br${n}`)
    finance = await makeStaff(payload, cleanup, 'finance', `br${n}`)
    const school = await payload.create({ collection: 'categories', data: { name: `School br ${n}` }, overrideAccess: true })
    cleanup.track('categories', school.id)
    const brochure = await payload.create({
      collection: 'documents',
      data: { title: `Guide ${n}`, category: 'brochure', audience: 'public', publicPath: brochurePath },
      file: pdf('course-guide'),
      overrideAccess: true,
    })
    cleanup.track('documents', brochure.id)
    brochureId = brochure.id
    const policy = await payload.create({
      collection: 'documents',
      data: { title: `Policy ${n}`, category: 'policy', audience: 'public', publicPath: `/pdf/policies/test-${n}-p.pdf` },
      file: pdf('policy'),
      overrideAccess: true,
    })
    cleanup.track('documents', policy.id)
    policyId = policy.id
    const course = await payload.create({
      collection: 'courses',
      data: { title: `Brochure course ${n}`, slug: `brochure-course-${n}`, school: school.id, brochureUrl: '/brochures/legacy.pdf', _status: 'published' },
      overrideAccess: true,
    })
    cleanup.track('courses', course.id)
    courseId = course.id
  })
  afterAll(async () => {
    await cleanup.run(payload)
    const dir = join(process.cwd(), 'media/documents')
    if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.startsWith(`test-${n}-`)) rmSync(join(dir, f))
  })

  it('marketing sets the brochure document; finance cannot', async () => {
    await payload.update({ collection: 'courses', id: courseId, data: { brochure: brochureId }, user: marketing, overrideAccess: false })
    let c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.brochure).toBe(brochureId)

    await payload.update({ collection: 'courses', id: courseId, data: { brochure: null }, user: finance, overrideAccess: false })
    c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.brochure).toBe(brochureId) // field locked to marketing (lockFields): finance's value is dropped
  })

  it('only documents with category brochure can be picked', async () => {
    await rejectsWith(
      payload.update({ collection: 'courses', id: courseId, data: { brochure: policyId }, user: marketing, overrideAccess: false }),
      /invalid|brochure/i,
    )
  })

  it('resolves the document publicPath at depth 0 and at depth 1, ahead of brochureUrl', async () => {
    const flat = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(await brochureHrefFor(flat, { payload })).toBe(brochurePath)
    const deep = await payload.findByID({ collection: 'courses', id: courseId, depth: 1 })
    expect(brochureHrefOf(deep)).toBe(brochurePath)
    expect(await brochureHrefFor({ brochure: 2_000_000_000, brochureUrl: '/brochures/legacy.pdf' }, { payload })).toBe('/brochures/legacy.pdf')
  })

  it('the brochure enquiry thank-you sends the visitor to the document URL', async () => {
    const course = await findCourse(payload, courseId)
    expect(course?.brochureHref).toBe(brochurePath)
    const def = { key: 'course-brochure', thankYou: { type: 'brochure' } } as unknown as FormDef
    expect(computeThankYou({ def, data: {}, landing: null, course, campus: null, campaignCode: null })).toBe(brochurePath)
  })
})
