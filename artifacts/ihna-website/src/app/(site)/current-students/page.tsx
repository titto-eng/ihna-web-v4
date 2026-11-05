// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Cta, Hero, img, LinkGroups, LinkTiles, PeopleGrid } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Current Students',
  path: '/current-students/',
  description: 'Insights| 07 Jul 2023 Celebrating NAIDOC Week at IHNA: Embracing Australia\'s Indigenous Heritage NAIDOC Week is a significant occasion that honors the…',
})

export default function CurrentStudentsRoute() {
  return (
    <>
      <Hero heading="Current Students" variant="compact" audienceSwitch={false} eyebrow="Current students" />
      <SectionNav section="current-student" current="/current-students/" />
      <LinkGroups
        groups={[
          {
            title: 'Important Info',
            links: [
              { label: 'Policies & Procedures', href: '/policies-links-forms/' },
              { label: 'Pay Online', href: '/pay-online/' },
              { label: 'Manage My Enrollment', href: '/manage-my-enrolment/' },
              { label: 'Complaints & Appeals', href: '/student-complaints-appeal/' },
              { label: 'Student Handbook', href: 'https://online.fliphtml5.com/wmka/tdni/#p=1' },
              { label: 'Census Dates', href: '/ihna-census-dates/' },
              { label: 'Scholarships', href: '/scholarship/' },
            ],
          },
          {
            title: 'New Student',
            links: [
              { label: 'Orientation', href: '/orientation/' },
              { label: 'USI', href: '/usi/' },
              { label: 'Life at IHNA', href: '/life-at-ihna/' },
              { label: 'Online Study Tools', href: '/pdf/IHNA-Online-Study-Tools.pdf' },
            ],
          },
          {
            title: 'Fees & Charges',
            links: [
              { label: 'IHNA Fees & Charges', href: '/ihna-fees-charges/' },
              { label: 'VET Student Loan', href: '/vet-students-loan/' },
              { label: 'Student Refund Form', href: 'https://forms.office.com/Pages/ResponsePage.aspx?id=niM6_UBfsk2J5NeaEQ7oOFmmKKloVyxJpS4vzUa0I5FUREZCOVlITUY2MVYwSjYwV1NFVEM0NVJESC4u&embed=true' },
              { label: 'VSL / VFH Policies', href: '/vsl-vfh-policies-procedures/' },
            ],
          },
          {
            title: 'Student Support',
            links: [
              { label: 'Academic Support', href: '/academic-support/' },
              { label: 'Mental Health & Wellbeing', href: '/mental-health-wellbeing-support-services/' },
              { label: 'L – Portfolio', href: '/l-portfolio/' },
              { label: 'Aboriginal And Torres Strait Islander', href: '/aboriginal-and-torres-strait-islander/' },
              { label: 'Key Systems', href: '/ihna-key-systems/' },
            ],
          },
          {
            title: 'After Study',
            links: [
              { label: 'Career help', href: '/career-help/' },
              { label: 'Alumni', href: '/alumni/' },
              { label: 'Careers', href: '/careers/' },
            ],
          },
        ]}
      />
      <CardGrid heading="Life at *IHNA*" columns="3" variant="grid" cards={[
        { badge: 'Insights · 7 Jul 2023', title: 'Celebrating NAIDOC Week at IHNA: Embracing Australia’s Indigenous Heritage', href: '/celebrating-naidoc-week-with-ihna-australia/' },
        { badge: 'Insights · 21 Jan 2022', title: 'IHNA is proud to announce its all-new “HLT54121-Diploma of Nursing” course!', href: '/ihna-is-proud-to-announce-its-all-new/' },
        { badge: 'Insights · 23 Nov 2021', title: 'Australia Welcomes International Students', href: '/australia-welcomes-international-students/' },
      ]} />
      <Cta links={[
        { href: '/news/', label: 'View More', style: 'primary' },
      ]} variant="inline" />
      <PeopleGrid
        tone="muted"
        heading="Meet Your Support *Officers*"
        people={[
          { name: 'Justin Jacob', role: 'Campus Director – Perth Campus', image: img({ src: '/images/ihna/theme/justin-jacob.webp', alt: 'Photo of Justin Jacob', width: 277, height: 366 }) },
          { name: 'Saji Kunnumpurath', role: 'Campus Manager – Heidelberg Campus', image: img({ src: '/images/ihna/theme/saji-kunnumpurath.webp', alt: 'Photo of Saji Kunnumpurath', width: 277, height: 366 }) },
          { name: 'Sabarish Babu', role: 'Head of Digital Transformation / Manager – Brisbane', image: img({ src: '/images/ihna/theme/sabarish.webp', alt: 'Photo of Sabarish Babu', width: 277, height: 366 }) },
          { name: 'Salil Mathew', role: 'Operations Director – Sydney' },
          { name: 'Arshad Abdul Samad', role: 'Director of Quality Management', image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Arshad Abdul Samad', width: 277, height: 366 }) },
        ]}
      />
      <LinkTiles
        heading="Talk to *Us*."
        items={[
          { label: 'For Accounts Enquiries', title: 'accounts@ihna.edu.au', href: 'mailto:accounts@ihna.edu.au' },
          { label: 'For General Enquiries', title: 'enquiry@ihna.edu.au', href: 'mailto:enquiry@ihna.edu.au' },
          { label: 'For Student Enquiries', title: 'studentsupport@ihna.edu.au', href: 'mailto:studentsupport@ihna.edu.au' },
        ]}
      />
    </>
  )
}
