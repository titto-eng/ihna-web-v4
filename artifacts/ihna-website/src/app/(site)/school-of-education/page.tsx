// Content from the live page (template-ihna-school-*.php). This file is the page: edit it freely.
// SchoolPage adds the school’s courses and staff from the CMS after this content.
import type { Metadata } from 'next'
import { pageMetadata, CareerRoles, EnquiryForm, GrowthPoints, img, Rich, SchoolIntro, Table, Testimonials } from '@/components/page'
import { SchoolPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'School of Education',
  path: '/school-of-education/',
  description: 'The IHNA School of Education prepares future early childhood educators with the skills and confidence to thrive in early childhood learning environments…',
})

export default function SchoolOfEducationRoute() {
  return (
    <SchoolPage title={'School of Education'} path="/school-of-education/" school="school-of-education" hero={{ heading: 'Empowering the next generation of early childhood educators and child carers.', variant: 'split', image: img({ src: '/images/ihna/schools/school-edu-com.webp', alt: '', width: 1031, height: 914 }), ctas: [{ label: 'Enquire now', href: '#quickContact', style: 'primary' }] }}>
      <SchoolIntro>
        <p><strong>The IHNA School of Education</strong> prepares future early childhood educators with the skills and confidence to thrive in early childhood learning environments. Our programs focus on human-centred training, hands-on placements, and flexible study options; equipping graduates to nurture, teach, and lead in Australia's growing education sector.</p>
      </SchoolIntro>
      <CareerRoles
        heading="Career Pathways After Graduation"
        lead="Graduates of our programs can work in a variety of rewarding roles, including:"
        roles={['Early Childhood Educator', 'Lead Educator / Room Leader', 'Childcare Centre Supervisor']}
        note={<p>Many of our students also use these qualifications to pathway into further study — including <strong>Bachelor of Early Childhood Education</strong>, or <strong>Education Leadership</strong> programs.</p>}
        image={{ src: '/images/ihna/theme/school-edu-com-block.webp', alt: '', width: 800, height: 563 }}
      />
      <Rich>
        <h2>Early Childhood Educator Salary &amp; Growth</h2>
        <p><strong>Salary Expectations (2025 Estimates)</strong></p>
      </Rich>
      <Table rows={[
        ['Qualification Level', 'Weekly Rate*', 'Hourly Rate*', 'Annualised Estimate*'],
        ['Certificate III (Assistant Educator)', '~$1,105 – $1,277', '~$29 – $33', '≈ $57,000 – $66,000'],
        ['Diploma (Lead Educator)', '~$1,203 – $1,405', '~$32 – $36', '≈ $62,000 – $73,000'],
        ['Early Childhood Teacher (Degree)', '~$1,295 – $1,293', '~$26 – $28', '≈ $67,000 – $95,000 (up to $110k in high-demand regions)'],
      ]} variant="striped" headerRow={true} />
      <Rich>
        <p>*Award benchmarks based on Children’s Services Award and includes pending pay rises &amp; worker retention payments. Visit the following links for reference:</p>
        <ul>
          <li><a href="https://practicaloutcomes.edu.au/in-demand-jobs-early-childhood-educator/?utm_source=chatgpt.com" rel="noopener noreferrer">In-demand jobs, early-childhood-educator</a></li>
          <li><a href="https://thesector.com.au/2025/06/20/wage-determinations-for-ecec-sector-published-confirming-pay-increases-from-1-july/?utm_source=chatgpt.com" rel="noopener noreferrer">Wage determinations for ECEC sector</a></li>
        </ul>
      </Rich>
      <GrowthPoints
        heading="Industry Growth & Demand Outlook"
        points={[
          <>Australia faces a shortfall of over 21,000 qualified early childhood educators as of 2024, with national workforce needing ~8% growth just to meet current demand. Visit the <a href="https://thesector.com.au/2024/09/04/jobs-and-skills-report-shows-a-shortfall-of-more-than-20000-educators/?utm_source=chatgpt.com" rel="noopener noreferrer">link</a></>,
          <>ECEC workforce has surged from <strong>168,500 in 2014 to 257,000 in 2024</strong>, one of the fastest-growing care sectors in the country. Visit the <a href="https://www.educationmattersmag.com.au/data-reveals-strong-growth-in-early-learning-workforce/?utm_source=chatgpt.com" rel="noopener noreferrer">link</a></>,
          <>
            Government wage increases:
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>10% increase from Dec 2024</li>
              <li>Additional 5% from Dec 2025<br />Results in significant uplift and improved wage parity.Visit the links for more details<br /><a href="https://www.theaustralian.com.au/education/thousands-of-childcare-workers-gifted-christmas-pay-rise/news-story/c4afcafe1945ffc034dd3cf947b05ccc?utm_source=chatgpt.com" rel="noopener noreferrer">The Australian</a>, <a href="https://thesector.com.au/2025/06/20/wage-determinations-for-ecec-sector-published-confirming-pay-increases-from-1-july/?utm_source=chatgpt.com" rel="noopener noreferrer">The Sector</a>, <a href="https://www.news.com.au/lifestyle/real-life/news-life/we-can-no-longer-ignore-australias-systemic-failures-in-keeping-kids-safe/news-story/1c35868698319278dd2cd34cd2dad3cc?utm_source=chatgpt.com" rel="noopener noreferrer">NEWS.com.au</a></li>
            </ul>
          </>,
        ]}
      />
      <Rich>
        <h2>Sources for Top Hiring Regions in Early Childhood Education</h2>
      </Rich>
      <Table rows={[
        ['Region(s)', 'Source / Reference'],
        ['Shepparton, Mildura, Bendigo (VIC)', 'Mitchell Institute – Victoria University — Mapped over 50% of VIC LGAs as “childcare deserts”'],
        ['Western Sydney, Dubbo, Tamworth (NSW)', 'NSW Government Workforce Strategy — Identified priority growth areas for ECEC staff'],
        ['Toowoomba, Cairns, Townsville (QLD)', 'Jobs Queensland ECEC Workforce Report — Reports strong regional growth in demand, especially in Northern QLD'],
        ['Bunbury, Kalgoorlie (WA)', 'WA Skills Priority Occupation List (SPOL) — ECEC on the critical shortage list for outer regional WA'],
        ['Eyre Peninsula, Mt Gambier (SA)', 'Adelaide Now article — 600+ childcare placements unavailable due to staff shortages'],
        ['Devonport, Launceston (TAS)', 'Tasmanian Government Early Years Plan — Forecasts upskilling and recruitment push in North & North-West TAS'],
        ['Alice Springs, Katherine (NT)', 'NT Department of Education – ECEC Review — Remote and Indigenous-focused support program growth cited'],
      ]} variant="striped" headerRow={true} />
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
