// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, Link, Panels, Pic, ProgramPicker, Rich, Table, Tabs } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'About Funding',
  path: '/about-funding/',
  description: 'The Skills First Program is the way that training providers are contracted in Victoria to deliver government-subsidised training to individuals.',
})

export default function AboutFundingRoute() {
  return (
    <>
      <Hero heading="About Funding" eyebrow="Funding" variant="compact" audienceSwitch={false} />
      {/* the three funding programs at a glance; each opens its tab below */}
      <ProgramPicker
        items={[
          { label: 'Skills First Program', region: 'Victoria', href: '#prog1' },
          { label: 'DTWD Funded Training', region: 'Western Australia', href: '#prog2' },
          { label: 'Smart and Skilled Funding', region: 'New South Wales', href: '#prog6' },
        ]}
      />
      <Tabs
        variant="pill"
        tabs={[
          {
            label: 'Skills First Program',
            anchorId: 'prog1',
            content: (
              <Panels>
                <Rich depth={1}>
                  <h3>Skills First Program*</h3>
                  <p>The Skills First Program is the way that training providers are contracted in Victoria to deliver government-subsidised training to individuals.</p>
                  <p><strong>*Skills First funding is currently unavailable for 2026</strong>. We will update this page when new funding places open. In the meantime, please review the eligibility guidelines below and submit an inquiry for assistance with available study options.</p>
                  <h4>Eligibility Guidelines</h4>
                  <p>Citizenship/residency</p>
                  <p>A student must be either:</p>
                  <ol>
                    <li>an Australian citizen</li>
                    <li>a holder of a permanent visa, or</li>
                    <li>a New Zealand citizen</li>
                  </ol>
                  <p>Physically present in Victoria or a border region</p>
                  <p>A student must be undertaking all training and assessment while physically present in:</p>
                  <ol>
                    <li>the State of Victoria; or</li>
                    <li>a border region with one of the following postcodes:</li>
                  </ol>
                </Rich>
                <Table rows={[
                  ['NSW', 'SA'],
                  ['2546', '5262,5263'],
                  ['2548 – 2551', '5267 – 5272'],
                  ['2625 – 2633', '5277 – 5279'],
                  ['2640 – 2648', '5290, 5291'],
                  ['2650, 2651, 2653, 2655, 2656', '5302 – 5304'],
                  ['2658 – 2660', '5311, 5333, 5340'],
                  ['2700, 2707', '5342 – 5345'],
                  ['2710 – 2717', ''],
                  ['2720', ''],
                  ['2730 – 2739', ''],
                ]} variant="striped" headerRow={true} depth={1} />
                <Rich depth={1}>
                  <p>The ‘2 Skill Sets in a year’ and ‘2 AQF qualifications in a year’ limits</p>
                  <ol>
                    <li>In a calendar year, a student may only commence a maximum of 2:</li>
                    <li>Skills First subsidised Skill Sets; and</li>
                    <li>Skills First subsidised programs that are AQF qualifications</li>
                  </ol>
                  <p>The following scenario Do not count the following when determining if a student meets these limits:</p>
                  <ol>
                    <li>transitioning from a superseded program to the current version of the same program;</li>
                    <li>recommencing training in the same program (at either the same or a different provider);</li>
                    <li>enrolling in an Apprenticeship (not Traineeship) after having participated in one of the programs identified as a ‘Pre-Apprenticeship and Pathway Program’ on the Funded Programs Report;</li>
                    <li>participation in ‘22510VIC – Course in Identifying and Responding to Family Violence Risk’; or</li>
                    <li>participation in Literacy and Numeracy Support Units.</li>
                  </ol>
                  <p>The ‘2 at a time’ limit</p>
                  <ol>
                    <li>A student may only commence a maximum of 2 Skills First subsidised programs at any one time.</li>
                    <li>
                      Do not count the following when determining if a student meets this limit:
                      <ol>
                        <li>22510VIC – Course in Identifying and Responding to Family Violence Risk’; or</li>
                        <li>Literacy and Numeracy Support Units</li>
                      </ol>
                    </li>
                  </ol>
                  <p>ASYLUM SEEKER VET PROGRAM</p>
                  <p><strong>Program settings</strong></p>
                  <p>You may exempt an individual from the citizenship/permanent residence eligibility criterion (as set out in Clause 2.2(a) of this Schedule 1) if they:</p>
                  <p>a) either:</p>
                  <ul>
                    <li>are referred to training via the Asylum Seeker Resource Centre or the Australian Red Cross Victims of Human Trafficking Program and they present a ‘Referral to Government Subsidised Training – Asylum Seekers’ form;</li>
                    <li>hold, or are a dependant of an individual who holds, a valid humanitarian, protection or refugee visa;</li>
                    <li>hold a bridging visa and have lodged an application for a humanitarian, protection or refugee visa; or</li>
                    <li>hold a bridging visa and have lodged an application under section 417 or section 48B of the Migration Act 1958 (Cth) which is yet to be determined; and</li>
                  </ul>
                  <p>b) have study and if relevant, work rights.</p>
                  <p>To know more about eligibility please refer to the <a href="https://content.vic.gov.au/sites/default/files/2024-01/20231102-eligibility.pdf" rel="noopener noreferrer">eligibility document</a>.</p>
                  <h4>Fees</h4>
                  <p>These guidelines describe the requirements about tuition fees and other fees associated with Skills First training, and the financial and accountability requirements for fees.</p>
                  <p>To know more about the fees, please refer to the <a href="https://content.vic.gov.au/sites/default/files/2024-01/20231129-fees.pdf" rel="noopener noreferrer">fee document</a>.</p>
                  <h4>Skills First quality charter</h4>
                  <p>This charter explains what the department expects from training providers in their provision of key aspects of training services under the contract.</p>
                  <p>To know more please <a href="https://content.vic.gov.au/sites/default/files/2023-08/2023_Skills-_First_Quality_Charter.pdf" rel="noopener noreferrer">click here</a>.</p>
                </Rich>
              </Panels>
            ),
          },
          {
            label: 'DTWD Funded Training',
            anchorId: 'prog2',
            content: (
              <Panels>
                <Rich depth={1}>
                  <h3>DTWD Funded Training*</h3>
                  <p>*The Western Australia Government offers a range of course at reduced fees under the Lower fees, local skills initiative.</p>
                  <p>Jobs and Skills WA provides a subsidised training place for eligible students enrolled in courses that are deemed State priority qualifications, where a training place is available.</p>
                  <p>Types of Funding:</p>
                  <ol>
                    <li>PARTICIPATION WORK READINESS (PWR)- Jobseeker</li>
                  </ol>
                  <p>The Participation Program focuses on the delivery of training for those sections of the population that are under-represented in the workforce and face barriers to mainstream training arrangements.</p>
                  <ol>
                    <li>PRIORITY INDUSTRY TRAINING (PIT) – Existing Worker</li>
                  </ol>
                  <p>This program focuses on making available a range of qualifications that address priority industry needs of the State through a non employment-based training pathway.</p>
                  <p>This program has two target groups, jobseekers and existing workers. The qualifications offered may be delivered in any region throughout WA for both target groups.</p>
                  <h4>Jobs and Skills WA Funded programs*</h4>
                  <p><Pic src="/images/ihna/theme/perth-wa/wa-funding-logos.png" alt="Jobs and Skills WA, Skills Ready and Lower Fees Local Skills logos" width={1600} height={239} /></p>
                  <ul>
                    <li><Link href="/courses/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care/">HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care)</Link></li>
                    <li><Link href="/courses/certificate-iii-in-sterilisation-services/">HLT37015 – Certificate III in Sterilisation Services</Link></li>
                    <li><Link href="/courses/certificate-iii-pathology-collection/">HLT37215 – Certificate III in Pathology Collection (superseded)</Link></li>
                    <li><Link href="/courses/diploma-of-nursing/">HLT54121 – Diploma of Nursing</Link></li>
                    <li><Link href="/courses/certificate-iii-in-individual-support-ageing-and-disability/">CHC33021 – Certificate III in Individual Support (Ageing and Disability)</Link></li>
                  </ul>
                  <p>This training is delivered under the Jobs and Skills WA program.</p>
                  <p>The Student tuition fees are indicative only and are subject to change given individual circumstances at enrolment. Additional fees may apply such as resource fees and other fees.</p>
                  <p>Refer to the ‘DTWD Funded Training’ eligibility guidelines to check your funding eligibility. <a href="https://www.wa.gov.au/organisation/department-of-training-and-workforce-development" rel="noopener noreferrer">Click here</a></p>
                  <p>*Western Australia funded seats are subject to availability and approval</p>
                  <h4>Eligibility Guidelines</h4>
                  <p>Citizenship/residency</p>
                  <p>A student must be a resident of Western Australia and must meet one of the below residency requirements for fee charging purposes, and is also eligible for fee waivers and concessions:</p>
                  <ol>
                    <li>an Australian citizen</li>
                    <li>a holder of a permanent visa, or</li>
                    <li>Hold a Humanitarian Visa</li>
                    <li>
                      Temperory Residents Persons holding one of the following visa types are to be treated as Australian residents for fee charging purposes and are also eligible for fee waivers and concessions:
                      <ul>
                        <li>holders of a sub-class 300, 309, 444, 445, 449, 461, 785, 786, 790, or 820 visa;</li>
                        <li>secondary holders of a temporary visa of sub-class 188, 457, 482, 489, 491 or 494 visa;</li>
                        <li>holders of a Bridging Visa E (subclasses 050 and 051) where the visa holder has made a valid application for a visa of subclass 785 or 790;</li>
                        <li>holders of a bridging visa who are eligible to work, and who have made a valid application for a subclass 866.</li>
                      </ul>
                    </li>
                  </ol>
                  <p>PARTICIPATION WORK READINESS (PWR)- Jobseeker</p>
                  <p>To be eligible for the program, students must be unemployed or under-employed and able to access mainstream training. Students must:</p>
                  <ol>
                    <li>have a written referral from an Approved Participation Referral Agent for Job Seekers, or</li>
                    <li>be referred by themselves; another agency or recruited by the Service Provider. Refer Section 7.1 for more information regarding Participation Referral Agents</li>
                  </ol>
                  <p>PRIORITY INDUSTRY TRAINING (PIT) – Existing Worker</p>
                  <p>Students must not have an active apprenticeship/traineeship training contract registered on WAAMS.</p>
                  <ul>
                    <li>Training provided to Students equates to face–to-face training of at least 50% of the contracted nominal hours for Job Seekers</li>
                    <li>Existing Worker is defined as an individual working 20 hours or more a week with a single or multiple employer.</li>
                    <li>Employment Type must be Full Time or Part Time</li>
                  </ul>
                  <p>For more information, Visit <a href="https://www.dtwd.wa.gov.au/" rel="noopener noreferrer">https://www.dtwd.wa.gov.au/</a></p>
                  <p>Not Eligible for Funding?</p>
                  <p>IHNA offers a range of payment plans to help you with your course fees. Call our admissions team today to know more.</p>
                </Rich>
              </Panels>
            ),
          },
          {
            label: 'Smart and Skilled Funding',
            anchorId: 'prog6',
            content: (
              <Panels>
                <Rich depth={1}>
                  <h3>Smart and Skilled Funding*</h3>
                  <p><strong>Important notice — Smart and Skilled funding update</strong><br />Our Smart and Skilled funding allocation is currently reserved for continuing students only. New student enrolments under this funding stream are not available at this time.</p>
                  <p>*Smart and Skilled provides eligible students with access to Government subsidised training in NSW. This includes an entitlement for all NSW citizens to undertake Apprenticeship and Traineeship training.</p>
                  <p>IHNA is an Approved Smart and Skilled Provider operating under the NSW Smart and Skilled Terms and Conditions and Operating Guidelines.</p>
                  <p>This training is subsidised by the NSW Government.</p>
                  <p>For more information, visit the official NSW Smart and Skilled website:</p>
                  <ul>
                    <li><a href="https://www.nsw.gov.au/education-and-training/vocational/funding" rel="noopener noreferrer">https://www.nsw.gov.au/education-and-training/vocational/funding</a></li>
                    <li><a href="https://skills.education.nsw.gov.au" rel="noopener noreferrer">https://skills.education.nsw.gov.au</a></li>
                  </ul>
                  <h4>AQF Qualifications</h4>
                  <p>Courses available under Smart and Skilled Funding at IHNA (subject to seat availability and NSW Government approval):</p>
                </Rich>
                <Table rows={[
                  ['Course Code', 'Qualification Name'],
                  ['HLT37525', 'Certificate III in Pathology Collection'],
                  ['HLT33115', 'Certificate III in Health Services Assistance (Assisting in Nursing Work in Acute Care)'],
                  ['CHC33021', 'Certificate III in Individual Support (Ageing and Disability)'],
                ]} variant="striped" headerRow={true} depth={1} />
                <Rich depth={1}>
                  <p>Note: The NSW Skills List provides the nationally accredited qualifications and courses that eligible students may undertake. The schedule of fees for each qualification can be accessed at: <a href="https://www.nsw.gov.au/education-and-training/vocational/funding/smart-skilled-fees" rel="noopener noreferrer">https://www.nsw.gov.au/education-and-training/vocational/funding/smart-skilled-fees </a></p>
                  <h4>Student Contribution and Fees</h4>
                  <p>Under Smart and Skilled, a student contributes towards the cost of training through the payment of a student fee. There are different categories of student fees based on the program, the qualification, and the characteristics of the student.</p>
                  <p><strong>Some students may be eligible for fee-free training or a concession fee.</strong></p>
                  <p>The Smart and Skilled Fee Administration Policy provides detailed guidance on fee arrangements and eligibility requirements for fee-free training or fee concessions.</p>
                  <p><a href="https://www.nsw.gov.au/sites/default/files/2023-05/fee-administration-policy-1-jul-23-to-30-jun-24.pdf" rel="noopener noreferrer">Smart and Skilled Fee Administration Policy</a></p>
                  <p><strong>Important — Student Fee Transparency</strong><br />IHNA cannot suggest or allow any misunderstanding that Smart and Skilled training is ‘free of charge’, discounted, or subsidised by IHNA or any third party. Training is subsidised by the NSW Government only.</p>
                  <h4>Enrolment Process</h4>
                  <p>To enrol in a Smart and Skilled subsidised course at IHNA, prospective students must complete the following steps:</p>
                  <ol>
                    <li>Check your eligibility using the eligibility criteria below.</li>
                    <li>Contact IHNA’s admissions team on 1800 22 52 83 or email <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a>.</li>
                    <li>
                      Complete the Notification of Enrolment form, which includes:
                      <ul>
                        <li>Personal consent and declarations</li>
                        <li>Evidence of eligibility (citizenship, residency, USI)</li>
                        <li>Credit Transfer application (if applicable)</li>
                        <li>Recognition of Prior Learning (RPL) application (if applicable)</li>
                      </ul>
                    </li>
                    <li>Provide all required documentation (see Acceptable Evidence table below).</li>
                    <li>Obtain your Unique Student Identifier (USI) — see below.</li>
                    <li>IHNA will submit the Notification of Enrolment into the STS online portal once documentation is verified.</li>
                  </ol>
                  <p>For full enrolment details and required forms, visit: <Link href="/how-to-apply/">How to Apply — IHNA Website</Link></p>
                  <h4>Unique Student Identifier (USI)</h4>
                  <p>All students must have a valid Unique Student Identifier (USI) before they can be enrolled in any nationally accredited training, including Smart and Skilled funded courses.</p>
                  <p>A USI is a reference number made up of 10 numbers and letters that gives you access to your online USI account. You must provide your USI at the time of enrolment and it will be verified by IHNA.</p>
                  <p><strong>How to create your USI:</strong></p>
                  <ul>
                    <li>Visit the official USI website: <a href="https://www.usi.gov.au/" rel="noopener noreferrer">usi.gov.au</a></li>
                    <li>You will need at least one form of approved ID (e.g. Australian passport, driver’s licence, Medicare card).</li>
                    <li>Your USI can be created in minutes and is free of charge.</li>
                    <li>Keep your USI safe — you will need it for any future training or qualifications.</li>
                  </ul>
                  <p><a href="https://www.usi.gov.au/" rel="noopener noreferrer">Create or find your USI — usi.gov.au</a></p>
                  <h4>Recognition of Prior Learning (RPL) and Consumer Protection</h4>
                  <h4>Recognition of Prior Learning (RPL)</h4>
                  <p>RPL is an assessment process that assesses competency acquired through formal training, work experience, or other life experiences. If you believe you already have the knowledge and skills required for a unit, you may be eligible to apply for RPL and receive credit towards your qualification.</p>
                  <p>To apply for RPL, contact IHNA’s admissions team at the time of enrolment. Evidence will be assessed against the requirements of the relevant qualification.</p>
                  <h4>Credit Transfer</h4>
                  <p>Credit transfer recognises learning achieved through formal qualifications previously completed at IHNA or another Registered Training Organisation (RTO). If you have completed relevant units of competency, you may be eligible to receive credit, which may reduce the overall duration and cost of your course.</p>
                  <h4>Consumer Protection</h4>
                  <p>IHNA operates in accordance with the Standards for Registered Training Organisations (RTOs) 2015 and the Australian Consumer Law. Students have the right to:</p>
                  <ul>
                    <li>Accurate and transparent information about courses, fees, and enrolment processes.</li>
                    <li>Lodge a complaint or appeal through IHNA’s formal complaints process.</li>
                    <li>Seek assistance from the Australian Skills Quality Authority (ASQA) if concerns are not resolved.</li>
                    <li>Access the National Training Complaints Hotline: 13 38 73.</li>
                  </ul>
                  <h4>IHNA Policies and Procedures</h4>
                  <p><Link href="/policies-links-forms/">IHNA Policies and Procedures</Link></p>
                  <h4>Additional Support for Students</h4>
                  <p>IHNA is committed to supporting students who may face barriers to education and training. Additional support is available for:</p>
                  <ul>
                    <li>Students with disability or additional learning needs</li>
                    <li>Aboriginal and Torres Strait Islander students</li>
                    <li>Students from low-income backgrounds</li>
                    <li>Students requiring Language, Literacy and Numeracy (LLN) support</li>
                    <li>Students experiencing financial hardship</li>
                  </ul>
                  <h4>Language, Literacy and Numeracy (LLN) Support</h4>
                  <p>Prior to enrolment, IHNA assesses each student’s LLN skills to identify any support needs. Students who require additional assistance will be referred to appropriate support services or resources.</p>
                  <h4>Fee Concessions</h4>
                  <p>Eligible students may be entitled to concession fees under Smart and Skilled. Concession eligibility is assessed at the time of enrolment and is determined in accordance with the Smart and Skilled Fee Administration Policy.</p>
                  <h4>Aboriginal and Torres Strait Islander Students</h4>
                  <p>IHNA warmly encourages Aboriginal and Torres Strait Islander students to study with us. Culturally responsive support and student services are available. Contact our admissions team to learn more about targeted support and fee arrangements.</p>
                  <h4>Eligibility Criteria for All Smart and Skilled Programs</h4>
                  <p>A person who is eligible to receive subsidised training in all Smart and Skilled Programs (except Smart and Skilled Entitlement Apprenticeships and Traineeships Program) is a person who, at the time of enrolment in a qualification or course on the NSW Skills List or a “short course” with a Smart and Skilled provider:</p>
                  <ul>
                    <li>(a) lives or works in NSW (determined by postcode of the usual place of residence or place of work); or</li>
                    <li>(b) is an Aboriginal or Torres Strait Islander student who does not live or work in NSW but lives in specific defined interstate NSW border areas (see Appendix 2: Defined interstate NSW border areas); and</li>
                    <li>
                      (c) is one of the following:
                      <ul>
                        <li>(i) an Australian citizen; or</li>
                        <li>(ii) a permanent Australian resident; or</li>
                        <li>(iii) a New Zealand citizen; or</li>
                        <li>(iv) a humanitarian visa holder or a partner visa holder whose sponsor is a humanitarian visa holder;</li>
                      </ul>
                    </li>
                    <li>(d) is aged 15 years or older; and</li>
                    <li>(e) is no longer in secondary education — except for registered home school students.</li>
                  </ul>
                  <p>A student must declare that the information they provide with regards to eligibility is true, accurate, complete and not misleading.</p>
                  <h4>Exceptions</h4>
                  <p>The following exceptions apply to the eligibility criteria above:</p>
                  <ul>
                    <li>If a person is approved or registered as an Existing Worker Trainee, they will not be eligible to receive Subsidised Training in a Smart and Skilled Qualification that is associated with the Training Contract for their existing worker traineeship, in relation to any Smart and Skilled Program.</li>
                    <li>The Department may allow a Smart and Skilled Provider to treat a person, who does not fit any of the above eligibility criteria, as being eligible to receive Subsidised Training under Smart and Skilled.</li>
                  </ul>
                  <h4>Acceptable Evidence</h4>
                  <p>The following table outlines the proof of eligibility requirements to access Smart and Skilled. All evidence must be able to be verified by IHNA. At the Department’s discretion, the Department may request that IHNA produce records for verification.</p>
                </Rich>
                <Table rows={[
                  ['Requirement', 'Acceptable Evidence', 'Evidence Requirement'],
                  ['Proof of identity', 'Unique Student Identifier (USI) The Provider must ensure validity of the USI.', 'Valid USI'],
                  ['Living or working in NSW', 'Living in NSW: any Commonwealth or NSW Government issued document providing evidence of living location. Working in NSW (if the student does not live in NSW): employer-issued document confirming employment in NSW.', 'Evidence sighted or collected by Provider'],
                  ['Australian citizen', 'Australian birth certificate; or Australian Passport; or Certificate of Australian Citizenship; or Green Medicare Card.', 'Evidence sighted or collected by Provider'],
                  ['New Zealand citizen', 'New Zealand birth certificate; or New Zealand Passport; or Green Medicare Card.', 'Evidence sighted or collected by Provider'],
                  ['Permanent Australian resident', 'Certificate of Evidence of Resident Status (CERS); or VEVO facility confirmation; or Green Medicare Card.', 'Evidence sighted or collected by Provider'],
                  ['Humanitarian visa holder / Partner visa holder', 'Relevant visa documentation; or ImmiCard (where appropriate). If on a Bridging Visa, a document from the Department of Home Affairs acknowledging the bridging visa is linked to a humanitarian visa application.', 'Evidence sighted or collected by Provider'],
                  ['Home school students', 'Copy of current certificate of home schooling registration, clearly indicating the period of registration.', 'Evidence sighted or collected by Provider'],
                  ['Date of Birth', 'USI Data', 'Valid USI'],
                  ['Registration as NSW apprentice or new entrant trainee', 'Training Contract identifier (TCID) number', 'Department system check against approved Training Contract'],
                  ['Year 10 Completion or Equivalent (if under 17)', 'Evidence that student has met school leaving age requirements', 'Student Declaration / Signature at enrolment'],
                  ['Postcode for an Aboriginal or Torres Strait Islander person who lives in defined interstate NSW border areas', 'Any Commonwealth or NSW Government or local council issued document providing evidence of living location', 'Student Declaration / Signature at enrolment'],
                ]} variant="striped" headerRow={true} depth={1} />
                <Rich depth={1}>
                  <p>Note: Where the evidence provided by the student is a copy of the original, the copy must be certified by an approved witness. A list of approved witnesses is available at the Commonwealth Attorney-General’s Department website: <a href="https://www.ag.gov.au/Publications/Pages/Statutorvdeclarationsignatorylist.aspx" rel="noopener noreferrer">www.ag.gov.au/Publications/Pages/Statutorvdeclarationsignatorylist.aspx</a></p>
                  <p>To know more about Smart and Skilled Fee administration policy <a href="https://www.nsw.gov.au/sites/default/files/2023-05/fee-administration-policy-1-jul-23-to-30-jun-24.pdf" rel="noopener noreferrer">click here</a></p>
                  <p>To learn about Smart and Skills Program in NSW <a href="https://www.nsw.gov.au/education-and-training/vocational/funding" rel="noopener noreferrer">Click here</a></p>
                  <h4>Further Information and Key Links</h4>
                  <ul>
                    <li><a href="https://www.nsw.gov.au/education-and-training/vocational/funding" rel="noopener noreferrer">NSW Government Smart and Skilled</a></li>
                    <li><a href="https://skills.education.nsw.gov.au" rel="noopener noreferrer">https://skills.education.nsw.gov.au</a></li>
                    <li><a href="https://www.nsw.gov.au/sites/default/files/2023-05/fee-administration-policy-1-jul-23-to-30-jun-24.pdf" rel="noopener noreferrer">Smart and Skilled Fee Administration Policy</a></li>
                    <li><a href="https://www.usi.gov.au/" rel="noopener noreferrer">Unique Student Identifier (USI)</a></li>
                    <li><Link href="/policies-links-forms/">IHNA Policies and Procedures</Link></li>
                    <li><Link href="/how-to-apply/">IHNA How to Apply</Link></li>
                    <li>National Training Complaints Hotline: 13 38 73 | Email: ntch@dewr.gov.au</li>
                    <li><a href="https://www.asqa.gov.au/" rel="noopener noreferrer">ASQA — Australian Skills Quality Authority</a></li>
                  </ul>
                </Rich>
              </Panels>
            ),
          },
        ]}
      />
      <Cta heading="Our team is here to help you with any questions you have, call us on 1800 22 52 83" links={[{ href: 'tel:1800225283', label: '1800 22 52 83', style: 'primary' }]} variant="banner" tone="sunrise" />
    </>
  )
}
