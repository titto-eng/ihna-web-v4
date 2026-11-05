import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { ThankYouEvent } from '@/components/tracking/ConversionEvents'
import { ThankYouCard } from '@/components/page/showcase'
import { site } from '@/content/site'
import { hasBrochure } from '@/lib/courses/brochure'
import { LandingArticle, landingCtx, type LandingDoc } from './shared'
import { ThankYouIntent } from './ThankYouIntent'

// ThankYou view (60 §4): Hero(compact) -> confirmation card (message, call link, onward links, IHNA Online) -> BrochureDownload when `?intent=brochure`; pushes `thank_you_view` (80 §4).
// It lives at the old handler URL (`thanks.php`, `thankyou.php`) because GTM counts conversions on it; always noindex (route metadata).
export function ThankYou({ doc }: { doc: LandingDoc }) {
  const ctx = landingCtx(doc)
  const { course } = doc
  const hero = { blockType: 'hero', variant: 'compact', eyebrow: 'Enquiry received', heading: 'Thank *you*', subheading: `We have your details for ${doc.entry.title} and a member of our admissions team will be in touch shortly.` } as AnyBlock
  return (
    <LandingArticle doc={doc} template="ThankYou" className="pb-0">
      <ThankYouEvent />
      <RenderBlocks blocks={[hero]} ctx={ctx} />
      <ThankYouCard phone={null} email={null} links={[{ label: 'Explore courses', href: '/courses/' }, { label: 'Back to the home page', href: '/' }]}>
        <div data-landing-slot="thank-you">
          <p>
            An enrolment advisor will guide you through course eligibility, campus options and your next enrolment steps. If your question is
            urgent, call us on <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}>{site.phone}</a>.
          </p>
          <p className="text-base" data-landing-slot="ihna-online">
            Prefer to study online? <a href="https://ihnaonline.edu.au/?utm_source=IHNA-Thank-You" rel="noopener">Learn more about IHNA Online</a>.
          </p>
        </div>
      </ThankYouCard>
      {hasBrochure(course) && (
        <ThankYouIntent intent="brochure">
          <RenderBlocks blocks={[{ blockType: 'brochureDownload' } as AnyBlock]} ctx={ctx} />
        </ThankYouIntent>
      )}
    </LandingArticle>
  )
}
