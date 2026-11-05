// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Cta, Hero, img, LogoBadge, Pic, Rich } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'IHM Courses',
  path: '/ihm-courses/',
  description: 'Looking to advance your global career in healthcare?',
})

export default function IhmCoursesRoute() {
  return (
    <>
      <Hero heading="IHM Courses" variant="compact" audienceSwitch={false} />
      <LogoBadge dark logo={{ src: '/images/ihna/uploads/2023/08/ihmw.png', alt: 'IHM Courses', width: 300, height: 141 }} />
      <Rich spacing="compact">
        <h3>INSTITUTE OF HEALTH AND MANAGEMENT</h3>
        <p>Looking to advance your global career in healthcare?</p>
      </Rich>
      <Cta links={[
        { href: 'https://ihm.edu.au/', label: 'Know more', style: 'primary' },
        { href: 'https://ihm.edu.au/contact/#enqf', label: 'Enquire now', style: 'secondary' },
      ]} variant="inline" />
      <Rich>
        <p><Pic src="/images/ihna/theme/ihm-lp/hero-img.png" alt="" width={613} height={635} /></p>
        <h3>Technology-rich, innovative learning environments that focus on outcome-driven practical learning are a key focus for IHM.</h3>
        <p><Pic src="/images/ihna/theme/ihm-lp/abt-img.webp" alt="" width={996} height={664} /></p>
        <h3>About IHM</h3>
        <p>The healthcare industry is in an era of transformation, and educators in this sector have to innovate to prepare practitioners for best practices and models of care. This is where an education at IHM truly makes a difference. Bringing together the collective expertise of experienced nurses, academics, and clinicians, IHM courses are delivered by professionals with extensive expertise in on-campus and online learning and teaching.</p>
        <p>Since 2012, the Institute of Health &amp; Management (IHM) has established itself as a premier provider of exceptional healthcare and nursing education in Australia. Offering industry acclaimed programs for Nurses, Medical practitioners, Dentists and other Healthcare professionals, IHM has achieved the status of an institute of higher education granted by the Australian Government’s Tertiary Education Quality and Standards Agency (TEQSA).</p>
        <p>Technology-rich, innovative learning environments that focus on outcome-driven practical learning are a key focus for IHM. Virtual reality simulations, immersive learning platforms, and curriculums aligned with global best practices allow our students to get on board with the latest knowledge, tools and techniques. IHM graduates will be equipped with skills and competencies that will give them an edge over their peers.</p>
        <h3>Quality of Education Experience at IHM</h3>
        <p>IHM is ranked in the top 25 Australian higher education institutions for quality of education experience according to the ratings of participating IHM students in the 2020 Student Experience Survey (SES). IHM was ranked #22 for Overall Quality, #6 for Skills Development and #32 for Student Support, out of 134 participating higher education institutions.</p>
        <h3>List of Courses</h3>
      </Rich>
      <CardGrid cards={[
        {
          title: 'Master of Nursing',
          body: 'Australian healthcare requires a large number of nurses, who are in high demand due of their wide range of practice and medical care approaches. As a nurse, you may play a vital role in promoting health, preventing illness, and caring for all people by completing our Master of Nursing degree program www.ihm.edu.au',
          image: img({ src: '/images/ihna/theme/ihm-lp/mn.webp', alt: 'Masters-nursing', width: 826, height: 661 }),
          href: 'https://ihm.edu.au/courses/master-of-nursing/',
        },
        {
          title: 'Bachelor of Social Work',
          body: 'Bachelor of Social Work will be able to influence local, national, and global social policy impacting all peoples and communities. The IHM Bachelor of Social Work offers significant interaction between students, their peers, social work academics, and social work/human services www.ihm.edu.au',
          image: img({ src: '/images/ihna/theme/ihm-lp/bsw.webp', alt: '', width: 740, height: 493 }),
          href: 'https://ihm.edu.au/courses/bachelor-of-social-work/',
        },
        {
          title: 'Graduate Certificate in Advanced Nursing',
          body: '(12 Specialisation) Graduate Certificate in Advanced Nursing course is certified course in Australia and also suitable for overseas students who are currently trained nurses working in a specialised nursing context and seeking to further develop their specialised nursing knowledge and formalise their clinical abilities. www.ihm.edu.au',
          image: img({ src: '/images/ihna/theme/ihm-lp/gcan.webp', alt: '', width: 740, height: 1112 }),
          href: 'https://ihm.edu.au/graduate-certificate-in-advanced-nursing/',
        },
        {
          title: 'Graduate Certificate in Advanced Nursing',
          body: '(Australian Nursing Practice) The Graduate Certificate in Advanced Nursing – Australian Nursing Practice specialty has been meticulously designed to assist Internationally Qualified Registered Nurses in becoming acquainted with the Australian health-care system. This course includes NCLEX RN preparation, PTE Training, four weeks of OSCE training and Practical Experience Placement (PEP) www.ihm.edu.au',
          image: img({ src: '/images/ihna/theme/ihm-lp/gcananp.webp', alt: '', width: 740, height: 1109 }),
          href: 'https://ihm.edu.au/courses/graduate-certificate-in-advanced-nursing-australian-nursing-practice/',
        },
        {
          title: 'NCLEX for RNs NCLEX Exam Preparation Course',
          body: 'At IHM, we recognise the unparalleled importance of the NCLEX (National Council Licensure Examination) as the foremost global licensure exam for nurses. www.ihm.edu.au',
          image: img({ src: '/images/ihna/theme/ihm-lp/nclex-thumb.webp', alt: '', width: 740, height: 1110 }),
          href: 'https://ihm.edu.au/courses/nclex-for-rns/',
        },
        {
          title: 'Medical Career Advancement Program (MCAP) for Australian Medical Council (AMC) Written Examination – Part 1',
          body: 'The Medical Career Advancement Program (MCAP) for Australian Medical Council (AMC) Written Examination – Part 1, is a preparatory course which enhances your professional knowledge and helps you to prepare for the Australian Medical Council written examination. www.ihm.edu.au',
          image: img({ src: '/images/ihna/theme/ihm-lp/mcap-thumb.webp', alt: '', width: 740, height: 1110 }),
          href: 'https://ihm.edu.au/courses/mcap-for-amc-written-examination-part-1/',
        },
      ]} columns="3" variant="grid" />
      <Cta links={[
        { href: 'https://ihm.edu.au/courses/', label: 'More Courses at IHM', style: 'primary' },
      ]} variant="inline" />
    </>
  )
}
