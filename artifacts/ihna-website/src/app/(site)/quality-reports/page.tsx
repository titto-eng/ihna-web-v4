// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, DocumentGroups, Hero, Rich, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Quality Reports',
  path: '/quality-reports/',
  description: 'Any learner must be given the opportunity to evaluate the quality of the education they are getting from their training provider. IHNA is presenting the…',
})

export default function QualityReportsRoute() {
  return (
    <>
      <Hero heading="IHNA Quality Reports" variant="split" look="spotlight" audienceSwitch={false} eyebrow="Future students" image={img({ src: '/images/ihna/pages/quality-reports.webp', alt: 'IHNA clinical simulation lab', width: 505, height: 631 })} />
      <SectionNav section="student" current="/quality-reports/" />
      <Rich>
        <p className="lead">Any learner must be given the opportunity to evaluate the quality of the education they are getting from their training provider. IHNA is presenting the following reports for any students wishing to enroll at IHNA. These reports show how IHNA rates in terms of student completions and quality matrices. Victorian Training Guarantee Service Agreement requires IHNA to publish the following reports .Please click on the links below and review the quality of IHNA’s programs using the reports.</p>
      </Rich>
      <DocumentGroups
        tone="muted"
        groups={[
          {
            title: 'IHNA Quality Reports',
            docs: [
              { label: 'ASQA Certificate of Registration', href: '/pdf/reports/ASQA_Registration_until_2024.pdf' },
              { label: 'IHNA Competency Completion Report 2016', href: '/pdf/reports/competency-completion-report-2016.pdf' },
              { label: 'Latest Registration Audit Report', href: '/pdf/reports/Audit_Report_VET.pdf' },
            ],
          },
          {
            title: 'Quality indicators Learner and employer Reports',
            docs: [
              { label: '2013 Report', href: '/pdf/reports/quality_indicator_report_2013.pdf' },
              { label: '2014 Report', href: '/pdf/reports/quality_indicators_learner_and_employer_questionnaire_report_2014.pdf' },
              { label: '2015 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2015.pdf' },
              { label: '2016 Report', href: '/pdf/reports/quality_indicator_annual_summary_finalreport_2016.pdf' },
              { label: '2019 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2019_2020.pdf' },
              { label: '2020 Report', href: '/pdf/reports/IHNA_Quality_Indicator_Report_2020.pdf' },
              { label: '2021 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2021.pdf' },
              { label: '2022 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2022.pdf' },
              { label: '2023 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2023.pdf' },
              { label: '2024 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2024.pdf' },
              { label: '2025 Report', href: '/pdf/reports/quality_indicator_annual_summary_report_2025.pdf' },
            ],
          },
        ]}
      />
    </>
  )
}
