// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, PartnerList } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Accreditation and Association',
  path: '/accreditation-and-association/',
  description: 'Accreditation and Association',
})

export default function AccreditationAndAssociationRoute() {
  return (
    <>
      <Hero heading="Accreditation and Association" eyebrow="About IHNA" variant="compact" audienceSwitch={false} />
      <PartnerList
        columns={2}
        partners={[
          { name: 'ACPET', logo: { src: '/images/ihna/partners/acpet.png', alt: 'ACPET logo', width: 298, height: 92 }, body: 'IHNA is an ACPET (Australian Council for Private Education and Training) member. ACPET is the industry association representing quality independent providers of education. ACPET’s focus on high standards means only quality independent training organisations are admitted as members. These members must adhere to the ACPET Code of Ethics and are encouraged and rewarded for regularly participating in professional development activities.' },
          { name: 'VELG', logo: { src: '/images/ihna/partners/velg.png', alt: 'VELG logo', width: 298, height: 92 }, body: 'Velg Training is Australia’s leading provider of Vocational Education and Training (VET) professional development and consulting services. Velg Training’s national client base represents Registered Training Organisations (RTOs) across Australia, including VET practitioners, teachers, trainers, assessors, TAFE teaching professionals, enterprise trainers and assessors, industry experts and other VET professionals. Having served the VET community for over 10 years as a member of VELG Training, IHNA has received a 10 Year Membership Certificate, commemorative digital badges, and recognition on VELG’s Virtual Recognition Wall.', href: 'https://www.velgtraining.com/' },
          { name: 'ISO 9001:2015', body: 'Our quality control measures put into effect at IHNA have granted us the ISO 9001:2015 certification, demonstrating that we have achieved minimal standards of quality and regulatory requirements for our facilities, people, training, services and equipment.' },
        ]}
      />
      <PartnerList
        tone="muted"
        columns={2}
        heading="Affiliate member of"
        partners={[
          { name: 'CATSINaM', logo: { src: '/images/ihna/partners/catsinam.webp', alt: 'CATSINaM logo', width: 300, height: 250 }, body: 'CATSINaM (Congress of Aboriginal and Torres Strait Islander Nurses and Midwives) plays a pivotal role in embedding cultural safety and Indigenous health knowledge into IHNA’s education ecosystem. By aligning with CATSINaM, IHNA strengthens its commitment to reconciliation, supports Aboriginal and Torres Strait Islander student success, and builds a culturally safe learning environment. This partnership will enhance staff development in cultural competency and support co-designed Indigenous-led health education strategies.', href: 'https://catsinam.org.au/' },
          { name: 'IEAA', logo: { src: '/images/ihna/partners/IEAA.png', alt: 'IEAA logo', width: 300, height: 141 }, body: 'IEAA (International Education Association of Australia) directly supports IHNA’s strategic agenda for internationalisation. Through this platinum partnership, IHNA gains access to critical policy insights, market intelligence, and opportunities for engagement with international education leaders. It positions IHNA to attract and support international students, participate in global academic collaborations, and elevate its presence in transnational education (TNE) markets.', href: 'https://ieaa.org.au/IEAA/IEAA/about-ieaa/Partnerships-Collaborations-Folder/Organisational-Members.aspx?hkey=1a0067a4-f275-44ee-914d-96a9e0935826' },
          { name: 'ITECA', body: 'ITECA (Independent Tertiary Education Council Australia) enables IHNA to be at the forefront of policy advocacy and reform for the independent tertiary education sector. The partnership facilitates IHNA’s involvement in shaping regulatory frameworks, accessing sector benchmarking, and elevating its national voice as a private provider. This engagement helps IHNA stay agile and responsive in a competitive education landscape while reinforcing its credibility.', href: 'https://www.iteca.edu.au/' },
          { name: 'WIL Australia', body: 'Work-Integrated Learning Australia Ltd (WIL Australia) bolsters IHNA’s commitment to work-integrated learning and career readiness. As a key player in WIL and placement frameworks, WIL Australia offers IHNA access to industry-academic collaboration tools and research that enhance the employability of its graduates. The partnership supports placement innovation, clinical partnerships, and graduate transition programs that are aligned with evolving industry expectations.', href: 'https://acen.edu.au/member-institutions/' },
          { name: 'ANMAC', body: 'ANMAC (Australian Nursing and Midwifery Accreditation Council) is critical to IHNA’s core operations, ensuring all nursing and midwifery programs meet national accreditation standards. By working closely with ANMAC, IHNA maintains the integrity, rigour, and industry relevance of its curriculum. This enables IHNA to deliver qualifications that are recognised nationally, ensuring graduates meet regulatory and professional standards across Australia.', href: 'https://anmac.org.au/' },
          { name: 'Ahpra', logo: { src: '/images/ihna/partners/NMBA2401.webp', alt: 'Ahpra logo', width: 716, height: 240 }, body: 'The Nursing and Midwifery Board of Australia (Ahpra) is the peak regulatory body that governs professional practice, registration, and standards for nursing graduates. Partnership with Ahpra ensures IHNA’s programs align with professional expectations and that graduates are eligible for national registration. This relationship supports CPD initiatives, scope-of-practice development, and ensures IHNA remains compliant with regulatory expectations.', href: 'https://www.nursingmidwiferyboard.gov.au/' },
          { name: 'Ageing Australia', body: 'Ageing Australia provides IHNA with direct insight into the aged care and community health workforce landscape. The partnership enables co-design of targeted training programs, micro-credentials, and workforce development initiatives that respond to aged care reform and demand. Collaborating with Ageing Australia positions IHNA as a workforce partner of choice, aligned with national priorities in aged and community care.', href: 'https://ageingaustralia.asn.au/affiliates-directory/institute-of-health-and-nursing-australia-ihna/' },
        ]}
      />
    </>
  )
}
