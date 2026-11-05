import type { FeesTableBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { courseOf, warnNoCourse } from '@/components/templates/courseContext'
import type { BlockProps } from '../types'

// The old course pages have no fees shortcode (DEC-15e): the imported fee tables stay `table` blocks in the course's `fees` slot.
// This block shows the course's own fee fields (`courses.fees`, finance-edited) when they are filled in, else nothing.
export function FeesTable({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('feesTable')
    return null
  }
  const fee = course.fees?.displayAmount?.trim()
  const note = course.fees?.note?.trim()
  if (!fee && !note) return null
  return (
    <Section tone={block.tone ?? 'sunrise'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div className="rounded-card bg-card p-8 md:p-12" data-course-block="feesTable">
        <p className="label-mono text-accent">Fees</p>
        {fee && <p className="display mt-3 text-display-md">{fee}</p>}
        {note && <p className="mt-4 max-w-prose whitespace-pre-line text-muted-foreground">{note}</p>}
      </div>
    </Section>
  )
}
