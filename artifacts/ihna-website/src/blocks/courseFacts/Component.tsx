import type { CourseFactsBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { CourseFacts as Facts, hasCourseFacts } from '@/components/course/CourseFacts'
import { courseOf, warnNoCourse } from '@/components/templates/courseContext'
import type { BlockProps } from '../types'

// Block wrapper around the shared <CourseFacts> (src/components/course/CourseFacts.tsx): the course comes from the render
// context, `block.show` narrows the facts, `ctx.audience` pins one audience. Reads the course doc only (no portal call).
export function CourseFacts({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('courseFacts')
    return null
  }
  if (!hasCourseFacts(course, ctx?.audience, block.show)) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'compact'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="courseFacts">
        <Facts course={course} audience={ctx?.audience} only={block.show} />
      </div>
    </Section>
  )
}
