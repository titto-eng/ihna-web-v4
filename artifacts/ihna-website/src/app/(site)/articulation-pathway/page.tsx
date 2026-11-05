// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, ChecklistItems, CountStats, Cta, FeatureCards, Hero, JourneySteps, Link, Pathways, Rich, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Articulation Pathway',
  path: '/articulation-pathway/',
  description: 'IHNA recognises relevant prior study through credit transfer and recognition of prior learning. Every application is assessed individually, in writing.',
})

const caveat = 'Subject to ANMAC accreditation and NMBA approval'
const email = 'partnerships@hci.edu.au'
const mailto = (subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
const mailStudent = mailto('Student pathway enquiry', "Hello Pathway Advisor,\n\nMy current or completed qualification:\nThe pathway I'm interested in:\nDomestic or onshore international:\n\nThank you.")
const mailRto = mailto('RTO articulation partnership enquiry', "Hello,\n\nOrganisation name and RTO number:\nQualifications we deliver:\nContact person and role:\n\nWe'd like to discuss an articulation partnership.")

type Pathway = {
  destination: string
  meta: string
  caveat?: string
  href?: string
  provider: string
  eligible: { code?: string; title: string; note?: string }[]
  credit: string
  progression: string
  conditions: string[]
  locations: string
}

const diplomas: Pathway[] = [
  {
    destination: 'HLT54121 Diploma of Nursing',
    meta: 'Diploma · Nursing · HLT54121',
    href: '/courses/diploma-of-nursing/',
    provider: 'Participating RTO — signed partner status to be confirmed',
    eligible: [
      { code: 'CHC33021', title: 'Certificate III in Individual Support' },
      { code: 'CHC43015', title: 'Certificate IV in Ageing Support' },
      { code: 'HLT33115', title: 'Certificate III in Health Services Assistance' },
      { title: 'Certificate IV in Allied Health Assistance', note: 'Code not specified in source' },
      { code: 'CHC43115', title: 'Disability-sector qualification', note: 'Targeted feeder only — subject to mapping; equivalent credit not confirmed' },
    ],
    credit: 'Credit transfer for identical or equivalent completed units; recognition of prior learning (RPL) assessed on evidence for other learning. No fixed number of months or units is promised.',
    progression: `Onward study: Bachelor of Nursing (${caveat}), requiring current enrolled nurse registration.`,
    conditions: [
      'Individual written assessment determines actual credit',
      'Standard entry and English / LLN requirements apply',
      'Placement requirements: police check, Working with Children check and immunisations',
    ],
    locations: 'Melbourne, Sydney, Perth, Brisbane, Adelaide and Hobart, with blended options. Locations and modes are subject to course, intake and international registration confirmation.',
  },
  {
    destination: 'CHC52021 Diploma of Community Services',
    meta: 'Diploma · Community services · CHC52021',
    href: '/courses/chc52021-diploma-of-community-services-case-management/',
    provider: 'Participating RTO — signed partner status to be confirmed',
    eligible: [
      { code: 'CHC32015', title: 'Certificate III in Community Services' },
      { code: 'CHC42021', title: 'Certificate IV in Community Services' },
      { code: 'CHC43315', title: 'Certificate IV in Mental Health' },
      { code: 'CHC40421', title: 'Certificate IV in Youth Work' },
      { code: 'CHC43115', title: 'Certificate IV in Disability Support', note: 'Title as stated in source' },
      { code: 'CHC33021', title: 'Certificate III in Individual Support' },
    ],
    credit: 'Unit-level credit transfer for identical or equivalent units, and evidence-based RPL. No fixed credit amount is promised.',
    progression: 'Onward study: Bachelor of Social Work.',
    conditions: [
      'Individual written assessment determines actual credit',
      'Standard entry and English / LLN requirements apply',
    ],
    locations: 'IHNA campuses, with blended and online options. Confirm course availability for your intake.',
  },
]

const bachelors: Pathway[] = [
  {
    destination: 'Bachelor of Nursing',
    meta: 'Bachelor · Nursing',
    caveat,
    provider: 'IHNA, or a participating RTO — signed partner status to be confirmed',
    eligible: [{ code: 'HLT54121', title: 'Diploma of Nursing', note: 'Plus current NMBA enrolled nurse registration' }],
    credit: 'Up to 12 months (8 units), with entry to second year subject to individual assessment. Credit is not automatic.',
    progression: 'Entry to second year of the degree, where assessment supports it.',
    conditions: [
      'Enrolment is conditional on accreditation and approvals',
      'Current enrolled nurse registration required',
      'Placement requirements: police check, Working with Children check and immunisations',
    ],
    locations: 'Melbourne, Sydney, Perth and Brisbane, subject to approvals and intake confirmation.',
  },
  {
    destination: 'Bachelor of Social Work',
    meta: 'Bachelor · Community services',
    provider: 'IHNA, or a participating RTO — signed partner status to be confirmed',
    eligible: [
      { code: 'CHC52021', title: 'Diploma of Community Services' },
      { code: 'CHC52015', title: 'Diploma of Community Services', note: 'Superseded qualification, listed in Strategy §1.2' },
    ],
    credit: 'Up to 12 months, a maximum of 25% of the four-year degree, with entry to second year subject to assessment.',
    progression: 'Entry to second year of the degree, where assessment supports it.',
    conditions: [
      'No credit for core social work units or later placements',
      'No blanket field-education exemption and no double counting',
      'Described as AASW-accredited in the supplied sources',
    ],
    locations: 'North Melbourne. Further campuses are planned and are not currently available.',
  },
]

function pathwayItem(p: Pathway) {
  return {
    title: p.destination,
    content: (
      <Rich depth={1}>
        <p><strong>{p.meta}</strong>{p.caveat && <><br /><em>{p.caveat}</em></>}</p>
        <h4>Source institution / provider</h4>
        <p>{p.provider}</p>
        <h4>Eligible qualifications</h4>
        <ul>
          {p.eligible.map((e) => (
            <li key={`${e.code ?? ''}${e.title}`}>
              {e.code && <strong>{e.code} </strong>}{e.title}{e.note && <em> ({e.note})</em>}
            </li>
          ))}
        </ul>
        <h4>Destination</h4>
        <p>{p.href ? <Link href={p.href}>{p.destination}</Link> : p.destination}{p.caveat && ` — ${p.caveat}`}</p>
        <h4>Credit</h4>
        <p>{p.credit}</p>
        <h4>Progression</h4>
        <p>{p.progression}</p>
        <h4>Conditions</h4>
        <ul>{p.conditions.map((c) => <li key={c}>{c}</li>)}</ul>
        <h4>Locations and modes</h4>
        <p>{p.locations}</p>
      </Rich>
    ),
  }
}

export default function ArticulationPathwayRoute() {
  return (
    <>
      <Hero
        eyebrow="Articulation pathways and partnerships"
        heading="The learning you've done counts. Let's work out how far."
        subheading="For healthcare and community services learners taking the next step, IHNA recognises relevant prior study through credit transfer and recognition of prior learning. Every application is assessed individually, in writing, before you commit."
        variant="compact"
        audienceSwitch={false}
        ctas={[
          { label: 'Find my pathway', href: '#finder', style: 'primary' },
          { label: 'I represent an RTO', href: '#institutions', style: 'secondary' },
        ]}
      />
      <JourneySteps
        heading="A typical route"
        intro={`Bachelor of Nursing: ${caveat}. Credit and duration are never automatic.`}
        steps={[
          { title: 'Diploma', body: 'e.g. HLT54121 Diploma of Nursing or CHC52021 Diploma of Community Services. Your foundation.' },
          { title: 'Credit assessment', body: 'Credit transfer / RPL assessed individually, in writing. Before you commit.' },
          { title: 'Bachelor Degree', body: 'e.g. Bachelor of Nursing or Bachelor of Social Work. Up to 12 months credit, assessed.' },
        ]}
      />
      <CountStats
        items={[
          { value: '4', label: 'destination courses across the two pathways' },
          { value: '5', label: 'existing university partners named in source' },
          { value: '2', label: 'working days — target for first advisor response' },
          { value: '5', label: 'working days — written indicative credit after verified documents' },
        ]}
      />
      <FeatureCards
        anchorId="why"
        columns={2}
        tone="default"
        heading="A clearer next step, with honest *limits*."
        intro="Articulation links one qualification to the next. It's designed to respect your previous learning. It does not guarantee employment, a visa, professional registration or unconditional admission, and we'd rather tell you that up front."
        items={[
          { title: 'Recognise what you’ve learned', body: <p>Completed units that are identical or equivalent can transfer. Other evidenced learning can be assessed through RPL.</p> },
          { title: 'Avoid repeating content', body: <p>Spend your time on what’s new to you rather than relearning what you already know and can demonstrate.</p> },
          { title: 'Potentially shorten study and cost', body: <p>Where your written assessment supports it, credit may reduce duration. The amount is set individually, never assumed.</p> },
          { title: 'Keep building a caring career', body: <p>Pathways connect certificate, diploma and degree study in nursing and community services.</p> },
        ]}
      />
      <FeatureCards
        columns={2}
        eyebrow="Two ways to get credit"
        items={[
          { title: 'Credit transfer', mark: 'CT', body: <p>Recognises completed units that are identical or equivalent to units in your new course.</p> },
          { title: 'Recognition of prior learning (RPL)', mark: 'RPL', body: <p>Assesses other prior learning against unit requirements, based on the evidence you provide.</p> },
        ]}
      />
      <Pathways
        anchorId="finder"
        heading="Pathway Finder"
        intro="Start with what you hold, or what you're studying now. How each pathway works: start with a diploma, then progress to a bachelor degree with credit."
        paths={[
          {
            label: '01',
            title: 'Nursing pathway',
            tagline: 'Diploma of Nursing → Bachelor of Nursing',
            structure: 'Up to 12 months credit',
            body: '8 units · entry to second year, subject to individual assessment',
            advantages: [
              { text: 'Step 1 · Diploma: HLT54121 Diploma of Nursing — 5 eligible feeder qualifications; RPL and credit transfer assessed' },
              { text: 'Step 2 · Bachelor Degree: Bachelor of Nursing — 2nd year entry possible, where assessment supports it' },
            ],
            progression: 'Requires current NMBA enrolled nurse registration',
            notice: caveat,
            ctas: [{ label: 'View course details', href: '#ihna', style: 'primary' }],
          },
          {
            label: '02',
            title: 'Community services pathway',
            tagline: 'Diploma of Community Services → Bachelor of Social Work',
            structure: 'Up to 12 months credit',
            body: 'Max. 25% of the four-year degree · entry to second year, subject to assessment',
            advantages: [
              { text: 'Step 1 · Diploma: CHC52021 Diploma of Community Services — 6 eligible feeder qualifications; RPL and credit transfer assessed' },
              { text: 'Step 2 · Bachelor Degree: Bachelor of Social Work — 2nd year entry possible, where assessment supports it' },
            ],
            progression: 'No credit for core social work units or later placements',
            ctas: [{ label: 'View course details', href: '#ihna', style: 'primary' }],
          },
        ]}
      />
      <Accordion anchorId="ihna" heading="Diploma Courses" variant="plain" items={diplomas.map(pathwayItem)} />
      <Accordion anchorId="ihm" heading="Bachelor Degrees" variant="plain" items={bachelors.map(pathwayItem)} />
      <JourneySteps
        anchorId="process"
        heading="Six steps, and you'll know your credit in writing before you decide."
        steps={[
          { title: 'Enquire', body: 'Email a Pathway Advisor directly. Target first response: within 2 working days.' },
          { title: 'Share your record', body: 'Provide a verified USI transcript or academic record. Current students can share proof of enrolment for a conditional pre-assessment.' },
          { title: 'Indicative credit', body: 'Receive written indicative credit within 5 working days after your documents are verified.' },
          { title: 'Apply', body: 'Submit a formal application. Admission checks, entry and English / LLN requirements apply.' },
          { title: 'Offer and acceptance', body: 'The manual describes a 5 working day target for complete applications — a target, not an unconditional promise.' },
          { title: 'Start well', body: 'Priority orientation and a transition workshop help you settle into the new level of study.' },
        ]}
      />
      <FeatureCards
        columns={2}
        tone="default"
        eyebrow="Who can apply"
        items={[
          { title: 'Domestic eligibility', mark: 'D', body: <ChecklistItems columns={1} items={[<>Current students, and alumni who completed within the last 18 months, in an eligible feeder qualification.</>, <>Standard entry and English / LLN requirements apply.</>, <>Nursing placements require a police check, Working with Children check and immunisations.</>]} /> },
          { title: 'Onshore international students', mark: 'I', body: <ChecklistItems columns={1} items={[<>A completion-first policy applies: you&apos;re expected to complete your current course.</>, <>Before any offer, admissions checks Standard 7, the six-month/1 year principal-course restriction, any release required, and PRISMS.</>, <>We can&apos;t provide migration advice. Please seek a registered migration agent for visa questions.</>]} /> },
        ]}
      />
      <SplitProse
        tone="muted"
        eyebrow="20 per cent off"
        heading="HCI Pathway *Scholarship*"
        intro="Eligible students may receive the HCI Pathway Scholarship of 20 per cent off first-semester tuition fees. Conditions apply."
      >
        <h3>Conditions</h3>
        <ul>
          <li>Eligibility for students from signed partner RTOs must be confirmed.</li>
          <li>Start within 18 months of completing your feeder qualification.</li>
          <li>Domestic students, and onshore international students eligible under Standard 7.</li>
          <li>All admission criteria must be met.</li>
          <li>Applied as credit on the first invoice; not cash, not transferable, first semester only.</li>
          <li>Cannot be combined with the Industry Hub discount or other HCI scholarships or promotions.</li>
          <li>Terms for future applicants may change on 60 days&apos; partner notice; existing offers are unaffected.</li>
          <li>The scholarship does not change credit or admission decisions.</li>
        </ul>
      </SplitProse>
      <Cta
        anchorId="institutions"
        variant="inline"
        heading="Give your graduates a responsible next step."
        body="If your RTO delivers certificate qualifications in health, ageing, disability or community services, a partnership can give your learners a documented route into IHNA study."
        links={[{ label: 'Discuss a partnership', href: mailRto, style: 'primary' }]}
      />
      <JourneySteps
        heading="For registered training organisations"
        steps={[
          { title: 'No fees, commissions or minimum numbers', body: 'Participation costs nothing and carries no volume targets.' },
          { title: 'A non-binding MOU', body: 'A memorandum of understanding records intent without locking either party in.' },
          { title: 'You inform; we lead sessions', body: 'Your RTO informs its own students and hosts IHNA-led information sessions.' },
          { title: 'Clear separation', body: 'Only IHNA issues offers and CoEs and collects tuition. No joint awards, joint delivery or agent relationship.' },
          { title: 'Privacy by design', body: 'Students self-refer, so you never pass on personal information.' },
        ]}
      />
      <Cta
        anchorId="contact"
        variant="inline"
        heading="I'm a student or graduate"
        body="Tell us what you've studied and where you'd like to go. Have your USI transcript ready if you can."
        links={[{ label: 'Email a Pathway Advisor', href: mailStudent, style: 'primary' }]}
      />
      <Cta
        variant="inline"
        heading="I represent an RTO"
        body="Share your RTO number and the qualifications you deliver, and we'll start a conversation."
        links={[{ label: 'Discuss a partnership', href: mailRto, style: 'secondary' }]}
      />
      <Rich>
        <p>Both open your email app addressed to <a href={`mailto:${email}`}>{email}</a>. Other contact: <Link href="/contact/">IHNA contact</Link></p>
      </Rich>
    </>
  )
}
