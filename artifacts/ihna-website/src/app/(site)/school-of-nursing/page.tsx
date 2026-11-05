// Content from the live page (template-ihna-school-*.php). This file is the page: edit it freely.
// SchoolPage adds the school’s courses and staff from the CMS after this content.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, CareerRoles, EnquiryForm, img, InsightStats, SchoolIntro, Testimonials } from '@/components/page'
import { SchoolPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'School of Nursing',
  path: '/school-of-nursing/',
  description: 'Venture into a rewarding career as an enrolled nurse with the opportunity to work anywhere in Australia.',
})

export default function SchoolOfNursingRoute() {
  return (
    <SchoolPage title={'School of Nursing'} path="/school-of-nursing/" school="school-of-nursing" hero={{ heading: 'Become a dedicated nursing professional to the perfection', subheading: 'Venture into a rewarding career as an enrolled nurse with the opportunity to work anywhere in Australia.', variant: 'split', image: img({ src: '/images/ihna/schools/nursing-banner.webp', alt: '', width: 1030, height: 914 }), ctas: [{ label: 'Enquire now', href: '#quickContact', style: 'primary' }] }}>
      <SchoolIntro>
        <p>Our comprehensive nursing program equips you with the knowledge, skills, and practical experience needed to excel in the dynamic field of nursing. Our dedicated faculty, state-of-the-art facilities, and hands-on training ensure that you are well-prepared to provide high-quality patient care.</p>
      </SchoolIntro>
      <CareerRoles
        eyebrow="After graduation"
        heading="Career Pathways After *Graduation*"
        lead="After successfully completing the Diploma of Nursing and registering with AHPRA, you may work in roles such as:"
        roles={['Enrolled Nurse (EN)', 'Aged Care Nurse', 'Rehabilitation Nurse (EN level)', 'Acute Care Nurse (EN level)', 'Mental Health Support Nurse (EN level)', 'Community Health EN']}
        note={<p>Many graduates also choose to progress their careers by undertaking further study, such as the Bachelor of Nursing to become a Registered Nurse (RN).</p>}
        image={{ src: '/images/ihna/theme/nursing-jobrole.webp', alt: 'Nursing job roles after the Diploma of Nursing', width: 865, height: 609 }}
      />
      <InsightStats cards={[
        {
          title: 'Future job growth*',
          body: 'By 2035, Australia is projected to face a shortfall of 70,707 full-time equivalent nurses across sectors (acute, primary, aged care). Visit this link to know more - Acute Care 26,665 FTE shortage Primary healthcare 21,765 FTE shortage Aged care 17,551 FTE shortage',
          href: 'https://anmj.org.au/australia-facing-shortfall-of-over-70000-nurses-by-2035-report-reveals/',
        },
        {
          title: 'Occupational Size',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: 325,500 workers in this (or similar) professions Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/registered-nurses?occupationCode=2544',
        },
        {
          title: 'Regions',
          body: 'Here’s what is possible in your career after successful completion of your qualifications: Job role for this position work across most Australian regions Source https://labourmarketinsights.gov.au/',
          href: 'https://labourmarketinsights.gov.au/occupation-profile/registered-nurses?occupationCode=2544',
        },
        {
          title: 'Salary',
          body: 'Here is what is possible in your career after successful completion of your qualifications $77,386-$110,464 Average salary per annum Source https://au.talent.com/salary?job=registered+nurse',
          href: 'https://au.talent.com/salary?job=registered+nurse',
        },
      ]} />
      <CardGrid heading="Further study at *IHM*" cards={[
        { title: 'National Council Licensure Examination for RNs', image: img({ src: '/images/ihna/theme/nclex_thumb.png', alt: '', width: 671, height: 593 }), href: 'https://ihm.edu.au/courses/nclex-for-rns/' },
        { title: 'Objective Structured Clinical Examination for Registered Nurses (OSCE for RNs)', image: img({ src: '/images/ihna/theme/osce_thumb.png', alt: '', width: 671, height: 593 }), href: 'https://ihm.edu.au/courses/osce-for-rns/' },
      ]} columns="2" variant="grid" />
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
