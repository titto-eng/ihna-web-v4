// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich, SplitProse, ValueCards, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Student Support',
  path: '/student-support/',
  description: 'Whether you are changing industries, upskilling or coming from high school, beginning a new endeavor can be equally daunting. That is why at IHNA our…',
})

export default function StudentSupportRoute() {
  return (
    <>
      <Hero heading="Student Support" variant="split" look="orbit" audienceSwitch={false} eyebrow="Future students" image={img({ src: '/images/ihna/pages/student-support.webp', alt: 'Student talking with a support officer', width: 604, height: 755 })} />
      <SectionNav section="student" current="/student-support/" />
      <Rich>
        <p className="lead">Whether you are changing industries, upskilling or coming from high school, beginning a new endeavor can be equally daunting. That is why at IHNA our educators, student support staff and registrars are all committed to supporting you to ease the transition to student life.</p>
        <p>We’re here to support you and make your learning journey smooth and positive. We offer all our students both one to one and group support services in the areas of Academic Support and Mental Health &amp; Wellbeing Support.</p>
        <p>Throughout your time at IHNA you will be met with a myriad of opportunities including:</p>
        <ul>
          <li>Academic Writing workshops</li>
          <li>Language support workshops</li>
          <li>APA referencing workshops</li>
          <li>Meditation, Yoga, Zumba, Dancing sessions</li>
          <li>Counselling support</li>
        </ul>
        <h4>All IHNA students are encouraged to submit all requests regarding system access, academic support and all requirements through this student service portal.</h4>
      </Rich>
      <ValueCards
        tone="muted"
        items={[
          { title: 'Administrative Support', body: <><p>You can raise your concerns related to course extension, assessment extension, withdrawals, differals etc.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'E-Learning Support', body: <><p>We are doing our best to deliver the best virtual learning experience to you. Your feedback is valuable to us. You may share it here.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'Finance', body: <><p>We are doing our best to clarify your queries about fees and the schedules. You can get through to us here.</p><p><a href="mailto:accounts@ihna.edu.au">accounts@ihna.edu.au</a></p></> },
          { title: 'Academic Support', body: <><p>To help us to ensure satisfying academic accomplishment, we welcome you to share your inputs and concerns here.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'IT Support', body: <><p>Our team is here to ensure the best course delivery enabled through our IT initiatives. You can raise your concerns here with respect to login and access issues.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'Testamur Application', body: <><p>Your academic accomplishment is our goal too. Get in touch with us for testamur application and issuance here.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'Complaints', body: <><p>Get assistance if you are not satisfied with the marks and assessment.</p><p><a href="mailto:studentcomplaints@ihna.edu.au">studentcomplaints@ihna.edu.au</a></p></> },
          { title: 'Appeals', body: <><p>Resolutions to your complaints are not satisfactory..! you can appeal here.</p><p><a href="mailto:studentcomplaints@ihna.edu.au">studentcomplaints@ihna.edu.au</a></p></> },
          { title: 'Job Placement Support', body: <><p>You can submit your CV and details here so that we can assist you in finding jobs.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'Counselling & Mental Health Wellbeing Services', body: <><p>Submit your request here if you need any assistance in counselling or stress management.</p><p><a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p></> },
          { title: 'Yammer – Student Engagement Platform', body: <><p>Connect with fellow students, participate in discussions, and stay updated with the latest community news on our Yammer platform.</p><p><a href="https://www.yammer.com/" target="_blank" rel="noopener noreferrer">Yammer – Student Engagement Platform</a></p></> },
          { title: 'Chat Bot', body: <><p>Get instant support and answers to your queries through our Chat Bot, available 24/7 to assist you.</p><p><a href="https://secure.livechatinc.com/licence/12907932/v2/open_chat.cgi?groups=7" target="_blank" rel="noopener noreferrer">Chat Bot</a></p></> },
        ]}
      />
      <SplitProse eyebrow="Wellbeing" heading="IHNA offers a free counseling service to support your mental health and *wellbeing*.">
        <p>IHNA offers a free counseling service to support your mental health and wellbeing. Additionally, MOST is a free mental health support platform available for all international students. It provides:</p>
        <ul>
          <li>Chatting with mental health professionals</li>
          <li>Access the Distress Tolerance Toolkit for simple, in-the-moment strategies</li>
          <li>Use the <a href="https://cdn.prod.website-files.com/687058ef735e5dfd5a6435c1/694092059a22f55cf1a1b8eb_e40241e0dac439efcb789bdbea6046c5_2025-26%20MOST%20Festive%20Care%20Pack.pdf" rel="noopener noreferrer">Festive Care Pack</a> for holiday wellbeing tips</li>
          <li>Students can download MOST on the <a href="https://apps.apple.com/au/app/most-mental-health-support/id6446385696" rel="noopener noreferrer"> Apple App Store </a> or <a href="https://play.google.com/store/apps/details?id=au.org.most.app.development&amp;hl=en_AU" rel="noopener noreferrer"> Google Play </a>, or visit <a href="https://www.most.org.au/" rel="noopener noreferrer">MOST</a>.</li>
        </ul>
        <p>Additional resources, including guidance on mental wellbeing, are available on Study Australia: How to access mental wellbeing support.</p>
        <h4>Important Notice on Scams:</h4>
        <p>The Department of Education have seen an increase in scams targeting vulnerable international students. Criminal organizations may attempt to use students as money mules, buy or sell student identity documents, or involve students in illegal activities like animal smuggling. Such scams can lead to loss of savings, legal charges, and risking your student visa status.</p>
        <p>Please stay vigilant and only use official channels for services and support. If you suspect any scam, contact IHNA or local authorities immediately.</p>
        <h3>Your safety and wellbeing are our top priority. Remember, help is always available.</h3>
      </SplitProse>
    </>
  )
}
