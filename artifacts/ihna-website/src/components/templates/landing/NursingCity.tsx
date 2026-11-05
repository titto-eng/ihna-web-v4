import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Section } from '@/components/layout/Section'
import { BodyWithForm, FORM_END_ANCHOR, LandingArticle, LandingForm, StickyEnquiryCta, heroBlock, landingCtx, type LandingProps } from './shared'

// Diploma of Nursing city pages (60 §4, IHNA): Hero(split, city eyebrow) -> funding note -> lead (quick details) -> StartDates (course,
// page has none) -> body (reasons, tabs, partners, FAQ) with the sidebar form -> trail -> closing CTA -> EnquiryForm -> sticky CTA.
// The city drives the hero copy (route file), the campus (registry `campusKey`) and the form's questions (registry `formFields`).
export function NursingCity({ doc, hero, lead, body, trail, ownForm, has = [] }: LandingProps) {
  const ctx = landingCtx(doc)
  const { course, campus, entry } = doc
  const dates: AnyBlock[] = course && !has.includes('startDates') ? [{ blockType: 'startDates', mode: 'all' } as AnyBlock] : []
  const eyebrow = campus?.name ? `Diploma of Nursing · ${campus.name}` : 'Diploma of Nursing'
  return (
    <LandingArticle doc={doc} template="NursingCity">
      <RenderBlocks blocks={[heroBlock(hero, { variant: 'split', eyebrow })]} ctx={ctx} />
      {entry.funding && (
        <Section spacing="compact">
          <p className="inline-flex rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-primary-strong" data-landing-slot="funding">{entry.funding}</p>
        </Section>
      )}
      {lead}
      {dates.length > 0 && <RenderBlocks blocks={dates} ctx={ctx} />}
      <BodyWithForm doc={doc} heading="Let us know more about you">{body}</BodyWithForm>
      {trail}
      <RenderBlocks blocks={[{ blockType: 'cta', heading: 'From aspiration to *achievement*', body: 'Start your nursing career with IHNA.', variant: 'banner', tone: 'ink', links: [{ label: 'Enquire now', href: `#${FORM_END_ANCHOR}`, style: 'primary' }] } as AnyBlock]} ctx={ctx} />
      {!ownForm && <LandingForm doc={doc} variant="card" anchorId={FORM_END_ANCHOR} heading="Let us know more about you" />}
      <StickyEnquiryCta />
    </LandingArticle>
  )
}
