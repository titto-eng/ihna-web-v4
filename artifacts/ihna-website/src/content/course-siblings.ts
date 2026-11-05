// The same course for the other audience, where the two pages do not follow the `<slug>` / `<slug>-international` rule
// (src/app/(site)/courses/[slug]/page.tsx `loadSibling`). Domestic slug -> international slug; the route reads it both ways.
// Source: the "Switch to International / Domestic" button of each ihna.edu.au course page (`a.switch-btn`, checked by
// tests/courses/course-ihna.test.ts against the course bodies). Site-specific (SHARED-FILES.md: src/content/**).
export const COURSE_SIBLINGS: Record<string, string> = {
  'diploma-of-nursing': 'diploma-of-nursing-int',
  'diploma-community-services-case-management': 'diploma-community-services-case-management-int',
  'chc52021-diploma-of-community-services-case-management': 'chc52021-diploma-of-community-services-case-management-international-students',
  'certificate-iii-in-individual-support-ageing-and-disability': 'chc33021-certificate-iii-in-individual-support-ageing-and-disability-international',
  'hlt37525-certificate-iii-in-pathology-collection': 'hlt37525-certificate-in-pathology-pathology-collection-int',
}

/** The registered other-audience slug of `slug`, either direction; null when the course is not listed. */
export function registeredSibling(slug: string): { slug: string; international: boolean } | null {
  if (COURSE_SIBLINGS[slug]) return { slug: COURSE_SIBLINGS[slug], international: true }
  const domestic = Object.keys(COURSE_SIBLINGS).find((k) => COURSE_SIBLINGS[k] === slug)
  return domestic ? { slug: domestic, international: false } : null
}
