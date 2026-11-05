// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Link, PriceList, Rich, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Fees, Charges and Refund',
  path: '/ihna-fees-charges/',
  description: 'The following fees are provided as a general guide only. Tuition fees are correct at time of publication and subject to change without prior notice…',
})

export default function IhnaFeesChargesRoute() {
  return (
    <>
      <Hero heading="IHNA Fees, Charges and Refund" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/ihna-fees-charges.webp', alt: 'Smiling student with a clipboard', width: 524, height: 655 })} />
      <SectionNav section="current-student" current="/ihna-fees-charges/" />
      <Rich>
        <p>The following fees are provided as a general guide only. Tuition fees are correct at time of publication and subject to change without prior notice. Individual course fees are listed under each course.</p>
        <p>Students may be eligible for government funding. Enrolling in this qualification and availing the relevant state funding, may affect student’s future training options and the eligibility for further government subsidised training. “The Student tuition fees are indicative only and are subject to change given individual circumstances at enrolment. Additional fees may apply such as Student service and resource fees”.</p>
        <p>IHNA has a range of interest-free payment plans to choose from.</p>
        <p>Please speak to an admissions consultant to know more.</p>
        <h2>Links</h2>
        <ul>
          <li><Link href="/domestic-fees-schedule/">IHNA Fees Schedule : Full fee paying students</Link></li>
          <li><Link href="/international-fees-schedule/">IHNA Fees Schedule : International students</Link></li>
          <li><Link href="/funding-fees-schedule/">IHNA Fees Schedule : Funding students</Link></li>
          <li><Link href="/pay-online/">Make a Payment</Link></li>
          <li><a href="https://forms.office.com/Pages/ResponsePage.aspx?id=niM6_UBfsk2J5NeaEQ7oOFmmKKloVyxJpS4vzUa0I5FUREZCOVlITUY2MVYwSjYwV1NFVEM0NVJESC4u&amp;embed=true" rel="noopener noreferrer">Apply for Refund</a></li>
        </ul>
      </Rich>
      <Rich tone="muted" spacing="compact">
        <h2>Indicative Additional (Non-Tuition) Costs</h2>
        <p>These are <strong>non-tuition costs</strong> students may need to pay during their course. <strong>Amounts are indicative only and may change or vary</strong> by location/provider. Where applicable, some fees are <strong>non-refundable.</strong></p>
      </Rich>
      <PriceList
        tone="muted"
        groups={[
          {
            title: 'Materials & Compliance',
            rows: [
              { label: 'Books and study materials:', amount: '$700', note: '(for the entire course)' },
              { label: 'Uniforms and shoes:', amount: '$150', note: '(per year)' },
              { label: 'Vaccination costs:', amount: '$250' },
              { label: 'Police check:', amount: '$56', note: '(fees may change—please refer to the AFP website)' },
              { label: 'Working with Children Check (WWCC):', amount: 'No cost', note: 'for volunteer WWCC' },
              { label: 'NDIS Worker Screening Check:', amount: 'approx. $135' },
            ],
          },
          {
            title: 'Other Administrative Charges',
            rows: [
              { label: 'Late payment of tuition fees/payment plan late fee penalty:', amount: '$200' },
              { label: 'Re-issuance of student ID:', amount: '$25' },
              { label: 'Re-issuance of certificate, statement of attainment and/or record of results:', amount: '$50' },
              { label: 'Course extension:', amount: '$50', note: '(per month)' },
              { label: 'Placement administration fee:', amount: '$200', note: '(per semester)' },
              { label: 'Redo professional experience placement fee:', amount: '$750', note: '(per week)' },
            ],
          },
        ]}
      />
    </>
  )
}
