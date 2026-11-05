// Content from the live page (template-ihna-school-*.php). This file is the page: edit it freely.
// SchoolPage adds the school’s courses and staff from the CMS after this content.
import type { Metadata } from 'next'
import { pageMetadata, CareerRoles, EnquiryForm, GrowthPoints, img, SalaryBoard, SchoolIntro, StudySteps, Testimonials } from '@/components/page'
import { SchoolPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA School of Community Services',
  path: '/school-of-community-services/',
  description: 'The IHNA School of Community Services equips compassionate individuals with the skills, practical experience, and nationally recognised qualifications to…',
})

export default function SchoolOfCommunityServicesRoute() {
  return (
    <SchoolPage title={'IHNA School of Community Services'} path="/school-of-community-services/" school="school-of-community-services" hero={{ heading: "Empowering Human-Centred Careers in Australia's Growing Care Sector", variant: 'split', image: img({ src: '/images/ihna/schools/school-com-ser.webp', alt: '', width: 1031, height: 914 }), ctas: [{ label: 'Enquire now', href: '#quickContact', style: 'primary' }] }}>
      <SchoolIntro>
        <p>The <strong>IHNA School of Community Services</strong> equips compassionate individuals with the skills, practical experience, and nationally recognised qualifications to make a meaningful difference in the lives of others. Whether you're supporting people in crisis, advocating for mental health, or guiding individuals through life's toughest challenges, our programs combine real-world placements, trauma-informed training, and flexible learning to prepare you for a life-changing career in community care.</p>
      </SchoolIntro>
      <CareerRoles
        heading="Career Pathways After Graduation"
        lead="Graduates of the IHNA School of Community Services are equipped to take on meaningful and people-focused roles across Australia’s growing human services sector."
        intro={<p>You may be eligible for roles such as:</p>}
        roles={['Community Support Worker', 'Case Manager', 'Mental Health Support Worker', 'NDIS Support Coordinator', 'Community Counsellor (non-clinical)', 'Family Support Officer', 'Youth Worker', 'Rehabilitation Support Worker', 'Crisis Intervention Worker', 'Drug and Alcohol Support Worker']}
        image={{ src: '/images/ihna/theme/school-com-ser-block.webp', alt: '', width: 866, height: 609 }}
      />
      <StudySteps
        heading="Pathways to Further Study"
        lead="Many of our graduates also use their IHNA qualification to pursue further academic or professional development in areas such as:"
        steps={['Bachelor of Social Work', 'Bachelor of Counselling or Psychology', 'Bachelor of Mental Health Practice', 'Postgraduate studies in Community Development, Casework, or Human Services']}
      />
      <GrowthPoints
        heading="Industry Growth & Demand"
        points={[
          <><strong>Community &amp; Personal Service Worker roles </strong>continue growing: 11.1% of the workforce in 2023 projected to rise to 11.4% by 2033. Over 90% of new roles will require post-secondary qualifications. <a href="https://www.jobsandskills.gov.au/publications/towards-national-jobs-and-skills-roadmap-summary/employment-projections-for-the-decade-ahead?utm_source=chatgpt.com" rel="noopener noreferrer">Employment projections for the decade ahead</a></>,
          <>In the year to Feb 2025, <strong>71,700 new jobs</strong> were added in the Community and Personal Services sector alone. <a href="https://www.yourcareer.gov.au/resources/australian-jobs-report/community-personal-service-workers" rel="noopener noreferrer">Community and Personal Service Workers</a></>,
          <><strong>Job growth in care sectors</strong> (including community services and mental health) is driven by the NDIS rollout and aging population—creating diverse opportunities. <a href="https://www.menziessupport.org.au/job-growth-in-community-services-provides-opportunities-for-diverse-skill-sets-and-lifestyles/?utm_source=chatgpt.com" rel="noopener noreferrer">menziessupport.org.au</a></>,
        ]}
      />
      <SalaryBoard
        heading="Salary Expectations"
        columns={['Job Role', 'Estimated Annual Salary (AUD)', 'Source']}
        rows={[
          { role: 'Community Support Worker', salary: '$70,000 – $80,000', source: <><a href="https://www.seek.com.au/career-advice/role/community-worker/salary?utm_source=chatgpt.com" rel="noopener noreferrer">Community Worker Salary</a>, <a href="https://www.seek.com.au/career-advice/role/community-support-worker/salary?utm_source=chatgpt.com" rel="noopener noreferrer">Community Support Worker Salary</a></> },
          { role: 'Mental Health Support Worker', salary: '~$70,000 – $80,000 (up to $98K in remote cities)', source: <a href="https://www.glassdoor.com.au/Salaries/community-support-worker-salary-SRCH_KO0%2C24.htm?utm_source=chatgpt.com" rel="noopener noreferrer">Glassdoor</a> },
          { role: 'Community Worker/Case Manager', salary: '$75,000 – $85,000+', source: <a href="https://www.seek.com.au/career-advice/role/community-worker/salary?utm_source=chatgpt.com" rel="noopener noreferrer">Seek</a> },
          { role: 'Community Services (general)', salary: '~$74,000 average', source: <a href="https://au.jooble.org/salary/community-support-worker?utm_source=chatgpt.com" rel="noopener noreferrer">Jooble</a> },
        ]}
      />
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
