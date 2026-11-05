// Content from the live page (template-ihna-school-*.php). This file is the page: edit it freely.
// SchoolPage adds the school’s courses and staff from the CMS after this content.
import type { Metadata } from 'next'
import { pageMetadata, CareerRoles, EnquiryForm, img, InsightStats, SchoolIntro, Testimonials } from '@/components/page'
import { SchoolPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'School of Allied Health',
  path: '/school-of-allied-health/',
  description: 'Explore a career in Allied Health and Human Services – where every action makes a meaningful impact.',
})

export default function SchoolOfAlliedHealthRoute() {
  return (
    <SchoolPage title={'School of Allied Health'} path="/school-of-allied-health/" school="school-of-allied-health-and-human-services" hero={{ heading: 'Transform lives through care and compassion', subheading: 'Explore a career in Allied Health and Human Services – where every action makes a meaningful impact.', variant: 'split', image: img({ src: '/images/ihna/schools/allied-health-assistance-banner.webp', alt: '', width: 1030, height: 914 }), ctas: [{ label: 'Enquire now', href: '#quickContact', style: 'primary' }] }}>
      <SchoolIntro>
        <p>Our Allied Health and Human Services courses are specially crafted towards providing you with all the necessary knowledge and skills you need for impactful careers in healthcare. From holistic patient care to community support, our comprehensive programs blend theoretical insights with hands-on training.</p>
      </SchoolIntro>
      <CareerRoles
        heading="Allied Health and Human Services professionals are the heart of healthcare"
        lead="Here’s what is possible in your career after successful completion of your qualifications"
        roles={['Aged Care Worker', 'Patient Care Assistant', 'Disability Support Coordinator', 'Disability Support Worker', 'Community Support Worker (Disability)', 'Aged Care Coordinator', 'Residential Care Worker', 'Case Manager', 'Community Services Manager', 'Social Worker', 'Counsellor']}
        image={{ src: '/images/ihna/theme/allied-health-assistance-jobrole.webp', alt: '', width: 865, height: 609 }}
      />
      <InsightStats cards={[
        {
          title: 'Future job growth*',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: 341,800+ Job openings over the next 5 years Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/aged-and-disabled-carers?occupationCode=4231',
        },
        {
          title: 'Occupational Size',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: 276,600 Workers in this (or similar) professions Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/aged-and-disabled-carers?occupationCode=4231',
        },
        {
          title: 'Regions',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: Job role for this position work across most Australian regions Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/ambulance-officers-and-paramedics?occupationCode=4111',
        },
        {
          title: 'Salary',
          body: 'Here is what is possible in your career after successful completion of your qualifications $58,149 - $82,004 Average salary per annum Source',
          href: 'https://au.talent.com/salary?job=aged+care+support+worker#:~:text=How%20much%20does%20a%20Aged%20care%20support%20worker%20make%20in%20Australia%3F&text=The%20average%20aged%20care%20support%20worker%20salary%20in%20Australia%20is,up%20to%20%2482%2C004%20per%20year',
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
