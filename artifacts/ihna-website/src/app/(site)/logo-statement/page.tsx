// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Pillars } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Logo Statement',
  path: '/logo-statement/',
  description: 'Like the Phoenix, IHNA rises from challenges, constantly renewing and innovating. Our strength lies in embracing change and pursuing excellence…',
})

export default function LogoStatementRoute() {
  return (
    <>
      <Hero heading="LOGO STATEMENT" variant="compact" audienceSwitch={false} />
      <Pillars
        eyebrow="Our logo"
        heading="What our logo *stands for*"
        items={[
          { label: 'The Phoenix', title: 'Innovation', body: <p>Like the Phoenix, IHNA rises from challenges, constantly renewing and innovating. Our strength lies in embracing change and pursuing excellence, reflecting resilience and wisdom in all we do.</p> },
          { label: 'The Shield', title: 'Caring', body: <p>The Shield in our logo reflects IHNA’s commitment to nurturing and protecting. We recognise every learner’s needs, prioritising a secure and caring environment that exceeds expectations and fosters growth and development.</p> },
          { label: 'The Southern Cross', title: 'Excellence', body: <p>The Southern Cross in our logo symbolises our unwavering commitment as an Australian institution to uphold national standards. At IHNA, excellence guides us; we are outcomes-focused, self-assured, and dedicated to achieving the highest satisfaction for our students, reflecting our proud heritage and connection to the broader Australian community.</p> },
        ]}
      />
    </>
  )
}
