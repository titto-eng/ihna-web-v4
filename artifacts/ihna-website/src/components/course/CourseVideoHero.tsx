import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Course } from '@/payload-types'
import { FilmLoop, FilmPlayer } from '@/components/course/CourseFilm.client'
import { CourseHeroActions, chipFacts, schoolOf, splitCourseTitle, type Cta } from '@/components/course/CourseHero'
import type { CourseFilm } from '@/content/course-videos'
import { cn } from '@/lib/cn'

// Video banner for a course with its own film (src/content/course-videos.ts): a full-bleed cinematic stage. The film loops muted
// behind a teal-to-ink grade with viewfinder corners; the course name rises word by word; a turning "watch the course film" button
// opens the film with sound; up to three key facts slide in as glass cards. Like the photo banner it shows only course data and
// site constants, and it keeps the same calls to action, student-type switch and RTO line (CourseHeroActions).

type Props = { course: Course; film: CourseFilm; eyebrow: string; apply?: Cta | null; enquire: Cta; sibling?: { label: string; path: string } | null }

/** The name as words that rise out of a mask one after another (the h1 keeps the full title as its text). */
function RisingWords({ text, from = 0 }: { text: string; from?: number }) {
  return text.split(/\s+/).filter(Boolean).map((w, i) => (
    <span key={`${w}-${i}`}>
      <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
        <span className="hero-word" style={{ '--i': from + i } as CSSProperties}>{w}</span>
      </span>{' '}
    </span>
  ))
}

const Corner = ({ className }: { className: string }) => (
  <span aria-hidden className={cn('film-corner absolute size-10 border-secondary md:size-14', className)} />
)

export function CourseVideoHero({ course, film, eyebrow, apply, enquire, sibling }: Props) {
  const school = schoolOf(course)
  const chips = chipFacts(course)
  const { code, name } = splitCourseTitle(course.title)
  return (
    <section className="relative isolate flex min-h-[clamp(640px,94svh,940px)] items-end overflow-hidden bg-ink text-ink-foreground" data-course-hero="video">
      <FilmLoop film={film} />

      {/* grade: ink from the bottom and the left for the copy, a teal wash, a slow orange light sweep, film grain dots */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <span className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-transparent" />
        <span className="absolute inset-0 bg-primary/20 mix-blend-color" />
        <span className="film-sweep absolute -inset-y-1/4 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-secondary/18 to-transparent blur-2xl" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(180_30%_99%/0.07)_1px,transparent_1px)] [background-size:4px_4px] opacity-60" />
      </div>

      {/* viewfinder corners */}
      <div aria-hidden className="pointer-events-none absolute inset-x-4 top-4 bottom-20 z-0 md:inset-x-8 md:top-8 md:bottom-28">
        <Corner className="top-0 left-0 rounded-tl-xl border-t-2 border-l-2" />
        <Corner className="top-0 right-0 rounded-tr-xl border-t-2 border-r-2 [animation-delay:120ms]" />
        <Corner className="bottom-0 left-0 rounded-bl-xl border-b-2 border-l-2 [animation-delay:240ms]" />
        <Corner className="right-0 bottom-0 rounded-br-xl border-r-2 border-b-2 [animation-delay:360ms]" />
        <span className="label-mono absolute top-1 left-14 hidden items-center gap-2 text-[10px] text-ink-foreground/70 md:inline-flex md:left-20">
          <span className="size-2 animate-pulse rounded-full bg-coral" /> {school.name ?? eyebrow}
        </span>
      </div>

      <div className="relative mx-auto grid w-full max-w-site gap-10 px-5 pt-28 pb-28 md:px-8 md:pb-36 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="min-w-0 max-w-3xl">
          <nav aria-label="Breadcrumb" className="hero-fade-up flex flex-wrap items-center gap-1.5 text-xs text-ink-foreground/75">
            <Link href="/courses/" className="hover:text-secondary">Courses</Link>
            {school.name && (
              <>
                <ChevronRight aria-hidden className="size-3.5" />
                <span>{school.name}</span>
              </>
            )}
          </nav>
          <p className="hero-fade-up mt-6 inline-flex items-center gap-2 rounded-full border border-ink-foreground/25 bg-ink-foreground/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md [--d:80ms]">
            <span className="size-2 animate-pulse rounded-full bg-secondary" />
            {eyebrow}
          </p>
          <h1 className="mt-5">
            {code && (
              <>
                <span className="label-mono hero-fade-up block text-sm text-secondary [--d:120ms]">{code}</span>
                <span className="sr-only"> - </span>
              </>
            )}
            <span className="display mt-3 block text-[clamp(2.5rem,6.4vw,5.6rem)] leading-[0.98] text-balance drop-shadow-[0_6px_30px_hsl(190_60%_6%/0.6)]">
              <RisingWords text={name} from={2} />
            </span>
          </h1>
          <span aria-hidden className="film-underline mt-6 block h-1 w-28 origin-left rounded-full bg-gradient-to-r from-secondary via-sun to-primary" />
          {course.excerpt && <p className="hero-fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-foreground/85 [--d:420ms]">{course.excerpt}</p>}
          <CourseHeroActions course={course} apply={apply} enquire={enquire} sibling={sibling} />
        </div>

        {/* the film button and the key-fact cards */}
        <div className="flex flex-col items-start gap-6 lg:items-end">
          <div className="hero-fade-up [--d:520ms]"><FilmPlayer film={film} title={course.title} /></div>
          {chips.length > 0 && (
            <ul className="grid w-full gap-3 sm:grid-cols-3 lg:w-72 lg:grid-cols-1">
              {chips.map((c, i) => (
                <li
                  key={c.key}
                  className="film-card relative overflow-hidden rounded-2xl border border-ink-foreground/20 bg-ink/45 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-md"
                  style={{ '--d': `${640 + i * 120}ms` } as CSSProperties}
                >
                  <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', ['bg-secondary', 'bg-primary', 'bg-sun'][i % 3])} />
                  <p className="label-mono text-[10px] text-secondary">{c.label}</p>
                  <p className="mt-0.5 text-sm leading-snug font-semibold">{c.value}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
