// Ported from the IHNA alumni microsite (alumni/newsletter-details.html) on 2026-10-21. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, img, Rich } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Newsletter Details',
  path: '/alumni/newsletter-details.html',
  description: 'Since IHNA began in 2007, more than 30,000 healthcare professionals have carried our vision into the world proving that education transforms lives.',
})

export default function AlumniNewsletterDetailsRoute() {
  return (
    <>
      <Hero
        heading="The IHNA Alumni: Celebrating Excellence, Connection, and Lifelong Learning"
        eyebrow="Published October 2025"
        variant="split" look="mosaic"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/alumni/ihna-alumni-nl-banner.webp', alt: 'IHNA Alumni Newsletter, October 2025', width: 1600, height: 800 })}
      />
      <Rich>
        <h2>Letter from the CEO</h2>
        <p>Dear IHNA Alumni,</p>
        <p>Since IHNA began in 2007, more than 30,000 healthcare professionals have carried our vision into the world proving that education transforms lives. You embody our mission of Education for Employment, turning knowledge into care, skill into compassion, and opportunity into impact.</p>
        <p>As healthcare evolves, IHNA remains committed to shaping workready professionals who lead with empathy and purpose. Guided by our core purpose Caring with Passion we will keep advancing education that empowers meaningful, compassionate careers. Stay connected through the IHNA Alumni Network to mentor, collaborate, and inspire future healthcare leaders. You remain the heart of our journey.</p>
        <p><strong>Dr Bijo Kunnumpurath</strong><br /><em>Founder &amp; Chief Executive Officer, IHNA</em></p>
        <h3>Milestones:</h3>
        <ul>
          <li>Founding Year: 2007 HCI started RTO in Melbourne</li>
          <li>Diploma of Nursing Accreditation: In 2022 IHNA got accreditation for Diploma of Nursing</li>
          <li>Excellence Award: In 2023, IHNA won the International Education Excellence Award for the third consecutive time</li>
          <li>Global Partnership: In 2024 IHNA collaborated with Ramsay Health care, Cintana education &amp; Arizona State University [ASU]</li>
        </ul>
        <p><a href="/alumni/docs/IHNA-Alumni-Newsletter-October-2025.pdf">Download Full PDF Issue (5.9 MB)</a></p>
      </Rich>
    </>
  )
}
