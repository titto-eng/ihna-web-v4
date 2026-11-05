// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, CardGrid, Cta, EnquiryForm, Hero, Rich, SplitProse, Statement, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Scholarship',
  path: '/scholarship/',
  description: 'Scholarships at IHNA provide opportunity, promote equity and recognise excellence and achievement, for both commencing and current students.',
})

// The scholarship list (from the old theme's scholarships.json). The live page lists none ("No scholarships are currently
// available!"), so `listingOpen` stays false; set it to true to show these cards again.
const listingOpen = false
const scholarships = [
  {
    title: 'HLT54121 – Diploma of Nursing',
    amount: '$6,000 AUD',
    campuses: ['Melbourne', 'Sydney', 'Brisbane'],
    availableTo: 'International & Domestic students',
    criteria: ['Financial need', 'Career change', 'Commitment to healthcare'],
    href: '/courses/diploma-of-nursing/',
  },
]

export default function ScholarshipRoute() {
  return (
    <>
      <Hero
        heading="Scholarships"
        variant="split" look="orbit"
        audienceSwitch={false}
        subheading="At IHNA, we believe in providing opportunities, promoting equity, and recognising excellence and achievement. We want you to reach your full potential and achieve your life and career goals."
        image={img({ src: '/images/ihna/scholarship/scholarship-banner.webp', alt: 'Graduates in caps and gowns embracing', width: 1600, height: 625 })}
        ctas={[
          { label: 'Scholarship Enquiry', href: '#scholarship-enquiry', style: 'primary' },
          { label: 'Contact Admissions', href: 'mailto:enquiry@ihna.edu.au', style: 'secondary' },
        ]}
      />
      <SplitProse eyebrow="Caring with Passion" heading="Overview">
        <p>Scholarships at IHNA are about providing opportunity, promoting equity and recognising excellence and achievement. Grounded in our purpose, <strong>Caring with Passion,</strong> we want you to reach your full potential and achieve your life and career goals.</p>
        <p>Scholarships at IHNA support both commencing and current students. Some scholarships recognise academic merit or community contribution. Others aim to support students experiencing financial hardship, students from regional or remote areas who relocate to study, and students from diverse backgrounds.</p>
        <p>Need help? Email <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a>, call <a href="tel:1800225283">1800 22 52 83</a> or contact our <strong>Admissions</strong> team by filling out the enquiry form to learn more about your situation.</p>
      </SplitProse>
      <Statement tone="default" title="Are you eligible?" quote="Whether you’re studying from Australia or overseas, when you apply for the Diploma of Nursing at IHNA’s Sydney or Brisbane campus, you will automatically be considered for this scholarship." />
      {listingOpen ? (
        <CardGrid
          heading="Available Scholarships"
          columns="2"
          cards={scholarships.map((s) => ({
            title: s.title,
            badge: s.amount,
            body: `${s.amount} scholarship on total tuition fee. Available at: ${s.campuses.join(', ')} campuses. Available to: ${s.availableTo}. Selection criteria: ${s.criteria.join(', ')}.`,
            href: s.href,
          }))}
        />
      ) : (
        <Rich>
          <h2>Available Scholarships</h2>
          <p>No scholarships are currently available!</p>
        </Rich>
      )}
      <Accordion
        heading="Scholarship Application Help Guide"
        intro="View our comprehensive guide to help you prepare a strong scholarship application."
        variant="plain"
        items={[
          {
            title: 'General advice for preparing your application',
            content: (
              <Rich depth={1}>
                <ul>
                  <li>Please provide all necessary information and supporting documentation. The more complete your application, the better we can assess it.</li>
                  <li>Allow yourself enough time — it&apos;s best to spend at least one hour preparing a strong application.</li>
                  <li>Gain feedback: ask someone (family member, friend, teacher) to read your application before you submit.</li>
                </ul>
              </Rich>
            ),
          },
          {
            title: 'Putting together your personal statement',
            content: (
              <Rich depth={1}>
                <p>Refer to the Selection/Eligibility Criteria in the scholarship listing for key info, and use this as an opportunity to:</p>
                <ul>
                  <li>Tell us who you are</li>
                  <li>Tell us what you have done and how the impact has shaped you</li>
                  <li>Tell us what you hope to achieve during your study at IHNA and beyond</li>
                </ul>
                <p>Consider how your life experiences enhance your application. Be specific about your journey—not something generic.</p>
                <p>You may also be asked to demonstrate your commitment to the nursing and healthcare fields. What inspired you? What are your ambitions? What do you aim to achieve in your future?</p>
              </Rich>
            ),
          },
          {
            title: 'Some key topics you may be asked to cover',
            content: (
              <Rich depth={1}>
                <h4>Financial hardship</h4>
                <p>Evidence may include (but is not limited to): holders of a Health Care Card, youth allowance, pension, or alternatively, you may provide recent income assessment or salary slips. If you are comfortable, share your story. Focus on your goals and how you plan to overcome challenges to succeed.</p>
                <h4>Educational disadvantage</h4>
                <p>Evidence may include relocation from a regional/rural area, study delay due to family responsibilities or illness, being an English language learner, a disability, or a medical condition.</p>
                <h4>Leadership potential / Commitment to community</h4>
                <p>What experience have you had that demonstrates your leadership or community service skills? Be specific when you describe this—qualify it with details, dates, role, and impact.</p>
                <h4>Benefits of receiving the scholarship</h4>
                <p>Think about how the financial support will help: Would you still need a part-time job? Could you focus more on your studies, get involved in student life, or do community work? What opportunities might open up with this support?</p>
              </Rich>
            ),
          },
          {
            title: 'Written references',
            content: (
              <Rich depth={1}>
                <p>You may be required to submit at least two references:</p>
                <h4>Academic reference:</h4>
                <p>Someone competent to comment on your capacity to undertake study (e.g., school teacher, training provider).</p>
                <h4>Character reference:</h4>
                <p>Someone who knows you outside of family and can comment on your suitability for the scholarship (employer, community leader).</p>
                <p><strong>Important:</strong> References must be recent (within the last 12 months) and from people not related to you.</p>
              </Rich>
            ),
          },
        ]}
      />
      <EnquiryForm formKey="scholarship" heading="Scholarship Enquiry" anchorId="scholarship-enquiry" />
      <Cta
        variant="banner"
        heading="Contact us"
        body="If you have any questions about the scholarship or application process, email enquiry@ihna.edu.au or call 1800 22 52 83."
        links={[
          { label: 'Contact Admissions', href: 'mailto:enquiry@ihna.edu.au', style: 'primary' },
          { label: 'Apply for the Scholarship', href: '#scholarship-enquiry', style: 'secondary' },
        ]}
      />
    </>
  )
}
