// Ported from the IHNA alumni microsite (alumni/index.php) on 2026-10-21. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, ImageText, img, Link, Stats } from '@/components/page'
import { AlumniHubPage } from '@/components/templates/pages'

const title = 'IHNA Alumni'

export const metadata: Metadata = pageMetadata({
  title,
  path: '/alumni/',
  metaTitle: 'IHNA Alumni - Stay Connected. Grow. Give Back.',
  description: 'A professional community of healthcare graduates across Australia and beyond - connecting opportunities, careers, and lifelong learning!',
})

export default function AlumniRoute() {
  return (
    <AlumniHubPage
      title={title}
      path="/alumni/"
      hero={{
        variant: 'compact',
        heading: title,
        eyebrow: 'Stay Connected. Grow. Give Back.',
        subheading: 'A professional community of healthcare graduates across Australia and beyond - connecting opportunities, careers, and lifelong learning!',
        audienceSwitch: false,
      }}
      ownForms={['alumni-story', 'alumni-signup']}
    >
      <Stats
        items={[
          { value: '30,000+', label: 'Alumni Worldwide' },
          { value: '220+', label: 'Placement Partners' },
          { value: '50+', label: 'Countries Represented' },
          { value: '25+', label: 'Years of Excellence' },
        ]}
      />
      <ImageText
        eyebrow="From the Alumni Newsletter"
        heading="The IHNA Alumni: Celebrating Excellence, Connection, and Lifelong Learning"
        media={img({ src: '/images/ihna/alumni/ihna-alumni-nl-banner.webp', alt: 'IHNA Alumni Newsletter, October 2025', width: 1600, height: 800 })}
        imageSide="left"
      >
        <p>Monthly insights, stories, and opportunities from our community.</p>
        <p>Since IHNA began in 2007, more than 30,000 healthcare professionals have carried our vision into the world proving that education transforms lives. You embody our mission of Education for Employment, turning knowledge into care, skill into compassion, and opportunity into impact.</p>
        <p><a href="/alumni/docs/IHNA-Alumni-Newsletter-October-2025.pdf">View Newsletter</a> · <Link href="/alumni/newsletters.php">View All Issues</Link></p>
      </ImageText>
      <EnquiryForm formKey="alumni-story" heading="Share your story" anchorId="share-your-story" tone="muted" />
      <EnquiryForm formKey="alumni-signup" heading="Stay in touch with IHNA" anchorId="alumni-signup" />
    </AlumniHubPage>
  )
}
