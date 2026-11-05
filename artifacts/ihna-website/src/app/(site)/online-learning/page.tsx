// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, CardGrid, Cta, EnquiryForm, Hero, Rich, ValueCards, VideoEmbed, Link } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Online Learning',
  path: '/online-learning/',
  description: 'Study online at IHNA in a supported, structured environment with educators and student support teams to guide you along the way.',
})

const faqs = [
  {
    q: 'Will I be able to contact my educator?',
    a: 'Yes, our online learning platform allows you to contact your educator just like you would in a classroom environment. We also have a 24/7 student support team to assist you as well.',
  },
  {
    q: 'How do I connect with my peers?',
    a: 'Our online platform allows you to Collaborate with your peers, participate in online discussions, ask questions, share your thoughts and contact your teachers.',
  },
  {
    q: 'What is the Online Library?',
    a: 'In addition to the learning resources for each of the course units, the online library is a host of books, resources, materials, videos, presentations etc that is available to our students. It contains hundreds of resources to help you with your studies and assignments.',
  },
  {
    q: 'Who can I ask for Non-Academic or technical help?',
    a: 'We also have a 24/7 student support team to assist you with any non-academic and any technical questions. Our team consists of staff with varied knowledge and we encourage you to contact us with any questions, big or small and we will try our best to assist you.',
  },
  {
    q: 'Can I do my assessments online?',
    a: 'Yes, our online learning platform allows you to view and complete your assessments online. You are also able to save your assessments and review them before you submit.',
  },
  {
    q: 'My course has lab simulations, how can I schedule those?',
    a: 'Your lab simulation will be scheduled in small groups at one of our campuses. Your timetable will have the scheduled lab simulation dates to help you plan your time accordingly.',
  },
  {
    q: 'Will my professional experience placement be organised by IHNA?',
    a: 'Yes, IHNA will organise professional experience placements (PEP) at health care facilities across Australia. PEPs are dependent on the availability at the facilities, so students are also encouraged for look for their own placements. To know more about how and pre-requisites to be completed before PE, contact your student support team.',
  },
  {
    q: 'Would I be eligible for funding if I study online?',
    a: 'Yes, in Victoria you can avail the government funding for both Online and Oncampus.',
  },
]

export default function OnlineLearningRoute() {
  return (
    <>
      <Hero
        heading="About Online Learning @ IHNA"
        variant="compact"
        audienceSwitch={false}
        eyebrow="Online learning"
        subheading="The structured learning format allows you to study in a supported environment with educators and student support teams to guide you along the way."
      />
      <Rich>
        <p>Online learning in now better than ever, you will have access to hundreds of online resources, articles presentations and videos so you will never stop exploring and learning. IHNA’s online webinars are scheduled so you can plan your study time in advance and speak to a &quot;living&quot; educator at every webinar.</p>
      </Rich>
      <CardGrid
        heading="Why Study Online?"
        columns="3"
        variant="grid"
        tone="muted"
        cards={[
          { title: 'Interactive Online learning platform' },
          { title: 'Supported learning environment' },
          { title: 'Access to e-learning resources' },
          { title: 'Scheduled online classes & forums' },
          { title: 'Manage your enrolment and fees' },
          { title: '24/7 student support team' },
        ]}
      />
      <Rich spacing="compact">
        <h2>How online study works</h2>
        <p>A supported learning environment that allows you to study on the go. With our structured online learning, you can fit study into your daily schedules.</p>
      </Rich>
      <VideoEmbed url="https://www.youtube.com/watch?v=IFyE4avutBA" title="IHNA Course Video" spacing="compact" />
      <Accordion
        heading="What is Structured online learning?"
        intro="Structured online learning feels like you are sitting in a classroom….just online! IHNA's online classroom is like being in the classroom where you interact with your educators and fellow students using our premium online portals. Regular activities, assessments and group activities create an interactive environment in which to learn."
        variant="faq"
        items={faqs.map(({ q, a }) => ({
          title: q,
          text: a,
          content: (
            <Rich depth={1}>
              <p>{a}</p>
            </Rich>
          ),
        }))}
      />
      <ValueCards
        heading="Courses Offered"
        items={[
          {
            title: 'Certificate III Courses',
            body: (
              <ul className="space-y-2">
                <li><Link href="/courses/certificate-iii-in-individual-support-ageing-and-disability/">CHC33021 – Certificate III in Individual Support (Ageing and Disability)</Link></li>
                <li><Link href="/courses/certificate-iii-pathology-collection/">HLT37215 – Certificate III in Pathology Collection</Link></li>
                <li><Link href="/courses/certificate-iii-in-sterilisation-services/">HLT37015 – Certificate III in Sterilisation Services</Link></li>
                <li>CHC30121 – Certificate III in Early Childhood Education and Care</li>
                <li>HLT33115 – Certificate III in Health Services Assistance</li>
                <li><Link href="/courses/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care/">HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care)</Link></li>
                <li><Link href="/courses/hlt35021-certificate-iii-in-dental-assisting/">HLT35021 – Certificate III in Dental Assisting</Link></li>
              </ul>
            ),
          },
          {
            title: 'Certificate IV Courses',
            body: (
              <ul className="space-y-2">
                <li>HLT47321 – Certificate IV in Health Administration</li>
                <li>CHC43121 – Certificate IV in Disability Support</li>
                <li>CHC43015 – Certificate IV in Ageing Support</li>
                <li>BSB40520 – Certificate IV in Leadership and Management</li>
              </ul>
            ),
          },
          {
            title: 'Diploma Courses',
            body: (
              <ul className="space-y-2">
                <li><Link href="/courses/diploma-of-nursing/">HLT54121 – Diploma of Nursing</Link></li>
                <li>CHC51015 – Diploma of Counselling</li>
                <li>CHC53315 – Diploma of Mental Health</li>
                <li>CHC50121 – Diploma of Early Childhood Education and Care</li>
                <li><Link href="/courses/chc52021-diploma-of-community-services-case-management/">CHC52021 – Diploma of Community Services (Case Management)</Link></li>
                <li>BSB50420 – Diploma of Leadership and Management</li>
                <li>HLT57715 – Diploma of Practice Management</li>
              </ul>
            ),
          },
        ]}
      />
      <Cta links={[{ href: '/courses/', label: 'View all IHNA courses', style: 'primary' }]} variant="inline" tone="muted" spacing="compact" />
      <EnquiryForm formKey="online-learning" heading="Want to know more? Feel free to contact us." />
    </>
  )
}
