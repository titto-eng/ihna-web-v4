// Old static URLs that answer 200 on live but whose content is not ported (urls.csv owner STATIC-DOCS). Site-specific constants.

/**
 * Demo and mock-up pages (old HTML under demo/, including a SCORM package). Live serves them with 200; their HTML never reaches this
 * site (rule 5), so each answers a minimal noindex page saying it is not available (src/app/(site)/demo/[...path]/page.tsx).
 * Any other /demo/ URL is 404. Open: the owner decides whether they can go (they would then 404).
 */
export const UNAVAILABLE_DEMO_PATHS = [
  '/demo/hand-hygiene/analytics-frame.html',
  '/demo/hand-hygiene/index.html',
  '/demo/hand-hygiene/index_lms.html',
  '/demo/hand-hygiene/index_lms_html5.html',
  '/demo/hand-hygiene/story.html',
  '/demo/hand-hygiene/story_html5.html',
  '/demo/ihna-online-courses/index.html',
  '/demo/ihna-online/course-details.html',
  '/demo/ihna-online/course-list-2.html',
  '/demo/ihna-online/course-list.html',
  '/demo/ihna-online/index.html',
  '/demo/landing-page/html/index.html',
  '/demo/landing-page/index.html',
  '/demo/landing-page/spanish/index.html',
  '/demo/online-courses-lp/index.html',
  '/demo/page-design/international-2.html',
  '/demo/page-design/international.html',
  '/demo/page-design/students.html',
] as const

/**
 * Server-side PHP includes that live answers with an empty 200 (they hold credentials and lookup tables; their source never leaves the
 * old repo, rule 3). Each has a route file that returns an empty 200 body.
 */
export const EMPTY_200_PATHS = ['/RDynamics.php', '/campaign_codes.php', '/e2btns.php'] as const
