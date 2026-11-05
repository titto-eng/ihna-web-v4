// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Pic, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Key Systems',
  path: '/ihna-key-systems/',
  description: 'IHNA’s Enterprise Resource Planning (ERP) System- IHNA has developed an in-house enterprise resource planning (ERP) system called ‘Knowledge Hub.’ This…',
})

export default function IhnaKeySystemsRoute() {
  return (
    <>
      <Hero heading="IHNA Key Systems" variant="compact" audienceSwitch={false} />
      <SplitProse tone="muted" eyebrow={'Key systems'} heading={'Knowledge Hub'}>
        <p>IHNA’s Enterprise Resource Planning (ERP) System- IHNA has developed an in-house enterprise resource planning (ERP) system called ‘Knowledge Hub.’ This comprehensive system allows IHNA to efficiently manage all aspects of the institution, including staff, students, stakeholders, and resources. The integration of student feedback through this system enables the Curriculum Development team to continuously improve and validate assessment materials, ensuring alignment with industry standards and meeting the evolving needs of students.</p>
      </SplitProse>
      <SplitProse eyebrow={'Key systems'} heading={'Clinsoft'}>
        <p>Digitizing Clinical Placements Clinical placement is a key aspect of most healthcare courses. Students gain dynamic exposure to the healthcare environment, enhancing their knowledge and skills. Clinsoft provides a streamlined platform to improve student placement operations, allowing students, educators, and institutions a transparent view into placement programs, and facilitating real-time interactions and collaboration. Clinsoft offers a customisable solution that streamlines the process of student placements, enabling real-time monitoring and tracking of activities, and allowing easy data management and compliance. If you’re looking for an end-to-end management solution for clinical placements, Clinsoft has all the answers you need! <strong><a href="https://clinsoft.com.au" rel="noopener noreferrer">Know more?</a></strong></p>
        <p><strong>The main modules of Clinsoft include:</strong></p>
        <ul>
          <li>Document management</li>
          <li>Monitoring of Student Placement</li>
          <li>Easy feedback mechanism</li>
          <li>Immunization record Management</li>
          <li>Data management</li>
          <li>Student Management System</li>
          <li>Communication</li>
          <li>Documents</li>
          <li>Attendance Management System</li>
          <li>Reports generation</li>
          <li>Resource management</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Key systems'} heading={'E-testamur'}>
        <p><strong>Generate Digital Certificates</strong> A certification is an industry-recognized way to validate expertise, skills and competencies. With eTestamur, institutions have a simplified platform for customised generation of e-certificates. Based on the program, it’s now possible to seamlessly generate certificate templates, issue reports, maintain records, and more. eTestamur offers a customisable solution that adds student data, requests, validates, and signs the certificate if the student is deemed satisfactory, and prints or sends the document as required. Simplify and streamline the process of generating online certificates with eTestamur! <strong><a href="https://etestamur.com/" rel="noopener noreferrer">Know more?</a></strong></p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>User-friendly dashboard</li>
          <li>Search and generate certificates for each student as per need</li>
          <li>Certificate can be approved or rejected, and printed as required</li>
          <li>Monitor and customise content in the certificate easily</li>
          <li>Configure organisational settings, branding, and logos</li>
          <li>Uploading program-wise Certificate templates</li>
          <li>Option of the digital and online signature can be stored with access credentials</li>
          <li>Period-wise Certificate issuance reports</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow={'Key systems'} heading={'L-Portfolio'}>
        <p>Life-Long Learning Portfolio is a collection of work, skills, and interests(evidence) in an electronic format that highlights learning and experience over time. When you think about your Life Long Learning Portfolio and the types of evidence that it contains, it is important to think carefully about its purpose and intended audience.</p>
        <p>Using these pieces of evidence one can apply for Recognition of prior learning. Recognition for prior learning is a process that involves the assessment of an individual, based on their previous qualifications, to help them gain credit for the unit of a course they are applying for further studies. This credit can be obtained based on prior knowledge and experience gained through working and learning, which can be either through life experience, work, or other professional development activities such as volunteering. RPL credit will accelerate the study period, reducing the time as well as cost investment. This portfolio will streamline the RPL process. <strong><a href="https://www.lllportfolio.com/" rel="noopener noreferrer">Know more?</a></strong></p>
        <p><strong>The following are the main modules:</strong></p>
        <ul>
          <li>Portfolio Builder</li>
          <li>Custom Sections</li>
          <li>Documents</li>
          <li>Policies</li>
          <li>Resume Builder</li>
          <li>Approval Process</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Key systems'} heading={'ACE LMS'}>
        <p>The ACE LMS is a complete learning management system. This product is a customized version of the world-top Canvas LMS. This is a self-hosted LMS with courses, course modules, resources, and assessments. Different tools can be incorporated into this system with LTI.</p>
        <p><Pic src="/images/ihna/theme/AceEd.webp" alt="" width={240} height={240} /></p>
      </SplitProse>
      <SplitProse eyebrow={'Key systems'} heading={'AceEd'}>
        <p>AceEd is IHNA’s innovative mobile application crafted to elevate the student experience by simplifying essential administrative tasks. With AceEd at your fingertips, you can effortlessly manage your identity, enrollments, attendance, and support requests directly from your mobile device. This intuitive platform guarantees easy and quick access to vital services, promoting a more connected and responsive educational community that enhances your learning journey.</p>
      </SplitProse>
    </>
  )
}
