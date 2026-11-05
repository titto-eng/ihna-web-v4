// This file is the page: edit it freely.
import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata, Hero, Pic, Rich, ValueCards } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'How to Apply',
  path: '/how-to-apply/',
  description: 'Before you start with the online application process, kindly ensure that you meet all the entry requirements for your preferred Course. Find entry…',
})

export default function HowToApplyRoute() {
  return (
    <>
      <Hero heading="How to Apply" variant="compact" audienceSwitch={false} eyebrow="Future students" />
      <SectionNav section="student" current="/how-to-apply/" />
      <ValueCards
        tone="default"
        eyebrow="Three steps"
        heading="Your application, *step by step*"
        items={[
          { mark: '1', title: 'Entry requirements', body: <>Before you start with the online application process, kindly ensure that you meet all the entry requirements for your preferred Course. <Link href="/courses/" className="font-semibold text-primary-strong underline underline-offset-4">Find entry requirements for your course</Link></> },
          { mark: '2', title: 'Lodging an application', body: <>You can enquire or apply via IHNA registered agents, email (<a href="mailto:enquiry@ihna.edu.au" className="font-semibold text-primary-strong underline underline-offset-4">enquiry@ihna.edu.au</a>), through phone or our website. When applying online via our website you need to ensure you have the following information ready to go:</> },
          { mark: '3', title: 'What course you plan to study.', body: 'The entry requirements for your preferred degree. Please ensure you have all relevant documents to upload to your application (e.g. copies of your transcripts).' },
        ]}
      />
      <Rich tone="muted" width="wide">
        <Pic src="/images/ihna/uploads/2024/11/image-2.png" alt="Organization Chart - IHNA" width={1021} height={871} />
      </Rich>
    </>
  )
}
