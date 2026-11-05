import type { Metadata } from 'next'
import { CourseListingView } from '@/components/templates/CourseListing'
import { getListingCourses } from '@/components/templates/data'
import { hasFilters, parseFilters, type SearchParams } from '@/components/templates/courseFilters'
import { pageAt } from '@/content/pages'
import { pageMetadata } from '@/components/page/metadata'
import { site } from '@/content/site'

type Props = { searchParams: Promise<SearchParams> }

const DESCRIPTION = `Browse courses at ${site.shortName} by school, qualification level, area of interest, student type, campus and delivery mode.`

// The registry row for /courses/ (src/content/pages.ts) owns the title and description; the route works without one.
const page = pageAt('/courses/')

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filtered = hasFilters(parseFilters(await searchParams))
  const meta = pageMetadata({ title: page?.title ?? 'Courses', description: page?.description ?? DESCRIPTION, path: '/courses/', noindex: page?.noindex })
  // Filtered views are thin duplicates of /courses/: crawlable for discovery, never indexed (canonical stays /courses/).
  return filtered ? { ...meta, robots: { index: false, follow: true } } : meta
}

export default async function CoursesPage({ searchParams }: Props) {
  const selected = parseFilters(await searchParams)
  const courses = await getListingCourses()
  return <CourseListingView title={page?.title ?? 'Courses'} courses={courses} selected={selected} />
}
