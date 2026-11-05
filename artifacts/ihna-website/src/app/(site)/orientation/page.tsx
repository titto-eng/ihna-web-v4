// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, Hero, Rich, ValueCards, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Orientation',
  path: '/orientation/',
  description: 'We understand that the first few days of your tertiary education can be quite intimidating. To ease you into the course, a structured orientation program…',
})

export default function OrientationRoute() {
  return (
    <>
      <Hero heading="Orientation" variant="split" look="orbit" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/orientation.webp', alt: 'Students walking together on campus', width: 505, height: 631 })} />
      <SectionNav section="current-student" current="/orientation/" />
      <Rich>
        <p className="lead">We understand that the first few days of your tertiary education can be quite intimidating. To ease you into the course, a structured orientation program is the first session that you will attend. In this session, you will get all the information regarding your course, assignments, policies and procedures etc. This session also gives you an opportunity to meet our faculty and other staff. This is also an excellent opportunity to meet your classmates and develop lasting friendships.</p>
      </Rich>
      <ValueCards
        tone="muted"
        heading="Things to bring on the Orientation *day*"
        items={[
          { mark: '1', title: 'Your passport' },
          { mark: '2', title: 'Your letter of offer' },
          { mark: '3', title: 'A copy of your visa (Only for International Students)' },
        ]}
      />
      <Checklist
        heading="What happens on my first *day*?"
        intro="On your first day you will:"
        items={[
          <>Have an official welcome session with seniors</>,
          <>Meet the academic and support staff</>,
          <>Meet your fellow students</>,
          <>Have your photograph clicked for issuing of student ID card</>,
          <>Have a campus tour</>,
          <>Learn how to access your Student Portal</>,
          <>Get familiar with your Student Handbook</>,
          <>Get your OSHC Policy card</>,
          <>Update your emergency contact details</>,
          <>Get your class timetable</>,
          <>Get your student ID Card issued</>,
          <>Learn about policies and procedures</>,
          <>Learn about the attendance policy</>,
          <>Learn about complaints and appeals procedures</>,
          <>Get the opportunity to ask any questions that you may have</>,
        ]}
      />
      <Checklist
        tone="muted"
        heading="What else should I do in my first *week*?"
        intro="You should use your first week as a student at the campus to familiarize yourself with:"
        columns={1}
        items={[
          <>Your timetable, your class teacher and classmates</>,
          <>The neighbourhood and the local area around the campus</>,
          <>Facilities such as the public library, public transport options (trains and buses), shopping centers, restaurants, cafes, and local medical center</>,
          <>The Library and online resources</>,
        ]}
      />
      <Rich tone="muted" spacing="compact">
        <p>If you are unable to attend your Orientation Day, please request for an IHNA Orientation Pack to be sent to you.</p>
        <p>Additional support services are available by contacting: <a href="tel:1800225283">1800 22 52 83</a>.</p>
      </Rich>
    </>
  )
}
