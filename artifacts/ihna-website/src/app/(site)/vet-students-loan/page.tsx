// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, Hero, Pic, Rich, Table, Tabs, Link } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'VET Student Loans',
  path: '/vet-students-loan/',
  description: 'The VET Student Loans program is an Australian Government loan program that helps eligible students enrolled in approved courses at diploma level or…',
})

export default function VetStudentsLoanRoute() {
  return (
    <>
      <Hero heading="VET Student Loans" variant="compact" audienceSwitch={false} />
      <Rich>
        <p><Pic src="/images/ihna/theme/vet.jpg" alt="VET Student Loans" width={400} height={143} /></p>
        <h2>What is VSL?</h2>
        <p>The VET Student Loans program is an Australian Government loan program that helps eligible students enrolled in approved courses at diploma level or above, at approved course providers pay their tuition fees. The loan has income-contingent repayment arrangements, which means you only need to make repayments if you are earning above the minimum repayment threshold. You can make voluntary repayments at any time.</p>
        <p>If you are an eligible student, the department may approve your VET Student Loan for an approved course. The department will pay your loan directly to IHNA. You will be responsible for any gap amount in the tuition fees, which are not covered by the loan. You will owe a debt to the Australian Government for the loan, which will be managed by the Australian Taxation Office (ATO).</p>
        <p>If you are eligible and accessing the VET STUDENT LOAN, Please refer to the VET Student Loans information booklet available at <a href="https://www.dewr.gov.au/vet-student-loans/vsl-student-manual" rel="noopener noreferrer">https://www.dewr.gov.au/vet-student-loans/vsl-student-manual</a> to understand your obligations for accessing and repayment of the loan. Be aware that a VET Student Loan is a loan from the Australian Government and will remain a personal debt until it is repaid to the Commonwealth, which you will have to begin repaying when you reach the compulsory repayment threshold.</p>
        <p>Your eligibility for the VET Student Loan is subject to approval from the Department. In case your application is not approved, you will be required to pay your course fees. Please contact your student support team for more details.</p>
        <h2>Find out if you’re eligible for a VET student loans and how to apply</h2>
      </Rich>
      <Tabs
        tabs={[
          {
            label: 'Eligibility',
            content: (
              <>
                <Rich depth={1}>
                  <p>To get a VET Student Loan, you must be an eligible student who is studying an approved course with an approved course provider. You must apply to the government using the approved form and must confirm your engagement and progression to continue to access the loan throughout your course.</p>
                  <p>Further details of eligibility are given below:</p>
                  <ul>
                  <li>You are an Australian citizen or a New Zealand Special Category Visa (SCV) holder who meets the long-term residency requirements, or a permanent humanitarian visa holder.</li>
                  <li>You have not exceeded the FEE-HELP limit.</li>
                  <li>You are enrolled with an approved course provider in an approved course and have enrolled in accordance with the application requirements.</li>
                  <li>You are studying the approved course primarily at a campus in Australia.</li>
                  <li>Your course meets the course requirements if it is:<ul>
                  <li>specified on the VET Student Loans (courses and loan caps) determination (the courses and loan caps determination); and</li>
                  <li>delivered by an approved course provider; and</li>
                  <li>a qualification for diploma, advanced diploma, graduate certificate or graduate diploma in the Australian Qualifications Framework.</li>
                  </ul>
                  </li>
                  <li>You have been assessed by your approved course provider as academically suited to undertake the approved course by either:<ul>
                  <li>providing your Australian Year 12 Certificate; OR</li>
                  <li>providing evidence of successful completion of an Australian Qualifications Framework Certificate IV or higher qualification (where the language of instruction is English); OR</li>
                  <li>displaying competence at Exit Level 3 in the Australian Core Skills Framework in both reading and numeracy through an approved Language, Literacy and Numeracy test.</li>
                  </ul>
                  </li>
                  </ul>
                  <p>In addition, your approved provider must reasonably believe you show competence in completing the course.</p>
                  <ul>
                  <li>You meet the Tax File Number (TFN) requirements.</li>
                  <li>You have a Unique Student Identifier (USI) or are otherwise exempt.</li>
                  <li>You have read the VET Student Loans information booklet</li>
                  <li>You have given the required documents to your approved course provider and submitted the loan application form by the first census day no less than two business days after enrolling.</li>
                  </ul>
                  Student Obligations<ul>
                  <li>You must provide your personal email and mailing address. All the information related to the vet student loan enrolment and vet student loan fee invoices will be sent to this email address, which is an important document that will include all the information about your vet student loan.</li>
                  <li>You will need to be aware of the census day(s) as this date is critical to getting a loan or withdrawing your enrolment.</li>
                  <li>If you are withdrawing from the course you must withdraw in writing before the census date to avoid incurring a debt.</li>
                  <li>A student engagement and progression requirement applies to your continued access to a vet student loan. A student engagement and progression requirement applies to your continued access to a VET Student Loan.</li>
                  <li>Be familiar with the IHNA policies and procedures relating to your study.</li>
                  <li>Aware of the complaint, appeal and withdrawal process.</li>
                  </ul>
                  Loan caps<ul>
                  <li>The Commonwealth Government has introduced loan caps for each VET student loan eligible course.</li>
                  <li>Eligible students will be entitled for loans up to the capped amount for their individual course enrolment.</li>
                  <li>IHNA course fee may exceed the capped VET student loan amount. In this instance you will be required to pay the difference by using the available payment option.</li>
                  </ul>
                  Repayment<p>You must start repaying your HELP debt through the tax system once your income is above the compulsory repayment threshold, even if you are still studying.The threshold is adjusted each year,and to learn more <a href="https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds#HELPandTSLrepaymentthresholdsandrates201" target="_blank" rel="noopener noreferrer">visit here</a></p>
                </Rich>
              </>
            ),
          },
          {
            label: 'How to apply',
            content: (
              <>
                <Rich depth={1}>
                  <p>Follow the steps below to apply for and keep track of your VET Student Loan. You must submit your VET Student Loan application before the census date for the classes you want the loan to cover.</p>
                  <p>For detailed information about how to apply, refer to the Australian Government’s VET Student Loan Information Booklet - <a href="https://www.dewr.gov.au/vet-student-loans/resources/vet-student-loans-information-booklet" target="_blank" rel="noopener noreferrer">https://www.dewr.gov.au/vet-student-loans/resources/vet-student-loans-information-booklet</a></p>
                  <p><strong>1. Check Your Eligibility for a VET Student Loan</strong></p>
                  <p>Ensure you meet all eligibility requirements for the VET Student Loan. To see if you are likely to meet the eligibility requirements, check out the <a href="https://www.yourcareer.gov.au/support/financial-assistance/assistance-for-vet-students/vsl-eligibility-check" target="_blank" rel="noopener noreferrer">VET Student Loans VSL eligibility check</a> | <a href="https://www.yourcareer.gov.au/" target="_blank" rel="noopener noreferrer">Your Career on the Explore Your Career website</a>. Alternatively you can Contact our Admissions Consultant at <a href="tel:1800225283">1800 22 52 83</a> or email <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a> for assistance in determining your eligibility.</p>
                  <p><strong>2. Inform Us of Your Intention to Apply</strong></p>
                  <p>When enrolling in an eligible IHNA course, you will be prompted to indicate if you intend to access a VET Student Loan. If you did not indicate your intent to apply during enrollment but would now like to access a VET Student Loan, please follow these steps: Contact our Admissions Team at <a href="tel:1800225283">1800 22 52 83</a> or email <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a> to discuss your options. Our team will guide you through the application process and provide the necessary documentation and next steps.</p>
                  <p><strong>3. Log in to the government portal (Electronic Commonwealth Assistance Form (eCAF))</strong></p>
                  <p>Upon confirmation of your enrolment with IHNA, you will be registered for the Electronic Commonwealth Assistance Form (eCAF). You will receive an email from eCAF with the necessary information to complete your VET Student Loan application.</p>
                  <p>Read the email and follow the instructions to log in to the government’s eCAF portal and begin your application.</p>
                  <p>If you can’t find your email, make sure to check your spam folder.</p>
                  <p><strong> 4. Provide all required details, including your Tax File Number (TFN) </strong></p>
                  <p>Follow the prompts within the eCAF portal to complete your application. For additional information about the details you must provide, refer to the government’s VET Student Loan eCAF fact sheet.</p>
                  <p>As part of your application, you must enter your TFN or certificate of application for a TFN on your eCAF.</p>
                  <p>Unless your TFN successfully validates with the Australian Taxation Office, your Vet Student Loan will not be approved, and your tuition fees must then be paid you in full to IHNA by the due date.</p>
                  <p><strong>Can’t validate your TFN?</strong></p>
                  <p>If you get an email advising of problems with your Tax File Number, immediately follow the instructions to validate your TFN by contacting Australian Taxation Office. You must ensure all your record including residential address are same which you have in ATO and IHNA.</p>
                  <p><strong> 5. Submit your application via the government’s eCAF portal </strong></p>
                  <p>Remember to submit your application before your first census date.</p>
                  <p>There are no provisions to backdate your loan application if you submit it after your census date.</p>
                  <p><strong>6. Submit your VET Student Loan progression forms</strong></p>
                  <p>You must complete all progression forms issued by the government. They’re issued in February, June and October of each year. The Department will send an email to your nominated email account when it’s time to complete your progression forms.</p>
                  <p>If you don’t submit your progression forms, your VET Student Loan will be cancelled, and you’ll need to pay your tuition fees to IHNA.</p>
                  <p>For more information, visit VET Student Loans – Student Progression Fact Sheet.</p>
                  <p><strong>How to Check if Your VET Student Loan is Approved</strong></p>
                  <p>Your VET Student Loan is not approved until you receive official notification from IHNA.</p>
                  <p>To confirm your loan status, please check your IHNA student email for the notification. If you have not received it or require assistance, contact our Student Support Team at <a href="tel:1800225283">1800 22 52 83</a> or email <a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p>
                </Rich>
              </>
            ),
          },
          {
            label: 'Know who to ask for help',
            content: (
              <>
                <Rich depth={1}>
                  Your provider (IHNA)<p>The student administration/enrolments office at your provider will be able to help you with:</p>
                  <ul>
                  <li>enrolments</li>
                  <li>tuition fees</li>
                  <li>census days</li>
                  <li>eligibility criteria for VET Student Loans</li>
                  <li>applying for a VET Student Loan</li>
                  <li>the correct withdrawal procedure</li>
                  <li>getting your HELP balance re-credited and your VETSL debt removed under special circumstances</li>
                  <li>grievance procedures for student complaints.</li>
                  </ul>
                  <p>Get in touch with IHNA through email <a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a> or call <a href="tel:1800225283">1800 22 52 83</a></p>
                  Your Career<p>Your Career is the consumer directory for VET. Using Your Career you can compare courses and providers to choose the course that best suits your needs.</p>
                  <p>Your Career lists all the nationally registered training providers, their contact details, the publicly available courses they are approved to deliver and where they are being delivered. Students can use Your Career site to search for VET Student Loans approved courses and approved course providers. Course price and course duration information can also be entered by training providers to assist students in assessing value for money.</p>
                  <p><strong>Your Career features:</strong></p>
                  <ul>
                  <li>Course price information: All approved course providers are required to enter on My Skills the fees a student can expect to pay for a course accessed with VET Student Loans.</li>
                  <li>A VET Student Loans calculator to assist you to understand how your debt will grow after five and ten years if unpaid.</li>
                  <li>Information collected from previous students about their satisfaction with training and their employment outcomes.</li>
                  </ul>
                  <p>Please find the link for more information <a href="https://www.yourcareer.gov.au/" target="_blank" rel="noopener noreferrer">https://www.yourcareer.gov.au/</a></p>
                  Study Assist<p>Study Assist provides information about options for financing your tertiary study, including:</p>
                  <ul>
                  <li>HELP loans available in both the higher education and VET sectors</li>
                  <li>courses and providers that offer Australian Government assistance</li>
                  <li>student income support</li>
                  <li>Australian Scholarships and Awards</li>
                  </ul>
                  VET Student Loans Ombudsman<p>The <a href="https://vet.ombudsman.gov.au/" target="_blank" rel="noopener noreferrer">VET Student Loans Ombudsman</a> began operating on 1 July 2017. The Ombudsman manages and investigates complaints about the VET FEE-HELP scheme and VET Student Loans program.</p>
                  National Training Complaints Hotline<ul>
                  <li>The <a href="https://www.dewr.gov.au/national-training-complaints-hotline" target="_blank" rel="noopener noreferrer">National Training Complaints Hotline</a> (13 38 73) is a joint Australian, state, and territory government initiative which protects students and makes it easier for consumers, such as apprentices, students, employers and others, to lodge complaints if they are concerned about any aspect of the training system.</li>
                  <li>The National Training Complaints Hotline directs complaints to relevant authorities, connecting consumers to the appropriate organisation.</li>
                  </ul>
                  Australian Taxation Office (ATO)<p>The <a href="http://www.ato.gov.au/" target="_blank" rel="noopener noreferrer">ATO</a> can help you with:</p>
                  <ul>
                  <li>your VETSL and/or HELP debt</li>
                  <li>compulsory repayments</li>
                  <li>voluntary repayments</li>
                  <li>overseas repayment</li>
                  <li>the best time for you to repay your debt</li>
                  </ul>
                  <p>Contact details:</p>
                  <ul>
                  <li>visit <a href="http://www.ato.gov.au/getloaninfo" target="_blank" rel="noopener noreferrer">Study and training support loans</a></li>
                  <li>visit <a href="https://www.ato.gov.au/tax-and-super-professionals/digital-services/in-detail/online-services-for-agents-user-guide/accounts-and-payments/loan-accounts" target="_blank" rel="noopener noreferrer">View your loan account online</a> for information on viewing your loan account online</li>
                  <li>use <a href="https://my.gov.au/" target="_blank" rel="noopener noreferrer">ATO online services</a> to view loan accounts and other information such as Payment Reference Number (PRN) and voluntary repayment options</li>
                  <li>call 13 28 61 for information about your VETSL and/or HELP account and personal tax topics</li>
                  <li>call 13 36 77 TTY or 1300 555 727 TTY for hearing or speech impaired students</li>
                  <li>write to Australian Taxation Office PO BOX 1032, ALBURY NSW 2640.</li>
                  </ul>
                  <p>Note: Do not send voluntary repayments to this address</p>
                  Services Australia<p><a href="https://www.servicesaustralia.gov.au/" target="_blank" rel="noopener noreferrer">Services Australia</a> can help you with Youth Allowance, Pensioner Education Supplement, Austudy, and ABSTUDY and other forms of student income support assistance.</p>
                  <p>Contact details:</p>
                  <ul>
                  <li>call 13 24 90 for information on Youth Allowance and Austudy</li>
                  <li>Freecall™ 1800 132 317 for information on ABSTUDY</li>
                  <li>Freecall™ 1800 810 586 for TTY* enquiries</li>
                  <li>call 13 12 02 for information in languages other than English.</li>
                  </ul>
                  <p>*TTY is only for people who are deaf or who have a hearing or speech impediment. A TTY phone is required to use this service.</p>
                  Department of Home Affairs<p><a href="https://www.homeaffairs.gov.au/" target="_blank" rel="noopener noreferrer">Department of Home Affairs</a> can help you with visas and Australian citizenship.</p>
                  <p>Contact details:</p>
                  <ul>
                  <li>visit Department of Home Affairs for visa and citizenship information</li>
                  <li>call 13 18 81 for visa and citizenship information.</li>
                  </ul>
                </Rich>
              </>
            ),
          },
          {
            label: 'Want to Know more?',
            content: (
              <>
                <Rich depth={1}>
                  <p>Please check the updated information given below:</p>
                  <p><strong>VSL/ VFH Policies/ Procedures : </strong><Link href="/vsl-vfh-policies-procedures/">https://www.ihna.edu.au/vsl-vfh-policies-procedures/</Link></p>
                  <ul>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Admission_and_Enrolment_Policy.pdf">Admission and Enrolment Policy</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Admission_and_Enrolment_Procedure_Updated.pdf">Admission and Enrolment Procedure</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Privacy_Policy.pdf">Privacy Policy</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Cancelling_a_Student_Enrolment_in_a_Course.pdf">Procedure for Cancelling a Student's Enrolment in a Course</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Procedure_for_Withdrawal_from_VET_Course_of_Study.pdf">Procedure for withdrawal from VET course of Study or an Approved Course</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Student_Complaints_and_Appeals_Policy.pdf">Student Complaints and Appeals Policy</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Student_Complaints_and_Appeals_Procedure.pdf">Student Complaints and Appeals Procedure</Link></li>
                  <li><Link href="/ihna-policies/IHNA_Refund_Policy.pdf">Refund Policy</Link></li>
                  <li><Link href="/ihna-procedures/IHNA_Refund_Procedure_Domestic_Students.pdf">Refund Procedure Domestic Students</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Student_Entry_Procedure_for_VET_Student_Loans.pdf">Student Entry Procedure</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Student_Review_Procedures_for_ReCrediting_Student_Loans_Balance.pdf">Student Review Procedures For Re-Crediting A Fee-Help Balance</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Tuition_Protection_Procedure.pdf">Tuition Protection Procedure</Link></li>
                  <li><Link href="/pdf/VSL-VFH-policies-procedures/IHNA_Tuition_Protection_Service_Policy.pdf">Tuition Protection Service Policy</Link></li>
                  </ul>
                  <p><strong>Statement of VSL Tuition Assurance 2018 : </strong><Link href="/pdf/VSL-Statement-of-tuition-assurance-2018.pdf">https://www.ihna.edu.au/pdf/VSL-Statement-of-tuition-assurance-2018.pdf</Link></p>
                  <p><strong>VET Student Loan Unit wise fee details 2021:</strong></p>
                  <ul>
                  <li><Link href="/pdf/VET_Student_Loan/2021/HLT54115_Diploma_of_Nursing_Vet_Student_Loan_2021.pdf">HLT54115 – Diploma of Nursing Fees</Link></li>
                  <li><Link href="/pdf/VET_Student_Loan/2022/CHC52015_Diploma_of_Community_Services_Vet_Student_Loan_2022.pdf">CHC52015 – Diploma of Community Services (Case Management) Fees</Link></li>
                  </ul>
                  <p><strong>VET Student Loan Unit wise fee details 2023:</strong></p>
                  <ul>
                  <li><Link href="/pdf/VET_Student_Loan/2023/CHC52015_Diploma_of_Community_Services_Vet_Student_Loan_2023.pdf">CHC52015 - Diploma of Community Services (Case Management) Fees</Link></li>
                  <li><Link href="/pdf/VET_Student_Loan/2023/HLT54121_Diploma_of_Nursing_Vet_Student_Loan_2023.pdf">HLT54121 - Diploma of Nursing Fees</Link></li>
                  </ul>
                  <p><strong>VET Student Loan Unit wise fee details 2024:</strong></p>
                  <ul>
                  <li><Link href="/pdf/VET_Student_Loan/2024/CHC52015_Diploma_of_Community_Services_Vet_Student_Loan_2024.pdf">CHC52015 - Diploma of Community Services (Case Management) Fees</Link></li>
                  <li><Link href="/pdf/VET_Student_Loan/2024/CHC52021_Diploma_of_Community_Services_Vet_Student_Loan_2024.pdf">CHC52021 - Diploma of Community Services (Case Management) Fees</Link></li>
                  <li><Link href="/pdf/VET_Student_Loan/2024/HLT54121_Diploma_of_Nursing_Vet_Student_Loan_2024.pdf">HLT54121 - Diploma of Nursing Fees</Link></li>
                  </ul>
                  <p><strong>VET Student Loan Unit wise fee details 2025:</strong></p>
                  <ul>
                  <li><Link href="/pdf/VET_Student_Loan/2025/HLT54121_Diploma_of_Nursing_Vet_Student_Loan_2025.pdf">HLT54121 - Diploma of Nursing Fees</Link></li>
                  <li><Link href="/pdf/VET_Student_Loan/2025/CHC52021_Diploma_of_Community_Services_Vet_Student_Loan_2025.pdf">CHC52021 – Diploma of Community Services (Case Management) Fees</Link></li>
                  </ul>
                  <p><strong>VET Student Loan Unit wise fee details 2026:</strong></p>
                  <ul>
                  <li><Link href="/pdf/VET_Student_Loan/2026/HLT54121_Diploma_of_Nursing_Vet_Student_Loan_2026.pdf">HLT54121 - Diploma of Nursing Fees</Link></li>
                  <li><Link href="/pdf/VET_Student_Loan/2026/CHC52025_Diploma_of_Community_Services_Vet_Student_Loan_2026.pdf">CHC52025 – Diploma of Community Services (Case Management)</Link></li>
                  </ul>
                  <p><strong>Census Dates :</strong></p>
                  <ul>
                  <li><Link href="/census-dates/">Census Dates older than 2018</Link></li>
                  <li><Link href="/census-dates-kh/">Census Dates in 2018 and after that</Link></li>
                  </ul>
                </Rich>
              </>
            ),
          },
          {
            label: 'FAQs',
            content: (
              <>
                <Rich depth={1}>
                  <h3>1. Unique Student Identifier (USI)</h3>
                </Rich>
                <Accordion depth={1}
                  items={[
                    {
                      title: 'What is the USI?',
                      text: 'USIs have been in place since 2015. Therefore, if you have studied a VET course in the last five years, including while at secondary school, you will already have an existing USI. If you have an existing USI you must continue to use that same USI on your eCAF application. You can locate your USI easily at Get a USI . The Unique Student Identifier (known as a USI) is a reference number made up of a combination of ten numbers and letters. Your USI is used to connect your student loan information to your personal details. You can log in and check or update your details at any time. Your USI is yo',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>USIs have been in place since 2015. Therefore, if you have studied a VET course in the last five years, including while at secondary school, you will already have an existing USI. If you have an existing USI you must continue to use that same USI on your eCAF application. You can locate your USI easily at <a href="https://www.usi.gov.au/students/get-a-usi" rel="noopener noreferrer">Get a USI</a>.</p>
                            <p>The Unique Student Identifier (known as a USI) is a reference number made up of a combination of ten numbers and letters. Your USI is used to connect your student loan information to your personal details. You can log in and check or update your details at any time. Your USI is your individual education identifier for life. It also creates an online record of your training attainments in Australia.</p>
                            <p>Applying for a USI is fast and free, and you keep the same USI for life. You can apply for a USI in as little as five minutes at <a href="http://www.usi.gov.au/" rel="noopener noreferrer">Unique Student Identifier</a>.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Where do I provide my USI?',
                      text: 'You might be asked to provide your USI when you apply to enrol in your course with your provider. Your provider should request your USI as part of the enrolment process. Students seeking VET Student Loans will be required to provide their USI on their eCAF application. This will either be pre-populated in the eCAF application form by your provider, or alternatively you should enter your USI in the USI field before you submit your eCAF application form.',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>You might be asked to provide your USI when you apply to enrol in your course with your provider. Your provider should request your USI as part of the enrolment process.</p>
                            <p>Students seeking VET Student Loans will be required to provide their USI on their eCAF application. This will either be pre-populated in the eCAF application form by your provider, or alternatively you should enter your USI in the USI field before you submit your eCAF application form.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Why do I need a USI on my eCAF application form?',
                      text: 'You will need to apply for a USI and include your USI on your eCAF application form if you wish to be eligible for a VET Student Loan. If you are undertaking either nationally recognised training, or a higher education qualification, you need a USI in order to receive Commonwealth financial assistance, as well as to obtain your qualification or statement of attainment. You must include your USI on your eCAF application form so that your provider and the Australian Government can provide you with information about any VET Student Loans or HELP loans you may have used. Your CHESSN (if allocated)',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>You will need to apply for a USI and include your USI on your eCAF application form if you wish to be eligible for a VET Student Loan.</p>
                            <p>If you are undertaking either nationally recognised training, or a higher education qualification, you need a USI in order to receive Commonwealth financial assistance, as well as to obtain your qualification or statement of attainment.</p>
                            <p>You must include your USI on your eCAF application form so that your provider and the Australian Government can provide you with information about any VET Student Loans or HELP loans you may have used. Your CHESSN (if allocated) is also used to help provide this information. The CHESSN will be gradually decommissioned from 2021 and replaced by the USI.</p>
                            <p>Your USI and your CHESSN (if allocated) are printed on your Commonwealth Assistance Notice (CAN).</p>
                            <p>The USI is being extended in 2021 to higher education. You should only have one USI – this will create a single government identifier for your entire tertiary education journey. You should only have one USI for the duration of your studies – even if you change providers, or decide to start a new course a few years after completing one, or change your name. You should always use the same USI for all of your studies.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Why is it important to have only one USI?',
                      text: 'In addition to creating an online record of your training attainments in Australia, your USI is an important identifier to be used to monitor and manage your Commonwealth assistance, especially for identifying whether you have reached your HELP loan limit. Your HELP loan limit applies to all study for which you use a VET Student Loan, VET FEE-HELP, HECS-HELP or FEE-HELP to pay for your course. How much you can borrow is calculated against individual USIs. If you have more than one USI, you might exceed your HELP loan limit because the loan limit will be applied to each USI you have been issued',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>In addition to creating an online record of your training attainments in Australia, your USI is an important identifier to be used to monitor and manage your Commonwealth assistance, especially for identifying whether you have reached your HELP loan limit. Your <a href="https://www.studyassist.gov.au/help-loans/2020-loan-limit-changes/" rel="noopener noreferrer">HELP loan limit</a> applies to all study for which you use a VET Student Loan, VET FEE-HELP, HECS-HELP or FEE-HELP to pay for your course.</p>
                            <p>How much you can borrow is calculated against individual USIs. If you have more than one USI, you might exceed your HELP loan limit because the loan limit will be applied to each USI you have been issued. If you have been allocated multiple USIs and the sum of the debts across those USIs exceeds the HELP limit you cannot access any more HELP or VET Student Loans to pay for your course. Prior to 2021, CHESSNs were used to monitor and manage loan accounts.</p>
                            <p>If you have received HELP or VET Student Loans in excess of the HELP loan limit, your provider will be required to return the funds to the Commonwealth and may seek repayment of the excess loan amount from you.</p>
                            <p>If you have more than one USI, or any other concerns about your USI or CHESSN, please complete an enquiry form on the Study Assist <a href="https://www.studyassist.gov.au/need-more-information/contact-us/" rel="noopener noreferrer">Contact us</a> webpage.</p>
                            <p>More information on how to get a USI and where to go for USI assistance is available at <a href="http://www.usi.gov.au/" rel="noopener noreferrer">Unique Student Identifier</a>.</p>
                          </Rich>
                        </>
                      ),
                    },
                  ]}
                />
                <Rich depth={1}>
                  <h3>2. Fee Notices</h3>
                </Rich>
                <Accordion depth={1}
                  items={[
                    {
                      title: 'Who will send the fee notices to me and when will I receive them?',
                      text: 'Your provider must send you a VET Student Loans fee notice for each fee period, for the course(s) you are enrolled in for that fee period. This must be sent to your nominated personal email or postal address at least 14 days before the census day. The fee notice must detail a range of information including: the provider’s name and registration code your name, contact details and student identification number as issued by the provider the cost of the unit/s you are enrolled in for that part of your course the census day(s) on which you will incur the debt your USI your CHESSN (if available) the',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Your provider must send you a VET Student Loans fee notice for each fee period, for the course(s) you are enrolled in for that fee period. This must be sent to your nominated personal email or postal address at least 14 days before the census day. The fee notice must detail a range of information including:</p>
                            <ul>
                              <li>the provider’s name and registration code</li>
                              <li>your name, contact details and student identification number as issued by the provider</li>
                              <li>the cost of the unit/s you are enrolled in for that part of your course</li>
                              <li>the census day(s) on which you will incur the debt</li>
                              <li>your USI</li>
                              <li>your CHESSN (if available)</li>
                              <li>the loan fee (if applicable)</li>
                            </ul>
                            <p>You should note that your fee notice may include more than one unit, but your provider is required to provide at least three fee notices across your course as your course must include at least three census days. This will ensure your course fees are spread across the course as you progress.</p>
                            <p>Your approved course provider must also send you a VET Student Loans Statement of Covered Fees which will provide details of the total course fee and how much will be covered by the loan amount.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'What is a Commonwealth Assistance Notice (CAN) ?',
                      text: 'If you are getting a VET Student Loan, your provider will send you a CAN, within 28 days after the census day, for each study period you are using the loan. Your CAN will include information on: the tuition fees for your course the course for which you have received VET Student Loans any upfront payments you have made any VET Student Loan you have used for that study period Check your CAN carefully to make sure that the tuition fees listed on your CAN are the same as those published on your provider’s website. If you notice any errors on your CAN, you have 14 days from the date of the CAN to s',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>If you are getting a VET Student Loan, your provider will send you a CAN, within 28 days after the census day, for each study period you are using the loan. Your CAN will include information on:</p>
                            <ul>
                              <li>the tuition fees for your course</li>
                              <li>the course for which you have received VET Student Loans</li>
                              <li>any upfront payments you have made</li>
                              <li>any VET Student Loan you have used for that study period</li>
                            </ul>
                            <p>Check your CAN carefully to make sure that the tuition fees listed on your CAN are the same as those published on your provider’s website. If you notice any errors on your CAN, you have 14 days from the date of the CAN to send your provider a written request for correction (some providers may allow for a longer correction period).</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'How can I use the myHELPbalance and myGov websites?',
                      text: 'There are two websites that help you keep track of what you have borrowed and how much you still have left to pay. myHELPbalance will help you keep track of how much you have borrowed under VET Student Loans and the various HELP loans from 2005 onwards. Please note that myHELPbalance only shows the loans you have received under VET Student Loans, HECS-HELP, OS-HELP, FEE-HELP and VET FEE-HELP, but not SA-HELP. The information is displayed on a per-unit basis. There is a time lag between the census day and when your information on myHELPbalance is updated. To work out a total of your current loa',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>There are two websites that help you keep track of what you have borrowed and how much you still have left to pay.</p>
                            <p><a href="http://www.myhelpbalance.gov.au/" rel="noopener noreferrer">myHELPbalance</a> will help you keep track of how much you have borrowed under VET Student Loans and the various HELP loans from 2005 onwards.</p>
                            <p>Please note that myHELPbalance only shows the loans you have received under VET Student Loans, HECS-HELP, OS-HELP, FEE-HELP and VET FEE-HELP, but not SA-HELP. The information is displayed on a per-unit basis.</p>
                            <p>There is a time lag between the census day and when your information on myHELPbalance is updated. To work out a total of your current loan amounts, you will need to add any units you have recently enrolled/are currently enrolled in to amounts showing on myHELPbalance if they are not already there.</p>
                            <p>myHELPbalance does not show the details of how much of your VETSL or HELP debt you have repaid to the ATO or what you have left owing to the ATO. It will also not show any details about pre-2005 study (including former HECS, OLDPS, PELS and BOTPLS loans).</p>
                            <p>You can use your CHESSN and other personal details to access myHELPbalance via the home page at <a href="http://www.studyassist.gov.au/" rel="noopener noreferrer">Study Assist</a>. If you do not know your CHESSN, contact your provider. The myHELPbalance portal will be updated during 2021 to accept a USI for login purposes.</p>
                            <p><a href="https://my.gov.au/LoginServices/main/login?execution=e3s1" rel="noopener noreferrer">myGov</a> allows you to get more information about your VETSL and other HELP debts online. It will show:</p>
                            <ul>
                              <li>all of your HELP debt (which includes HECS-HELP, OS-HELP, SA-HELP, FEE-HELP, VET FEE-HELP and VET Student Loans debts from 1 January 2017 to 30 June 2019 as a consolidated amount)</li>
                              <li>your VETSL debt (VET Student Loans debts from 1 July 2019)</li>
                              <li>any indexation that has been applied to your debts</li>
                              <li>any repayments you have made, so you can see how much you have left owing.</li>
                            </ul>
                            <p>To access this online service, please refer to the instructions on the <a href="http://www.ato.gov.au/" rel="noopener noreferrer">Australian Taxation Office</a> website.</p>
                          </Rich>
                        </>
                      ),
                    },
                  ]}
                />
                <Rich depth={1}>
                  <h3>3. Withdrawal or Non-Completion of Studies</h3>
                  <p>More information about withdrawal procedures and special circumstances is available from the <a href="http://www.studyassist.gov.au/" rel="noopener noreferrer">Study Assist</a> website. You must also familiarise yourself with the specific withdrawal policy of your provider.</p>
                </Rich>
                <Accordion depth={1}
                  items={[
                    {
                      title: 'What happens if I fail or withdraw from a unit?',
                      text: 'If you correctly withdraw from a unit or subject by the census day, you will not incur a debt for that part of your course. If you have already made an upfront payment of your tuition fees, you will receive a refund from your provider. If you fail part of a course (unit or subject), or withdraw from part of a course after the census day, you will still have to pay the tuition fee for that unit. If you used a VET Student Loan, you will incur a VETSL debt. If you made an upfront payment to your provider, you are not eligible for a refund of that payment. If you failed the unit or subject or with',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>If you correctly withdraw from a unit or subject by the census day, you will not incur a debt for that part of your course. If you have already made an upfront payment of your tuition fees, you will receive a refund from your provider.</p>
                            <p>If you fail part of a course (unit or subject), or withdraw from part of a course after the census day, you will still have to pay the tuition fee for that unit. If you used a VET Student Loan, you will incur a VETSL debt. If you made an upfront payment to your provider, you are not eligible for a refund of that payment.</p>
                            <p>If you failed the unit or subject or withdrew after the census day because of special circumstances, you can apply to your provider to have your VETSL debt removed. If you paid for your units upfront, you will need to contact your provider for information on the refund process for upfront payments.</p>
                            <p>You can get touch with IHNA through email <a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a> or call <a href="tel:1800225283">1800 22 52 83</a></p>
                            <p>If your provider engaged in unacceptable conduct in relation to your application for a VET Student Loan you can apply to the department to have your debt removed.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'How do I withdraw from a unit?',
                      text: 'To withdraw from a unit or course without incurring a VETSL debt or forfeiting an upfront payment, you need to complete your provider’s formal withdrawal process and withdraw in writing by the census day. If the course you are withdrawing from involves enrolment with more than one provider, you will need to withdraw from each one individually. Providers cannot charge you a fine, penalty or fee for withdrawing from units before the census day, but you must withdraw in writing. Furthermore, providers cannot enrol you in subsequent units without your written instruction. In the event you wish to ',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>To withdraw from a unit or course without incurring a VETSL debt or forfeiting an upfront payment, you need to complete your provider’s formal withdrawal process and withdraw in writing by the census day. If the course you are withdrawing from involves enrolment with more than one provider, you will need to withdraw from each one individually.</p>
                            <p>Providers cannot charge you a fine, penalty or fee for withdrawing from units before the census day, but you must withdraw in writing. Furthermore, providers cannot enrol you in subsequent units without your written instruction. In the event you wish to enrol in subsequent units, your provider is required to have in place a process to allow this. You should refer to IHNA’s withdrawal process, which will be available on its website.</p>
                            <p>You can contact IHNA through email <a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a> or call <a href="tel:1800225283">1800 22 52 83</a> for more information on withdrawing and the required formal process.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'What happens if I withdraw from a unit under special circumstances?',
                      text: 'If you withdraw from a unit after the census day because you become seriously ill or for other special circumstances, you can apply to your provider to have your HELP balance re-credited and your VETSL debt removed. You cannot have your debt removed if you have already successfully completed your unit of study. Changing your mind is not a good enough reason to apply for special circumstances and you will still be required to repay your VETSL debt. Similarly, failing a unit is not in itself sufficient to apply for special circumstances. However, if you fail a unit because of special circumstanc',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>If you withdraw from a unit after the census day because you become seriously ill or for other special circumstances, you can apply to your provider to have your HELP balance re-credited and your VETSL debt removed. You cannot have your debt removed if you have already successfully completed your unit of study.</p>
                            <p>Changing your mind is not a good enough reason to apply for special circumstances and you will still be required to repay your VETSL debt. Similarly, failing a unit is not in itself sufficient to apply for special circumstances. However, if you fail a unit because of special circumstances, you may consider applying to have your HELP balance re-credited.</p>
                            <p>For your provider to be satisfied that special circumstances apply to you, you must be able to prove that the circumstances:</p>
                            <ul>
                              <li>were beyond your control</li>
                              <li>did not make their full impact on you until on or after the census day</li>
                              <li>made it impracticable (i.e. impossible) for you to complete your unit(s) of study requirements.</li>
                            </ul>
                            <p>You can contact IHNA through email <a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a> or call <a href="tel:1800225283">1800 22 52 83</a>.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Where and how do I report unacceptable conduct of my education provider in relation to my VET student loan?',
                      text: 'Students who find themselves with a VETSL debt due to a provider’s unacceptable conduct in relation to their application for a VET Student Loan may be able to apply to have the VETSL debt cancelled. Examples of unacceptable conduct include, but are not limited to, misleading or deceptive conduct; advertising tuition fees for the course where there are reasonable grounds for believing that the provider will not be able to provide the course for those fees; the use of physical force, or harassment or coercion in connection with the application or enrolment in the course. Students will need to ap',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Students who find themselves with a VETSL debt due to a provider’s unacceptable conduct in relation to their application for a VET Student Loan may be able to apply to have the VETSL debt cancelled.</p>
                            <p>Examples of unacceptable conduct include, but are not limited to, misleading or deceptive conduct; advertising tuition fees for the course where there are reasonable grounds for believing that the provider will not be able to provide the course for those fees; the use of physical force, or harassment or coercion in connection with the application or enrolment in the course.</p>
                            <p>Students will need to apply to the department and provide details of what led to the debt being raised and any correspondence or paperwork received about their study and debt. To find out more information about unacceptable conduct remissions, visit the Complaints and Grievances webpage at <a href="http://www.studyassist.gov.au/" rel="noopener noreferrer">Study Assist</a>.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'What happens if my provider stops delivering my course?',
                      text: 'Tuition protection arrangements provide assistance for VET Student Loan (VSL) students who are unable to continue their studies due to a provider default. A provider defaults if they do not commence a course, cease delivering a course, or close entirely. If you are studying with a private VSL provider who defaults, you will be assisted by the Government’s Tuition Protection Service (TPS) to continue your studies. If your provider defaults, the TPS will assist you to move to a replacement VSL provider to continue your studies in the same or similar course. If there are no suitable replacement c',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Tuition protection arrangements provide assistance for VET Student Loan (VSL) students who are unable to continue their studies due to a provider default. A provider defaults if they do not commence a course, cease delivering a course, or close entirely.</p>
                            <p>If you are studying with a private VSL provider who defaults, you will be assisted by the Government’s Tuition Protection Service (TPS) to continue your studies. If your provider defaults, the TPS will assist you to move to a replacement VSL provider to continue your studies in the same or similar course. If there are no suitable replacement courses available, you may be entitled to receive a loan re-credit for parts of the course you were unable to complete due to the default.</p>
                            <p>If you are studying with a public or government-owned VSL provider (such as a TAFE), your provider will assist you to move to a replacement course, or if a suitable replacement course is not available, receive a loan re-credit for parts of the course you were unable to complete due to the default.</p>
                            <p>You should ensure you keep up-to-date records throughout your study that demonstrate your progression through the course. This includes statements of attainment or other reports which show the competencies you have achieved. These records will assist you in continuing your studies, should your provider default.</p>
                            <p>Further information about tuition protection is available on the TPS website.</p>
                          </Rich>
                        </>
                      ),
                    },
                  ]}
                />
                <Rich depth={1}>
                  <h3>4. Repaying Your VETSL Debt</h3>
                </Rich>
                <Accordion depth={1}
                  items={[
                    {
                      title: 'When do I start paying back my loan?',
                      text: 'Your VETSL debt forms part of your accumulated VETSL debt. You must start repaying your VETSL debt through the tax system once your income is above the compulsory repayment threshold, even if you are still studying. The threshold is adjusted each year; for the 2026-27 financial year, it is $69,528. Repayments made through the Australian taxation system are called ‘compulsory repayments’ and continue until you have repaid your whole debt. How much you must pay back is calculated from the amounts given on your income tax return for: your taxable income reportable fringe benefits (reported on you',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Your VETSL debt forms part of your accumulated VETSL debt. You must start repaying your VETSL debt through the tax system once your income is above the compulsory repayment threshold, even if you are still studying.</p>
                            <p>The threshold is adjusted each year; for the 2026-27 financial year, it is $69,528. Repayments made through the Australian taxation system are called ‘compulsory repayments’ and continue until you have repaid your whole debt.</p>
                            <p>How much you must pay back is calculated from the amounts given on your income tax return for:</p>
                            <ul>
                              <li>your taxable income</li>
                              <li>reportable fringe benefits (reported on your payment summary)</li>
                              <li>total net investment loss (including net rental loss)</li>
                              <li>reportable super contributions</li>
                              <li>exempt foreign employment income amounts.</li>
                            </ul>
                            <p>Anyone who has a VETSL debt and earns above the minimum repayment threshold will be required to repay their debt regardless of where they live, whether in Australia or overseas. Visit <a href="http://www.studyassist.gov.au/" rel="noopener noreferrer">Study Assist</a> for more information.</p>
                            <p>If you move overseas and have a VETSL debt you have the same repayment obligations as those living in Australia. This applies if you already live or intend to move overseas for a total of 183 days or more in any 12 month period.</p>
                            <p>You will be required to notify the ATO by updating your contact details through ATO online services within seven days of leaving Australia. Visit <a href="http://www.ato.gov.au/overseasobligations" rel="noopener noreferrer">overseas obligations when repaying loans</a> or <a href="http://www.studyassist.gov.au/" rel="noopener noreferrer">Study Assist</a> for more information.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'How much will my repayments be?',
                      text: 'The amount you repay each year is calculated as a percentage of your worldwide income. The repayment percentage increases as your income increases, so the more you earn, the higher your repayment will be. The ATO will calculate your compulsory repayment for the year and include it on your income tax notice of assessment. You can determine the amount of your compulsory repayment by using the Study and Training Loan Repayment Calculator and the repayment rates on the ATO website. Repayment rates for the 2026–27 financial year',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>The amount you repay each year is calculated as a percentage of your worldwide income. The repayment percentage increases as your income increases, so the more you earn, the higher your repayment will be.</p>
                            <p>The ATO will calculate your compulsory repayment for the year and include it on your income tax notice of assessment. You can determine the amount of your compulsory repayment by using the <a href="https://www.ato.gov.au/Calculators-and-tools/Study-and-training-loan-repayment-calculator/" rel="noopener noreferrer">Study and Training Loan Repayment Calculator</a> and the repayment rates on the ATO website.</p>
                            <p><strong>Repayment rates for the 2026–27 financial year</strong></p>
                          </Rich>
                          <Table rows={[
                            ['Repayment income', 'Repayment % rate'],
                            ['$0 – $69,528', 'Nil'],
                            ['$69,529 – $129,717', '15c for each $1 over $69,528'],
                            ['$129,718 – $186,050', '$9,028 plus 17c for each $1 over $129,717'],
                            ['$186,051 and over', '10% of your total repayment income'],
                          ]} variant="striped" headerRow={true} depth={1} />
                        </>
                      ),
                    },
                    {
                      title: 'Can I make a voluntary repayment?',
                      text: 'Yes. You can make a voluntary repayment to the ATO at any time and for any amount. Voluntary repayments are in addition to the compulsory repayments made through your tax return. There are several ways you can make a voluntary repayment, including via BPAY and credit card. Voluntary repayments can be made through ATO online services accessible via myGov. For more information on making a payment, go to the ATO’s How to pay webpage. For more information on voluntary repayments, go to the ATO’s Voluntary repayments webpage.',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Yes. You can make a voluntary repayment to the ATO at any time and for any amount. Voluntary repayments are in addition to the compulsory repayments made through your tax return.</p>
                            <p>There are several ways you can make a voluntary repayment, including via BPAY and credit card. Voluntary repayments can be made through ATO online services accessible via myGov.</p>
                            <p>For more information on making a payment, go to the ATO’s <a href="http://www.ato.gov.au/atohowtopay" rel="noopener noreferrer">How to pay</a> webpage. For more information on voluntary repayments, go to the ATO’s <a href="http://www.ato.gov.au/voluntaryrepay" rel="noopener noreferrer">Voluntary repayments</a> webpage.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Are repayments tax deductible?',
                      text: 'Compulsory repayments are not tax deductible. Voluntary repayments made by you or someone other than your employer are not tax deductible. Your employer may be able to claim a tax deduction for voluntary repayments it makes on your behalf, but it may also be liable for fringe benefits tax on the repayments. For more information, visit Australian Taxation Office.',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Compulsory repayments are not tax deductible. Voluntary repayments made by you or someone other than your employer are not tax deductible. Your employer may be able to claim a tax deduction for voluntary repayments it makes on your behalf, but it may also be liable for fringe benefits tax on the repayments. For more information, visit Australian Taxation Office.</p>
                          </Rich>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
    </>
  )
}
