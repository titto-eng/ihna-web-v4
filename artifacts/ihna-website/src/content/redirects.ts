// Exact-path redirects (70-urls-seo §4, DEC-64). Loaded by next.config.ts, so a change needs a restart.
// Only rules whose target is live are listed (DEC-31). Prefix and "contains" rules live in src/lib/legacy-redirects.ts because
// next.config cannot express "contains".
//
// IHNA: every rule below answers on live as listed (checked 2026-10-21) and keeps the live status, 301 or 302 (DEC-30). The old
// theme's header.php runs 14 "URL contains" rules; only the 4 whose target is live are here, as the exact URLs they answer: a
// "contains" rule would also catch live landing pages such as /study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability/
// (header.php never runs for those static pages).
// Paths without a file extension are written with their trailing slash: Next answers the slash-less form with a 308 first.
export type Redirect = { from: string; to: string; permanent: boolean; note: string }

const DOMESTIC = '/domestic-students/'

/** The `-int.php` international landing pages answer a 302 to /domestic-students/ (line 2 of each file). */
const INT_LANDING_PHP = [
  'certificate3-early-childhood-education-care-int.php',
  'certificate3-health-administration-int.php',
  'certificate3-health-services-assistance-int.php',
  'certificate3-individual-support-int.php',
  'certificate4-ageing-support-int.php',
  'certificate4-disability-int.php',
  'certificate4-health-administration-int.php',
  'certificate4-leadership-management-int.php',
  'diploma-community-services-int.php',
  'diploma-early-childhood-education-care-int.php',
  'diploma-leadership-management-int.php',
  'diploma-practice-management-int.php',
]

export const redirects: Redirect[] = [
  // header.php page_redirects()
  { from: '/international-policies/', to: '/policies-links-forms/', permanent: false, note: 'header.php "international-policies"' },
  { from: '/industry-partnerships/', to: '/industry/', permanent: false, note: 'header.php "industry-partnerships"' },
  { from: '/courses/hltaid011-provide-first-aid/', to: '/courses/provide-first-aid/', permanent: true, note: 'header.php (301)' },
  {
    from: '/courses/certificate-iii-individual-support-ageing-disability/',
    to: '/courses/certificate-iii-in-individual-support-ageing-and-disability/',
    permanent: false,
    note: 'header.php "certificate-iii-individual-support-ageing-disability" (2022 sitemap URL)',
  },
  {
    from: '/courses/certificate-iii-individual-support-ageing-disability-int/',
    to: '/courses/certificate-iii-in-individual-support-ageing-and-disability/',
    permanent: false,
    note: 'header.php, same rule (2022 sitemap URL)',
  },

  // functions.php template_redirect and server rules
  { from: '/ihna-global-covid-nursing-award/', to: '/awards-and-rankings-ihna/', permanent: true, note: 'functions.php; live goes via /awards/ (two 301s), one hop here' },
  { from: '/awards/', to: '/awards-and-rankings-ihna/', permanent: true, note: 'server rule (2022 sitemap URL)' },
  { from: '/clp/diploma-of-nursing/', to: '/courses/diploma-of-nursing/', permanent: true, note: 'server rule (2022 sitemap URL); /clp/pathology-collection/ stays 404' },

  // Old landing pages that send visitors to /domestic-students/
  ...INT_LANDING_PHP.map((f) => ({ from: `/study-at-ihna/${f}`, to: DOMESTIC, permanent: false, note: '-int.php: header("Location") on line 2' })),
  { from: '/healthcare-courses-ballarat/', to: DOMESTIC, permanent: false, note: 'DirectoryIndex courses.php' },
  { from: '/healthcare-courses-ballarat/courses.php', to: DOMESTIC, permanent: false, note: 'courses.php: header("Location") on line 2' },
  { from: '/healthcare-courses-ballarat/courses/', to: DOMESTIC, permanent: false, note: '.htaccess extensionless rule' },
  { from: '/healthcare-courses-bendigo/', to: DOMESTIC, permanent: false, note: 'DirectoryIndex courses.php' },
  { from: '/healthcare-courses-bendigo/courses.php', to: DOMESTIC, permanent: false, note: 'courses.php: header("Location") on line 2' },

  // Blog
  // two blog URLs of the old sitemap that no App Runner post answers (live renders an empty article): the typo'd slug goes to the post,
  // the removed post to the blog
  {
    from: '/blog/2014/06/ihna-represented-at-amsterdam-for-the-netnep-conference-5th-international-nurse-education-conference/',
    to: '/blog/2014/06/ihna-represented-at-amsterdam-for-the-netnep-conference-5th-international-nurse-conference/',
    permanent: true,
    note: 'sitemap slug typo of an existing post',
  },
  {
    from: '/blog/2021/10/what-is-the-difference-between-the-two-qualifications-certificate-iii-in-health-administration-and-certificate-iv-in-health-administration/',
    to: '/blog/',
    permanent: true,
    note: 'post no longer in the blog',
  },
]
