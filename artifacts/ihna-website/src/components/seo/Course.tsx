import type { Course } from '@/payload-types'
import { site } from '@/content/site'
import { getStartDates } from '@/lib/portal'
import { courseCrumbs, courseLd, instancesFromStartDates } from '@/lib/seo/jsonld'
import { BreadcrumbJsonLd } from './BreadcrumbList'
import { JsonLd } from './JsonLd'

/** Course + BreadcrumbList (Home › Courses › X). `hasCourseInstance` comes from the portal start dates only when `showStartDates` is true (DEC-7); no portal = no instances. */
export async function CourseJsonLd({ course }: { course: Course }) {
  const settings = site
  const dates = course.khId && course.showStartDates === true ? await Promise.resolve(getStartDates(course.khId)).catch(() => null) : null
  const instances = dates && !dates.unavailable ? instancesFromStartDates(dates.data.campuses) : []
  return (
    <>
      <JsonLd data={courseLd(course, { settings, instances })} />
      <BreadcrumbJsonLd items={courseCrumbs(course)} />
    </>
  )
}
