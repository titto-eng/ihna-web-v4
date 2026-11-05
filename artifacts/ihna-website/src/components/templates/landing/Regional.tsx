import { RenderBlocks } from '@/components/RenderBlocks'
import { FORM_END_ANCHOR, LandingArticle, LandingForm, heroBlock, landingCtx, type LandingProps } from './shared'

// Regional healthcare pages (60 §4, IHNA: /healthcare-courses-<city>/): Hero(compact) -> quick enquiry form -> lead (course cards) ->
// body (why study, campuses) -> trail. The form comes first, as on the old pages, so there is no sticky bar.
export function Regional({ doc, hero, lead, body, trail, ownForm }: LandingProps) {
  const ctx = landingCtx(doc)
  return (
    <LandingArticle doc={doc} template="Regional" className="pb-0">
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'compact' })]} ctx={ctx} />
      {!ownForm && <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Quick enquiry" tone="muted" />}
      {lead}
      {body}
      {trail}
    </LandingArticle>
  )
}
