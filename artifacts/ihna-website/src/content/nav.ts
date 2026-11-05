// Header navigation (05 §4.2, DEC-63). Hand-edited constants; keep it plain data.
// IHNA: the live header of ihna.edu.au as of 2026-10-21 (the top bar has "Blog" where the repo's header.php has "Careers"). Every
// internal target answers 200 on live; the external ones (IHNA Online, Industry Hub, the two IHM courses) too. Courses offered to
// both audiences open a Domestic/International chooser on live; here they link to the domestic page, which links to the other.
export type NavLink = { label: string; href: string }
/** `href`: the heading links to its own page (the school pages); `column`: the column of a multi-column panel (Courses, as live). */
export type NavGroup = { heading: string | null; href?: string; column?: 1 | 2 | 3; links: NavLink[] }
export type NavItem = { label: string; href: string; groups: NavGroup[] }

export const nav: {
  utilityLinks: NavLink[]
  menu: NavItem[]
  primaryCta: NavLink | null
  secondaryCta: NavLink | null
  promoBar: { enabled: boolean; text: string | null; label: string | null; href: string | null }
} = {
  utilityLinks: [
    { label: 'IHNA Online', href: 'https://ihnaonline.edu.au/' },
    { label: 'Current Students', href: '/current-students/' },
    { label: 'Library', href: '/library/' },
    { label: 'IHNA Alumni', href: '/ihna-alumni/' },
    { label: 'Contact Us', href: '/contact/' },
    { label: 'Blog', href: '/blog/' },
  ],
  menu: [
    {
      label: 'About',
      href: '#',
      groups: [
        {
          heading: null,
          links: [
            { label: 'About Us', href: '/about-us/' },
            { label: 'Educational Philosophy', href: '/educational-philosophy/' },
            { label: 'HCI Australia', href: '/hci-australia/' },
            { label: 'Cintana Education Strategic Collaboration', href: '/cintana-alliance-partnership/' },
            { label: 'Awards and Rankings', href: '/awards-and-rankings-ihna/' },
            { label: 'Reconciliation Action Plan', href: '/ihna-australias-reconciliation-action-plan/' },
            { label: 'Accreditation and Association', href: '/accreditation-and-association/' },
            { label: 'About Funding', href: '/about-funding/' },
            { label: 'Scholarships', href: '/scholarship/' },
            { label: 'Governance', href: '/governance/' },
            { label: 'Our Team', href: '/our-team/' },
            { label: 'Academic Management Team', href: '/academic-staff/' },
            { label: 'Meet Our MD', href: '/meet-our-founder-and-md/' },
            { label: 'Life at IHNA', href: '/life-at-ihna/' },
            { label: 'Student Testimonials', href: '/testimonials/' },
            { label: 'Policies & Procedures', href: '/policies-links-forms/' },
            { label: 'Careers', href: '/career/' },
            { label: 'Logo Statement', href: '/logo-statement/' },
            { label: 'Cyber Security Tips', href: '/cybersecurity-tips/' },
          ],
        },
      ],
    },
    {
      label: 'Courses',
      href: '/courses/',
      // The live Courses panel: three columns of course categories, each heading linking to its school page; one link per course
      // (a course offered to both audiences opens its domestic page, which links to the international one).
      groups: [
        {
          heading: 'IHNA School of Nursing',
          href: '/school-of-nursing/',
          column: 1,
          links: [
            { label: 'HLT54121 – Diploma of Nursing', href: '/courses/diploma-of-nursing/' },
            { label: 'HLT57921 – Diploma of Anaesthetic Technology and Practices', href: '/courses/hlt57921-diploma-of-anaesthetic-technology-and-practices/' },
            { label: 'NCLEX for RNs', href: 'https://ihm.edu.au/courses/nclex-for-rns/' },
            { label: 'OSCE for RNs', href: 'https://ihm.edu.au/courses/osce-for-rns/' },
          ],
        },
        {
          heading: 'IHNA School of Community Services',
          href: '/school-of-community-services/',
          column: 1,
          links: [
            { label: 'CHC52021 – Diploma of Community Services (Case Management) (Superseded)', href: '/courses/chc52021-diploma-of-community-services-case-management/' },
            { label: 'CHC52025 – Diploma of Community Services (Case Management)', href: '/courses/diploma-community-services-case-management/' },
          ],
        },
        {
          heading: 'IHNA School of Allied Health and Human Services',
          href: '/school-of-allied-health/',
          column: 2,
          links: [
            { label: 'CHC33021 – Certificate III in Individual Support (Ageing and Disability)', href: '/courses/certificate-iii-in-individual-support-ageing-and-disability/' },
            {
              label: 'HLT33115 – Certificate III in Health Services Assistance (Assisting in Nursing Work in Acute Care)',
              href: '/courses/hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care/',
            },
            { label: 'HLT37215 – Certificate III in Pathology Collection (superseded)', href: '/courses/certificate-iii-pathology-collection/' },
            { label: 'HLT37525 - Certificate III in Pathology (Pathology Collection)', href: '/courses/hlt37525-certificate-iii-in-pathology-collection/' },
            { label: 'HLT37015 – Certificate III in Sterilisation Services (superseded)', href: '/courses/certificate-iii-in-sterilisation-services/' },
            { label: 'HLT35021 – Certificate III in Dental Assisting', href: '/courses/hlt35021-certificate-iii-in-dental-assisting/' },
          ],
        },
        {
          heading: 'IHNA Package Courses',
          column: 2,
          links: [{ label: 'Diploma of community Service to Bachelor of Social Work', href: '/courses/diploma-of-community-service-to-bachelor-of-social-work/' }],
        },
        {
          heading: 'First Aid',
          href: '/school-of-first-aid/',
          column: 3,
          links: [
            { label: 'HLTAID011 – Provide First Aid', href: '/courses/provide-first-aid/' },
            { label: 'HLTAID009 – Provide Cardiopulmonary Resuscitation', href: '/courses/provide-cardiopulmonary-resuscitation/' },
            { label: 'HLTAID010 – Provide Basic Emergency Life Support', href: '/courses/provide-basic-emergency-life-support/' },
            { label: 'HLTPAT005 – Collect Specimens for Drugs of Abuse Testing', href: '/courses/hltpat005-collect-specimens-for-drugs-of-abuse-testing/' },
          ],
        },
        {
          heading: 'Other Courses',
          column: 3,
          links: [
            { label: 'Post Graduate Courses at IHM', href: '/ihm-courses/' },
            { label: 'English Language Preparatory Course', href: '/courses/ihna-english-language-preperatory-course/' },
          ],
        },
      ],
    },
    {
      label: 'Campuses',
      href: '#',
      groups: [
        {
          heading: null,
          links: [
            { label: 'Melbourne', href: '/ihna-melbourne-campus/' },
            { label: 'Sydney', href: '/ihna-sydney-campus/' },
            { label: 'Perth', href: '/ihna-perth-campus/' },
            { label: 'Brisbane', href: '/ihna-brisbane-campus/' },
          ],
        },
      ],
    },
    {
      label: 'Partnership',
      href: '#',
      groups: [
        {
          heading: null,
          links: [
            { label: 'Industry Hub', href: 'https://industryhub.ihna.edu.au/industry-partnership' },
            { label: 'Industry Partnerships', href: '/industry/' },
            { label: 'University Partners', href: '/university-partners/' },
            { label: 'Articulation Pathway', href: '/articulation-pathway/' },
            { label: 'International Student Recruitment', href: '/international-student-recruitment/' },
            { label: 'Partner With Us', href: '/partner-with-us/' },
          ],
        },
      ],
    },
    {
      label: 'Students',
      href: '#',
      groups: [
        {
          heading: null,
          links: [
            { label: 'Domestic Students', href: '/domestic-students/' },
            { label: 'International Students', href: '/international-students/' },
          ],
        },
      ],
    },
    {
      label: 'Login',
      href: '#',
      groups: [
        {
          heading: null,
          links: [
            { label: 'Staff Login', href: '/staff-login/' },
            { label: 'Student Login', href: '/student-login/' },
          ],
        },
      ],
    },
  ],
  primaryCta: { label: 'Enquire Now', href: '/course-enquiry/' },
  secondaryCta: null,
  promoBar: { enabled: false, text: null, label: null, href: null },
}
