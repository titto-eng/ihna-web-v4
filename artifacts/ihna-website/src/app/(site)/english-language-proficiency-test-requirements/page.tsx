// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, Hero, Rich, Table, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'English Language Proficiency Test Requirements',
  path: '/english-language-proficiency-test-requirements/',
  description: 'The English language requirements may vary depending on your chosen course. Please refer to the specific course page for detailed information on entry…',
})

export default function EnglishLanguageProficiencyTestRequirementsRoute() {
  return (
    <>
      <Hero heading="English Language Proficiency Test Requirements" eyebrow="International students" variant="split" look="panorama" audienceSwitch={false} image={img({ src: '/images/ihna/pages/english-language-proficiency-test-requirements.webp', alt: 'Student practising English on a tablet', width: 736, height: 920 })} />
      <Rich>
        <p>The English language requirements may vary depending on your chosen course. Please refer to the specific course page for detailed information on entry requirements.</p>
        <p><strong>(1). English language requirements for Subclass 500 (Student) visa</strong></p>
      </Rich>
      <Checklist
        tone="muted"
        intro="For the purposes of subclause 500.213(1) of Schedule 2 to the Regulations, the following requirements are specified below;"
        columns={1}
        items={[
          <>
            <p>the applicant must undertake one of the following English language tests:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Cambridge English: Advanced test <strong>(CAE)</strong> (also known as Certificate in Advanced English);</li>
              <li>International English Language Testing System <strong>(IELTS)</strong>;</li>
              <li>Occupational English Test <strong>(OET)</strong>;</li>
              <li>Pearson Test of English Academic <strong>(PTE)</strong>;</li>
              <li>Test of English as a Foreign Language internet based test <strong>(TOEFL iBT)</strong>; and</li>
            </ul>
          </>,
          <>
            <p>the applicant must have undertaken the test within the following period:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>if evidence of the test is provided at the time the applicant makes an application for a Subclass 500 (Student) visa—the 2 year period immediately before the day on which the visa application is made; or</li>
              <li>if evidence of the test is not provided at the time the visa application is made—the 2 year period immediately before the day on which a decision to grant or refuse to grant the visa is made; and</li>
            </ul>
          </>,
          <>
            <p>the applicant meets the requirements in subsection (2), (3), or (4).</p>
          </>,
        ]}
      />
      <Table rows={[
        ['(2) The applicant achieved the required English language test score specified in Column 2 of an item in the table in Schedule 1.'],
        ['(Schedule 1) English language test scores'],
        ['Item', 'Column 1:', 'Column 2:', 'Column 3:', 'Column 4:'],
        ['Test name', 'Minimum test score', 'Minimum test score: if principal course is accompanied by at least 10 weeks of an ELICOS; or if a standard foundation program; or if an extended foundation program; or if an eligible pathway program.', 'Minimum test score: if principal course is accompanied by at least 20 weeks of an ELICOS.'],
        ['1', 'Cambridge English: Advanced (CAE) test/ Certificate in Advanced English', '169', '162', '154'],
        ['2', 'International English Language Testing system (IELTS Test)', 'Overall band score 6.0', 'Overall band score of 5.5', 'Overall band score of 5.0'],
        ['3', 'Occupational English Test (OET)', 'a score of at least B for each test component', 'a score of at least B for each test component', 'a score of at least B for each test component'],
        ['4', 'Pearson Test of English Academic (PTE)', '50', '42', '36'],
        ['5', 'Test of English as a Foreign Language internet-based test (TOEFL iBT)', '64', '46', '35'],
      ]} variant="striped" headerRow={true} />
      <Table rows={[
        ['(3) If the applicant is enrolled in:'],
        ['at least 10 weeks of an ELICOS that accompanies a principal course and that is intended to commence after the Subclass 500 (Student) visa application was made; or'],
        ['a) at least 10 weeks of an ELICOS that accompanies a principal course and that is intended to commence after the Subclass 500 (Student) visa application was made; or'],
        ['b) a standard foundation program; or'],
        ['c) an extended foundation program'],
        ['the applicant achieved the required English language test score specified in Column 3 of an item in the table in Schedule 1.'],
      ]} variant="striped" headerRow={true} />
      <Table rows={[
        ['(4) If the applicant is enrolled in at least 20 weeks of an ELICOS that accompanies a principal course and that is intended to commence after the Subclass 500 (Student) visa application was made, the applicant achieved the required English language test score specified in Column 4 of an item in the table in Schedule 1.'],
      ]} variant="striped" headerRow={true} />
      <Rich>
        <h2>Exceptions to English Language Test Requirements</h2>
        <p>For the purpose of subclause 500.213(2) of Schedule 2 to the Regulations, subclause 500.213(1) of Schedule 2 to the Regulations does not apply to the following classes of applicants:</p>
      </Rich>
      <Table rows={[
        ['Citizens and Valid Passport Holders from the Following Countries'],
        ['1. Canada', '2. New Zealand', '3. Republic of Ireland'],
        ['4. United Kingdom', '5. United States of America', ''],
      ]} variant="striped" headerRow={true} />
      <Table rows={[
        ['An applicant who is enrolled in one of the following courses, where that course is the only course of study enrolled in for the purposes of the Subclass 500 (Student) visa application'],
        ['a) A course delivered in a language other than English', 'b) An ELICOS'],
        ['c) A registered school course', 'd) A registered post-graduate research course'],
      ]} variant="striped" headerRow={true} />
      <Table rows={[
        ['An applicant who is'],
        ['a Foreign Affairs student; or a Defence Student; or a Secondary exchange student;'],
      ]} variant="striped" headerRow={true} />
      <Table rows={[
        ['An applicant, who, in the 2 years before applying for a Subclass 500 (Student) visa, has successfully completed'],
        ['i. the requirements for a Senior Secondary Certificate of Education, in a course that was conducted in Australia and in English; or'],
        ['ii. a substantial component of a course leading to a qualification from the Australian Qualifications Framework at the Certificate IV level or higher that was conducted in Australia and in English, while the applicant was holding a student visa;'],
      ]} variant="striped" headerRow={true} />
      <Table rows={[
        ['An applicant who has successfully completed a minimum of 5 years of study in English undertaken in one or more of the following countries'],
        ['i. Australia', 'ii. Canada', 'iii. New Zealand', 'iv. South Africa'],
        ['v. The Republic of Ireland', 'vi. The United Kingdom', 'vii. The United States of America', ''],
      ]} variant="striped" headerRow={true} />
      <Rich>
        <p>This document provides a clear overview of the English language proficiency requirements necessary for applicants seeking the Subclass 500 (Student) visa to enroll in courses at IHNA. For any further queries or detailed assistance, applicants are advised to consult with IHNA’s admissions office or refer to the relevant legal regulations. For more details refer to <a href="http://www.immi-to-australia.com/pdf/imm_18-015.pdf" rel="noopener noreferrer">Immi to Australia</a></p>
        <p>Appendix (Under subclause 500.213(1) of Schedule 2 to the Regulations, if required to do so by the Minister, an applicant must provide evidence demonstrating that they possess a level of English language proficiency that meets the requirements specified in an instrument made under paragraph 500.213(3)(a) of Schedule 2 to the Regulations. The instrument specifies the required levels of English language proficiency that applicants must have to meet the criteria for the Subclass 500 (Student) visa.)</p>
        <p>(Under subclause 500.213(2) of Schedule 2 to the Regulations, the requirement in subclause 500.213(1) of Schedule 2 to the Regulations, to provide evidence of English language proficiency, does not apply to the class of applicants specified in subsection 6(2) of Part 2 of the instrument, under paragraph 500.213(3)(b) of Schedule 2 to the Regulations.)</p>
      </Rich>
    </>
  )
}
