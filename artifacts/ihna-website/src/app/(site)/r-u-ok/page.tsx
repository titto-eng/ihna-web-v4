// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, ImageText, img, Steps } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'R U OK?',
  path: '/r-u-ok/',
  description: 'At IHNA, R U OK? is more than one day. It is a reminder to check in with the people around us and make wellbeing part of everyday life.',
})

const booking = 'https://bookings.cloud.microsoft/book/SupportSessionDON@hcig.onmicrosoft.com/s/vx-0fho74U24h75lLz1dbA2?ismsaljsauthenabled'

export default function RUOkRoute() {
  return (
    <>
      <Hero
        eyebrow="R U OK? Every Day at IHNA"
        heading="A conversation can make a difference."
        subheading="At IHNA, R U OK? is more than one day. It is a reminder to check in with the people around us, start meaningful conversations and make wellbeing part of everyday life."
        variant="split" look="orbit"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/theme/r-u-ok-assets/hero.webp', alt: 'Students sharing a relaxed conversation on campus', width: 1536, height: 1024 })}
        ctas={[
          { label: 'Book a confidential session', href: booking, style: 'primary' },
          { label: 'Explore R U OK? resources', href: '#resources', style: 'secondary' },
        ]}
      />
      <Steps
        anchorId="conversation"
        heading="Check in. Be present. Start the conversation."
        intro="Study, work, placements and personal commitments can sometimes feel overwhelming. Sometimes, simply asking “Are you OK?” can be the start of the support someone needs. Four simple steps can make a difference."
        variant="numbered"
        steps={[
          { title: 'Ask', body: 'Choose the right moment and simply ask, “Are you OK?” A way to start: “How are you going?”' },
          { title: 'Listen', body: 'Give them your full attention and allow them time to talk. Make space to listen: take your time. Be present and listen without judgement.' },
          { title: 'Encourage Action', body: 'Support them in taking a positive next step or in seeking additional support when needed. Find a next step: “How would you like me to support you?”' },
          { title: 'Check In', body: 'Follow up later and let them know you are still there. Keep the connection: make time to catch up again and ask how they’re going.' },
        ]}
      />
      <ImageText
        media={img({ src: '/images/ihna/theme/r-u-ok-assets/counselling.webp', alt: 'An approachable counsellor listening attentively to a student', width: 1536, height: 1024 })}
        imageSide="right"
        heading="Need someone to talk to?"
        ctas={[{ label: 'Book a confidential session', href: booking, style: 'primary' }]}
      >
        <p>You do not have to work through everything on your own.</p>
        <p>The <strong>IHNA Student Counsellor</strong> is available to provide students with <strong>confidential support</strong> and a safe space to talk.</p>
        <p>Whether you are dealing with study pressure, placements, personal challenges or simply need someone to listen, support is available.</p>
        <h3>Bookings</h3>
        <p>Speak confidentially with the IHNA Student Counsellor.</p>
        <p><em>Your wellbeing matters. You are not alone.</em></p>
      </ImageText>
      <ImageText
        anchorId="resources"
        media={img({ src: '/images/ihna/theme/r-u-ok-assets/flowers.webp', alt: 'Yellow flowers reaching towards the sunlight', width: 1536, height: 1024 })}
        imageSide="left"
        heading="Explore R U OK? resources"
        ctas={[{ label: 'Explore R U OK? resources', href: 'https://www.ruok.org.au/', style: 'primary' }]}
      >
        <p>Find practical information, conversation tips and resources to help you support yourself and the people around you.</p>
        <p><em>Small conversations. A brighter tomorrow.</em></p>
      </ImageText>
      <Cta
        variant="banner"
        heading="Check in with others. Check in with yourself."
        body="Sometimes a conversation starts with just three words. Kind people. Brighter futures."
        links={[{ label: 'Are you OK?', href: '#conversation', style: 'primary' }]}
      />
    </>
  )
}
