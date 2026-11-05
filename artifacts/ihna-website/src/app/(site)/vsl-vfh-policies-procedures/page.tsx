// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, DocumentGroups, Hero, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'VSL/VFH Policies & Procedures',
  path: '/vsl-vfh-policies-procedures/',
  description: 'VSL/VFH Policies & Procedures',
})

export default function VslVfhPoliciesProceduresRoute() {
  return (
    <>
      <Hero heading="VSL/VFH Policies &amp; Procedures" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/vsl-vfh-policies-procedures.webp', alt: 'Nurse with a clipboard', width: 663, height: 829 })} />
      <SectionNav section="current-student" current="/vsl-vfh-policies-procedures/" />
      <DocumentGroups
        groups={[
          {
            title: 'VSL/VFH Policies & Procedures',
            docs: [
              { label: 'VSL/VFH Policies & Procedures', href: '/vsl-vfh-policies-and-procedures/' },
              { label: 'Statement of VSL Tuition Assurance', href: '/pdf/VSL-Statement-of-tuition-assurance-2018.pdf' },
              { label: 'Statement of VFH Tuition Assurance', href: '/pdf/VFH-Statement-of-tuition-assurance-2018.pdf' },
            ],
          },
        ]}
      />
    </>
  )
}
