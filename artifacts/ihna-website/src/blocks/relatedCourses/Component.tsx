import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import type { Course, RelatedCoursesBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { CardCarousel } from '@/components/blocks/CardCarousel'
import { Badge } from '@/components/ui/badge'
import { courseOf, namesOf, warnNoCourse } from '@/components/templates/courseContext'
import type { BlockProps } from '../types'

const idOf = (c: number | { id: number }) => (typeof c === 'object' ? c.id : c)

// `courses.relatedCourses` first; when a course has none, the other published courses of the same school.
async function load(course: Course, limit: number): Promise<Course[]> {
  const payload = await getPayloadClient()
  const explicit = (course.relatedCourses ?? []).map(idOf)
  if (explicit.length) {
    const { docs } = await payload.find({ collection: 'courses', where: { and: [{ id: { in: explicit } }, { _status: { equals: 'published' } }] }, depth: 1, limit, pagination: false, select: CARD_FIELDS })
    return explicit.map((id) => docs.find((d) => d.id === id)).filter(Boolean) as unknown as Course[]
  }
  const school = idOf(course.school)
  const { docs } = await payload.find({
    collection: 'courses',
    where: { and: [{ _status: { equals: 'published' } }, { school: { equals: school } }, { id: { not_equals: course.id } }, { 'seo.noindex': { not_equals: true } }] },
    depth: 1, limit, sort: 'title', pagination: false, select: CARD_FIELDS,
  })
  return docs as Course[]
}

// Cards need five fields; without `select` each related course drags its whole 60-130 KB body through the query.
const CARD_FIELDS = { title: true, slug: true, path: true, deliveryModes: true, durations: true } as const

// One query per course per 5 minutes (the course and lookup hooks expire it) instead of one per view.
const loadCached = (course: Course, limit: number) =>
  unstable_cache(() => load(course, limit), ['course-related', String(course.id), String(limit)], {
    tags: [`course:${course.slug}`, 'collection:courses', 'courses'], revalidate: 300,
  })()

export async function RelatedCourses({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('relatedCourses')
    return null
  }
  let items: Course[] = []
  try {
    items = await loadCached(course, block.limit ?? 6)
  } catch {
    return null
  }
  if (!items.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="relatedCourses">
        <SectionHeader heading="Related *courses*" />
        <CardCarousel label="Related courses">
          {items.map((c) => (
            <Link key={c.id} href={c.path ?? `/courses/${c.slug}/`} className="flex h-full flex-col gap-4 rounded-card border border-border bg-card p-6 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="flex flex-wrap gap-2">
                {namesOf(c.deliveryModes).map((n) => <Badge key={n} variant="secondary">{n}</Badge>)}
              </div>
              <span className="display text-xl leading-snug">{c.title}</span>
              {namesOf(c.durations)[0] && <span className="mt-auto text-sm text-muted-foreground">{namesOf(c.durations)[0]}</span>}
            </Link>
          ))}
        </CardCarousel>
      </div>
    </Section>
  )
}

// Payload loads on first use, so a block with nothing to fetch (no course, portal down) never boots the CMS config.
async function getPayloadClient() {
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  return getPayload({ config })
}
