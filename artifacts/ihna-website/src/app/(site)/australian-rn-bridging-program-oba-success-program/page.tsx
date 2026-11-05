// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, img, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Australian-RN Bridging Program (OBA Success Program)',
  path: '/australian-rn-bridging-program-oba-success-program/',
  description: 'Are you an overseas registered graduate nurse? The Australian RN Bridging Program (OBA Success Program) is your gateway to a nursing career in Australia.',
})

const knowMore = 'https://mwtaustralia.com.au/australia-rn-bridging-program-oba-success-program-new/'

export default function AustralianRnBridgingProgramObaSuccessProgramRoute() {
  return (
    <>
      <Hero
        eyebrow="Discover Your Path to Success with the"
        heading="Australian RN Bridging Program (OBA Success Program)"
        subheading="Your Gateway to a Thriving Nursing Career in Australia!"
        variant="split" look="ribbon"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/theme/Rn-oba-success-program.webp', alt: 'Australian RN Bridging Program (OBA Success Program)', width: 1600, height: 905 })}
        ctas={[{ label: 'Know More', href: knowMore, style: 'primary' }]}
      />
      <SplitProse eyebrow="OBA Success Program" heading="Your gateway to *nursing in Australia*">
        <p>Are you an overseas registered graduate nurse with aspirations to build a fulfilling career in Australia? We present to you the <strong>Australian RN Bridging Program (Outcome Based Assessment Success Program)</strong> – a unique opportunity tailored to open doors to endless possibilities!</p>
        <p>Our carefully curated program provides blended and online training and offers a pathway to become an Aged Care Support Worker or Assistant in Nursing (AIN), while you study to become an Australian Registered Nurse.</p>
      </SplitProse>
      <Cta
        variant="banner"
        heading="Embark on Your Success Journey!"
        body="Elevate your nursing career, embrace the Australian RN Bridging Program (OBA Success Program), and step into a future filled with endless opportunities. Act now – your dream career in Australia awaits!"
        links={[{ label: 'Know More', href: knowMore, style: 'primary' }]}
      />
    </>
  )
}
