import { describe, expect, it } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'
import { loadListingCourses, loadStaff } from '@/components/templates/data'
import { buildFacets, filterCourses, HIDDEN_COURSE_SLUGS } from '@/components/templates/courseFilters'
import { searchContent } from '@/components/templates/search'

// Real Postgres through the Local API (the IHNA courses are already imported in the dev database: npm run import -- lookups,wp-courses).
describe('course listing data (DEC-34)', () => {
  it('lists the 21 IHNA courses, never the hidden junk slugs, in the menu order (school, then title)', async () => {
    const all = await loadListingCourses()
    expect(all).toHaveLength(21)
    for (const slug of HIDDEN_COURSE_SLUGS) expect(all.map((c) => c.slug)).not.toContain(slug)
    expect(all[0].school?.slug).toBe('school-of-nursing')
    expect(all.at(-1)?.slug).toBe('ihna-english-language-preperatory-course')
  })

  it('filters real courses by one facet', async () => {
    const all = await loadListingCourses()
    const only = filterCourses(all, { school: ['school-of-nursing'] })
    expect(only.map((c) => c.slug).sort()).toEqual(['diploma-of-nursing', 'diploma-of-nursing-int', 'hlt57921-diploma-of-anaesthetic-technology-and-practices'])
  })

  it('offers the IHNA facets with the live menu and finder counts, and no empty facet', async () => {
    const facets = buildFacets(await loadListingCourses(), {})
    const counts = (param: string) => Object.fromEntries(facets.find((f) => f.param === param)!.options.map((o) => [o.slug, o.count]))
    expect(facets.map((f) => f.param)).toEqual(['school', 'level', 'discipline', 'type', 'campus', 'delivery'])
    expect(counts('school')).toEqual({
      'school-of-nursing': 3, 'school-of-community-services': 4, 'school-of-allied-health-and-human-services': 8, 'package-courses': 1, 'first-aid': 4, 'other-courses': 1,
    })
    expect(counts('level')).toEqual({ 'certificate-iii': 8, diploma: 8, 'first-aid': 4 })
    expect(counts('discipline')).toEqual({ nursing: 3, 'allied-health-and-human-services': 8, 'community-services': 5, 'first-aid': 4 })
    for (const f of facets) expect(f.options.every((o) => o.count > 0), f.param).toBe(true)
  })
})

describe('search (Postgres full-text)', () => {
  it('finds a known course by name and groups it under courses', async () => {
    const r = await searchContent('diploma of nursing')
    expect(r.courses.map((c) => c.path)).toContain('/courses/diploma-of-nursing/')
    expect(r.total).toBe(r.courses.length + r.pages.length + r.posts.length)
  })

  it('finds courses by content, never the hidden junk courses', async () => {
    const r = await searchContent('nursing')
    expect(r.courses.length).toBeGreaterThan(0)
    const test = await searchContent('test')
    expect(test.courses.map((c) => c.path)).not.toContain('/courses/test-1/')
  })

  it('finds posts and pages by content', async () => {
    const r = await searchContent('nursing')
    expect(r.posts.length + r.pages.length).toBeGreaterThan(0)
  })

  it('returns nothing for a query that is too short, and does not throw on odd input', async () => {
    expect((await searchContent('a')).total).toBe(0)
    await expect(searchContent('"unbalanced -(')).resolves.toBeTruthy()
  })
})

describe('school staff (SchoolPage)', () => {
  it('lists the people the staff collection links to the school or to one of its courses, with /staff-profile/?id= links', async () => {
    const payload = await getPayload({ config })
    const find = (collection: 'categories' | 'courses' | 'staff', where: Record<string, unknown>) =>
      payload.find({ collection, where: where as never, limit: 2, depth: 0, overrideAccess: true }).then((r) => r.docs as unknown as { id: number; legacyId?: number; school?: number | null; courses?: number[] | null }[])
    const [nursing] = await find('categories', { slug: { equals: 'school-of-nursing' } })
    const [allied] = await find('categories', { slug: { equals: 'school-of-allied-health-and-human-services' } })
    const alliedCourses = (await loadListingCourses()).filter((c) => c.school?.slug === 'school-of-allied-health-and-human-services').map((c) => c.id)
    const [bySchool, byCourse] = await find('staff', { active: { not_equals: false } })
    const opts = { overrideAccess: true, context: { importing: true } }
    try {
      await payload.update({ collection: 'staff', id: bySchool.id, data: { school: nursing.id }, ...opts })
      await payload.update({ collection: 'staff', id: byCourse.id, data: { courses: [alliedCourses[0]] }, ...opts })
      const n = await loadStaff(nursing.id, [])
      expect(n.map((s) => s.id)).toContain(bySchool.id)
      expect(n.map((s) => s.id)).not.toContain(byCourse.id)
      expect(n.find((s) => s.id === bySchool.id)?.path).toBe(`/staff-profile/?id=${bySchool.legacyId}`)
      expect((await loadStaff(allied.id, alliedCourses)).map((s) => s.id)).toContain(byCourse.id)
      expect((await loadStaff(allied.id, [])).map((s) => s.id)).not.toContain(byCourse.id)
    } finally {
      await payload.update({ collection: 'staff', id: bySchool.id, data: { school: bySchool.school ?? null }, ...opts })
      await payload.update({ collection: 'staff', id: byCourse.id, data: { courses: byCourse.courses ?? [] }, ...opts })
    }
  })
})
