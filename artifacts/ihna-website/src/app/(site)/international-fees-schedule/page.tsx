// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Table, Hero, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Fees Schedule : International Students',
  path: '/international-fees-schedule/',
  description: 'IHNA Fees Schedule : International Students',
})

export default function InternationalFeesScheduleRoute() {
  return (
    <>
      <Hero heading="IHNA Fees Schedule : International Students" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/international-fees-schedule.webp', alt: 'Healthcare administrator at work', width: 524, height: 655 })} />
      <SectionNav section="current-student" current="/international-fees-schedule/" />
      <Table headerRow={true} variant="striped" rows={[
        ['Courses', 'Melbourne', 'Perth', 'Sydney', 'Brisbane'],
        ['HLT37525 – Certificate III in Pathology (Pathology Collection)', '–', '–', '$8,000.00', '–'],
        ['CHC33021 – Certificate III in Individual Support (Ageing, Disability)', '$6,000.00', '$6,000.00', '–', '–'],
        ['HLT54121 – Diploma of Nursing', '$36,000.00', '$36,000.00', '$36,000.00', '$36,000.00'],
        ['CHC52025 – Diploma of Community Services (Case Management)', '$18,000.00', '–', '$18,000.00', '–'],
      ]} />
    </>
  )
}
