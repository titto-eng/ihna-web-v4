import { site } from '@/content/site'

// PLACEHOLDER copy for the Home first screen until marketing supplies it (05 §4.4). Lives apart from Home.tsx so the image import can seed
// the same words into the Home page's own `hero` block, where marketing then edits them in /admin.
export const HERO_FALLBACK = {
  eyebrow: site.siteName,
  heading: 'Health education that *works* as hard as you do.',
  subheading: 'Nursing, aged care and health courses, taught by practising clinicians and educators.',
}

export const heroSubheading = (campusNames: string[]): string =>
  campusNames.length ? `${HERO_FALLBACK.subheading} Study in ${campusNames.join(', ')}.` : HERO_FALLBACK.subheading

/** Copy for the two photo bands the image import seeds into the Home layout (also placeholder, editable in /admin). */
export const HOME_BANDS = {
  facilities: {
    eyebrow: 'Facilities',
    heading: 'Learn in real *clinical* spaces',
    body: 'Our nursing laboratories are set up like hospital wards, so students practise assessment and care skills before they reach placement.',
  },
  graduates: {
    eyebrow: 'Our graduates',
    heading: 'Celebrating every *graduate*',
    body: `Each year we celebrate the students who complete their qualifications with ${site.shortName}, together with their families and our academic staff.`,
  },
}
