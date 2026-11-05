// The live RPL / credit transfer page (a server-only PHP page on live, linked from /domestic-students/), rewritten by hand from the
// live page on 2026-10-21. The eligibility form is `rpl-enquiry`; it answers at /rpl-and-credit-transfer/thanks/.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, EnquiryForm, Hero, Rich, SplitProse, Tabs, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'RPL | Recognition of Prior Learning',
  path: '/rpl-and-credit-transfer/',
  description: 'RPL (Recognition of Prior Learning) assesses your competency(s) that may have been acquired through formal, non-formal, and informal learning.',
})

export default function RplAndCreditTransferRoute() {
  return (
    <>
      <Hero
        heading="You have the experience? You deserve the *qualification*"
        subheading="Get qualified now: your success story starts here."
        variant="split" look="panorama"
        audienceSwitch={false}
        eyebrow="RPL and credit transfer"
        ctas={[{ label: 'Check eligibility', href: '#eligibility', style: 'primary' }]} image={img({ src: '/images/ihna/pages/rpl-and-credit-transfer.webp', alt: 'Experienced carer with an older woman', width: 480, height: 600 })} />
      <SplitProse eyebrow="RPL" heading="What is *RPL?*">
        <p>RPL (Recognition of Prior Learning) assesses your competency(s) that may have been acquired through formal, non-formal and informal learning or direct work experience to determine if you meet the required skills and knowledge specified in a training package or VET accredited courses.</p>
        <h3>Who can apply for RPL?</h3>
        <ul>
          <li>If you are over the age of 18 years of age or older with at least one year current, relevant working experience.</li>
          <li>If you have attained skills, knowledge and experience gained from working in the health industry.</li>
          <li>If you have any prior learning should have been acquired in one or more of the following ways: workplace learning, informal study for recreational/personal interest purposes, company/industry based training, working with experts, or life experience.</li>
          <li>If you have any experience or overseas qualification can get nationally recognised qualification.</li>
          <li>If you feel that your prior learning meets the prescribed requirements of the equivalent module offered by HCI. This could consequently earn you a module credit.</li>
          <li>If you feel you comply with all the admission requirements of the qualification for which you wish to apply for an RPL credit, please refer to course admission requirements to know more.</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow="Credit transfer" heading="What is Credit *Transfer?*" tone="muted">
        <p>Credit transfer applies where students have completed units of study at another TAFE College or Registered Training Organisation, including IHNA, that meet the requirements of another qualification or the applicable training package. Credit will be granted in accordance with the Certification, Issuing and Recognition of Qualifications and Statements of Attainment. There is no fee to assess a Credit Transfer.</p>
        <h3>Who can apply for CT?</h3>
        <ul>
          <li>If you have completed part, or all, of an accredited qualification.</li>
          <li>If you completed an accredited qualification but have not been practising recently or your accreditation has expired.</li>
          <li>If you feel you comply with all the admission requirements of the qualification for which you wish to apply for an CT, please refer to course admission requirements to know more.</li>
        </ul>
      </SplitProse>
      <Tabs
        tabs={[
          {
            label: 'Benefits',
            content: (
              <Rich depth={1}>
                <h3>If your RPL application is successful:</h3>
                <ul>
                  <li>You do not have to attend any training in knowledge and skills you already possess</li>
                  <li>You can save time, by either not needing to attend any training sessions or attending a reduced number of classes to address the identified gap training requirements</li>
                  <li>You can complete your qualification in a comparatively shorter time</li>
                </ul>
                <h3>If your CT is successful:</h3>
                <ul>
                  <li>You’ll save money on the units that were already done.</li>
                  <li>You will save time on the subjects that were a part of your previous qualification.</li>
                </ul>
              </Rich>
            ),
          },
          {
            label: 'Process',
            content: (
              <CardGrid
                depth={1}
                columns="4"
                variant="grid"
                cards={[
                  { title: 'Complete free RPL/CT assessment', body: 'Speak to our experts and share the qualification and work experience you have achieved to get an RPL assessment' },
                  { title: 'Review by RPL/CT Assessment team', body: 'Your documents will be reviewed by our team' },
                  { title: 'Book an appointment with our RPL/CT coordinator', body: 'Online meeting scheduled for a conversation with our course coordinator' },
                  { title: 'Complete enrolment and get qualified', body: 'Get access to your student portal and start learning!' },
                ]}
              />
            ),
          },
          {
            label: 'Evidence for RPL',
            content: (
              <Rich depth={1}>
                <p>The following documents could be submitted to support your RPL application:</p>
                <ul>
                  <li>A resume or notes about where they have worked, either paid or unpaid, and what they did there</li>
                  <li>Position descriptions and any performance appraisals from the last two years</li>
                  <li>Certificates from in-house training or formal training you have undertaken</li>
                  <li>Statement of attainment</li>
                  <li>Photographs or videos of work undertaken</li>
                  <li>Professional development logbook from the workplace</li>
                  <li>Reference letters from the workplace supervisors, employers and colleagues</li>
                  <li>Industry awards</li>
                  <li>Workplace forms and checklists completed by you</li>
                  <li>Any other documentation you could provide to support your claim</li>
                </ul>
                <p>Remember that the evidence you provide will vary with the units of competency. The self-evaluation checklist for each unit of competency will identify a list of supportive documents you could provide.</p>
                <h3>Confidentiality issues</h3>
                <ul>
                  <li>Do not include any confidential and sensitive information in the supportive evidence you provide, e.g. client’s name and personal particulars or an organisation’s financial figures. You could delete or black out this information or make it unidentifiable</li>
                  <li>Seek permission from your workplace supervisor prior to submitting any workplace documentation as part of your RPL process</li>
                </ul>
              </Rich>
            ),
          },
          {
            label: 'Evidence for CT',
            content: (
              <Rich depth={1}>
                <p>List of evidence you could provide to submit your CT application:</p>
                <ul>
                  <li>AQF certification documentation issued by any other RTO or</li>
                  <li>AQF authorised issuing organisation or</li>
                  <li>Authenticated VET transcripts issued by the Registrar.</li>
                </ul>
              </Rich>
            ),
          },
          {
            label: 'Tips & Hints',
            content: (
              <Rich depth={1}>
                <h3>Tips and Hints to Prepare for RPL</h3>
                <p>Our assessors must make sure you have the skills and knowledge to meet the industry standards. This means you must be involved with us in a comprehensive quality process that covers the content of the qualification you want to be recognised for.</p>
                <p>Assessment will happen in a variety of ways and being prepared can save you valuable time and also make the recognition process stress-free for you. Here are some tips and hints for you to consider:</p>
                <ul>
                  <li>Be prepared to talk about your current job roles and your work history particularly if you are not currently employed. Hopefully, you have provided some details on your application form about where you have worked, either paid or unpaid and what tasks you performed there. These will make a good starting point and put you at ease with the RPL process.</li>
                  <li>If you have a position description, and even though you may not be able to bring it with you, be prepared to talk about the responsibilities and duties you have in your current role.</li>
                  <li>If you are in a workplace that is supporting your application to get qualified, be prepared to discuss the opportunity for your assessor to contact your workplace or previous workplace so your skills can be confirmed by someone that works or has worked with you.</li>
                  <li>You may also have community contacts from unpaid or volunteer work you have done that may not appear to be related to this application, but you will be surprised at how far our assessors will go to find evidence to support your claim.</li>
                  <li>In-house training conducted by in-house staff or suppliers to your industry or service area is generally of high quality. Be prepared to talk about any opportunities you have had in this area, and if you were issued with a certificate for your attendance at the training bring it with you for your interview.</li>
                  <li>Be prepared to discuss with your IHNA assessor about other ways you can demonstrate your skills, for example if you have any references from employers or diary notes from when you attended in-house training or trade shows. Sometimes even photographs of projects you have worked on that you can use to ‘trigger’ discussion with your assessor may be valuable contributors to your assessment.</li>
                </ul>
                <p>Other items or documents, if you have them readily available, you should consider supplying copies of with your application may include but not be limited to:</p>
                <ul>
                  <li>Any licences or tickets held, e.g. forklift, working with children, etc.</li>
                  <li>Brief CV or work history</li>
                  <li>Job Safety Analysis (JSA) that you may have completed</li>
                  <li>Certificates - supplier training courses, in house courses, workshops, seminars</li>
                  <li>Certificates - club courses e.g. first aid, surf lifesaving, etc.</li>
                  <li>Photographs or DVDs of work undertaken</li>
                  <li>Technical drawings or site plans you have worked with</li>
                  <li>Workplace inductions</li>
                  <li>Performance appraisals</li>
                  <li>Membership of relevant associations</li>
                  <li>Hobbies, interests outside of work</li>
                  <li>References or letters from previous employers or supervisors</li>
                  <li>Any other documentation that may demonstrate industry experience</li>
                </ul>
              </Rich>
            ),
          },
        ]}
      />
      <EnquiryForm formKey="rpl-enquiry" heading="Eligibility Check" anchorId="eligibility" />
    </>
  )
}
