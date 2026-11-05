// Ported from the IHNA alumni microsite (alumni/newsletters.php) on 2026-10-21. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ImageText, img, Link } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Newsletter Details',
  path: '/alumni/newsletters.php',
  description: 'Stay informed with the latest alumni news, success stories, events, and opportunities. Published monthly with insights from our healthcare community.',
})

export default function AlumniNewslettersRoute() {
  return (
    <>
      <Hero
        heading="Alumni Newsletter"
        eyebrow="IHNA Alumni"
        variant="compact"
        audienceSwitch={false}
        subheading="Stay informed with the latest alumni news, success stories, events, and opportunities. Published monthly with insights from our vibrant healthcare community."
      />
      <ImageText
        eyebrow="October 2025"
        heading="The IHNA Alumni: Celebrating Excellence, Connection, and Lifelong Learning"
        media={img({ src: '/images/ihna/alumni/ihna-alumni-nl-banner.webp', alt: 'IHNA Alumni Newsletter, October 2025', width: 1600, height: 800 })}
        imageSide="left"
      >
        <p>Since IHNA began in 2007, more than 30,000 healthcare professionals have carried our vision into the world proving that education transforms lives. You embody our mission of Education for Employment, turning knowledge into care, skill into compassion, and opportunity into impact.</p>
        <p><a href="/alumni/docs/IHNA-Alumni-Newsletter-October-2025.pdf">View Newsletter</a> · <Link href="/alumni/newsletter-details.html">Read the letter from the CEO</Link></p>
      </ImageText>
    </>
  )
}
