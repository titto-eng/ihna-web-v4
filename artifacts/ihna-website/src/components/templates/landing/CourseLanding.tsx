import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Section } from '@/components/layout/Section'
import { hasBrochure } from '@/lib/courses/brochure'
import { site } from '@/content/site'
import { BodyWithForm, FORM_END_ANCHOR, LandingArticle, LandingForm, StickyEnquiryCta, heroBlock, landingCtx, type LandingProps } from './shared'

// F4-F7, F10, F11 (60 §4): Hero(split, form) -> CourseFacts -> funding note -> body -> Testimonials -> Accordion -> BrochureDownload ->
// CTA + EnquiryForm. The international variant (`studentType: 'international'`) shows the RTO / CRICOS line and no funding note.
export function CourseLanding({ doc, hero, lead, body, trail, ownForm, has = [] }: LandingProps) {
  const ctx = landingCtx(doc)
  const { course, entry } = doc
  const international = entry.studentType === 'international'
  const eyebrow = international ? `RTO ID ${site.organisation.rto} · CRICOS ${site.organisation.cricos}` : course?.title ? 'Course' : null
  const closing: AnyBlock[] = [
    ...(has.includes('brochureDownload') || !hasBrochure(course) ? [] : [{ blockType: 'brochureDownload' } as AnyBlock]),
    { blockType: 'cta', heading: 'Ready to *start*?', body: entry.title, variant: 'banner', tone: 'ink', links: [{ label: 'Enquire now', href: `#${FORM_END_ANCHOR}`, style: 'primary' }] } as AnyBlock,
  ]
  return (
    <LandingArticle doc={doc} template={international ? 'CourseLanding:international' : 'CourseLanding'}>
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'split', eyebrow })]} ctx={ctx} />
      {course && <RenderBlocks blocks={[{ blockType: 'courseFacts' } as AnyBlock]} ctx={ctx} />}
      {!international && entry.funding && (
        <Section spacing="compact">
          <p className="inline-flex rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-primary-strong" data-landing-slot="funding">{entry.funding}</p>
        </Section>
      )}
      {lead}
      <BodyWithForm doc={doc} heading="Enquire about this course">{body}</BodyWithForm>
      {trail}
      <RenderBlocks blocks={closing} ctx={ctx} />
      {!ownForm && <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Enquire about this course" />}
      <StickyEnquiryCta />
    </LandingArticle>
  )
}
