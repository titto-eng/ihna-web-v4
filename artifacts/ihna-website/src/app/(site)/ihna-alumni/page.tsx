// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Cta, EnquiryForm, img, LinkTiles, Rich, SplitProse, Stats, Testimonials } from '@/components/page'
import { AlumniHubPage } from '@/components/templates/pages'

const title = 'IHNA Alumni'
const path = '/ihna-alumni/'
const T = '/images/ihna/theme'
const INSTAGRAM = 'https://www.instagram.com/ihna_australia/'
const YOUTUBE = 'https://www.youtube.com/@ihna-australia'

export const metadata: Metadata = pageMetadata({
  title,
  path,
  description: 'IHNA has been delivering vocational healthcare education since 2007. This page is for our graduates - to stay connected, share their journeys, and more.',
})

// Graduate stories as published on the live page (first name, course, story text); videos on the IHNA YouTube channel.
const stories = [
  { name: 'Renee', course: 'Nursing', headline: 'One phone call changed everything', id: '8StXt7gNX4s', text: 'Renee moved from remote Katherine, NT to Brisbane to pursue nursing. Hear how a single conversation with IHNA gave her the confidence to take the leap.' },
  { name: 'Edith', course: 'Nursing', headline: 'She always knew she was meant to be a nurse', id: 'PGQ54dXd4PE', text: 'Growing up with limited access to education didn’t stop Edith. IHNA gave her the pathway, the trainers, and the clinical training to turn a lifelong dream into reality.' },
  { name: 'Berk', course: 'Sterilisation Services', headline: 'Engineer to CSSD Technician: a career pivot that made sense', id: '_1jZOZopFwM', text: 'Berk came to Australia with an engineering background and found a new calling in hospital sterilisation. His technical skills found a new home in healthcare.' },
  { name: 'Khamphong', course: 'Pathology Collection', headline: 'Hands-on training that made her job-ready', id: '1i56Y0sqDgc', text: 'Khamphong wanted real clinical skills and a clear path into healthcare. IHNA’s Pathology Collection course gave her the practical confidence to step straight into the workforce.' },
  { name: 'Mukeet', course: 'Nursing', headline: 'From Pakistan to a thriving nursing career in Australia', id: 'rzJnjb8NT2I', text: 'Moving to another country to study nursing takes courage. Hear how this graduate navigated a new country, found his footing at IHNA, and entered the Australian healthcare workforce.' },
  { name: 'William', course: 'Individual Support', headline: '30 years in architecture - then everything changed', id: 'vdyLKJQBjlI', text: 'William wanted his work to be closer to people. Hear how he balanced decades of professional experience with studying Certificate III in Individual Support at IHNA later in life.' },
  { name: 'Paula', course: 'Individual Support', headline: 'Training that prepares you to make a real difference', id: '4ULK-iHhEvg', text: 'Hear how hands-on training in IHNA’s Certificate III in Individual Support (Ageing & Disability) prepared this graduate for the realities and the rewards of working in care.' },
  { name: 'Melissa', course: 'Sterilisation Services', headline: 'From unsure about the future to a clear career direction', id: 'dxa3iQpj1vk', text: 'She wasn’t sure where her career was heading until she found IHNA’s Sterilisation Services course. Hear how hands-on training and approachable trainers gave her confidence and clarity.' },
  { name: 'Scarlett', course: 'Pathology Collection', headline: '“I got a job offer” - Scarlett’s next step', id: 'YYa0IZ5eZJA', text: 'After completing her Certificate III in Pathology Collection at IHNA, Scarlett received a job offer. A short but powerful reminder of why industry-focused training matters.' },
  { name: 'Georgina', course: 'Diploma of Nursing', headline: '“Challenging - but the support made all the difference”', id: 'BLN7B3Fe17U', text: 'An honest account of completing IHNA’s Diploma of Nursing, the clinical training, the tough moments, and why she’d recommend it to anyone serious about a healthcare career.' },
]

export default function IhnaAlumniRoute() {
  return (
    <AlumniHubPage
      title={title}
      path={path}
      hero={{
        heading: 'Alumni',
        eyebrow: 'IHNA Alumni',
        variant: 'split', look: 'mosaic',
        audienceSwitch: false,
        subheading: 'You trained for healthcare. This community stays with you.',
        image: img({ src: `${T}/ihna-alumni-banner-14.webp`, alt: 'IHNA graduates celebrating at a graduation ceremony', width: 1600, height: 600, focal: [55, 40] }),
        ctas: [
          { label: 'Share your story', href: '#share-your-story', style: 'primary' },
          { label: 'Read our newsletter', href: '#newsletter', style: 'secondary' },
        ],
      }}
      ownForms={['alumni-story', 'alumni-signup']}
    >
      <Rich>
        <p>IHNA has been delivering vocational healthcare education since 2007. This page is for our graduates - to stay connected, share their journeys, and find what comes next.</p>
      </Rich>
      <CardGrid
        heading="Graduation moments"
        intro="A more focused view of recent ceremonies, celebrations, and proud alumni milestones across the IHNA community."
        columns="3"
        variant="grid"
        cards={[
          { badge: 'Ceremony highlights', title: 'Recent ceremonies, proud families, and career milestones.', body: 'Swipe through the warmth, pride, and first big steps into healthcare careers. 30k+ graduates celebrated across IHNA’s growing community since 2007.', image: img({ src: `${T}/graduation-moments/image2.jpeg`, alt: 'IHNA graduation celebration', width: 1600, height: 1066 }), href: INSTAGRAM },
          { badge: 'Across campuses', title: 'Shared joy across campuses, communities, and graduating cohorts.', body: 'Moments like these make the alumni network feel personal, visible, and alive. 5 Australian campuses represented across IHNA’s graduate journey.', image: img({ src: `${T}/graduation-moments/image3.jpeg`, alt: 'Graduates celebrating at an IHNA event', width: 1600, height: 1066 }), href: INSTAGRAM },
          { badge: 'Follow the story', title: 'Follow along for highlights, processions, and photo-worthy milestones.', body: 'Live channel for fresh highlights, event recaps, and alumni celebration moments.', image: img({ src: `${T}/graduation-moments/image4.jpeg`, alt: 'IHNA graduation ceremony procession', width: 1600, height: 1067 }), href: INSTAGRAM },
        ]}
      />
      <Cta links={[{ label: 'More moments on Instagram', href: INSTAGRAM, style: 'secondary' }]} variant="inline" spacing="compact" />
      <Stats
        tone="muted"
        items={[
          { value: '30,000+', label: 'Graduates since 2007' },
          { value: '220+', label: 'Industry partners' },
          { value: 'Nearly 20', label: 'Years of healthcare education expertise' },
        ]}
      />
      <Rich anchorId="stories" spacing="compact">
        <h2>Real people. Life-changing careers.</h2>
        <p>Every graduate started somewhere. These are the honest stories of people who chose healthcare, some fresh to Australia, others mid-career, and what happened next.</p>
      </Rich>
      <Testimonials
        variant="carousel"
        spacing="compact"
        inline={stories.map((s) => ({
          name: `${s.name}’s Story`,
          role: `${s.course} · ${s.headline}`,
          quote: s.text,
          videoUrl: `https://www.youtube.com/watch?v=${s.id}`,
        }))}
      />
      <Rich spacing="compact">
        <h3>More stories on our YouTube channel</h3>
        <p>We publish new graduate videos regularly. Subscribe to be notified.</p>
      </Rich>
      <Cta links={[{ href: YOUTUBE, label: 'Visit IHNA on YouTube', style: 'primary' }]} variant="inline" spacing="compact" />
      <Cta
        tone="ink"
        variant="banner"
        heading="Celebrating your achievement"
        body="Graduation marks the start of your healthcare career. Watch highlights from recent ceremonies and follow us on Instagram for photos from across our campuses."
        links={[
          { href: YOUTUBE, label: 'Browse the full channel', style: 'primary' },
          { href: INSTAGRAM, label: 'Follow graduation moments on Instagram', style: 'secondary' },
        ]}
      />
      <SplitProse
        anchorId="newsletter"
        tone="muted"
        eyebrow="Alumni newsletter"
        heading="The IHNA alumni *newsletter*"
        intro="Graduate spotlights, campus news, healthcare industry updates, and community events - delivered regularly."
      >
        <h3>Latest issue: Celebrating excellence, connection and lifelong learning</h3>
        <p>Since 2007, IHNA graduates have been contributing to healthcare across Australia. This issue features alumni stories, campus updates, and what’s happening in our community.</p>
        <p><a href="/alumni/docs/IHNA-Alumni-Newsletter-October-2025.pdf">Read full issue (PDF)</a></p>
      </SplitProse>
      <CardGrid
        anchorId="jobs"
        heading="Your IHNA qualification is just the beginning."
        intro="Whether you want to go further in your studies, connect with employers, or help someone else get started - here’s where to go next."
        columns="3"
        variant="grid"
        cards={[
          { badge: '1', title: 'Looking to advance your studies?', body: 'IHM (Institute of Health Management) is an affiliated institution offering bachelor’s and master’s degrees in health management and related fields - a natural next step after your IHNA vocational qualification. IHM is a separate institution. Admission, fees, and program delivery are governed solely by IHM’s own policies. IHNA does not deliver IHM programs.', href: 'https://ihm.edu.au/' },
          { badge: '2', title: 'Looking for work in healthcare?', body: 'IHNA’s Industry Hub connects graduates with 220+ employer partners across nursing, aged care, community services, and sterilisation. Browse the network and find organisations actively working with IHNA-trained professionals.', href: 'https://industryhub.ihna.edu.au/industry-partnership' },
          { badge: '3', title: 'Know someone considering healthcare?', body: 'If someone you know is looking to get into healthcare - a family member, friend, or colleague - point them our way. IHNA offers courses across nursing, individual support, community services, and more across 5 Australian campuses.', href: '/courses/' },
        ]}
      />
      <Cta
        variant="inline"
        spacing="compact"
        links={[
          { label: 'Explore IHM degrees', href: 'https://ihm.edu.au/', style: 'secondary' },
          { label: 'Visit the Industry Hub', href: 'https://industryhub.ihna.edu.au/industry-partnership', style: 'secondary' },
          { label: 'Share IHNA courses', href: '/courses/', style: 'secondary' },
          { label: 'Email alumni@ihna.edu.au', href: 'mailto:alumni@ihna.edu.au', style: 'link' },
        ]}
      />
      <Rich tone="muted" spacing="compact">
        <h2>Share your story</h2>
        <p>If IHNA was part of your path into healthcare, we’d love to hear from you. Share your experience, what you’re doing now, and the milestone you’re most proud of since graduation.</p>
      </Rich>
      <EnquiryForm formKey="alumni-story" anchorId="share-your-story" tone="muted" />
      <CardGrid
        heading="Need something from IHNA?"
        columns="2"
        variant="grid"
        cards={[
          { title: 'Request your transcript', body: 'Email student support with your full name, course name, and student ID if you remember it. Include: name / course / student ID. studentsupport@ihna.edu.au', href: 'mailto:studentsupport@ihna.edu.au' },
          { title: 'Get in touch', body: 'Questions, alumni follow-up, or not sure where to go next? The alumni team can guide you. alumni@ihna.edu.au', href: 'mailto:alumni@ihna.edu.au' },
        ]}
      />
      <LinkTiles
        anchorId="connect"
        tone="muted"
        heading="Find IHNA where you already are"
        intro="Follow our social channels for graduation highlights, graduate features, campus news, and community updates."
        items={[
          { title: 'Facebook', href: 'https://www.facebook.com/myIHNA' },
          { title: 'Instagram', href: INSTAGRAM },
          { title: 'YouTube', href: YOUTUBE },
          {
            title: 'IHNA Alumni - LinkedIn',
            label: 'Connect on LinkedIn',
            body: 'Connect with other IHNA graduates, share job leads, and stay updated on what former classmates are doing across the healthcare sector.',
            href: 'https://www.linkedin.com/showcase/alumni-of-institute-of-health-and-nursing-australia/',
          },
        ]}
      />
      <EnquiryForm formKey="alumni-signup" heading="Stay in touch with IHNA" anchorId="alumni-signup" />
    </AlumniHubPage>
  )
}
