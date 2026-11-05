// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, ActionTiles, DocCards, FeatureCards, Hero, IconChecks, img, JourneySteps, SchoolIntro } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Australia’s Reconciliation Action Plan',
  path: '/ihna-australias-reconciliation-action-plan/',
  description: 'The Institute of Health & Nursing Australia (IHNA) is proud to have our innovative RAP accredited by Reconciliation Australia, marking a significant step…',
})

export default function IhnaAustraliasReconciliationActionPlanRoute() {
  return (
    <>
      <Hero heading="Reconciliation Action Plan" variant="split" look="mosaic" audienceSwitch={false} eyebrow="About IHNA" image={img({ src: '/images/ihna/pages/ihna-australias-reconciliation-action-plan.webp', alt: 'Aboriginal cultural artefacts at an IHNA cultural workshop', width: 720, height: 900 })} />
      <SectionNav section="about" current="/ihna-australias-reconciliation-action-plan/" />
      <SchoolIntro>
        <h4 className="label-mono mb-4 text-sm text-secondary-strong">IHNA Australia’s</h4>
        <p>The Institute of Health &amp; Nursing Australia (IHNA) is proud to have our innovative RAP accredited by Reconciliation Australia, marking a significant step in our commitment to reconciliation.</p>
      </SchoolIntro>
      <FeatureCards
        palette="earth"
        tone="muted"
        heading="Our reconciliation *commitment*"
        items={[
          { title: 'Build Meaningful Relationships', body: 'We strive to build authentic relationships with Aboriginal and Torres Strait Islander communities and individuals.' },
          { title: 'Promote Social Inclusivity', body: 'Fostering a community that honors and appreciates the diversity of all cultures, ensuring everyone feels respected and valued.' },
          { title: 'Foster Mutual Respect', body: 'Encourage understanding and appreciation for Aboriginal and Torres Strait Islander cultures within our institution and beyond.' },
        ]}
      />
      <FeatureCards
        palette="earth"
        columns={2}
        tone="default"
        heading="What is a Reconciliation Action Plan (*RAP*)?"
        items={[
          { title: 'Structured FrameWork', body: 'A RAP guides organisations in fostering respect, strengthening relationships, and creating opportunities for Aboriginal and Torres Strait Islander peoples.' },
          { title: 'Innovate RAP', body: 'IHNA Innovate RAP ensures that we embed reconciliation into our culture, policies, and practices through genuine engagement and meaningful action.' },
        ]}
      />
      <IconChecks
        palette="earth"
        tone="muted"
        heading="What this means for *IHNA* ?"
        items={[
          'Strengthening Existing Relationships',
          'Creating an Inclusive Environment',
          'Providing Equitable Opportunities',
          'Engaging authentically with Aboriginal and Torres Strait Islander communities and organisations.',
          'Promoting cultural safety, awareness and respect among staff and students.',
          'The Skilldemy program focuses on the following key objectives to make international workforces stronger.',
        ]}
      />
      <FeatureCards
        palette="earth"
        tone="ink"
        heading="Engaging and Reporting on *RAP*"
        items={[
          { title: 'RAP Working Group', body: 'A dedicated group will oversee implementation.' },
          { title: 'Regular Reporting', body: 'Internal update and annual impact survey will be shared.' },
          { title: 'Staff & Student Engagement', body: 'Cultural awareness training will be provided.' },
        ]}
      />
      <DocCards
        palette="earth"
        tone="muted"
        heading="Our *RAP*"
        items={[
          { label: 'HCI RAP · 2025', title: 'HCI_Innovative_RAP_2025.pdf', href: '/pdf/HCI_RAP_January_2025.pdf' },
          { label: 'HCI RAP · 2026 (Ver 2.0)', title: 'HCI_Innovative_RAP_2026_V2.pdf', href: '/pdf/HCI_IHNA-RAP-Document_V2_26Jun10.pdf' },
        ]}
      />
      <JourneySteps
        palette="earth"
        heading="Staff & Students Engagement *Details*"
        steps={[
          { title: 'Cultural Awarness Training', body: <p>Providing learning opportunities for Staff &amp; Students</p> },
          { title: 'Participation in Key Events', body: <p>Celebrating National Reconciliation Week, NAIDOC Week, and other significant events.</p> },
        ]}
      />
      <ActionTiles
        palette="earth"
        heading="Join Our Reconciliation *Journey*"
        items={[
          { title: 'Stay Updated', body: 'Visit this page regularly' },
          { title: 'Share Ideas', body: <>Contact us at <a href="mailto:RWG@hci.edu.au">RWG@hci.edu.au</a></> },
          { title: 'Learn More', body: <>Visit <a href="https://www.reconciliation.org.au" rel="noopener noreferrer">www.reconciliation.org.au</a></> },
        ]}
      />
    </>
  )
}
