// Ported from the IHNA alumni microsite (alumni/events.php) on 2026-10-21. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero, Tabs } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Global Alumni Meet',
  path: '/alumni/events.php',
  description: 'Connect with fellow healthcare professionals, advance your career, and stay engaged with the IHNA community through our diverse range of events and programs.',
})

const details = '/alumni/event-details.html'

export default function AlumniEventsRoute() {
  return (
    <>
      <Hero
        heading="Alumni Events & Programs"
        eyebrow="IHNA Alumni"
        variant="compact"
        audienceSwitch={false}
        subheading="Connect with fellow healthcare professionals, advance your career, and stay engaged with the IHNA community through our diverse range of events and programs."
      />
      <Tabs
        tabs={[
          {
            label: 'Upcoming Events',
            content: (
              <CardGrid
                depth={1}
                columns="3"
                cards={[
                  { title: 'Sydney Alumni Networking', badge: '25th Jan, 2025', href: details },
                  { title: 'Mentorship Program Launch', badge: '10th Feb, 2025', href: details },
                ]}
              />
            ),
          },
          {
            label: 'Past Events',
            content: <CardGrid depth={1} columns="3" cards={[{ title: 'Annual Research Day', badge: '10th Aug, 2024', href: details }]} />,
          },
        ]}
      />
      <CardGrid
        heading="Featured Events"
        columns="3"
        cards={[
          { title: 'Global Alumni Meet 2024', badge: '15th Nov, 2024 | Melbourne, AU', body: 'Our largest annual gathering for networking, learning, and celebration.', href: details },
          { title: 'Nursing Career Workshop', badge: '5th Dec, 2024 | Online Webinar', body: 'Expert tips on advancing your career in the healthcare sector.', href: details },
          { title: 'Annual Charity Drive', badge: '20th Jan, 2025 | Sydney, AU', body: 'Giving back to the community through a dedicated healthcare initiative.', href: details },
        ]}
      />
    </>
  )
}
