// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, Pic, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Genuine Student Test Requirement',
  path: '/genuine-student-test-requirement/',
  description: 'The transition from the Genuine Temporary Entrant (GTE) requirement to the Genuine Student (GS) requirement for student visas in Australia, effective from…',
})

export default function GenuineStudentTestRequirementRoute() {
  return (
    <>
      <Hero heading="Genuine Student Test Requirement" variant="compact" audienceSwitch={false} />
      <SplitProse tone="muted" eyebrow={'Student visa'} heading={'Genuine Student Test (GST)'}>
        <p>The transition from the Genuine Temporary Entrant (GTE) requirement to the <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement" rel="noopener noreferrer">Genuine Student (GS)</a> requirement for student visas in Australia, effective from 23 March 2024 onward, represents a significant shift in the assessment process. The Genuine Student Test (GST) in Australia represents a shift in assessing international student visa applications, replacing the Genuine Temporary Entrant (GTE) requirement. The GST is a comprehensive evaluation aimed at ensuring the authenticity and sincerity of students intending to study in Australia.</p>
        <p><Pic src="/images/ihna/theme/gte-r.webp" alt="gte requirement" width={1500} height={1000} /></p>
        <p>Here’s a breakdown of its benefits and how it differs from the previous GTE requirement:</p>
        <ul>
          <li><strong>Scope and Application: </strong>The GS requirement applies to <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" rel="noopener noreferrer">student visa</a> applications lodged on or after 23 March 2024. However, applications lodged before this date will continue to be assessed against the previous GTE requirement.</li>
          <li><strong>Primary Intent of Studying: </strong>All applicants for a student visa must demonstrate genuine intent to study in Australia as their primary reason for obtaining the visa. This ensures that individuals entering Australia on student visas are committed to their education.</li>
          <li><strong>Development of Skills and Pathway to Permanent Residence: </strong>The GS requirement aims to include students who, after studying in Australia, acquire skills that are valuable to the country. This implies that students who fulfill the GS requirement may have opportunities to apply for permanent residence in Australia.</li>
          <li><strong>Genuine Student Criterion: </strong>To be granted a student visa, applicants must satisfy the genuine student criterion. This involves demonstrating a genuine intention to study in Australia and an understanding that studying is the primary purpose of their visa.</li>
          <li><strong>Dependent Criterion: </strong>In addition to the genuine student criterion, applicants may also need to satisfy the genuine student dependent criterion if they are dependents of the primary student visa applicant.</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow={'Student visa'} heading={'In the online student visa application form, applicants will be asked the following questions to address the Genuine Student (GS) criteria:'}>
        <ul>
          <li><strong>Current Circumstances: </strong>Provide details of your current circumstances, including ties to family, community, employment, and economic situation. (Maximum 150 words)</li>
          <li><strong>Reason for Choosing Course and Education Provider: </strong>Explain why you wish to study this course in Australia with this particular education provider. Include your understanding of the requirements of the intended course and studying and living in Australia. (Maximum 150 words)</li>
          <li><strong>Benefits of Completing the Course: </strong>Explain how completing the course will be beneficial to you. (Maximum 150 words)</li>
          <li><strong>Additional Relevant Information: </strong>Provide any other relevant information you would like to include. (Maximum 150 words)</li>
        </ul>
        <p>For applicants who have previously held a student visa or those lodging an application in Australia from a non-student visa, an additional question will be asked.</p>
        <p>It’s crucial to provide evidence to support your claims, as generic statements will not carry significant weight in the GS assessment. Your overall personal circumstances will be considered during the assessment process.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Student visa'} heading={'Benefits of the Genuine Student Test (GST):'}>
        <ul>
          <li><strong>Fairness and Transparency: </strong>The GST emphasises fairness and transparency in the evaluation process, treating all applicants equitably.</li>
          <li><strong>Comprehensive Assessment Criteria: </strong>Unlike the previous GTE requirement, the GST employs a detailed set of criteria to accurately assess each applicant’s suitability for a student visa.</li>
          <li><strong>Aligning Intentions with Visa Goals: </strong>The GST scrutinises applicants’ intentions to ensure they genuinely intend to pursue education in Australia, aligning with the purpose of the student visa.</li>
          <li><strong>Confidence in Clarity: </strong>Applicants have a clear understanding of what is expected of them during the GST process, reducing uncertainties and instilling confidence.</li>
          <li><strong>Building Trust in the System: </strong>The transparent and open nature of the GST fosters trust between applicants and the Australian immigration system, crucial for a positive visa application experience.</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow={'Student visa'} heading={'Comparison Between GST and GTE:'}>
        <p>While the GST may seem more challenging due to its broader criteria and thorough examination, it aims to bring genuine students and clarity to the evaluation process. The added effort required for the GST is offset by its equitable and transparent nature.</p>
        <p><strong>Genuine Temporary Entrant (GTE): </strong>Focuses on a personal statement explaining the student’s genuine reasons for migrating and studying in Australia, supported by documents and evidence.</p>
        <p><strong>Genuine Student Test (GST): </strong>Based on targeted questions asked of students applying for a student visa, including explanations of their circumstances and the purpose of their visit to Australia.</p>
        <p>The transition from GTE to GST signifies a commitment to maintaining the integrity of the Australian education system while ensuring that genuine students have the opportunity to study in Australia.</p>
        <p>For more information, refer to <a href="https://immi.homeaffairs.gov.au/Visa-subsite/files/direction-no-106.pdf" rel="noopener noreferrer">Ministerial Direction No. 106 (348KB PDF)</a></p>
      </SplitProse>
      <Cta links={[
        {
          href: '/pdf/IHNA_Genuine_Student_Assessment_Form.pdf',
          label: 'Genuine Student Assessment Form',
          style: 'primary',
        },
      ]} variant="inline" />
    </>
  )
}
