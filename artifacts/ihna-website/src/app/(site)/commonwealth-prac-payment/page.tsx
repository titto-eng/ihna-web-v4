// Ported by hand from the old template (template-commonwealth-prac-payment.php; the page's WordPress body is not rendered there).
// The template's header/footer images and its local video are not carried over (theme assets; see the PORTAL+PAYMENTS hand-over).
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich, SplitProse, Tabs, img } from '@/components/page'

const CPP = 'https://yourcareer.gov.au/cpp'

export const metadata: Metadata = pageMetadata({
  title: 'Commonwealth Prac Payment', // the live page title (parity)
  path: '/commonwealth-prac-payment/',
  description: 'Diploma of Nursing students may be eligible for the Commonwealth Prac Payment (CPP) while they complete their mandatory prac placements.',
})

export default function CommonwealthPracPaymentRoute() {
  return (
    <>
      <Hero heading="Commonwealth Prac Payment (VET) now available!" variant="split" look="panorama" audienceSwitch={false} image={img({ src: '/images/ihna/pages/commonwealth-prac-payment.webp', alt: 'Nursing student on placement', width: 1000, height: 1250 })} />
      <SplitProse eyebrow="Commonwealth Prac Payment" heading="Support while you *train*">
        <p>
          Diploma of Nursing students may be eligible to receive the Commonwealth Prac Payment (CPP) in vocational education and training (VET).
          Eligible students are entitled to receive over $300 per week.
        </p>
        <p>The CPP (VET) is a new payment to help with the cost of living while students undertake 400 hours of mandatory prac placements to qualify as an Enrolled Nurse.</p>
        <p>Applications are now open. Learn more at <a href={CPP}>yourcareer.gov.au/cpp</a>.</p>
      </SplitProse>
      <Tabs
        tone="muted"
        tabs={[
          {
            label: 'Who can apply?',
            anchorId: 'who-can-apply',
            content: (
              <Rich depth={1}>
                <p>The CPP (VET) is for eligible Diploma of Nursing students.</p>
                <p>Eligible Diploma of Nursing students will need to:</p>
                <ul>
                  <li>be a domestic student</li>
                  <li>be undertaking a full-time mandatory prac placement of a minimum average of 30 hours or more per week</li>
                  <li>
                    and either:
                    <ul>
                      <li>
                        receive an eligible income support payment (like Youth Allowance, Austudy, ABSTUDY, Disability Support Pension or some Department of
                        Veterans Affairs (DVA) income support payments). You can see a full list in the CPP (VET) Guidelines, or
                      </li>
                      <li>
                        be working at least 60 hours on average over a continuous 4-week period (e.g. average of more than 15 hours per week) during the most
                        recent study period before applying (that is, not during holidays) and not earn more than the applicable weekly income threshold (before
                        tax) during that time.
                      </li>
                    </ul>
                  </li>
                </ul>
                <p>For more detailed information about eligibility requirements view the <a href={CPP}>CPP (VET) Guidelines</a>.</p>
              </Rich>
            ),
          },
          {
            label: 'How to apply?',
            anchorId: 'how-to-apply',
            content: (
              <Rich depth={1}>
                <p>The CPP (VET) will be available to eligible Diploma of Nursing students for prac placement hours on or after 1 July 2025.</p>
                <p>Applying is easy.</p>
                <h3>Gather your evidence</h3>
                <p>As part of your application, you will need to provide evidence to prove your eligibility. We recommend having these documents ready before you start your application.</p>
                <p>Evidence may include:</p>
                <ul>
                  <li>Australian citizenship (for example, birth certificate, passport)</li>
                  <li>enrolment in a Diploma of Nursing</li>
                  <li>prac placement dates (for example, placement agreement, screenshot from InPlace)</li>
                  <li>income or income support payments (for example, a payslip or confirmation of your income support payment).</li>
                </ul>
                <p>You will also need to complete a declaration stating that the information provided by you is true and correct at the date of the declaration.</p>
                <h3>Log in to the portal</h3>
                <ol>
                  <li>Navigate to the <a href="https://portal.yourcareer.gov.au/profile">Your Career portal</a>. You will be taken to the myGov sign in page.</li>
                  <li>Sign into myGov to log in to the Your Career portal for the first time.</li>
                  <li>Create a Your Career portal profile. Now, you can use your myGov details to log in any time to manage your CPP (VET) applications and payments.</li>
                  <li>Once you have logged in, you can start your application and save it at any time to complete later.</li>
                  <li>You can also link Your Career to your myGov account to access the Your Career portal.</li>
                </ol>
                <h3>Assessment outcome</h3>
                <p>The Department of Employment and Workplace Relations will assess your application, and you will get an email letting you know the outcome.</p>
                <h3>Remember</h3>
                <p>
                  If you get an income support payment from Services Australia or DVA, you must tell them you are going to get the CPP (VET). You should do
                  this as soon as you know the dates of your prac placement. Learn about when and how to report at the{' '}
                  <a href="https://www.servicesaustralia.gov.au/">Services Australia website</a>.
                </p>
              </Rich>
            ),
          },
          {
            label: 'Need more info?',
            anchorId: 'need-more-info',
            content: (
              <Rich depth={1}>
              <ul>
                <li><a href={CPP}>CPP (VET) FAQs</a>: answers to common questions about eligibility, applications, and payments</li>
                <li><a href={CPP}>CPP (VET) resources</a>: guides and tools to help students apply, including step-by-step guidance for submitting applications</li>
                <li><a href={CPP}>CPP (VET) eligibility checker</a>: a quick tool to assess eligibility before beginning an application</li>
              </ul>
              </Rich>
            ),
          },
        ]}
      />
    </>
  )
}
