// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, CardGrid, Hero, Rich, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Mental Health & Wellbeing Support Services',
  path: '/mental-health-wellbeing-support-services/',
  description: 'Mental health is a state of well-being that allows everyone to realise their potential, to cope with challenges in life, work successfully and…',
})

export default function MentalHealthWellbeingSupportServicesRoute() {
  return (
    <>
      <Hero heading="Mental Health &amp; Wellbeing Support Services" variant="compact" audienceSwitch={false} eyebrow="Current students" />
      <SectionNav section="current-student" current="/mental-health-wellbeing-support-services/" />
      <Rich>
        <p className="lead">Mental health is a state of well-being that allows everyone to realise their potential, to cope with challenges in life, work successfully and productively and contribute to the community. Our goal is to create a culture whereby mental health is valued, promoted and free from stigma. We want to spread awareness of mental health challenges so that individuals are equipped to navigate it personally as well as support those around us who are affected.</p>
      </Rich>
      <SplitProse tone="muted" eyebrow="Wellbeing" heading="Workshops & *Seminars*">
        <p>Throughout the year, IHNA hosts a series of online workshops and seminars for our students on the topic of Mental Health and Wellbeing. These sessions are hosted by Mental health professionals; the purpose of these workshops is to:</p>
        <ul>
          <li>Build Awareness and promote a better understanding of mental health &amp; mental illness through addressing frequent misconceptions</li>
          <li>To encourage students to take proactive measures to look after your physical and mental wellbeing. Student life is hard enough as it is, but we understand many of our students also have work and family commitments. That is why we run workshops such as yoga, meditation and Zumba, so that students can carve a little time of their day to look after yourself!</li>
          <li>We also want to equip you with the knowledge and access to resources to be able to look after yourself or others, so our workshops aim to also inform students about the awareness of support services available</li>
        </ul>
        <p>Mental Health and Wellbeing sessions are conducted once in a month, please stay tuned to event updates that are emailed to students. You can also find out more through <a href="https://hcig.sharepoint.com/sites/StudentSupport/SitePages/Counselling.aspx" rel="noopener noreferrer">Student Hub</a></p>
      </SplitProse>
      <SplitProse eyebrow="Support" heading="Counselling *Services*">
        <p>All our campuses are staffed with compassionate Student Support Officers who can help refer you to counselling services and other forms of social, psychological and medical support based on your location and your specific needs.</p>
      </SplitProse>
      <Accordion
        tone="muted"
        heading="FAQs Regarding counselling"
        items={[
          {
            title: 'What is counselling? And who provides it?',
            text: 'Counselling is offered by a qualified counsellor with Relationships Australia. A counsellor facilitates discussions in areas of concern, exploring the factors that are influencing the situation, and the thoughts and emotions involved. The counsellor will support you to generate ways of resolving or dealing with the difficulties being experienced. Counselling for IHNA students is provided by our Mental Health Services partner Relationships Australia. Relationships Australia’s qualified psychologists, social workers and counsellors have experience working with a range of client’s including organ',
            content: (
              <>
                <Rich depth={1}>
                  <p>Counselling is offered by a qualified counsellor with Relationships Australia. A counsellor facilitates discussions in areas of concern, exploring the factors that are influencing the situation, and the thoughts and emotions involved. The counsellor will support you to generate ways of resolving or dealing with the difficulties being experienced.</p>
                  <p>Counselling for IHNA students is provided by our Mental Health Services partner Relationships Australia.</p>
                  <p>Relationships Australia’s qualified psychologists, social workers and counsellors have experience working with a range of client’s including organisations individual’s, couples and families.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'What are the costs?',
            text: 'IHNA students have access to two free counselling sessions through Relationships Australia our external provider for counselling services. More sessions can be added if needed. Other than Counselling, should a student require or be interested in accessing further mental health services such as a Psychologists, this can be accessed through referral from a GP. The costs for these sessions can be covered through a Mental Health Care Plan which for international students is covered through the Overseas Student Health Cover.',
            content: (
              <>
                <Rich depth={1}>
                  <p>IHNA students have access to two free counselling sessions through Relationships Australia our external provider for counselling services. More sessions can be added if needed.</p>
                  <p>Other than Counselling, should a student require or be interested in accessing further mental health services such as a Psychologists, this can be accessed through referral from a GP. The costs for these sessions can be covered through a Mental Health Care Plan which for international students is covered through the Overseas Student Health Cover.</p>
                </Rich>
              </>
            ),
          },
          {
            title: 'Will this be disclosed to anyone?',
            text: 'Absolutely not! Should you seek a referral to see a counsellor, this information will not effect your enrolment nor will it be disclosed to anyone outside of the required persons and those with your informed consent. Although IHNA individually refers staff to this service. What you discuss with your counsellor is completely confidential. This confidentiality will be discussed in detail with you at your first session. If you would like to know more about Relationships Australia please see: Relationships Australia Victoria – Counselling',
            content: (
              <>
                <Rich depth={1}>
                  <p>Absolutely not! Should you seek a referral to see a counsellor, this information will not effect your enrolment nor will it be disclosed to anyone outside of the required persons and those with your informed consent. Although IHNA individually refers staff to this service. What you discuss with your counsellor is completely confidential. This confidentiality will be discussed in detail with you at your first session. If you would like to know more about Relationships Australia please see: <a href="https://www.relationshipsvictoria.com.au/services/counselling/" rel="noopener noreferrer">Relationships Australia Victoria – Counselling</a></p>
                </Rich>
              </>
            ),
          },
          {
            title: 'Is this service available for international students?',
            text: 'Yes it is! Counselling through Relationships Australia is available for all IHNA students domestic and international.',
            content: (
              <>
                <Rich depth={1}>
                  <p>Yes it is! Counselling through Relationships Australia is available for all IHNA students domestic and international.</p>
                </Rich>
              </>
            ),
          },
        ]}
      />
      <Rich>
        <p>Please do not hesitate to contact the Student Support Officer at your campus, if you would like to know more.</p>
        <h2>Community Mental Health Services</h2>
        <p><strong>For Emergency assistance Call 000</strong></p>
        <ul>
          <li>For immediate 24/7 emergency assistance (police, ambulance or fire): Call Triple Zero 000</li>
          <li>Call 000 and explain your emergency</li>
          <li>You will be directed as to what to do</li>
          <li>Rape and domestic violence services Call 000</li>
        </ul>
      </Rich>
      <CardGrid cards={[
        {
          title: 'Beyond Blue: for anxiety or depression',
          body: '1300 22 4636 Online chat available too',
          href: 'https://www.beyondblue.org.au/',
        },
        {
          title: 'Lifeline: anyone having a personal crisis',
          body: '13 11 14 Chat online or text',
          href: 'https://www.lifeline.org.au/',
        },
        {
          title: 'MensLine Australia: for men facing emotional or relationship concerns',
          body: '1300 78 99 78',
          href: 'https://mensline.org.au/',
        },
        {
          title: 'Kids Helpline: counselling for young people aged 5 to 25',
          body: '1800 55 1800',
          href: 'https://kidshelpline.com.au/',
        },
        {
          title: 'Suicide Call Back Service: for anyone thinking about suicide',
          body: '1300 659 467',
          href: 'https://suicidecallbackservice.org.au/',
        },
        {
          title: 'headspace',
          body: 'Mental health support for young people aged 12-25, including their family and friends Find a headspace centre near you or access online and phone counselling through eheadspace',
          image: img({ src: '/images/ihna/theme/headspace/Portrait_full-colour_no-tagline.jpg', alt: 'Mental Health & Wellbeing Support Services - IHNA', width: 849, height: 705 }),
          href: 'https://headspace.org.au/',
        },
        {
          title: 'A conversation can make a difference.',
          body: 'It is a reminder to check in with the people around us, start meaningful conversations and make wellbeing part of everyday life.',
          href: '/r-u-ok/',
        },
      ]} columns="3" variant="grid" />
    </>
  )
}
