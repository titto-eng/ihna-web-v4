// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, Cta, Hero, img, Rich, PeopleGrid, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Meet The Team',
  path: '/our-team/',
  description: 'IHNA prides itself on the high calibre of its management, teaching and administrative staff.',
})

export default function OurTeamRoute() {
  return (
    <>
      <Hero heading="Meet The *Team*" eyebrow="About IHNA" variant="compact" audienceSwitch={false} subheading="IHNA prides itself on the high calibre of its management, teaching and administrative staff." />
      <SplitProse eyebrow="Our people" heading="Qualified, experienced and *dedicated*" aside={
        <ul className="space-y-3">
          <li><a className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 font-semibold transition-colors hover:border-primary hover:text-primary-strong" href="https://hcistaff.powerappsportals.com/" rel="noopener noreferrer">Staff Self Service Portal<span aria-hidden>↗</span></a></li>
          <li><a className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 font-semibold transition-colors hover:border-primary hover:text-primary-strong" href="https://portal.ihna.edu.au/users/login" rel="noopener noreferrer">Knowledge Hub<span aria-hidden>↗</span></a></li>
        </ul>
      }>
        <p>IHNA has well qualified, experienced, enthusiastic and dedicated staff to ensure the smooth and appropriate functioning of the College. Strong financial and student management are key determinants of the success or failure of any teaching establishment.</p>
        <p>IHNA educators are highly qualified, not just as educators but also as motivators. They all have significant practical experience in Australian hospitals and overseas which comes to life in the theoretical and practical elements of the courses. Each has a unique ability to ‘tune in’ to individual students and, as a consequence recognize potential limitations and strengths, thus enabling them to bring the best out of students so that they are optimally ready for the position of their choice in the health care sector.</p>
        <p>Similarly the friendly and approachable administrative staff supporting IHNA operations are highly qualified and have a wealth of relevant experience.</p>
      </SplitProse>
      <PeopleGrid tone="muted" heading="Senior *Management*" people={[
        {
          name: 'Dr Bijo Kunnumpurath',
          role: 'Founder and Chief Executive Officer',
          image: img({ src: '/images/ihna/theme/bijo.webp', alt: 'Photo of Dr Bijo Kunnumpurath', width: 722, height: 922 }),
        },
        {
          name: 'Mr Pankaj Patel',
          role: 'Chief Financial Officer',
          image: img({ src: '/images/ihna/theme/pankaj.webp', alt: 'Photo of Mr Pankaj Patel', width: 277, height: 366 }),
        },
        { name: 'Mr Ali Ahmed', role: 'Chief Operations Officer' },
        {
          name: 'Dr Shisir Manandhar',
          role: 'Academic Director',
          image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr Shisir Manandhar', width: 277, height: 366 }),
        },
        {
          name: 'Arshad Abdul Samad',
          role: 'Director of Quality Management',
          image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Arshad Abdul Samad', width: 277, height: 366 }),
        },
        {
          name: 'Sabarish Babu',
          role: 'Head of Digital Transformation / Manager – Brisbane',
          image: img({ src: '/images/ihna/theme/sabarish.webp', alt: 'Photo of Sabarish Babu', width: 277, height: 366 }),
        },
      ]} />
      <Accordion variant="plain"
        items={[
          {
            title: 'Dr Bijo Kunnumpurath, Founder and Chief Executive Officer',
            content: (
              <>
                <Rich depth={1}>
                  <p>Dr. Bijo, the Founder, Managing Director, and CEO of HCI Australia, epitomizes a visionary leader driven by a deep passion for education, entrepreneurship, and technology. With a Master’s in Business Administration and a background in Mechanical Engineering, he brings over three decades of extensive project and business management experience to his role. Furthermore, as a member of GAICD and has pursued a PhD in Corporate Governance in the Educational Sector at Swinburne University, Dr. Bijo exemplifies a dedication to lifelong learning and professional excellence.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'Mr Pankaj Patel, Chief Financial Officer',
            content: (
              <>
                <Rich depth={1}>
                  <p>With more than 20 years of experience in the field of accounting and finance, Pankaj has experience across financial reporting, taxation, and auditing, with established skills in corporate finance, financial analysis, taxation, accounting, and auditing. He holds Bachelor of Commerce and is also a Certified Public Accountant (AUS) and Chartered Accountant (India). Pankaj has been working with the HCI Group for over eight years and is responsible for managing financial aspects of the entire group.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'Dr Shisir Manandhar, Academic Director',
            content: (
              <>
                <Rich depth={1}>
                  <p>Shisir Manandhar is a respected leader in Australian tertiary education, overseeing academic programs at IHNA. With over seven years of experience, he specializes in technology management and innovation policy. As head of Heathovation, he drives research and innovation in healthcare education using cutting-edge technologies. Shisir's research focuses on enhancing tertiary education and healthcare delivery through innovative technologies.</p>
                </Rich>
              </>
            ),
          },
        ]}
      />
      <PeopleGrid
        heading="Our *Staff*"
        eyebrow="Campus Managers"
        people={[
          { name: 'Justin Jacob', role: 'Campus Director – Perth Campus', image: img({ src: '/images/ihna/theme/justin-jacob.webp', alt: 'Photo of Justin Jacob', width: 277, height: 366 }) },
          { name: 'Saji Kunnumpurath', role: 'Campus Manager – Heidelberg', image: img({ src: '/images/ihna/theme/saji-kunnumpurath.webp', alt: 'Photo of Saji Kunnumpurath', width: 277, height: 366 }) },
          { name: 'Sabarish Babu', role: 'Head of Digital Transformation / Manager – Brisbane', image: img({ src: '/images/ihna/theme/sabarish.webp', alt: 'Photo of Sabarish Babu', width: 277, height: 366 }) },
          { name: 'Salil Mathew', role: 'Operations Director – Sydney' },
        ]}
      />
      <PeopleGrid
        tone="muted"
        eyebrow="Other Staff"
        people={[
          { name: 'Mrs. Shali Bijo', role: 'Curriculum Development Advisor', image: img({ src: '/images/ihna/theme/Shali_Bijo.webp', alt: 'Photo of Mrs. Shali Bijo', width: 277, height: 366 }) },
        ]}
      />
      <Cta links={[{ href: '/academic-staff/', label: 'View More', style: 'primary' }]} variant="inline" spacing="compact" tone="muted" />
    </>
  )
}
