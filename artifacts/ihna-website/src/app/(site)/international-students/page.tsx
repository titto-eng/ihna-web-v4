// This file is the page: edit it freely. Content from the live page (template-international-students.php). Course entries link only to
// pages that answer here; the live links of CHC30121 and the skill sets are 404 on live, so those entries are text.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Cta, Hero, img, Testimonials, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'International Students',
  path: '/international-students/',
  description: 'Join hundreds of international students studying at IHNA, an award-winning education and training provider that values industry-based learning.',
})

const T = '/images/ihna/theme/international'
const thumb = (file: string) => img({ src: `${T}/${file}`, width: 500, height: 334 })

/** The live course list, in its order. `href` only where the page answers (a course in the CMS). */
const COURSES: { title: string; badge: string; image: string; href?: string }[] = [
  { title: 'CHC52025 – Diploma of Community Services (Case Management)', badge: 'Diploma', image: 'diploma-community-services-case-management-thumb.jpg', href: '/courses/diploma-community-services-case-management/' },
  { title: 'HLT54121 – Diploma of Nursing', badge: 'Diploma', image: 'don-thumb.jpg', href: '/courses/diploma-of-nursing-int/' },
  { title: 'CHC33021 – Certificate III in Individual Support (Ageing and Disability)', badge: 'Certificate III', image: 'certificate-iii-individual-support-ageing-disability-thumb.jpg', href: '/courses/chc33021-certificate-iii-in-individual-support-ageing-and-disability-international/' },
  { title: 'CHC30121 – Certificate III in Early Childhood Education and Care', badge: 'Certificate III', image: 'chc30121-certificate-iii-in-early-childhood-education-and-care.jpg' },
  { title: 'HLT37215 – Certificate III in Pathology Collection', badge: 'Certificate III', image: 'certificate-iii-pathology-collection-thumb.jpg', href: '/courses/certificate-iii-pathology-collection/' },
  { title: 'HLTSS00064 – Infection Control Skill Set', badge: 'Skill set', image: 'infection-control-skill-set-thumb.webp' },
  { title: 'HLTSS00065 – Infection Control Skill Set (Retail)', badge: 'Skill set', image: 'HLTSS00065-Infection-Control-Skill-Set.jpg' },
  { title: 'HLTSS00066 – Infection Control Skill Set (Food Handling)', badge: 'Skill set', image: 'HLTSS00066-Infection-Control-Skill-Set-Food-Handling.jpg' },
  { title: 'HLTSS00067 – Infection Control Skill Set (Transport and Logistics)', badge: 'Skill set', image: 'HLTSS00067-Infection-control-Skill-Set--Logistics.jpg' },
  { title: 'CHCSS00114 – Entry into Care Roles Skill Set', badge: 'Skill set', image: 'entry-into-care-roles-skill-set-thumb.webp' },
  { title: 'CHCSS00070 – Assist Clients with Medication Skill Set', badge: 'Skill set', image: 'CHCSS00070-Assist-Clients-with-Medication-Skill-Set.jpg' },
  { title: 'CHCSS00088 – Induction', badge: 'Skill set', image: 'CHCSS00088-Induction.jpg' },
]

/** The live page's student quotes: the excerpts it shows; the full text is on /testimonials/. */
const QUOTES: { name: string; quote: string }[] = [
  { name: 'Miwa Fulu', quote: 'I found this course to be very informative and interacting with other students as well as the educator was another great source of learning method. How the instructor Tracy encouraged students to bring out the information or experience that they have was another way that I increased my knowledge in mental health. Learning about all the different theories was difficult but going through TA made me think how to utilize them in practice. In this regard, I found that Theory Assessment was one of …' },
  { name: 'Jennifer', quote: 'Starting this course in May 2022, I have learnt so much. I have learnt to be a strong, confident and positive person. This course has provided me with knowledge on a wide range of topics, and I would not have been able to do this without the support of my teachers Tracey, Payel, Meril and Sara. They have provided confidence and supported me when I was struggling with the computer. From a person who had no knowledge of the computer to now being able to type this message for others to read and …' },
  { name: 'Sandra Best', quote: 'I’ve had a positive learning experience and have found the guidance and support from the team members, including Tracey, Payel, Meril, Sara the administrative staff, to be exceptional. Throughout the course, I have received valuable and comprehensive instruction that has greatly enriched my understanding of the subject matter. The content is well-structured and presented in a manner that’s easy to understand, making it accessible for learners at all levels. Tracey and Payel are excellent …' },
  { name: 'Nansi Habib', quote: 'I recently arrived to Australia as a refugee born in Syria and had to live away from home in Lebanon for 12 years which prevented me from continuing my education and fulfil my passion which is becoming a counsellor and being able to help others with their mental health. When I enrolled in this course it was my very first step into a new country with new methods of teaching and learning. However after meeting my educator and having many inquiries with different subjects, the response of the …' },
  { name: 'Sinead Ramsbottom', quote: 'I’ve recently completed the Diploma of Counselling with IHNA. Overall my student experience was good. The course tutors Tracey and Payel were extremely helpful and supportive throughout the duration of the course. Tracey was my first tutor when I began the course and her wealth of industry experience and warm and friendly nature radiated in every class, I really looked forward to my classes with Tracey and am grateful to her for her encouragement and guidance. Payel supported me as I …' },
  { name: 'Tanya Maree Shelby', quote: 'CHC51015 – Diploma of Counselling Review at the Institute of Health and Nursing Australia. This course has been a great source of learning for me. The content and format of learning that I had from this course was very intensive and I learned a lot. For one I had no idea that I would be reading and publishing Journals that I have written or worked on in collaboration with others. I have had to discuss different topics in the discussion area which proved to be very informative for …' },
  { name: 'Tazin', quote: 'It has been a privilege to be a part of IHNA and I would like to thank the faculty for their encouragement and support. Moreover I would like to thank the new Course Coordinator Michelle Tollentino for the changes she has made, whether it might be extra-curricular sports activities, community events or education implementation. She has made the institute better which has helped me and others in many ways. Quote I wanted to share: “Try to be a rainbow in someone’s cloud” by Maya Angelou. Additionally …' },
  { name: 'Sheryl Karren Ginez', quote: 'Studying at IHNA has been a great experience. Our classroom is multicultural but we get along well, and we had fun while learning. It feels like a second home. My educators and admins at IHNA were supportive every step of the way, although they were strict when it comes to our assessments, I know it was for the betterment of my career. The campus is strategically located in the heart of Perth. It is near the transport station so it was always a breeze to come and learn. Now I am a …' },
]

export default function InternationalStudentsRoute() {
  return (
    <>
      <Hero
        heading="International Students"
        variant="split" look="panorama"
        audienceSwitch={false}
        subheading="Join hundreds of international students studying at IHNA. You will be choosing an award-winning education and training provider that values industry-based learning, innovative teaching and excellent graduate outcomes."
        image={img({ src: `${T}/domestic-course-header.jpg`, alt: 'IHNA international students', width: 1600, height: 601, focal: [80, 50] })}
        ctas={[
          { label: 'Courses', href: '#courseList', style: 'primary' },
          { label: 'Studying with Us', href: '#studyWithUs', style: 'secondary' },
          { label: 'Why IHNA', href: '#whyIHNA', style: 'link' },
        ]}
      />
      <SplitProse eyebrow="Study in Australia" heading="Information for International Students">
        <p>Making the brave decision to move countries to pursue your education comes with a lot of excitement and new challenges. We’re delighted that you’ve chosen Australia as a place to pursue your goals, a country with many professional opportunities for growth as well as plenty of places to visit and enjoy your time.</p>
        <p>We understand the challenges involved with moving and settling into a new place so we’re here to support you through it all. Our assistance begins when you’re still at home, from finding the right agent to filling out visa applications. Once you’ve arrived we’ll help you settle into your new home and navigate the resources available to you, including English language assistance.</p>
        <p>Notably, IHNA collaborates with industry partners and other institutions to provide you with professional and internationally recognised courses that are relevant and practical. All courses incorporate blended learning so that you can make the most of online and in-person experiences on campus with the latest simulation technologies.</p>
        <p>Courses are offered across a range of areas within nursing, health, and community services. You’ll find all the information you need on what’s available on our courses page. Make sure to navigate to the International Students tab in order to see all the relevant information you’ll need for your application.</p>
        <p>We’re eager to share our deep and relevant expertise of the industry with you for a bright future in Australian healthcare.</p>
      </SplitProse>
      <Cta links={[{ href: '/l-portfolio/', label: 'L – Portfolio', style: 'secondary' }]} variant="inline" spacing="compact" />
      <SplitProse anchorId="media-consent" tone="muted" eyebrow="Your privacy" heading="Photography, Video and Media Consent">
        <p>The <strong>Institute of Health and Nursing Australia (IHNA)</strong> regularly documents campus life, student lab activities, simulations, workshops and events to share with the IHNA community and the public via our website, learning platforms, emails and social media. This may involve taking photographs and video recordings that can be used in teaching materials as well as for educational and promotional purposes.</p>
        <p>By enrolling in an IHNA program or attending IHNA activities, you consent to IHNA using your image, voice and likeness in these materials. Where the student is under 18 years of age, parents and guardians are taken to consent on behalf of their child.</p>
        <p>If you do <strong>not</strong> wish to be photographed or filmed for these purposes, please inform an IHNA staff member at the time of enrolment or before the activity begins, or email us at <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a> with your full name, student ID and campus. You may also use this email address at any time to request the removal of your image or video from our website, social media or other digital platforms, where reasonably possible.</p>
      </SplitProse>
      <CardGrid
        anchorId="courseList"
        heading="Courses for International Students"
        columns="3"
        variant="grid"
        cards={COURSES.map((c) => ({ title: c.title, badge: c.badge, href: c.href, image: thumb(c.image) }))}
      />
      <CardGrid
        anchorId="studyWithUs"
        tone="muted"
        heading="Studying at IHNA?"
        intro="Join hundreds of international students studying at IHNA. You will be choosing an award-winning education and training provider that values industry-based learning, innovative teaching and excellent graduate outcomes."
        columns="4"
        variant="grid"
        cards={[
          { title: 'GST Requirement', href: '/genuine-student-test-requirement/' },
          { title: 'Exclusion to English Language Proficiency Tests requirements', href: '/english-language-proficiency-test-requirements/' },
          { title: 'IHNA International Course Guide', href: 'https://online.fliphtml5.com/wmka/pzco/' },
          { title: 'Student Handbook', href: 'https://online.fliphtml5.com/wmka/IHNA_SHB_26Apr23/#p=1' },
          { title: 'Studying In Australia', href: '/studying-australia/' },
          { title: 'Find a Registered Agent', href: '/international-student-recruitment/' },
          { title: 'Agent Application Form', href: '/pdf/IHNA_Education_Agent_Application_Form.pdf' },
          { title: 'Fees & Charges', href: '/ihna-fees-charges/' },
          { title: 'CRICOS', href: '/cricos/' },
          { title: 'Why IHNA', href: '#whyIHNA' },
          { title: 'Student Support Services', href: '/student-support/' },
          { title: 'Student Complaints and Appeals', href: '/student-complaints-appeal/' },
          { title: 'Policies & Procedures', href: '/policies-links-forms/' },
          { title: 'Scholarships', href: '/scholarship/' },
          { title: 'Uniform and Scrubs', body: 'For Perth Campus', href: 'https://www.wanneroouniforms.com.au/ihna/' },
          { title: 'Uniform and Scrubs', body: 'For Other Campuses', href: 'https://shop.fullypromoted.com.au/ihna' },
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
          ...QUOTES,
        ]}
      />
      <Cta links={[{ href: '/testimonials/', label: 'Read all testimonials', style: 'secondary' }]} variant="inline" spacing="compact" tone="muted" />
    </>
  )
}
