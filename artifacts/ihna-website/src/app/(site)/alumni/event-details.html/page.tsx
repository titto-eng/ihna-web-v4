// Ported from the IHNA alumni microsite (alumni/event-details.html) on 2026-10-21. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero, Rich, Table, Tabs } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Global Alumni Meet',
  path: '/alumni/event-details.html',
  description: 'The Global Alumni Meet is where IHNA graduates from around the world converge to network, share insights, and celebrate success.',
})

const details = '/alumni/event-details.html'

export default function AlumniEventDetailsRoute() {
  return (
    <>
      <Hero
        heading="Global Alumni Meet 2024"
        eyebrow="IHNA Alumni"
        variant="compact"
        audienceSwitch={false}
        subheading="Join us for the most anticipated event of the year! The Global Alumni Meet is where IHNA graduates from around the world converge to network, share insights, and celebrate success."
      />
      <Table
        caption="Event Key Details"
        rows={[
          ['Date', 'Fri, 15th November 2024'],
          ['Time', '6:00 PM - 10:00 PM AEST'],
          ['Location', 'Grand Hyatt, Melbourne'],
        ]}
      />
      <Rich>
        <h2>Keynote &amp; Agenda</h2>
        <p>This year&apos;s event features a keynote address from <strong>Dr. Anya Sharma</strong>, a panel discussion on global healthcare mobility, and dedicated networking sessions. A premium dining experience will cap off the evening. Expect to meet alumni from Australia, India, and the Philippines.</p>
        <ul>
          <li>Keynote: Dr. Anya Sharma (IHNA Alumna &apos;05)</li>
          <li>Panel: Future of Remote Healthcare</li>
          <li>Alumni Achievement Awards</li>
          <li>Formal Dinner &amp; Networking</li>
        </ul>
        <h2>Venue Information</h2>
        <p>The Grand Hyatt, Melbourne offers a world-class setting for our reunion. Directions and parking details will be sent to all registered attendees one week before the event.</p>
      </Rich>
      <CardGrid heading="Featured Events" columns="3" cards={[{ title: 'Webinar: Future of Nursing', badge: 'Online | 20th Oct 2024', href: details }]} />
      <Rich>
        <h2>All Alumni Events</h2>
      </Rich>
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
    </>
  )
}
