import type { EnquiryFormBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { Card, CardContent } from '@/components/ui/card'
import { EnquiryFormClient } from '@/components/forms/EnquiryFormClient'
import { getFormView } from '@/lib/enquiries/formView'
import { courseOf } from '@/components/templates/courseContext'
import type { BlockProps } from '../types'

// The form definition comes from src/content/forms.ts (40-enquiries): fields, consent text and captcha flags. The block holds no thank-you path (DEC-4).
export async function EnquiryForm({ block, ctx }: BlockProps<Block>) {
  const view = await getFormView(block.formKey)
  if (!view) return null // unknown or inactive formKey: nothing is rendered (dev log in getFormView)
  const course = courseOf(ctx)
  return (
    <Section tone={block.tone ?? 'muted'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId ?? 'quickContact'} depth={ctx?.depth}>
      <Card className={block.variant === 'sidebar' ? 'mx-auto max-w-md bg-card py-0' : 'mx-auto max-w-3xl bg-card py-0'} data-form-key={block.formKey}>
        <CardContent className="relative p-8 md:p-12">
          <EnquiryFormClient def={view.def} heading={block.heading} campuses={view.campuses} courses={view.courses} presetCourseId={course ? String(course.id) : null} layout={block.variant} />
        </CardContent>
      </Card>
    </Section>
  )
}
