// Footer (05 §4.2, DEC-63). Hand-edited constants; keep it plain data.
// IHNA: the live footer of ihna.edu.au as of 2026-10-21 (the third column has "Careers" where the repo's footer.php has "Blog").
// Phones, email and social profiles come from src/content/site.ts. Every internal target answers 200 on live.
import type { NavLink } from './nav'
import { site } from './site'

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'x' | 'tiktok'

const telLink = (label: string, phone: string): NavLink => ({ label: `${label}: ${phone}`, href: `tel:${phone.replace(/[^+\d]/g, '')}` })

export const footer: {
  columns: { heading: string; links: NavLink[] }[]
  newsletter: { enabled: boolean; formKey: string; heading: string; text: string }
  acknowledgement: string | null
  /** The "Know more" link under the acknowledgement (rendered when set). */
  acknowledgementLink?: NavLink | null
  legalLines: string[]
  legalLinks: NavLink[]
  social: { network: SocialNetwork; href: string }[]
} = {
  columns: [
    {
      heading: 'Students',
      links: [
        { label: 'How to Apply', href: '/how-to-apply/' },
        { label: 'Current Students', href: '/current-students/' },
        { label: 'Census Dates', href: '/ihna-census-dates/' },
        { label: 'Course Calendar', href: '/course-calendar/' },
        { label: 'Pay Online', href: '/payment-options/' },
      ],
    },
    {
      heading: 'Partners',
      links: [
        { label: 'Corporate Registration', href: '/corporate-registration/' },
        { label: 'Expression of Interest', href: '/expression-of-interest/' },
        { label: 'Recruitment Consultants', href: '/international-student-recruitment/' },
        { label: 'Download Corporate Profile', href: site.contact.corporateProfileUrl },
      ],
    },
    {
      heading: 'IHNA',
      links: [
        { label: 'Staff Login', href: '/staff-login/' },
        { label: 'Careers', href: '/career/' },
        { label: 'Contact Us', href: '/contact/' },
        { label: 'Policies', href: '/policies-links-forms/' },
      ],
    },
    {
      heading: 'Contact',
      links: [
        telLink('From within Australia', site.phone),
        telLink('From outside Australia', site.phoneInternational),
        { label: `Email: ${site.email}`, href: `mailto:${site.email}` },
      ],
    },
  ],
  // Off: IHNA has no newsletter form in src/content/forms.ts.
  newsletter: {
    enabled: false,
    formKey: 'newsletter',
    heading: 'Stay in the loop',
    text: 'Course news, events and study tips from IHNA, straight to your inbox.',
  },
  acknowledgement:
    'IHNA acknowledges the Traditional Owners of the country throughout Australia and recognises continuing connection to land, waters, and culture. We pay our respects to Elders past, present and emerging.',
  acknowledgementLink: { label: 'Know more', href: '/aboriginal-and-torres-strait-islander/' },
  legalLines: [
    `Legal entity: ${site.organisation.legalName} | ACN: ${site.organisation.acn} | ABN ${site.organisation.abn} | RTO ID: ${site.organisation.rto} | CRICOS Provider Code: ${site.organisation.cricos}`,
  ],
  legalLinks: [],
  social: [...site.social],
}
