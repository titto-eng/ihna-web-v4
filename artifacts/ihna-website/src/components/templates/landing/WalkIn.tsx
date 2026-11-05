import { RenderBlocks } from '@/components/RenderBlocks'
import { FORM_END_ANCHOR, LandingArticle, LandingForm, heroBlock, landingCtx, type LandingProps } from './shared'

// Walk-in enquiry (60 §4, IHNA: /walkin-enquiry/, the QR code at campus receptions): Hero(compact) -> form, which answers inline.
// Always noindex (registry row).
export function WalkIn({ doc, hero, body }: LandingProps) {
  return (
    <LandingArticle doc={doc} template="WalkIn" className="pb-0">
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'compact' })]} ctx={landingCtx(doc)} />
      <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Your details" tone="muted" />
      {body}
    </LandingArticle>
  )
}
