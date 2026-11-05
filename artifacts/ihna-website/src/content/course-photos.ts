// Course photos used until a course has its own `heroImage` in the CMS: the old site's own course images (wp-content/themes/mwt-ihna
// and wp-content/uploads), upscaled with Real-ESRGAN (x4plus), sharpened and cropped once into public/images/ihna/courses/: `<slug>.webp` (4:5, the course hero) and
// `<slug>-card.webp` (16:10, course cards). Keyed by course slug. Plain data, safe in client components.
export type CoursePhoto = { src: string; alt: string; width: number; height: number }

const PHOTOS: Record<string, { alt: string; hero: [number, number]; card: [number, number] }> = {
  'certificate-iii-in-individual-support-ageing-and-disability': { alt: 'Aged care worker with an older man', hero: [1000, 1250], card: [1200, 750] },
  'certificate-iii-in-sterilisation-services': { alt: 'Sterilisation technician loading a steriliser', hero: [1000, 1250], card: [1200, 750] },
  'certificate-iii-pathology-collection': { alt: 'Blood collection tubes', hero: [1000, 1250], card: [1200, 750] },
  'chc33021-certificate-iii-in-individual-support-ageing-and-disability-international': { alt: 'Carer walking with an older woman', hero: [1000, 1250], card: [1200, 750] },
  'chc52021-diploma-of-community-services-case-management': { alt: 'Case worker supporting a client', hero: [1000, 1250], card: [1200, 750] },
  'chc52021-diploma-of-community-services-case-management-international-students': { alt: 'Support worker helping a wheelchair user', hero: [1000, 1250], card: [1200, 750] },
  'diploma-community-services-case-management': { alt: 'Community services worker with an older woman', hero: [1000, 1250], card: [1200, 750] },
  'diploma-community-services-case-management-int': { alt: 'Community services student with a clipboard', hero: [1000, 1250], card: [1200, 750] },
  'diploma-of-community-service-to-bachelor-of-social-work': { alt: 'Social worker visiting an older man at home', hero: [1000, 1250], card: [1200, 750] },
  'diploma-of-nursing': { alt: 'Nursing student in scrubs in a hospital corridor', hero: [1000, 1250], card: [1200, 750] },
  'diploma-of-nursing-int': { alt: 'Nurse holding a tablet', hero: [1000, 1250], card: [1200, 750] },
  'hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care': { alt: 'Assistant in nursing preparing a hospital bed', hero: [1000, 1250], card: [1200, 750] },
  'hlt35021-certificate-iii-in-dental-assisting': { alt: 'Dental assistant with a dentist', hero: [1000, 1250], card: [1200, 750] },
  'hlt37525-certificate-iii-in-pathology-collection': { alt: 'Pathology collector taking a blood sample', hero: [1000, 1250], card: [1200, 750] },
  'hlt37525-certificate-in-pathology-pathology-collection-int': { alt: 'Pathology sample tubes', hero: [1000, 1250], card: [1200, 750] },
  'hlt57921-diploma-of-anaesthetic-technology-and-practices': { alt: 'Anaesthetic technician preparing medication', hero: [1000, 1250], card: [1200, 750] },
  'hltpat005-collect-specimens-for-drugs-of-abuse-testing': { alt: 'Specimen collection for drug testing', hero: [1000, 1250], card: [1200, 750] },
  'ihna-english-language-preperatory-course': { alt: 'Student practising English', hero: [1000, 1250], card: [1200, 750] },
  'provide-basic-emergency-life-support': { alt: 'Emergency life support training', hero: [1000, 1250], card: [1200, 750] },
  'provide-cardiopulmonary-resuscitation': { alt: 'CPR practice on a training manikin', hero: [1000, 1250], card: [1200, 750] },
  'provide-first-aid': { alt: 'First aid training with a bandaged leg', hero: [1000, 1250], card: [1200, 750] },
}

/** The course's photo: `hero` (4:5) or `card` (16:10); null when the course has none here. */
export function coursePhoto(slug: string | null | undefined, kind: 'hero' | 'card' = 'hero'): CoursePhoto | null {
  const p = slug ? PHOTOS[slug] : undefined
  if (!p) return null
  const [width, height] = p[kind]
  return { src: `/images/ihna/courses/${slug}${kind === 'card' ? '-card' : ''}.webp`, alt: p.alt, width, height }
}
