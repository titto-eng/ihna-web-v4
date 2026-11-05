// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Gallery, EventDetail, Hero, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Staff – Cultural Workshop Events',
  path: '/staff-cultural-workshop-events/',
  description: 'Participate in hands-on workshops exploring traditional arts, storytelling, and cultural practices led by community elders and artists.',
})

const I = '/images/ihna/staff-cultural-workshop-events'

export default function StaffCulturalWorkshopEventsRoute() {
  return (
    <>
      <Hero
        heading="Cultural Workshops & Events"
        eyebrow="Staff"
        variant="compact"
        audienceSwitch={false}
        subheading="Participate in hands-on workshops exploring traditional arts, storytelling, and cultural practices led by community elders and artists."
      />
      <EventDetail
        chips={['Workshop', 'Past event']}
        title="Virtual Cultural Awareness Workshop"
        facts={[
          { label: 'Date', value: '04 December 2025' },
          { label: 'Time', value: '2:00 PM – 5:00 PM (AEDT)' },
          { label: 'Location', value: 'Online' },
          { label: 'Led By', value: 'Koori Kinnections' },
        ]}
      >
        <p>IHM and IHNA staff recently participated in a Cultural Awareness Workshop led by <strong>Koori Kinnections</strong>, gaining valuable insights into the history, culture, and lived experiences of Aboriginal and Torres Strait Islander peoples.</p>
        <p>The session encouraged reflection, respectful understanding, and reinforced our commitment to inclusive and culturally safe workplaces.</p>
        <h3>Session Agenda</h3>
        <p>Introduction to Aboriginal and Torres Strait Islander histories, cultures, and lived experiences; reflective and respectful discussion; and reinforcing cultural safety and inclusive workplace practices.</p>
      </EventDetail>
      <Gallery
        variant="grid"
        spacing="compact"
        images={[
          img({ src: `${I}/cultural-awareness-workshop3.webp`, alt: 'Virtual Cultural Awareness Workshop slide: Invasion and Dispossession', width: 1385, height: 860 }),
          img({ src: `${I}/cultural-awareness-workshop2.webp`, alt: 'Virtual Cultural Awareness Workshop slide', width: 1383, height: 862 }),
        ]}
      />
    </>
  )
}
