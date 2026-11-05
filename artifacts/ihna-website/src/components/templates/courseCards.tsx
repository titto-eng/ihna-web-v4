import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SCHOOL_PHOTO_SIZE, schoolPhoto } from '@/components/course/schoolPhoto'
import { coursePhoto } from '@/content/course-photos'
import Image from '@/components/blocks/MediaImage'
import { mediaOf } from '@/components/blocks/media'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { pickSize } from '@/lib/media-sizes'
import type { Course } from '@/payload-types'

// Serializable view of a course for listing, school, campus and home cards. Built on the server, used by server and client components.
export type Ref = { slug: string; name: string; sortOrder: number }
export type CourseCardData = {
  id: number
  slug: string
  path: string
  title: string
  excerpt: string | null
  accreditation: string | null
  fee: string | null
  featured: boolean
  featuredOrder: number
  studentType: 'domestic' | 'international' | 'both'
  image: { url: string; alt: string; width: number; height: number; position?: string } | null
  school: Ref | null
  delivery: Ref[]
  campus: Ref[]
  level: Ref[]
  discipline: Ref[]
  duration: string | null
}

const refOf = (row: unknown): Ref | null => {
  if (!row || typeof row !== 'object') return null
  const r = row as { slug?: string | null; name?: string | null; sortOrder?: number | null }
  return r.slug && r.name ? { slug: r.slug, name: r.name, sortOrder: r.sortOrder ?? 0 } : null
}
const refsOf = (rows: unknown): Ref[] =>
  (Array.isArray(rows) ? rows : []).flatMap((r) => refOf(r) ?? []).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

/** `course` must be loaded at depth >= 1 so the lookups are populated. */
export function toCardData(course: Course): CourseCardData {
  const image = pickSize(mediaOf(course.heroImage as never), 'card')
  const duration = (Array.isArray(course.durations) ? course.durations : []).find((d) => d && typeof d === 'object') as { name?: string } | undefined
  return {
    id: course.id,
    slug: course.slug,
    path: course.path ?? `/courses/${course.slug}/`,
    title: course.title,
    excerpt: course.excerpt ?? null,
    accreditation: course.accreditation ?? null,
    fee: course.fees?.displayAmount ?? null,
    featured: Boolean(course.featured),
    featuredOrder: course.featuredOrder ?? 9999,
    studentType: course.studentType ?? 'both',
    image,
    school: refOf(course.school),
    delivery: refsOf(course.deliveryModes),
    campus: refsOf(course.campuses),
    level: refsOf(course.levels),
    discipline: refsOf(course.disciplines),
    duration: duration?.name ?? null,
  }
}

export function CourseCard({ course, detailed = false }: { course: CourseCardData; detailed?: boolean }) {
  const own = coursePhoto(course.slug, 'card')
  // a CMS image narrower than the card's 2x width (the old 350-500 px thumbnails) gives way to the course photo
  const cms = course.image && course.image.width >= 640 ? course.image : null
  const photo = cms ?? (own ? { url: own.src, alt: own.alt, width: own.width, height: own.height, position: 'center' } : { url: schoolPhoto(course.school?.slug), alt: '', ...SCHOOL_PHOTO_SIZE, position: 'center 30%' })
  // "HLT54121 - Diploma of Nursing": the national code as a small label, the name as the card title (same text, the dash hidden)
  const m = /^([A-Z]{3,}\d{3,}[A-Z]?)\s*[-–]\s*(.+)$/.exec(course.title.trim())
  return (
    <Link href={course.path} className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2" data-course-card={course.slug}>
      <Card className="relative h-full gap-0 overflow-hidden py-0 shadow-sm transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/15">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image src={photo.url} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw" style={{ objectPosition: photo.position }} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
          {course.school && <span className="label-mono absolute top-4 left-4 max-w-[85%] truncate rounded-full bg-ink/60 px-3 py-1 text-[10px] text-ink-foreground backdrop-blur">{course.school.name}</span>}
          {course.duration && <span className="absolute right-4 bottom-4 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink shadow-lg">{course.duration}</span>}
          {m && <span className="label-mono absolute bottom-4 left-4 text-xs text-secondary">{m[1]}</span>}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="display text-2xl leading-snug transition-colors group-hover:text-primary-strong">
            {m ? <><span className="sr-only">{m[1]} - </span>{m[2]}</> : course.title}
          </h3>
          {course.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{course.excerpt}</p>}
          {detailed && (
            <dl className="grid gap-1 text-sm text-muted-foreground">
              {course.campus.length > 0 && <div><dt className="sr-only">Campuses</dt><dd>{course.campus.map((c) => c.name).join(' · ')}</dd></div>}
              {course.accreditation && <div><dt className="sr-only">Accreditation</dt><dd>{course.accreditation}</dd></div>}
              {course.fee && <div><dt className="sr-only">Fee</dt><dd>{course.fee}</dd></div>}
            </dl>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {course.delivery.map((d) => <Badge key={d.slug} variant="secondary" className="label-mono rounded-full px-3 text-[10px] tracking-widest">{d.name}</Badge>)}
            <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-strong">
              View course <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
