// Content from the live page (template-ihna-school-*.php). This file is the page: edit it freely.
// SchoolPage adds the school’s courses and staff from the CMS after this content.
import type { Metadata } from 'next'
import { pageMetadata, CareerRoles, EnquiryForm, img, InsightStats, SchoolIntro, Testimonials } from '@/components/page'
import { SchoolPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'School of First-Aid',
  path: '/school-of-first-aid/',
  description: 'Be a lifesaver! Join our First Aid Courses and gain the skills to respond confidently in emergencies. Your knowledge can make a difference.',
})

export default function SchoolOfFirstAidRoute() {
  return (
    <SchoolPage title={'School of First-Aid'} path="/school-of-first-aid/" school="first-aid" hero={{ heading: 'Empower yourself with life-saving skills!', subheading: 'Be a lifesaver! Join our First Aid Courses and gain the skills to respond confidently in emergencies. Your knowledge can make a difference.', variant: 'split', image: img({ src: '/images/ihna/schools/firstaid-banner.webp', alt: '', width: 1030, height: 914 }), ctas: [{ label: 'Enquire now', href: '#quickContact', style: 'primary' }] }}>
      <SchoolIntro>
        <p>IHNA's First Aid Courses provide essential knowledge and hands-on training to handle emergencies confidently. Your readiness can make a difference when it matters most. Enrol today and be a certified first responder</p>
      </SchoolIntro>
      <CareerRoles
        heading="Chart a course towards a purposeful career in first aid"
        lead="Here’s what is possible in your career after successful completion of your qualifications"
        roles={['Paramedic', 'Emergency Medical Services (EMS) Personnel', 'First Aid Trainer/Instructor', 'Workplace First Aid Officer', 'Community Support Worker', 'Volunteer Coordinator', 'Emergency Relief Worker', 'Health and Safety Officer', 'Emergency Services Volunteer', 'Disaster Relief Volunteer']}
        image={{ src: '/images/ihna/theme/first-aid-jobrole.webp', alt: '', width: 865, height: 609 }}
      />
      <InsightStats cards={[
        {
          title: 'Future job growth*',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: 21,000+ Job openings over the next 5 years Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/ambulance-officers-and-paramedics?occupationCode=4111',
        },
        {
          title: 'Occupational Size',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: 27,000 workers in this (or similar) professions Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/ambulance-officers-and-paramedics?occupationCode=4111',
        },
        {
          title: 'Regions',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: Job role for this position work across most Australian regions Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/ambulance-officers-and-paramedics?occupationCode=4111',
        },
        {
          title: 'Salary',
          body: 'Here is what is possible in your career after successful completion of your qualifications $105,000 to $125,000 Average salary per annum Source https://www.seek.com.au/career-advice/role/paramedic/salary',
          href: 'https://www.seek.com.au/career-advice/role/paramedic/salary#:~:text=What%20can%20I%20earn%20as%20a%20Paramedic%3F&text=The%20average%20annual%20salary%20for,ranges%20from%20%24105%2C000%20to%20%24125%2C000.',
        },
      ]} />
      <Testimonials heading="Campus *Tour*" tone="muted" anchorId="campus-tour" inline={[
        { name: 'Perth', videoUrl: 'https://www.youtube.com/watch?v=NZJlSIaRkSo' },
        { name: 'Sydney', videoUrl: 'https://www.youtube.com/watch?v=h2H1vxanEPs' },
        { name: 'Heidelberg', videoUrl: 'https://www.youtube.com/watch?v=y2MOKRjRJ_4' },
        { name: 'Melbourne', videoUrl: 'https://www.youtube.com/watch?v=RVaHwxTqOmA' },
        { name: 'Brisbane', videoUrl: 'https://www.youtube.com/watch?v=8c37xl41KdU' },
      ]} variant="carousel" />
      <EnquiryForm formKey="quick-enquiry" heading="Have any questions? Feel free to contact us anytime." />
    </SchoolPage>
  )
}
