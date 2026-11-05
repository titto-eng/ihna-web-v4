// The school banner photo that stands in for a course without its own hero image (course hero, course cards). Plain data: safe
// in server and client components.
const SCHOOL_PHOTO: Record<string, string> = {
  'school-of-nursing': '/images/ihna/schools/nursing-banner.webp',
  'school-of-community-services': '/images/ihna/schools/school-com-ser.webp',
  'school-of-allied-health-and-human-services': '/images/ihna/schools/allied-health-assistance-banner.webp',
  'first-aid': '/images/ihna/schools/firstaid-banner.webp',
}
const FALLBACK_PHOTO = '/images/ihna/schools/school-edu-com.webp'

/** Width and height of every school banner (1030 × 914). */
export const SCHOOL_PHOTO_SIZE = { width: 1030, height: 914 } as const

export const schoolPhoto = (schoolSlug: string | null | undefined): string => SCHOOL_PHOTO[schoolSlug ?? ''] ?? FALLBACK_PHOTO
