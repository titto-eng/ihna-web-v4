import type { BrochureDownloadBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { RenderBlocks } from '@/components/RenderBlocks'
import { courseOf, warnNoCourse } from '@/components/templates/courseContext'
import { hasBrochure } from '@/lib/courses/brochure'
import type { BlockProps } from '../types'
import { BrochureDialog } from './BrochureDialog'

// Needs a course brochure (`courses.brochure`, else the legacy `brochureUrl`; DEC-69). The download itself sits behind the
// `course-brochure` enquiry form, whose thank-you resolves the URL (`brochureHrefFor`, 20-blocks).
export function BrochureDownload({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('brochureDownload')
    return null
  }
  if (!hasBrochure(course)) return null
  const child = { depth: (ctx?.depth ?? 0) + 1, course }
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'compact'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="brochureDownload">
        <BrochureDialog label={block.label ?? 'Download the course guide'} courseTitle={course.title}>
          <RenderBlocks blocks={[{ blockType: 'enquiryForm', formKey: 'course-brochure', variant: 'inline', spacing: 'none', tone: 'default', anchorId: 'brochureForm' }]} ctx={child} />
        </BrochureDialog>
      </div>
    </Section>
  )
}
