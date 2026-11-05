import { describe, expect, it } from 'vitest'
import { html } from './html'
import { courses } from './fixtures'
import { CourseListingView } from '@/components/templates/CourseListing'
import { buildFacets, filterCourses, hrefWith, parseFilters } from '@/components/templates/courseFilters'

describe('course listing filters', () => {
  it('parses the URL facets in the live site\'s names and ignores junk', () => {
    expect(parseFilters({ delivery: 'online', campus: 'sydney,perth', school: ['a', 'b'], type: 'Domestic', level: '<script>', nope: 'x' })).toEqual({
      delivery: ['online'], campus: ['sydney', 'perth'], school: ['a', 'b'], type: ['domestic'],
    })
  })

  it('filters by one facet (OR inside a facet, AND across facets)', () => {
    expect(filterCourses(courses, { delivery: ['online'] }).map((c) => c.slug)).toEqual(['master-of-nursing-online'])
    expect(filterCourses(courses, { campus: ['sydney', 'melbourne'] }).map((c) => c.slug)).toEqual(['bachelor-of-nursing', 'bachelor-of-social-work'])
    expect(filterCourses(courses, { campus: ['sydney', 'melbourne'], school: ['school-of-social-work'] }).map((c) => c.slug)).toEqual(['bachelor-of-social-work'])
    expect(filterCourses(courses, { type: ['international'] }).map((c) => c.slug)).toEqual(['bachelor-of-nursing', 'master-of-nursing-online'])
  })

  it('offers only values that exist, in the IHNA facet order (school first), with counts', () => {
    const facets = buildFacets(courses, {})
    expect(facets.map((f) => f.param)).toEqual(['school', 'level', 'type', 'campus', 'delivery'])
    expect(facets.find((f) => f.param === 'campus')!.options.map((o) => `${o.slug}:${o.count}`)).toEqual(['melbourne:1', 'perth:1', 'sydney:1'])
  })

  it('builds links that keep the other selections', () => {
    expect(hrefWith({ campus: ['sydney'] }, 'delivery', 'online')).toBe('/courses/?campus=sydney&delivery=online')
    expect(hrefWith({ campus: ['sydney'] }, 'campus', null)).toBe('/courses/')
  })

  it('renders only the matching cards for ?delivery=online, with a count', async () => {
    const out = await html(<CourseListingView courses={courses} selected={{ delivery: ['online'] }} />)
    expect(out).toContain('data-course-card="master-of-nursing-online"')
    expect(out).not.toContain('data-course-card="bachelor-of-nursing"')
    expect(out).toContain('aria-live="polite"')
    expect(out).toMatch(/data-course-count[^>]*>1 course</)
    expect(out).toContain('href="/courses/"')
  })

  it('renders every course with no filters and tells the user when nothing matches', async () => {
    expect((await html(<CourseListingView courses={courses} selected={{}} />)).match(/data-course-card=/g)).toHaveLength(3)
    expect(await html(<CourseListingView courses={courses} selected={{ campus: ['perth'], delivery: ['online'] }} />)).toContain('No courses match')
  })
})
