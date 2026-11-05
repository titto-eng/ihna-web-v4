// Content from the live page (front-page.php: banner carousel, course search and course tabs, campus video and campuses, claim boxes,
// latest blogs, "What's on" + quick enquiry, acknowledgement). This file is the page: edit it freely.
// Course cards, schools and testimonials come from the CMS (HomePage); upcoming events come from the CMS `events` collection; the
// campus list is src/content/campuses.ts. The old Instagram feed and the awards strip were hidden on the live page and are not ported.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { img, pageMetadata, Testimonials } from '@/components/page'
import { CampusShowcase } from '@/components/templates/CampusShowcase'
import { site } from '@/content/site'
import { JsonLd } from '@/components/seo/JsonLd'
import type { AnyBlock } from '@/components/RenderBlocks'
import { HomePage } from '@/components/templates/pages'
import type { HeroProps } from '@/components/templates/pageParts'

const TITLE = 'Welcome to IHNA – Elevate Your Career in Healthcare!'

export const metadata: Metadata = {
  ...pageMetadata({
    title: TITLE,
    path: '/',
    description: 'Courses across Nursing, Allied Health and Community Care. Evidence-based training, flexible study and real industry exposure at IHNA.',
  }),
  title: { absolute: TITLE },
}

const slides: HeroProps[] = [
  {
    variant: 'split',
    eyebrow: 'Institute of Health and Nursing Australia',
    heading: 'Australia’s leading *health & nursing* institute',
    subheading: 'Explore courses across Nursing, Allied Health and Community Care. Evidence-based training, flexible study and real industry exposure; when it comes to health training, think IHNA.',
    image: img({ src: '/images/ihna/home/leading-institute.webp', alt: 'A group of IHNA nursing students in uniform', width: 846, height: 595 }),
    ctas: [
      { label: 'Explore courses', href: '/courses/', style: 'primary' },
      { label: 'Contact us', href: '/contact/', style: 'secondary' },
    ],
  },
  {
    variant: 'split',
    eyebrow: 'HLT54121 – Diploma of Nursing',
    heading: '400 hours of *placement* support',
    subheading: 'We place you where you’ll learn fast and get noticed. Our team handles the logistics and even covers the costs of your placement, allowing you to focus on the work.',
    image: img({ src: '/images/ihna/home/placement-support.webp', alt: 'IHNA nursing students in a training ward', width: 846, height: 595 }),
    ctas: [{ label: 'See course details', href: '/courses/diploma-of-nursing/', style: 'primary' }],
  },
  {
    variant: 'split',
    eyebrow: 'Victorian International Education Awards',
    heading: 'Not a one-time win. A proven *track record*.',
    subheading: '4 Winner titles + 2 Commendations + 1 Finalist placing at the Victorian International Education Awards.',
    image: img({ src: '/images/ihna/home/awards-banner.webp', alt: 'IHNA receiving a Victorian International Education Award', width: 846, height: 595 }),
    ctas: [{ label: 'Join an award-winning institution', href: '/awards-and-rankings-ihna/', style: 'primary' }],
  },
  {
    variant: 'split',
    eyebrow: 'Walk-in sessions',
    heading: 'Walk in. Look around. Let’s talk about your *health career*.',
    subheading: 'Visit us every second Wednesday: explore the campus, meet our team and speak with a counsellor at your own pace.',
    image: img({ src: '/images/ihna/home/walkin-lookaround.webp', alt: 'An IHNA event hall', width: 846, height: 595 }),
    ctas: [{ label: 'Register my interest', href: '/walkin-registration/', style: 'primary' }],
  },
  {
    variant: 'split',
    eyebrow: 'Student stories',
    heading: 'What’s *inside* IHNA?',
    subheading: 'See real student stories, inside the simulation labs, and tips for succeeding on placement.',
    image: img({ src: '/images/ihna/home/inside-ihna.webp', alt: 'Nursing students in an IHNA simulation lab', width: 846, height: 595 }),
    ctas: [{ label: 'View more videos', href: 'https://www.youtube.com/@ihna-australia', style: 'primary' }],
  },
]

// The home banner: one constant background video behind the text slider (VideoHero). The poster is the first frame, served as the LCP image.
const HERO_VIDEO = {
  webm: '/video/ihna-hero.webm',
  mp4: '/video/ihna-hero.mp4',
  poster: '/images/ihna/home/hero-poster.webp',
  alt: 'IHNA nursing students in scrubs walking to campus',
}

// Three of the live stats below, floating beside the hero text on desktop.
const HERO_HIGHLIGHTS = [
  { value: '35K+', label: 'Students' },
  { value: '92.4%', label: 'Student satisfaction (NCVER 2025)' },
  { value: '300+', label: 'Placement partners' },
]

/**
 * GEO / local SEO: every campus as a Place of the organisation, with address and phone, plus the RTO and CRICOS identifiers, so
 * search engines and AI answer engines can cite where IHNA teaches and how to contact each campus (src/content/site.ts).
 */
function campusesLd() {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/+$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    '@id': `${origin}/#organization`,
    name: site.siteName,
    alternateName: [site.shortName, 'IHNA Australia'],
    url: `${origin}/`,
    logo: `${origin}${site.logo.url}`,
    image: `${origin}/images/ihna/brand/og-default.jpg`,
    description: 'Courses across Nursing, Allied Health and Community Care. Evidence-based training, flexible study and real industry exposure at IHNA.',
    telephone: site.phone,
    email: site.email,
    areaServed: 'AU',
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'RTO', value: site.organisation.rto },
      { '@type': 'PropertyValue', propertyID: 'CRICOS', value: site.organisation.cricos },
      { '@type': 'PropertyValue', propertyID: 'ABN', value: site.organisation.abn.replace(/\s/g, '') },
    ],
    legalName: site.organisation.legalName,
    sameAs: site.social.map((s) => s.href),
    location: site.contact.campuses.map((c) => ({
      '@type': 'Place',
      name: `IHNA ${c.name} campus`,
      address: { '@type': 'PostalAddress', streetAddress: c.address, addressCountry: 'AU' },
      telephone: c.phone,
    })),
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'admissions', telephone: site.phone, email: site.email, areaServed: 'AU', availableLanguage: 'English' },
      { '@type': 'ContactPoint', contactType: 'admissions', telephone: site.phoneInternational, areaServed: 'Worldwide', availableLanguage: 'English' },
    ],
  }
}

const stats = {
  blockType: 'stats',
  tone: 'card',
  heading: 'Australia’s leading *health and nursing* institute',
  items: [
    { value: '300+', label: 'Placement partners' },
    { value: '5', label: 'Campuses in Australia with advanced applied learning labs' },
    { value: '20', label: 'Years of teaching excellence', note: 'Celebrating almost 20 years' },
    { value: '92.4%', label: 'Student satisfaction', note: 'Source: NCVER 2025' },
    { value: '35K+', label: 'Students' },
    { value: '85.7%', label: 'Of IHNA Diploma graduates get jobs', note: 'Source: NCVER 2025' },
  ],
} as AnyBlock

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function HomeRoute({ searchParams }: Props) {
  // WordPress search lived at /?s=; the site search is /search/?q=
  const { s } = await searchParams
  const q = Array.isArray(s) ? s[0] : s
  if (typeof q === 'string') redirect(q.trim() ? `/search/?q=${encodeURIComponent(q.trim().slice(0, 200))}` : '/search/')

  return (
    <HomePage
      title="Home"
      path="/"
      hero={slides}
      video={HERO_VIDEO}
      highlights={HERO_HIGHLIGHTS}
      stats={stats}
      featuredLimit={null}
      latest={{ eyebrow: 'Blog', heading: 'Latest *blogs*', href: '/blog/', label: 'All blogs' }}
      courseTabs={{
        heading: 'ENHANCE YOUR CAREER THROUGH | HEALTHCARE EDUCATION AND SKILLS TRAINING!',
        searchPlaceholder: 'Search...',
        tabs: [
          {
            label: 'IHNA SCHOOL OF ALLIED HEALTH AND HUMAN SERVICES',
            items: [
              'certificate-iii-in-individual-support-ageing-and-disability',
              'hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care',
              'certificate-iii-pathology-collection',
              'hlt37525-certificate-iii-in-pathology-collection',
              'certificate-iii-in-sterilisation-services',
              'hlt35021-certificate-iii-in-dental-assisting',
            ],
          },
          { label: 'IHNA SCHOOL OF COMMUNITY SERVICES', items: ['chc52021-diploma-of-community-services-case-management', 'diploma-community-services-case-management'] },
          {
            label: 'IHNA SCHOOL OF NURSING',
            items: [
              'diploma-of-nursing',
              'hlt57921-diploma-of-anaesthetic-technology-and-practices',
              { title: 'National Council Licensure Examination for RNs', href: 'https://ihm.edu.au/courses/nclex-for-rns/', image: { src: '/images/ihna/theme/nclex_thumb.png', alt: '', width: 671, height: 593 } },
              { title: 'Objective Structured Clinical Examination for Registered Nurses (OSCE for RNs)', href: 'https://ihm.edu.au/courses/osce-for-rns/', image: { src: '/images/ihna/theme/osce_thumb.png', alt: '', width: 671, height: 593 } },
            ],
          },
          {
            label: 'UNIT OF COMPETENCY',
            items: ['provide-first-aid', 'provide-cardiopulmonary-resuscitation', 'hltpat005-collect-specimens-for-drugs-of-abuse-testing', 'provide-basic-emergency-life-support'],
          },
        ],
      }}
      afterCourses={<CampusShowcase heading="Our *Campus*" video={{ src: '/videos/home/campus-video.mp4', poster: '/videos/home/campus-video.webp' }} />}
      whatsOn={{ heading: 'What’s on at IHNA', formHeading: 'Have any Questions?', formIntro: 'Feel free to contact us anytime.', formKey: 'quick-enquiry' }}
      acknowledgement={{
        heading: 'Acknowledgement',
        body: <p>IHNA acknowledges the Traditional Owners of the country throughout Australia and recognises continuing connection to land, waters, and culture. <br />We pay our respects to Elders past, present and emerging.</p>,
        link: { label: 'Know more', href: '/aboriginal-and-torres-strait-islander/' },
      }}
    >
      <JsonLd data={campusesLd()} />
      <Testimonials
        heading="Inside *IHNA*"
        variant="carousel"
        inline={[
          { name: 'This is where my nursing career really started: IHNA Brisbane Diploma of Nursing', videoUrl: 'https://www.youtube.com/watch?v=8StXt7gNX4s' },
          { name: 'My dream is to be a nurse: IHNA Brisbane is getting me there', videoUrl: 'https://www.youtube.com/watch?v=QfhM8rzST0w' },
          { name: 'In conversation with our Diploma of Nursing student at IHNA’s Graduation Day', videoUrl: 'https://www.youtube.com/watch?v=oyKN9dCjgL8' },
        ]}
      />
    </HomePage>
  )
}
