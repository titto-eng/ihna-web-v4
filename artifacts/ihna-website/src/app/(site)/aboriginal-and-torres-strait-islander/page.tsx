// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, EventCards, FeatureCards, Hero, img, MediaSplit, SchoolIntro, SplitProse } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Aboriginal And Torres Strait Islander : Education and Support',
  path: '/aboriginal-and-torres-strait-islander/',
  description: 'At the Institute of Health and Nursing Australia (IHNA), we are committed to creating culturally safe learning and working environments that honor…',
})

export default function AboriginalAndTorresStraitIslanderRoute() {
  return (
    <>
      <Hero heading="Aboriginal and Torres Strait Islander Education &amp; Support" variant="split" look="mosaic" audienceSwitch={false} eyebrow="About IHNA" image={img({ src: '/images/ihna/theme/aboriginal-bg.webp', alt: '', width: 1536, height: 1024 })} />
      <SectionNav section="about" current="/aboriginal-and-torres-strait-islander/" />
      <SchoolIntro>
        <p>At the Institute of Health and Nursing Australia (IHNA), we are committed to creating culturally safe learning and working environments that honor, respect, and celebrate Aboriginal and Torres Strait Islander peoples, cultures, and knowledge.</p>
      </SchoolIntro>
      <MediaSplit
        tone="muted"
        eyebrow="Our Commitment to Reconciliation"
        heading="Reconciliation Action Plan (*RAP*)"
        image={img({ src: '/images/ihna/theme/aboriginal-bg.webp', alt: '', width: 1536, height: 1024 })}
      >
        <p>IHNA’s Reconciliation Action Plan (RAP) is the cornerstone of our commitment to Aboriginal and Torres Strait Islander peoples. The RAP guides our work across three key pillars: Relationships, Respect, and Opportunities.</p>
      </MediaSplit>
      <FeatureCards
        palette="earth"
        tone="ink"
        items={[
          { title: 'Relationships', body: 'Building meaningful connections' },
          { title: 'Respect', body: 'Honoring cultures and knowledge' },
          { title: 'Opportunities', body: 'Creating pathways to thrive' },
        ]}
      />
      <Cta links={[
        { href: '/ihna-australias-reconciliation-action-plan/', label: 'Read the Full RAP', style: 'primary' },
        { href: '/ihna-policies/IHNA_Aboriginal_and_Torres_Strait_Islander_Education_and_Support_Policy.pdf', label: 'Support Guidelines', style: 'secondary' },
      ]} variant="inline" tone="muted" spacing="compact" />
      <SplitProse eyebrow="Students" heading="Supporting Your Educational *Journey*">
        <p>At IHNA, we are committed to supporting Aboriginal and Torres Strait Islander students through culturally safe education, dedicated support services, and inclusive governance structures. Our goal is to create a learning environment where you can thrive, lead, and inspire positive change in healthcare and society.</p>
      </SplitProse>
      <FeatureCards
        palette="earth"
        tone="muted"
        heading="What We *Offer*"
        items={[
          { title: 'Priority Admission', body: <><p>Priority admission for Aboriginal and Torres Strait Islander students.</p><p><a href="mailto:admissions@ihna.edu.au">Contact Admission</a></p></> },
          { title: 'Student Council Representation', body: <><p>First priority invitations to join the Student Council, enabling representation and voice in institutional decision-making.</p><p><a href="mailto:governance@hci.edu.au">Expression of Interest</a></p></> },
          { title: 'Dedicated Scholarships', body: <><p>Scholarships supporting Aboriginal and Torres Strait Islander students pursuing nursing and health careers.</p><p><a href="mailto:support@ihna.edu.au">Contact Support</a></p></> },
          { title: 'Culturally Safe Learning', body: 'Culturally safe learning environments supported by trained staff, community partnerships, and Indigenous-led initiatives.' },
          { title: 'Aboriginal and Torres Strait Islander Perspective', body: 'Integration of Aboriginal and Torres Strait Islander perspectives into teaching and learning, and community engagement activities.' },
          { title: 'Community Partnerships', body: 'Strong partnerships with Aboriginal and Torres Strait Islander communities and organizations.' },
          { title: 'Mentorship Program', body: 'We offer a dedicated mentorship program for students who identify as Aboriginal and/or Torres Strait Islander. This program connects students with a First Nations educator, ensuring culturally safe, respectful and appropriate guidance that supports student wellbeing and academic success.' },
        ]}
      />
      <EventCards
        palette="earth"
        heading="Events"
        items={[
          { when: 'Upcoming', detail: 'July 2026', title: 'NAIDOC Week Celebrations', body: 'Join us for a week of cultural celebrations, workshops, and community gatherings honoring Aboriginal and Torres Strait Islander histories, cultures, and achievements.', href: 'mailto:events@hci.edu.au' },
          { when: 'Bi-annual', detail: 'April & November', title: 'Student Council Gathering', body: 'Bi-annual gatherings for Aboriginal and Torres Strait Islander students to connect, share experiences, and access support in a culturally safe environment.', href: 'mailto:governance@hci.edu.au' },
          { when: 'Quarterly', detail: 'Every quarter', title: 'Cultural Workshops', body: 'Participate in hands-on workshops exploring traditional arts, storytelling, and cultural practices led by community elders and artists.', href: '/student-cultural-workshop-events/' },
        ]}
      />
      <Cta heading="Ready to Start Your Journey?" body='Explore our programs, apply for scholarships, or connect with our support team to learn more about how IHNA can support your educational goals.' links={[{ href: 'mailto:support@ihna.edu.au', label: 'Contact Support', style: 'primary' }]} variant="banner" tone="sunrise" />
      <SplitProse eyebrow="Staff" heading="Building an Inclusive *Workplace*">
        <p>At IHNA, we are proud to create an inclusive and supportive environment for Aboriginal and Torres Strait Islander staff. Our commitment extends beyond education — it is about respect, representation, and reconciliation. Through the Aboriginal and Torres Strait Islander Education and Support Committee and our Reconciliation Action Plan (RAP), we actively support First Nations employment, leadership development, and cultural capability building.</p>
        <h3>Join the Aboriginal and Torres Strait Islander Education and Support Committee</h3>
        <p>Become part of the Aboriginal and Torres Strait Islander Education and Support Committee and contribute to shaping First Nations education and support initiatives at IHNA. We welcome Aboriginal and Torres Strait Islander staff members and allies who are passionate about advancing reconciliation, cultural safety, and educational excellence.</p>
        <p><a href="mailto:governance@hci.edu.au">Expression of Interest</a></p>
      </SplitProse>
      <FeatureCards
        palette="earth"
        tone="muted"
        columns={4}
        heading="Our Commitments to *Staff*"
        items={[
          { title: 'Employment & Development', body: <div className="prose prose-sm"><ul>
          <li>Priority recruitment through culturally safe hiring</li>
          <li>Funded training and education support</li>
          <li>Mentorship with senior academic leaders</li>
        </ul></div> },
          { title: 'Cultural Capability', body: <div className="prose prose-sm"><ul>
          <li>Cultural awareness training via LMS Module</li>
          <li>First Nations-led community workshops</li>
          <li>Cultural competency standards</li>
        </ul></div> },
          { title: 'Voice & Governance', body: <div className="prose prose-sm"><ul>
          <li>Representation on Aboriginal and Torres Strait Islander Education and Support Committee and Academic Board</li>
          <li>Input on curriculum and research</li>
          <li>Leadership in decision-making</li>
        </ul></div> },
          { title: 'Community & Recognition', body: <div className="prose prose-sm"><ul>
          <li>Community organization partnerships</li>
          <li>Cultural observances and events</li>
          <li>Valued voice in all initiatives</li>
        </ul></div> },
        ]}
      />
      <EventCards
        palette="earth"
        heading="Professional Development Events"
        items={[
          { when: 'Quarterly', detail: 'Ongoing Access', title: 'Cultural Awareness Training (LMS Module)', body: 'Comprehensive LMS Module providing regular cultural awareness training for all faculty and staff, led by First Nations educators covering cultural protocols, respectful communication, and inclusive practices.', href: 'https://canvas.ihna.edu.au/courses/1360' },
          { when: 'Bi-annual', detail: 'March & Sept', title: 'First Nations Leadership Forum', body: 'Forums bringing together Aboriginal and Torres Strait Islander staff across all levels to discuss leadership development and career advancement opportunities.', href: 'mailto:events@hci.edu.au' },
          { when: 'Monthly', detail: 'Last Wed/Month', title: 'Aboriginal and Torres Strait Islander Education and Support Committee Meetings', body: 'Regular meetings to guide strategic planning, curriculum development, and community partnerships aligned with RAP commitments.', href: 'mailto:governance@hci.edu.au' },
          { when: 'Annual', detail: 'May 27 – Jun 3', title: 'Reconciliation Week Activities', body: 'Week-long series of events including staff workshops, community engagement activities, and celebrations recognizing reconciliation achievements.', href: 'mailto:events@hci.edu.au' },
          { when: 'Quarterly', detail: 'Every quarter', title: 'Cultural Workshops', body: 'Participate in hands-on workshops exploring traditional arts, storytelling, and cultural practices led by community elders and artists.', href: '/staff-cultural-workshop-events/' },
        ]}
      />
      <FeatureCards
        palette="earth"
        tone="muted"
        heading="Our Reconciliation Action Plan"
        intro="IHNA’s Reconciliation Action Plan (RAP) framework strengthens relationships, respect, and opportunities for Aboriginal and Torres Strait Islander peoples. The RAP guides our work across three key pillars:"
        items={[
          { title: 'Relationships', body: 'Building meaningful connections with Aboriginal and Torres Strait Islander communities.' },
          { title: 'Respect', body: 'Honoring and celebrating Aboriginal and Torres Strait Islander cultures, knowledge, and contributions.' },
          { title: 'Opportunities', body: 'Creating pathways for Aboriginal and Torres Strait Islander peoples to thrive in education and employment.' },
        ]}
      />
      <Cta links={[{ href: '/ihna-australias-reconciliation-action-plan/', label: 'Read the Full RAP', style: 'primary' }]} variant="inline" tone="muted" spacing="compact" />
      <Cta heading="Join Our Team" body='Together, we are building a workplace that values cultural diversity, empowers Indigenous leadership, and advances reconciliation through education and opportunity.' links={[{ href: 'mailto:hr@ihna.edu.au', label: 'Contact HR Team', style: 'primary' }]} variant="banner" tone="sunrise" />
    </>
  )
}
