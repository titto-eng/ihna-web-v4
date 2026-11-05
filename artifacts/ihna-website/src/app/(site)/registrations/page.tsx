// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, PartnerList } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Registrations',
  path: '/registrations/',
  description: 'The Australian Skills Quality Authority (ASQA) is Australia’s national regulator for vocational education and training (VET), ensuring that training…',
})

export default function RegistrationsRoute() {
  return (
    <>
      <Hero heading="Registrations" variant="compact" audienceSwitch={false} />
      <PartnerList
        linkLabel="Check Website"
        eyebrow="Registrations"
        heading="Regulated, registered and *accredited*"
        partners={[
          { name: 'The Australian Skills Quality Authority (ASQA)', body: <p>The Australian Skills Quality Authority (ASQA) is Australia’s national regulator for vocational education and training (VET), ensuring that training organisations meet required standards in course quality, governance, and student services. IHNA is dedicated to practising ASQA’s principles by maintaining excellence in its operations, including course delivery and student support. By aligning with ASQA’s framework, IHNA ensures that students receive quality education and are well-prepared for their careers.</p>, href: 'https://www.asqa.gov.au/' },
          { name: 'Commonwealth Register of Institutions and Courses for Overseas Students (CRICOS)', body: <p>The Commonwealth Register of Institutions and Courses for Overseas Students (CRICOS) is the official government listing of Australian education providers that offer courses to international students. As a CRICOS-registered institution, IHNA is committed to delivering high-quality education that meets the standards set for international education in Australia. This ensures that our courses are designed to support and enhance students’ learning experience worldwide.</p>, href: 'https://cricos.education.gov.au/' },
          { name: 'The Nursing and Midwifery Board of Australia (NMBA)', logo: { src: '/images/ihna/theme/pship_img/NMBA2401.webp', alt: 'The Nursing and Midwifery Board of Australia (NMBA)', width: 716, height: 240 }, body: <p>The Nursing and Midwifery Board of Australia (NMBA) regulates the practice of nurses and midwives in Australia to ensure public safety and professional standards. As an education provider offering nursing courses, IHNA ensures that our programs align with NMBA’s guidelines and accreditation standards, preparing students for professional registration and practice. The NMBA oversees the registration process, professional codes of conduct, and ongoing professional development.</p>, href: 'https://www.nursingmidwiferyboard.gov.au/' },
          { name: 'SVTS', body: <p>The Skills First program, administered by the Victorian Government, provides funding for quality vocational education and training to eligible students in Victoria. As a Skills First provider, IHNA is dedicated to delivering courses that meet the needs of the state’s industries and support students in gaining valuable, in-demand skills. This initiative ensures accessible education, helping students build rewarding careers while contributing to Victoria’s workforce.</p>, href: 'https://www.vic.gov.au/skills-first' },
          { name: 'DTWD', body: <p>The Department of Training and Workforce Development (DTWD) is responsible for the planning and coordination of vocational education and training in Western Australia. At IHNA, we align our programs with DTWD’s initiatives to ensure that our training meets the workforce needs of the state, providing students with relevant skills for employment in high-demand industries. DTWD supports the development of a skilled workforce through quality education and training.</p>, href: 'https://www.wa.gov.au/organisation/department-of-training-and-workforce-development' },
          { name: 'VET Student Loans', body: <p>The VET Student Loans program, administered by the Department of Employment and Workplace Relations (DEWR), provides eligible students with access to income-contingent loans to help cover the cost of their vocational education and training (VET) courses. At IHNA, students enrolled in approved diploma and advanced diploma courses can access VET Student Loans, making education more affordable and accessible while allowing students to focus on their studies without upfront financial pressure.</p>, href: 'https://www.dewr.gov.au/vet-student-loans' },
          { name: 'Smart and Skilled', body: <p>Smart and Skilled, an initiative by the NSW Government, offers low-cost and free vocational education and training options for eligible students and job seekers. Through this program, IHNA provides government-subsidised courses that help individuals gain essential skills and qualifications for employment in various industries. Smart and Skilled aims to make quality training more accessible, supporting the development of a skilled workforce in New South Wales.</p>, href: 'https://education.nsw.gov.au/skills-nsw/students-and-job-seekers/low-cost-and-free-training-options/smart-and-skilled-training' },
          { name: 'ISO 9001', body: <p>ISO 9001 is an internationally recognised standard for quality management systems (QMS), ensuring that organisations meet the needs of customers and stakeholders through effective processes and continuous improvement. IHNA is committed to maintaining high-quality standards across our education and training programs by aligning with ISO 9001 principles. This ensures that our services are consistently reliable, efficient, and focused on delivering the best outcomes for our students and partners.</p>, href: 'https://saiassurance.com.au/iso-9001' },
        ]}
      />
    </>
  )
}
