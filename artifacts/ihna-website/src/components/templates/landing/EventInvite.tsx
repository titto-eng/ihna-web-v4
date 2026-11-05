import { RenderBlocks } from '@/components/RenderBlocks'
import { FORM_END_ANCHOR, LandingArticle, LandingForm, StickyEnquiryCta, heroBlock, landingCtx, type LandingProps } from './shared'

// F9 webinar / agent invite and scholarship (60 §4): Hero(full-image) -> body -> Steps -> EnquiryForm.
export function EventInvite({ doc, hero, lead, body, trail, ownForm }: LandingProps) {
  const ctx = landingCtx(doc)
  return (
    <LandingArticle doc={doc} template="EventInvite">
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'full' })]} ctx={ctx} />
      {lead}
      {body}
      {trail}
      {!ownForm && <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Register your interest" />}
      <StickyEnquiryCta label="Register" />
    </LandingArticle>
  )
}
