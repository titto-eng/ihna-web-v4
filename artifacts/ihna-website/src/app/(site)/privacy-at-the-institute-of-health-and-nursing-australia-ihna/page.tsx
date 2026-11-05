// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich, SplitProse, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy at the Institute of Health and Nursing Australia (IHNA)',
  path: '/privacy-at-the-institute-of-health-and-nursing-australia-ihna/',
  description: 'This page contains information about how IHNA deals with personal information (also known as personal data) and the rights of the individual.',
})

export default function PrivacyAtTheInstituteOfHealthAndNursingAustraliaIhnaRoute() {
  return (
    <>
      <Hero heading="Privacy at the Institute of Health and Nursing Australia (IHNA)" variant="split" look="editorial" audienceSwitch={false} image={img({ src: '/images/ihna/pages/privacy-at-the-institute-of-health-and-nursing-australia-ihna.webp', alt: 'Staff member reviewing records', width: 480, height: 600 })} />
      <Rich>
        <p className="lead">This page contains information about how IHNA deals with personal information (also known as personal data) and the rights of the individual.</p>
      </Rich>
      <SplitProse tone="muted" eyebrow={'Privacy'} heading={'Reporting a Breach'}>
        <p>If you suspect a breach of an IHNA system, contact the helpdesk at itsupport@hci.edu.au</p>
      </SplitProse>
      <SplitProse eyebrow={'Privacy'} heading={'IHNA Website Privacy'}>
        <p>The Institute of Health and Management (IHNA) is committed to protecting your privacy.</p>
        <p>We handle your personal information according to the Privacy Act 1988 and the Australian Privacy Principles (APPs) 2014, in accordance with the Standards for Registered Training Organisations (SRTOs 2015) and the VET Student Loan Act and Rule 2016.</p>
        <p><strong>This privacy statement explains:</strong></p>
        <ul>
          <li>The information we collect through our websites.</li>
          <li>How we use and share that information.</li>
          <li>Your rights to access and manage your information.</li>
          <li>How to make a privacy complaint.</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Privacy'} heading={'Personal Information Defined'}>
        <p>Personal information is any data that identifies you as an individual.</p>
      </SplitProse>
      <SplitProse eyebrow={'Privacy'} heading={'Information We Collect'}>
        <p><strong>We collect personal information in two ways on our websites:</strong></p>
        <h3>1. Information You Provide:</h3>
        <p>You may submit personal information when you inquire, subscribe to our services, update contact details, or provide website feedback. This may include your name, contact details, and other relevant information. Students and staff will need a Student ID and password to access specific areas.</p>
        <p><strong>The information you provide could include the following: </strong></p>
        <h3>Information about Students</h3>
        <p>IHNA collects personally identifiable information that students provide when they register or enrol for any educational courses or programs, when they use certain IHNA online services or products, or when they enter promotions. IHNA’s preferred source of personal information is the individual concerned. IHNA may also receive information from other sources such as other members of the Health Careers International (HCI) Group.</p>
        <p>Under the Freedom of Information Act, Vic 1982, IHNA will permit a student to apply for and receive a copy of their VET personal information that the provider holds on the student’s record.</p>
        <p>IHNA is committed to protecting student privacy. We will only collect personal information when necessary for academic purposes or as required by law. We will obtain student consent before collecting sensitive information and ensure that all data is handled securely and confidentially.</p>
        <p>We will inform students about how their information is used and provide them with the opportunity to access and correct their data. We will take reasonable steps to prevent unauthorised access to student information and comply with all applicable privacy laws.</p>
        <h3>Information about Staff</h3>
        <p>IHNA collects personal information from its staff which may be used for Selection, Appointment, Promotion, General Administration or Provision of Services to staff. IHNA’s preferred source of personal information is the individual concerned. However, IHNA may also receive information from other sources such as:</p>
        <ol>
          <li>previous employers and referees nominated by prospective and current staff members.</li>
          <li>academic assessors.</li>
          <li>promotion and performance review assessments.</li>
        </ol>
        <p>IHNA takes all reasonable steps to ensure that information collected is:</p>
        <ol>
          <li>necessary for IHNA’s purposes;</li>
          <li>relevant to the purpose of collection; and</li>
          <li>collected in a fair way, without unreasonable intrusion.</li>
        </ol>
        <p>IHNA is committed to adhering to the Privacy Act 1988 and the Australian Privacy Principles (APPs). We handle personal information with care, ensuring it is collected, used, secured, and disclosed responsibly. IHNA safeguards all confidential information obtained. We will ensure that:</p>
        <ul>
          <li>Information collected for training and assessment purposes is not shared with third parties without written consent, except when required by law.</li>
          <li>All records are stored securely.</li>
          <li>All information in records is maintained in strict confidentiality.</li>
        </ul>
        <h3>2. Information Collected Automatically:</h3>
        <p>In some circumstances, IHNA uses cookies to enhance the functionality of its website and offer improved services. A cookie is a packet of information that allows the server to identify and interact more effectively with computers using the website. IHNA do not store any personal details using cookies. Users can configure their browser to accept all cookies, reject all cookies, or notify them when a cookie is sent by referring to their browser instructions. If users reject all cookies, they may be unable to use IHNA website.</p>
        <p><strong>We use cookies for various purposes, including:</strong></p>
        <ul>
          <li>Recording website areas you visit, courses viewed, browsing time, and actions taken. This helps us improve website usability and user experience.</li>
          <li>Remembering your preferences and progress on the website.</li>
          <li>Tracking information you provide to avoid incomplete applications or remember favourited courses.</li>
          <li>Understanding your interests for personalised content and relevant advertising on other websites.</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Privacy'} heading={'How We Use Your Information'}>
        <p>We use your information only for the purpose it was collected or a directly related purpose.</p>
        <ul>
          <li><strong>Information You Provide:</strong> We use information from online forms to process your requests, analyse trends for better service, and provide additional relevant content. Information from Alumni and Advancement forms may be used to update contact details, share news and achievements, manage gifts, or respond to bequest inquiries.</li>
          <li><strong>Information Collected Automatically:</strong> We use cookie information to deliver website functionality, monitor performance, personalise content, and deliver targeted advertising through remarketing. We also use software tools to collect anonymous user interaction data to improve your experience and our websites.</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow={'Privacy'} heading={'Sharing Your Information'}>
        <p>Unless instructed otherwise, personal information may be shared with related companies within Health Careers International Pty Ltd (HCI) where it will remain confidential. We share your information with third parties in limited circumstances:</p>
        <ul>
          <li><strong>Contractors and Consultants:</strong> We share information with contracted service providers bound by IHNA’s privacy and security requirements to assist with services.</li>
          <li>Website Service Providers: External service providers hosting and supporting our websites will have access to information collected through them. These providers are also bound by IHNA’s privacy and security requirements.</li>
          <li><strong>Digital Engagement Service Providers:</strong> We use external providers for website hosting, support, and personalised content delivery. These providers may collect information about your website use for those purposes. We also use them for targeted advertising through platforms like Facebook and Google.</li>
          <li><strong>Event Service Providers:</strong> We use digital engagement platforms to personalise website content and conduct marketing activities. These platforms may collect information about your website use for this purpose.</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Privacy'} heading={'Storing and Securing Your Information'}>
        <p>IHNA implements security measures to protect your personal information from misuse, unauthorised access, use, modification, or disclosure.</p>
      </SplitProse>
      <SplitProse eyebrow={'Privacy'} heading={'Links to External Websites'}>
        <p>Our websites may link to external websites operated by third parties. This privacy statement does not apply to those websites. We recommend you review their privacy information to understand how they handle your data.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Privacy'} heading={'Accessing and Correcting Your Information'}>
        <p><strong>Under Australian privacy laws, you have the right to access and correct your personal information held by IHNA. Residents outside Australia may have additional rights, including:</strong></p>
        <ul>
          <li>Restricting or objecting to our use of your information.</li>
          <li>Withdrawing your consent to our use of your information at any time.</li>
          <li>Objecting to direct marketing (including profiling).</li>
          <li>Requesting erasure of your information if we no longer have a lawful reason to hold it.</li>
          <li>Requesting data portability of your information.</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow={'Privacy'} heading={'Making a Privacy Complaint'}>
        <p>You have the right to complain if you believe IHNA has breached your privacy.</p>
        <p><strong>If an individual wishes to raise or discuss any issues about the Privacy Policy, they can:</strong></p>
        <ul>
          <li>Speak directly to a staff member who will do their best to resolve the issue.</li>
          <li>Email the issue to registrar@ihna.edu.au</li>
          <li>If an investigation is required IHNA will keep the individual advised of the progress. If staff is unable to resolve the matter, it will be escalated as appropriate to facilitate a solution.</li>
        </ul>
        <p><strong>For Complaints and Appeals</strong></p>
        <ul>
          <li>A complaint should initially be made to IHNA using any of the above avenues.</li>
          <li>Follow IHNA’s Complaints and Appeals Policy located at IHNA website.</li>
          <li>Allow reasonable time (usually 30 days) for IHNA to respond.</li>
        </ul>
      </SplitProse>
    </>
  )
}
