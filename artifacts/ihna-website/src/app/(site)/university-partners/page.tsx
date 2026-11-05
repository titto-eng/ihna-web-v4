// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, PartnerList } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'University Partners',
  path: '/university-partners/',
  description: 'La Trobe University is a respected public research university in Australia, known for academic excellence and innovation. Established in 1964, it is…',
})

export default function UniversityPartnersRoute() {
  return (
    <>
      <Hero heading="University Partners" variant="compact" audienceSwitch={false} eyebrow="Industry" />
      <SectionNav section="industry" current="/university-partners/" />
      <PartnerList
        partners={[
          {
            name: 'La Trobe University',
            logo: { src: '/images/ihna/partners/latrobe.webp', alt: 'La Trobe University logo', width: 448, height: 150 },
            body: 'La Trobe University is a respected public research university in Australia, known for academic excellence and innovation. Established in 1964, it is Victoria’s third university. Its main campus is in Bundoora, Melbourne, supporting various educational and community initiatives.',
            listLabel: 'Progress from the',
            items: [
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Social Work (Honours) <strong>3 Years = 4.5 Years.</strong></>,
            ],
          },
          {
            name: 'Griffith University',
            logo: { src: '/images/ihna/partners/griffith.svg', alt: 'Griffith University logo', width: 1499, height: 318 },
            body: 'Griffith University is a leading public research university in Australia, recognised for its modern approach to education. Founded in 1971, it offers interdisciplinary programs, particularly in environmental science and Asian studies. Located in Nathan, Brisbane, the university focuses on academic excellence and social impact.',
            listLabel: 'Progress from the',
            items: [
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Social Work (Honours) <strong>3.5 Years = 5 Years.</strong></>,
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Human Services <strong>3 Years = 4.5 Years.</strong></>,
            ],
          },
          {
            name: 'The University of Southern Queensland (USQ)',
            logo: { src: '/images/ihna/partners/unisq.svg', alt: 'The University of Southern Queensland (USQ) logo', width: 652, height: 234 },
            body: 'The University of Southern Queensland (USQ) is a key regional university in Australia dedicated to accessible, industry-focused education. Founded in 1967, it has a strong research presence and is headquartered in Toowoomba, Queensland, aiming to empower students across various fields.',
            listLabel: 'Progress from the',
            items: [
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Social Work (Honours) <strong>3.5 Years = 5 Years.</strong></>,
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Human Services (Child &amp; Family Practice) <strong>3 Years = 4.5 Years.</strong></>,
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Human Services (Counselling Practice) <strong>3 Years = 4 Years.</strong></>,
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Human Services (Disability &amp; Human Practice) <strong>3 Years = 4 Years.</strong></>,
              <>CHC52025 – Diploma of Community Services (Case Management) <strong>1.5 Years</strong> to Bachelor of Human Services (Intercultural &amp; Community Practice) <strong>2 Years = 3 Years.</strong></>,
              <>HLT54121 – Diploma of Nursing <strong>1.5 Years</strong> to Bachelor of Nursing <strong>2 Years = 3.5 Years.</strong></>,
            ],
          },
        ]}
      />
    </>
  )
}
