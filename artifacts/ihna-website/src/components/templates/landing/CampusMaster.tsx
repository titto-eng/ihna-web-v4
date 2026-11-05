import { RenderBlocks } from '@/components/RenderBlocks'
import { BodyWithForm, FORM_END_ANCHOR, LandingArticle, LandingForm, StickyEnquiryCta, heroBlock, landingCtx, type LandingProps } from './shared'

// F3 (60 §4): Hero(split, form) -> Pathways -> Curriculum -> AdmissionsPanel -> body -> Accordion -> BrochureDownload -> EnquiryForm.
export function CampusMaster({ doc, hero, lead, body, trail, ownForm }: LandingProps) {
  const ctx = landingCtx(doc)
  const { campus } = doc
  return (
    <LandingArticle doc={doc} template="CampusMaster">
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'split', eyebrow: campus?.name ? `${campus.name} campus` : null })]} ctx={ctx} />
      {lead}
      <BodyWithForm doc={doc} heading="Enquire about this course">{body}</BodyWithForm>
      {trail}
      {!ownForm && <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Enquire about this course" />}
      <StickyEnquiryCta />
    </LandingArticle>
  )
}
