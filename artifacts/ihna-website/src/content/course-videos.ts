// Course banner films. A course listed here opens with the video banner (src/components/course/CourseVideoHero.tsx) instead of the
// photo banner. The films are IHNA's own course videos (the `course-videos/` originals), encoded once into public/videos/courses/:
//   <film>.mp4       16:9 1600x900 loop, no sound (desktop and tablet banner)
//   <film>-m.mp4     3:4 720x960 centre crop, no sound (phone banner)
//   <film>-full.mp4  1280x720 with sound (the "watch" player)
//   <film>.webp / <film>-m.webp  posters (first frame shown before the video plays, and with reduced motion)
// Keyed by course slug. Plain data, safe in client components.

export type CourseFilm = {
  /** 16:9 loop */ loop: string
  /** 3:4 phone loop */ loopMobile: string
  /** the film with sound */ full: string
  poster: string
  posterMobile: string
  /** what the film shows, for the player's accessible name */ label: string
}

const FILMS: Record<string, { file: string; label: string }> = {
  'diploma-of-nursing': { file: 'diploma-of-nursing', label: 'Nursing students training in the IHNA clinical lab' },
  'diploma-of-nursing-int': { file: 'diploma-of-nursing', label: 'Nursing students training in the IHNA clinical lab' },
  'hlt57921-diploma-of-anaesthetic-technology-and-practices': { file: 'diploma-of-anaesthetic-technology-and-practices', label: 'Anaesthetic technology students working with anaesthetic equipment' },
  'diploma-community-services-case-management': { file: 'diploma-in-community-services-case-management', label: 'Community services workers supporting older people' },
  'diploma-community-services-case-management-int': { file: 'diploma-in-community-services-case-management', label: 'Community services workers supporting older people' },
  'chc52021-diploma-of-community-services-case-management': { file: 'diploma-in-community-services-case-management', label: 'Community services workers supporting older people' },
  'chc52021-diploma-of-community-services-case-management-international-students': { file: 'diploma-in-community-services-case-management', label: 'Community services workers supporting older people' },
  'hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care': { file: 'health-service-assistance-assisting-in-nursing-work-in-acute-care', label: 'Assistants in nursing caring for patients' },
  'certificate-iii-in-individual-support-ageing-and-disability': { file: 'individual-support-ageing-and-disability', label: 'Individual support students helping a client to walk' },
  'chc33021-certificate-iii-in-individual-support-ageing-and-disability-international': { file: 'individual-support-ageing-and-disability', label: 'Individual support students helping a client to walk' },
  'hlt37525-certificate-iii-in-pathology-collection': { file: 'pathology-collection', label: 'Pathology collection students taking a blood sample' },
  'certificate-iii-pathology-collection': { file: 'pathology-collection', label: 'Pathology collection students taking a blood sample' },
  'hlt37525-certificate-in-pathology-pathology-collection-int': { file: 'pathology-collection', label: 'Pathology collection students taking a blood sample' },
  'certificate-iii-in-sterilisation-services': { file: 'sterilisation-services', label: 'Sterilisation technicians at work in a sterilising department' },
  'hlt35021-certificate-iii-in-dental-assisting': { file: 'dental-assisting', label: 'Dental assistants working chairside with a dentist' },
}

/** The course's banner film, or null when the course has none (it keeps the photo banner). */
export function courseFilm(slug: string | null | undefined): CourseFilm | null {
  const f = slug ? FILMS[slug] : undefined
  if (!f) return null
  const base = `/videos/courses/${f.file}`
  return { loop: `${base}.mp4`, loopMobile: `${base}-m.mp4`, full: `${base}-full.mp4`, poster: `${base}.webp`, posterMobile: `${base}-m.webp`, label: f.label }
}

export const courseFilmSlugs = Object.keys(FILMS)
