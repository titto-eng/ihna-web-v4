import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { BodyWithForm, FORM_END_ANCHOR, LandingArticle, LandingForm, StickyEnquiryCta, heroBlock, landingCtx, type LandingProps } from './shared'

// F2 (60 §4): Hero(split, campus, intake, form) -> Stats -> StartDates(course, campus) -> body -> Steps -> BrochureDownload -> EnquiryForm.
// `lead` holds the page's stats/startDates, `trail` its steps/brochureDownload (the route file sorts them).
export function CampusBachelor({ doc, hero, lead, body, trail, ownForm, has = [] }: LandingProps) {
  const ctx = landingCtx(doc)
  const { campus, course } = doc
  // the portal dates for this course are shown when the course is set and the page has no StartDates of its own
  const dates: AnyBlock[] = course && !has.includes('startDates') ? [{ blockType: 'startDates', mode: 'all' } as AnyBlock] : []
  return (
    <LandingArticle doc={doc} template="CampusBachelor">
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'split', eyebrow: campus?.name ? `${campus.name} campus` : null })]} ctx={ctx} />
      {lead}
      {dates.length > 0 && <RenderBlocks blocks={dates} ctx={ctx} />}
      <BodyWithForm doc={doc} heading="Enquire about this course">{body}</BodyWithForm>
      {trail}
      {!ownForm && <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Enquire about this course" />}
      <StickyEnquiryCta />
    </LandingArticle>
  )
}
