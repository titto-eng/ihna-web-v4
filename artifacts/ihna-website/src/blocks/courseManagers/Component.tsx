import { unstable_cache } from 'next/cache'
import type { CourseManagersBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { mediaOf } from '@/components/blocks/media'
import { courseOf, warnNoCourse } from '@/components/templates/courseContext'
import type { BlockProps } from '../types'
import { TeamGridClient, type Member } from '../teamGrid/TeamGridClient'

// Staff linked to the course (`staff.courses`). Emails are never rendered (rule 4; the field is staff-only anyway).
export async function CourseManagers({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('courseManagers')
    return null
  }
  let docs: unknown[] = []
  try {
    docs = await loadStaff(course.id)
  } catch {
    return null // a lookup failure never breaks the page
  }
  const members: Member[] = (docs as { id: number; name: string; position?: string | null; postNominals?: string | null; bio?: string | null; photo?: unknown }[]).map((s) => {
    const p = mediaOf(s.photo as never)
    return {
      id: String(s.id), name: s.name, role: [s.position, s.postNominals].filter(Boolean).join(' · ') || null, bio: s.bio,
      photo: p ? { url: p.url!, alt: p.alt ?? '', width: p.width ?? 640, height: p.height ?? 800 } : null,
    }
  })
  if (!members.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="courseManagers">
        <SectionHeader heading={block.heading ?? 'Course managers'} />
        <TeamGridClient members={members} label={block.heading ?? 'Course managers'} />
      </div>
    </Section>
  )
}

// One query per course per 5 minutes (staff, media and course hooks expire it) instead of one per view.
const loadStaff = (courseId: number) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'staff', where: { and: [{ courses: { contains: courseId } }, { _status: { equals: 'published' } }] }, depth: 1, limit: 12, pagination: false,
        select: { name: true, position: true, postNominals: true, bio: true, photo: true },
      })
      return docs as unknown[]
    },
    ['course-managers', String(courseId)],
    { tags: ['collection:staff', 'staff', 'collection:media', 'collection:courses'], revalidate: 300 },
  )()

// Payload loads on first use, so a block with nothing to fetch (no course, portal down) never boots the CMS config.
async function getPayloadClient() {
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  return getPayload({ config })
}
