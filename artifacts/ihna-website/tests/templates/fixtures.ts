import type { CourseCardData } from '@/components/templates/courseCards'
import type { Lookup, StaffCard } from '@/components/templates/data'
import type { Post } from '@/payload-types'

// Representative documents for the template tests (no database).
const ref = (slug: string, name: string, sortOrder = 0) => ({ slug, name, sortOrder })
export const nursing = ref('school-of-nursing', 'School of Nursing')
export const socialWork = ref('school-of-social-work', 'School of Social Work')

export const course = (over: Partial<CourseCardData> & { slug: string; title: string }): CourseCardData => ({
  id: Math.floor(Math.random() * 1e6), path: `/courses/${over.slug}/`, excerpt: null, accreditation: null, fee: null, featured: false, featuredOrder: 9999,
  studentType: 'both', image: null, school: nursing, delivery: [ref('face-to-face', 'Face to face')], campus: [ref('sydney', 'Sydney')], level: [ref('bachelor', 'Bachelor')], discipline: [], duration: '3 years',
  ...over,
})

export const courses: CourseCardData[] = [
  course({ id: 1, slug: 'bachelor-of-nursing', title: 'Bachelor of Nursing', featured: true, featuredOrder: 1, campus: [ref('sydney', 'Sydney'), ref('perth', 'Perth')] }),
  course({ id: 2, slug: 'master-of-nursing-online', title: 'Master of Nursing (Online)', delivery: [ref('online', 'Online')], level: [ref('master', 'Master')], campus: [], studentType: 'international' }),
  course({ id: 3, slug: 'bachelor-of-social-work', title: 'Bachelor of Social Work', school: socialWork, campus: [ref('melbourne', 'Melbourne')], studentType: 'domestic' }),
]

export const lookup = (id: number, slug: string, name: string, extra: Partial<Lookup> = {}): Lookup => ({ id, slug, name, description: null, image: null, detailPath: null, ...extra })
export const schools = [lookup(11, 'school-of-nursing', 'School of Nursing', { description: 'Nursing from diploma to master.' }), lookup(12, 'school-of-social-work', 'School of Social Work')]
export const campuses = [lookup(21, 'melbourne', 'Melbourne'), lookup(22, 'sydney', 'Sydney'), lookup(23, 'perth', 'Perth')]

export const staff: StaffCard[] = [
  { id: 1, name: 'Dr Alex Morgan', position: 'Head of School', photo: null, school: { id: 11, name: 'School of Nursing' }, path: '/dr-alex-morgan/' },
  { id: 2, name: 'Sam Lee', position: 'Lecturer', photo: null, school: { id: 12, name: 'School of Social Work' }, path: null },
]

export const post = (id: number, title: string): Post => ({ id, title, slug: `p-${id}`, path: `/blog/p-${id}/`, category: 'blog', publishedAt: '2026-05-01T00:00:00.000Z', excerpt: `About ${title}`, content: null as never, updatedAt: '', createdAt: '' }) as Post
