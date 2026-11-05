// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Cta, Hero, img, Rich, Tabs, Testimonials, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Domestic Students',
  path: '/domestic-students/',
  description: 'Join hundreds of students studying across Australia in Melbourne, Sydney, Perth and Brisbane with an award-winning education and training provider.',
})

const T = '/images/ihna/theme'

export default function DomesticStudentsRoute() {
  return (
    <>
      <Hero
        heading="Domestic Students"
        variant="split" look="panorama"
        audienceSwitch={false}
        subheading="Join hundreds of students studying across Australia in Melbourne, Sydney, Perth and Brisbane. You will be choosing an award-winning education and training provider that values industry-based learning, innovative teaching and excellent graduate outcomes."
        image={img({ src: `${T}/domestic-students-header.jpg`, alt: 'IHNA domestic students', width: 1600, height: 601, focal: [80, 50] })}
        ctas={[
          { label: 'Courses', href: '#courseList', style: 'primary' },
          { label: 'Studying with Us', href: '#studyWithUs', style: 'secondary' },
          { label: 'Why IHNA', href: '#whyIHNA', style: 'link' },
        ]}
      />
      <SplitProse eyebrow="Study at IHNA" heading="Information for Domestic Students">
        <p>Explore your passion for healthcare at an institute that cares about making your future career a reality. Whether you’ve just left school or are thinking of a career change, your learning at IHNA takes you straight to a satisfying job in healthcare.</p>
        <p>We’re here to make sure your experience comes with student welfare, administrative, and educational support. You’ll be assisted on how to make the most of funding opportunities and other schemes that can advance you through your studies.</p>
        <p>If you’re an Indigenous Australian, we’ll ensure that you access the support you need to pave your journey and shape the Australian healthcare industry. If you require accessibility conditions then we are here to make sure those needs are met so that you can pursue your goals.</p>
        <p>Courses are offered across a range of areas within nursing, health, and community services. As a domestic student you’ll have access to all the courses that are directly in demand across Australia today.</p>
        <p>We’re eager to share our deep and relevant expertise of the industry with students like you so that you can apply it directly to your growth.</p>
      </SplitProse>
      <Cta links={[
        { href: '/career-changers/', label: 'Career Changers', style: 'primary' },
        { href: '/school-leavers/', label: 'School Leavers', style: 'secondary' },
        { href: '/aboriginal-and-torres-strait-islander/', label: 'Aboriginal and Torres Strait Islander', style: 'secondary' },
        { href: '/l-portfolio/', label: 'L – Portfolio', style: 'link' },
      ]} variant="inline" spacing="compact" />
      <SplitProse anchorId="media-consent" tone="muted" eyebrow="Your privacy" heading="Photography, Video and Media Consent">
        <p>The <strong>Institute of Health and Nursing Australia (IHNA)</strong> regularly documents campus life, student lab activities, simulations, workshops and events to share with the IHNA community and the public via our website, learning platforms, emails and social media. This may involve taking photographs and video recordings that can be used in teaching materials as well as for educational and promotional purposes.</p>
        <p>By enrolling in an IHNA program or attending IHNA activities, you consent to IHNA using your image, voice and likeness in these materials. Where the student is under 18 years of age, parents and guardians are taken to consent on behalf of their child.</p>
        <p>If you do <strong>not</strong> wish to be photographed or filmed for these purposes, please inform an IHNA staff member at the time of enrolment or before the activity begins, or email us at <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a> with your full name, student ID and campus. You may also use this email address at any time to request the removal of your image or video from our website, social media or other digital platforms, where reasonably possible.</p>
      </SplitProse>
      <Rich anchorId="courseList" spacing="compact">
        <h2>Courses for Domestic Students</h2>
      </Rich>
      <Tabs
        spacing="compact"
        tabs={[
          {
            label: 'All Courses',
            content: (
              <CardGrid depth={1} columns="3" variant="grid" cards={[
                { title: 'CHC33021 – Certificate III in Individual Support (Ageing and Disability)', href: '/courses/certificate-iii-in-individual-support-ageing-and-disability/', image: img({ src: `${T}/certificate-iii-individual-support-ageing-disability-thumb.webp`, width: 1600, height: 629 }) },
                { title: 'HLT33115 – Certificate III in Health Services Assistance (Assisting in Nursing Work in Acute Care)', href: '/courses/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care/', image: img({ src: `${T}/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care-thumb.jpg`, width: 500, height: 334 }) },
                { title: 'CHC52025 – Diploma of Community Services (Case Management)', href: '/courses/diploma-community-services-case-management/', image: img({ src: `${T}/diploma-community-services-case-management-thumb.webp`, width: 1600, height: 629 }) },
                { title: 'HLT37215 – Certificate III in Pathology Collection (superseded)', href: '/courses/certificate-iii-pathology-collection/', image: img({ src: `${T}/certificate-iii-pathology-collection-thumb.webp`, width: 1600, height: 629 }) },
                { title: 'HLT37525 – Certificate III in Pathology (Pathology Collection)', href: '/courses/hlt37525-certificate-iii-in-pathology-collection/', image: img({ src: `${T}/certificate-iii-pathology-collection-thumb.webp`, width: 1600, height: 629 }) },
                { title: 'HLT37015 – Certificate III in Sterilisation Services', href: '/courses/certificate-iii-in-sterilisation-services/', image: img({ src: `${T}/HLT37015-c3-ss.png`, width: 500, height: 334 }) },
                { title: 'HLT35021 – Certificate III in Dental Assisting', href: '/courses/hlt35021-certificate-iii-in-dental-assisting/', image: img({ src: `${T}/hlt35021-certificate-iii-in-dental-assisting.png`, width: 500, height: 334 }) },
                { title: 'HLT54121 – Diploma of Nursing', href: '/courses/diploma-of-nursing/', image: img({ src: `${T}/don-thumb.jpg`, width: 350, height: 195 }) },
                { title: 'HLT57921 – Diploma of Anaesthetic Technology and Practices', href: '/courses/hlt57921-diploma-of-anaesthetic-technology-and-practices/', image: img({ src: `${T}/HLT37015-c3-ss.png`, width: 500, height: 334 }) },
              ]} />
            ),
          },
          {
            label: 'Short Courses and First Aid',
            content: (
              <CardGrid depth={1} columns="4" variant="grid" cards={[
                { title: 'HLTAID011 – Provide First Aid', href: '/courses/provide-first-aid/', image: img({ src: `${T}/provide-first-aid-thumb.jpg`, width: 500, height: 334 }) },
                { title: 'HLTAID009 – Provide Cardiopulmonary Resuscitation (CPR)', href: '/courses/provide-cardiopulmonary-resuscitation/', image: img({ src: `${T}/provide-cardiopulmonary-resuscitation-thumb.jpg`, width: 500, height: 334 }) },
                { title: 'HLTPAT005 – Collect Specimens for Drugs of Abuse Testing', href: '/courses/hltpat005-collect-specimens-for-drugs-of-abuse-testing/', image: img({ src: `${T}/lab-doctor-performing-medical-exam-urine-1.jpg`, width: 1600, height: 1067 }) },
                { title: 'HLTAID010 – Provide Basic Emergency Life Support', href: '/courses/provide-basic-emergency-life-support/', image: img({ src: `${T}/bls.jpg`, width: 500, height: 334 }) },
              ]} />
            ),
          },
        ]}
      />
      <CardGrid
        anchorId="studyWithUs"
        tone="muted"
        heading="Studying at IHNA."
        intro="Join hundreds of students studying across Australia in Melbourne, Sydney, Perth and Brisbane. You will be choosing an award-winning education and training provider that values industry-based learning, innovative teaching and excellent graduate outcomes."
        columns="4"
        variant="grid"
        cards={[
          { title: 'Our Locations and Facilities', href: '/our-locations/' },
          { title: 'Policies & Procedures', href: '/policies-links-forms/' },
          { title: 'Fees & Charges', href: '/ihna-fees-charges/' },
          { title: 'Student Support Services', href: '/student-support/' },
          { title: 'Student Complaints and Appeals', href: '/student-complaints-appeal/' },
          { title: 'Recognition of Prior Learning & Credit Transfer', href: '/rpl-and-credit-transfer/' },
          { title: 'VET Student Loans', href: '/vet-students-loan/' },
          { title: 'Study Online', href: '/library/' },
          { title: 'Scholarships', href: '/scholarship/' },
          { title: 'Uniform and Scrubs', body: 'For Perth Campus', href: 'https://www.wanneroouniforms.com.au/ihna/' },
          { title: 'Uniform and Scrubs', body: 'For Other Campuses', href: 'https://shop.fullypromoted.com.au/ihna' },
          { title: 'Student Handbook', href: 'https://online.fliphtml5.com/wmka/IHNA_SHB_26Apr23/#p=1' },
        ]}
      />
      <CardGrid
        anchorId="whyIHNA"
        heading="Why IHNA?"
        columns="3"
        variant="grid"
        cards={[
          { title: 'Awards & Recognition', body: 'IHNA is proud of having earned a number of awards and recognitions from Australia and overseas.' },
          { title: 'Partnerships & Pathways', body: 'Our institute partners with a number of educational companies and universities and offers pathway options to leading universities in Australia.' },
          { title: 'Job Placement Assistance', body: 'We connect you with a number of companies and job providers, and give you a hand in landing your dream job.' },
          { title: 'Knowledge Partner', body: 'We provide quality industry healthcare training and knowledge partnership to help your business grow and excel.' },
          { title: 'Career Partner', body: 'Since education is an on-going process through your life, we build relationships with our students and help them further their education continuously.' },
          { title: 'Training Partner', body: 'We partner with a number of training institutions in Australia and globally to provide healthcare education in different parts of the globe.' },
        ]}
      />
      <Testimonials
        heading="Hear from our Students."
        variant="carousel"
        tone="muted"
        inline={[
          { name: 'Studying Diploma of Practice Management at IHNA', role: 'Student stories', videoUrl: 'https://www.youtube.com/watch?v=heGpvmGRT5E' },
          { name: 'Studying Diploma of Practice Management at IHNA', role: 'Student stories', videoUrl: 'https://www.youtube.com/watch?v=lP81b-JOxi0' },
          { name: 'Diploma of Nursing at IHNA', role: 'Student stories', videoUrl: 'https://www.youtube.com/watch?v=h6gw_kobeQ8' },
        ]}
      />
    </>
  )
}
