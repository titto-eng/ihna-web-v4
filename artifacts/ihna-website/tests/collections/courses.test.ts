import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { boot, Cleanup, makeStaff, nonce, rejectsWith } from './helpers'

let payload: Payload
const cleanup = new Cleanup()
const n = nonce()
let schoolId: number
let courseId: number

type StaffUser = Awaited<ReturnType<typeof makeStaff>>
let marketing: StaffUser
let finance: StaffUser
let viewer: StaffUser

describe('courses: URL, live-URL guard, field-level fees', () => {
  beforeAll(async () => {
    payload = await boot()
    marketing = await makeStaff(payload, cleanup, 'marketing', n)
    finance = await makeStaff(payload, cleanup, 'finance', n)
    viewer = await makeStaff(payload, cleanup, 'viewer', n)
    const school = await payload.create({ collection: 'categories', data: { name: `School ${n}` }, overrideAccess: true })
    cleanup.track('categories', school.id)
    schoolId = school.id
    const course = await payload.create({
      collection: 'courses',
      data: { title: `Course ${n}`, slug: `course-${n}-a`, school: schoolId, fees: { displayAmount: '$100' }, _status: 'published' },
      overrideAccess: true,
    })
    cleanup.track('courses', course.id)
    courseId = course.id
  })
  afterAll(async () => {
    await cleanup.run(payload)
  })

  it('sets path /courses/<slug>/ and defaults showStartDates to false (DEC-7)', async () => {
    const c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.path).toBe(`/courses/course-${n}-a/`)
    expect(c.showStartDates).toBe(false)
  })

  it('marketing cannot update fees; finance can; finance cannot touch other fields', async () => {
    await payload.update({
      collection: 'courses', id: courseId, user: marketing, overrideAccess: false,
      data: { fees: { displayAmount: '$1' }, excerpt: 'edited by marketing' },
    })
    let c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.fees?.displayAmount).toBe('$100')
    expect(c.excerpt).toBe('edited by marketing')

    await payload.update({
      collection: 'courses', id: courseId, user: finance, overrideAccess: false,
      data: { fees: { displayAmount: '$200' }, excerpt: 'edited by finance' },
    })
    c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.fees?.displayAmount).toBe('$200')
    expect(c.excerpt).toBe('edited by marketing')
  })

  it('key facts: marketing edits every fact but the fee text; finance edits only the fee text (DEC-67)', async () => {
    await payload.update({
      collection: 'courses', id: courseId, user: marketing, overrideAccess: false,
      data: { facts: { duration: { value: '3 years', detail: 'full-time' }, fee: { show: false, value: '$999 by marketing' } } },
    })
    let c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.facts?.duration?.value).toBe('3 years')
    expect(c.facts?.duration?.detail).toBe('full-time')
    expect(c.facts?.fee?.show).toBe(false)
    expect(c.facts?.fee?.value ?? null).toBeNull()

    await payload.update({
      collection: 'courses', id: courseId, user: finance, overrideAccess: false,
      data: { facts: { duration: { value: '9 years' }, fee: { value: '$31,500 per year', detail: 'indicative' } } },
    })
    c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.facts?.duration?.value).toBe('3 years')
    expect(c.facts?.fee?.value).toBe('$31,500 per year')
    expect(c.facts?.fee?.detail).toBe('indicative')
  })

  it('viewer can read but not write; anonymous cannot read a draft', async () => {
    await expect(
      payload.update({ collection: 'courses', id: courseId, user: viewer, overrideAccess: false, data: { excerpt: 'nope' } }),
    ).rejects.toThrow()
    const draft = await payload.create({
      collection: 'courses', data: { title: `Draft ${n}`, slug: `course-${n}-draft`, school: schoolId, _status: 'draft' }, overrideAccess: true,
    })
    cleanup.track('courses', draft.id)
    const anon = await payload.find({ collection: 'courses', where: { id: { equals: draft.id } }, overrideAccess: false })
    expect(anon.totalDocs).toBe(0)
    const asViewer = await payload.find({ collection: 'courses', where: { id: { equals: draft.id } }, user: viewer, overrideAccess: false })
    expect(asViewer.totalDocs).toBe(1)
  })

  it('changing the slug of a PUBLISHED course is refused and leaves the URL alone', async () => {
    await rejectsWith(
      payload.update({ collection: 'courses', id: courseId, data: { slug: `course-${n}-b`, _status: 'published' }, overrideAccess: true }),
      /live URL never changes/,
    )
    const c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.path).toBe(`/courses/course-${n}-a/`)
    expect(c.slug).toBe(`course-${n}-a`)
  })

  it('a never-published draft can change its slug; a live course can be edited as a draft but not republished under a new URL', async () => {
    const draft = await payload.create({
      collection: 'courses', data: { title: `Slug draft ${n}`, slug: `course-${n}-d1`, school: schoolId, _status: 'draft' }, overrideAccess: true,
    })
    cleanup.track('courses', draft.id)
    const moved = await payload.update({ collection: 'courses', id: draft.id, data: { slug: `course-${n}-d2`, _status: 'draft' }, draft: true, overrideAccess: true })
    expect(moved.path).toBe(`/courses/course-${n}-d2/`)

    // The live course may be saved as a draft with a new slug (nothing public changes) ...
    await payload.update({ collection: 'courses', id: courseId, data: { slug: `course-${n}-c` }, draft: true, overrideAccess: true })
    // ... but publishing that draft would move the live URL, so it is refused.
    await rejectsWith(
      payload.update({ collection: 'courses', id: courseId, data: { slug: `course-${n}-c`, _status: 'published' }, overrideAccess: true }),
      /live URL never changes/,
    )
  })

  it('context.allowUrlChange and context.importing bypass the guard', async () => {
    await payload.update({
      collection: 'courses', id: courseId, data: { slug: `course-${n}-b`, _status: 'published' }, overrideAccess: true, context: { allowUrlChange: true },
    })
    let c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.path).toBe(`/courses/course-${n}-b/`)
    await payload.update({
      collection: 'courses', id: courseId, data: { slug: `course-${n}-imp`, _status: 'published' }, overrideAccess: true, context: { importing: true },
    })
    c = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    expect(c.path).toBe(`/courses/course-${n}-imp/`)
  })

  it('rejects a duplicate slug', async () => {
    await expect(
      payload.create({ collection: 'courses', data: { title: 'Dup', slug: `course-${n}-imp`, school: schoolId, _status: 'published' }, overrideAccess: true }),
    ).rejects.toThrow()
  })
})
