import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronRight, Phone } from 'lucide-react'
import type { Course } from '@/payload-types'
import { AudienceSwitch } from '@/components/audience/AudienceSwitch'
import { Emphasis } from '@/components/Emphasis'
import { mediaOf } from '@/components/blocks/media'
import { factListsFor, type ResolvedFact } from '@/components/course/facts'
import { schoolPhoto } from '@/components/course/schoolPhoto'
import { coursePhoto } from '@/content/course-photos'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'

// Course page hero (05 §4.4 CourseDetail): an immersive deep-teal stage with a drifting aurora, a heartbeat line and a framed photo
// carrying floating fact chips. Everything it shows is course data (title, excerpt, school, facts) or site constants (phone, RTO,
// CRICOS); it adds no marketing copy of its own. Without a large enough hero image the course photo, then the school's banner photo, stands in.


export type Cta = { label: string; href: string }

/** Narrowest CMS hero image the course banner uses (the frame is up to ~560 px wide, shown at 2x). */
export const MIN_HERO_WIDTH = 900

export const schoolOf = (course: Course): { name?: string; slug?: string } =>
  course.school && typeof course.school === 'object' ? { name: course.school.name ?? undefined, slug: course.school.slug ?? undefined } : {}

/** Up to three facts for the floating chips: the first audience's list, in a marketing order. */
export function chipFacts(course: Course): ResolvedFact[] {
  const facts = factListsFor(course as never)[0]?.facts ?? []
  const order = ['duration', 'delivery', 'level', 'campuses', 'units']
  return order.flatMap((k) => facts.filter((f) => f.key === k)).slice(0, 3)
}

/** "HLT54121 - Diploma of Nursing": the national code as a label above the name (the full title stays the h1's text). */
export function splitCourseTitle(title: string): { code?: string; name: string } {
  const m = /^([A-Z]{3,}\d{3,}[A-Z]?)\s*[-–]\s*(.+)$/.exec(title.trim())
  return { code: m?.[1], name: m?.[2] ?? title }
}

/** The banner's calls to action, the student-type switch and the RTO line (shared by the photo and the video banner). */
export function CourseHeroActions({ course, apply, enquire, sibling }: { course: Course; apply?: Cta | null; enquire: Cta; sibling?: { label: string; path: string } | null }) {
  const tel = site.phone.replace(/[^\d+]/g, '')
  return (
    <>
      <div className="hero-fade-up mt-9 flex flex-wrap items-center gap-3 [--d:300ms]">
        {apply && (
          <a href={apply.href} className="course-glow group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-secondary px-7 py-3.5 font-semibold text-ink shadow-xl shadow-secondary/30 transition-transform hover:-translate-y-0.5">
            <span aria-hidden className="course-shine absolute inset-y-0 left-0 w-1/3 bg-white/40" />
            <span className="relative">{apply.label}</span>
            <ArrowUpRight aria-hidden className="relative size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
        <a
          href={enquire.href}
          className={cn(
            'group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all hover:-translate-y-0.5',
            apply ? 'border border-ink-foreground/30 bg-ink-foreground/5 text-ink-foreground backdrop-blur hover:border-secondary hover:text-secondary' : 'course-glow bg-secondary text-ink shadow-xl shadow-secondary/30',
          )}
        >
          {enquire.label}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
        <a href={`tel:${tel}`} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-ink-foreground/80 hover:text-secondary">
          <Phone aria-hidden className="size-4" /> {site.phone}
        </a>
      </div>

      {(sibling || course.studentType === 'both') && (
        <div className="hero-fade-up mt-8 flex flex-wrap items-center gap-3 text-sm [--d:380ms]">
          {sibling && (
            <>
              <span className="text-ink-foreground/70">Student type</span>
              <span className="rounded-full bg-ink-foreground px-4 py-1.5 font-semibold text-ink">{course.studentType === 'international' ? 'International' : 'Domestic'}</span>
              <Link href={sibling.path} className="rounded-full border border-ink-foreground/30 px-4 py-1.5 font-semibold hover:border-secondary hover:text-secondary">{sibling.label}</Link>
            </>
          )}
          {course.studentType === 'both' && <AudienceSwitch onDark />}
        </div>
      )}

      <p className="hero-fade-up label-mono mt-10 text-[10px] text-ink-foreground/55 [--d:440ms]">
        RTO {site.organisation.rto} · CRICOS {site.organisation.cricos}
      </p>
    </>
  )
}

export function CourseHero({ course, eyebrow, apply, enquire, sibling }: { course: Course; eyebrow: string; apply?: Cta | null; enquire: Cta; sibling?: { label: string; path: string } | null }) {
  const school = schoolOf(course)
  // The CMS hero image wins only when it is big enough for this banner (the old site's featured images are 350-500 px thumbnails);
  // otherwise the course's own photo (src/content/course-photos.ts), then the school banner.
  const cms = mediaOf(course.heroImage as never)
  const image = cms && (cms.width ?? 0) >= MIN_HERO_WIDTH ? cms : null
  const own = coursePhoto(course.slug)
  const photo = image?.url ?? own?.src ?? schoolPhoto(school.slug)
  const photoAlt = image?.alt ?? own?.alt ?? ''
  const chips = chipFacts(course)
  const { code, name } = splitCourseTitle(course.title)
  return (
    <section className="relative isolate overflow-hidden bg-ink text-ink-foreground" data-course-hero="">
      {/* stage: aurora blobs, dot grid, heartbeat line */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="course-aurora absolute -top-1/3 -left-1/4 size-[46rem] rounded-full bg-primary/45 blur-3xl" />
        <span className="course-aurora absolute -right-1/4 -bottom-1/2 size-[40rem] rounded-full bg-secondary/30 blur-3xl [animation-delay:-6s]" />
        <span className="course-aurora absolute top-1/4 left-1/2 size-[22rem] rounded-full bg-mint/25 blur-3xl [animation-delay:-11s]" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(180_30%_99%/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <svg className="absolute bottom-10 left-0 h-24 w-full opacity-40" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path className="course-pulse-line" d="M0 60 H420 L450 60 L470 18 L495 92 L515 40 L530 60 H760 L780 60 L795 30 L812 78 L826 60 H1200" fill="none" stroke="hsl(33 93% 54%)" strokeWidth="2" />
        </svg>
      </div>

      <div className="mx-auto grid w-full max-w-site gap-12 px-5 pt-10 pb-24 md:px-8 md:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pb-32">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="hero-fade-up flex flex-wrap items-center gap-1.5 text-xs text-ink-foreground/70">
            <Link href="/courses/" className="hover:text-secondary">Courses</Link>
            {school.name && (
              <>
                <ChevronRight aria-hidden className="size-3.5" />
                <span>{school.name}</span>
              </>
            )}
          </nav>
          <p className="hero-fade-up mt-6 inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur [--d:80ms]">
            <span className="size-2 animate-pulse rounded-full bg-secondary" />
            {eyebrow}
          </p>
          <h1 className="hero-fade-up mt-5 [--d:140ms]">
            {code ? (
              <>
                <span className="label-mono block text-sm text-secondary">{code}</span>
                <span className="sr-only"> - </span>
                <span className="display mt-3 block text-[clamp(2.3rem,5.4vw,4.6rem)] leading-[1.02] text-balance">{name}</span>
              </>
            ) : (
              <span className="display block text-[clamp(2.3rem,5.4vw,4.6rem)] leading-[1.02] text-balance"><Emphasis text={course.title} tone="secondary" /></span>
            )}
          </h1>
          {course.excerpt && <p className="hero-fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-foreground/80 [--d:220ms]">{course.excerpt}</p>}

          <CourseHeroActions course={course} apply={apply} enquire={enquire} sibling={sibling} />
        </div>

        {/* visual: framed photo with a slow-turning ring and floating fact chips */}
        <div className="hero-fade-up relative mx-auto w-full max-w-md [--d:200ms] lg:max-w-none">
          <span aria-hidden className="course-spin absolute -inset-6 rounded-[3rem] bg-[conic-gradient(from_0deg,hsl(178_100%_31%/0.0),hsl(178_100%_31%/0.7),hsl(33_93%_54%/0.8),hsl(178_100%_31%/0.0))] opacity-60 blur-2xl" />
          <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] border border-ink-foreground/15 shadow-2xl shadow-black/40">
            <Image src={photo} alt={photoAlt} fill priority sizes="(min-width: 1024px) 40vw, 90vw" quality={90} className="object-cover" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          </div>
          {chips.map((c, i) => (
            <div
              key={c.key}
              className={cn(
                'hero-float absolute max-w-[13rem] rounded-2xl border border-white/40 bg-card/95 px-4 py-3 text-card-foreground shadow-2xl shadow-black/30 backdrop-blur',
                i === 0 && '-left-3 top-[12%] sm:-left-8',
                i === 1 && '-right-3 top-[46%] [animation-delay:-2s] sm:-right-8',
                i === 2 && 'bottom-[8%] left-[10%] [animation-delay:-4s]',
              )}
            >
              <p className="label-mono text-[10px] text-primary-strong">{c.label}</p>
              <p className="mt-0.5 text-sm leading-snug font-semibold">{c.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
