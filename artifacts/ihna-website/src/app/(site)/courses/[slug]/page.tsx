import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Course } from '@/payload-types'
import type { AnyBlock } from '@/components/RenderBlocks'
import { CourseDetail, type SharedStat } from '@/components/templates/CourseDetail'
import { registeredSibling } from '@/content/course-siblings'
import { courseUrl } from '@/lib/paths'
import { getCoursePortal } from '@/lib/portal'
import { getSeoMetadata } from '@/lib/seo/get-metadata'
import { timed } from './perf'

type Params = Promise<{ slug: string }>

async function loadCourse(slug: string, draft: boolean): Promise<Course | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'courses', where: { path: { equals: courseUrl(slug) } }, draft, limit: 1, depth: 1, overrideAccess: draft,
  })
  return (docs[0] as Course | undefined) ?? null
}

// Published courses are cached under the tags the course hooks revalidate (`course:<slug>`, `collection:courses`).
const getPublishedCourse = (slug: string) =>
  unstable_cache(() => loadCourse(slug, false), ['course', slug], { tags: [`course:${slug}`, 'collection:courses', 'courses'], revalidate: 300 })()

// `cache` shares one lookup between generateMetadata and the page within a request.
const getCourse = cache(async (slug: string): Promise<Course | null> => {
  const { isEnabled: draft } = await draftMode()
  const course = await timed(`loadCourse ${draft ? 'draft' : 'cached'}`, () => (draft ? loadCourse(slug, true) : getPublishedCourse(slug)))
  return course && (draft || course._status === 'published' || course._status == null) ? course : null
})

type Shared = { layout: AnyBlock[]; stats: SharedStat[] }
const NO_SHARED: Shared = { layout: [], stats: [] }

const getShared = unstable_cache(
  async (): Promise<Shared> => {
    const payload = await getPayload({ config })
    const g = await payload.findGlobal({ slug: 'courseShared', depth: 1 })
    return { layout: (g.layout ?? []) as unknown as AnyBlock[], stats: g.stats ?? [] }
  },
  ['global:courseShared'],
  { tags: ['global:courseShared', 'collection:courses'], revalidate: 60 },
)

/** The same course for the other audience: the pair in `src/content/course-siblings.ts`, else `<slug>-international` <-> `<slug>`. */
async function loadSibling(slug: string, studentType: Course['studentType']): Promise<{ label: string; path: string } | null> {
  const registered = registeredSibling(slug)
  const intl = registered ? !registered.international : slug.endsWith('-international')
  const siblingSlug = registered?.slug ?? (intl ? slug.replace(/-international$/, '') : `${slug}-international`)
  if (!registered && !intl && studentType === 'international') return null
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'courses', where: { and: [{ path: { equals: courseUrl(siblingSlug) } }, { _status: { equals: 'published' } }] },
      limit: 1, depth: 0, select: { path: true }, pagination: false,
    })
    const path = docs[0]?.path
    return path ? { label: intl ? 'Domestic' : 'International', path } : null
  } catch {
    return null
  }
}

// One Payload query per course per 5 minutes instead of one per view; the course hooks' tags expire it.
const getSibling = (course: Course) =>
  unstable_cache(() => loadSibling(course.slug, course.studentType), ['course-sibling', course.slug, String(course.studentType)], {
    tags: [`course:${course.slug}`, 'collection:courses', 'courses'], revalidate: 300,
  })()

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const course = await getCourse((await params).slug)
  if (!course) return {}
  // title template, canonical (`seo.canonical` or the path), robots (`seo.noindex`, staging NEXT_PUBLIC_ROBOTS) and OG (70 §4)
  return getSeoMetadata(course, {}, { type: 'website' })
}

export default async function CoursePage({ params }: { params: Params }) {
  const { slug } = await params
  const course = await getCourse(slug)
  // Unknown or unpublished: hand over to the catch-all, which still tries the redirects collection before it 404s (70 §1).
  if (!course) notFound() // redirects are in next.config (src/content/redirects.ts); nothing else lives under /courses/

  // The portal bundle (census + start dates) is started here, once per page, and shared with every block through
  // `@/lib/portal` (request-scoped cache + unstable_cache). PORTAL_ENABLED=0 returns synchronously and awaits nothing.
  if (course.khId) void getCoursePortal(course.khId) // not awaited here: the date blocks await the same shared promise
  const [shared, sibling] = await timed('shared+sibling', () => Promise.all([timed('shared', () => getShared().catch(() => NO_SHARED)), timed('sibling', () => getSibling(course))]))
  return (
    <>
      <CourseDetail course={course} shared={shared.layout} sharedStats={shared.stats} sibling={sibling} />
    </>
  )
}
