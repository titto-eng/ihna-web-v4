import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
import Image from '@/components/blocks/MediaImage'
import { mediaOf } from '@/components/blocks/media'
import { Section } from '@/components/layout/Section'
import { pickSize } from '@/lib/media-sizes'
import { CourseCard, type CourseCardData } from './courseCards'
import type { Lookup, StaffCard } from './data'
import { Banner, LeadHero, SectionTitle, enquireHref, type HeroProps } from './pageParts'

export function StaffGrid({ staff }: { staff: StaffCard[] }) {
  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {staff.map((s) => {
        const photo = pickSize(mediaOf(s.photo as never), 'thumb')
        const body = (
          <>
            <div className="aspect-[4/5] overflow-hidden rounded-card bg-muted">
              {photo ? (
                <Image src={photo.url} alt={`Photo of ${s.name}`} width={photo.width} height={photo.height} sizes="(min-width: 1024px) 22vw, 45vw" className="size-full object-cover object-[50%_20%]" />
              ) : (
                <span aria-hidden className="display flex size-full items-center justify-center text-5xl text-primary-strong">{s.name.replace(/^(dr|prof|assoc|mrs|mr|ms)\.?\s+/gi, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
              )}
            </div>
            <p className="mt-3 font-semibold leading-snug">{s.name}</p>
            {s.position && <p className="text-sm text-muted-foreground">{s.position}</p>}
          </>
        )
        return (
          <li key={s.id}>
            {s.path ? <Link href={s.path} className="block rounded-card hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2">{body}</Link> : body}
          </li>
        )
      })}
    </ul>
  )
}

type SchoolProps = { title: string; hero: HeroProps; children?: ReactNode; school: Lookup | null; courses: CourseCardData[]; staff: StaffCard[] }

// each school's accent (the `--school` colour the school sections use), by the school lookup's slug
const ACCENTS: Record<string, string> = {
  'school-of-nursing': 'var(--color-primary)',
  'school-of-community-services': 'var(--color-mint)',
  'school-of-allied-health-and-human-services': 'var(--color-ocean)',
  'first-aid': 'var(--color-coral)',
  'school-of-education': 'var(--color-sun)',
}

/**
 * The school banner: a deep-teal stage lit in the school's accent, the heading rising word by word over a drawn heartbeat line, the
 * school photo in a slanted full-bleed panel crossed by light bars, a glass card with the number of courses, the in-page jump
 * links, and a ticker with the school's name along the bottom edge.
 */
function SchoolHero({ hero, name, courseCount, jumps }: { hero: HeroProps; name: string; courseCount: number; jumps: { label: string; href: string }[] }) {
  const pic = pickSize(mediaOf(hero.image as never), 'hero')
  const words = hero.heading.split(/\s+/).filter(Boolean)
  const cta = hero.ctas?.[0]
  return (
    <section className="relative isolate overflow-hidden bg-ink text-ink-foreground" data-school-hero="">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="course-aurora absolute -top-1/3 -left-1/4 size-[44rem] rounded-full opacity-50 blur-3xl" style={{ background: 'var(--school)' }} />
        <span className="course-aurora absolute -bottom-1/2 left-1/3 size-[36rem] rounded-full bg-secondary/25 blur-3xl [animation-delay:-8s]" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(180_30%_99%/0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>
      <div className="relative mx-auto grid w-full max-w-site gap-10 px-5 pt-12 pb-24 md:px-8 md:pt-16 lg:min-h-[640px] lg:grid-cols-[1fr_1fr] lg:items-center lg:pb-28">
        <div className="relative z-10 min-w-0">
          <p className="hero-fade-up inline-flex items-center gap-2.5 rounded-full border border-ink-foreground/20 bg-ink-foreground/10 py-1.5 pr-4 pl-2 text-xs font-semibold tracking-wide backdrop-blur md:text-sm">
            <span aria-hidden className="flex size-6 items-center justify-center rounded-full text-ink" style={{ background: 'var(--school)' }}><GraduationCap className="size-3.5" /></span>
            {name}
          </p>
          <h1 className="display mt-6 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[1.02] text-balance">
            {words.map((w, i) => (
              <span key={`${w}-${i}`}>
                <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span className="hero-word" style={{ '--i': i } as CSSProperties}>{w}</span>
                </span>{' '}
              </span>
            ))}
          </h1>
          <svg aria-hidden viewBox="0 0 600 40" className="mt-6 h-8 w-full max-w-[480px]">
            <path className="course-pulse-line" d="M0 20 H190 L208 20 L222 4 L240 36 L256 20 H600" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {hero.subheading && <p className="hero-fade-up mt-4 max-w-xl text-lg leading-relaxed text-ink-foreground/80 [--d:260ms]">{hero.subheading}</p>}
          <div className="hero-fade-up mt-8 flex flex-wrap items-center gap-3 [--d:340ms]">
            {cta && (
              <a href={cta.href ?? '#quickContact'} className="course-glow group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-secondary px-7 py-3.5 font-semibold text-ink shadow-xl shadow-secondary/30 transition-transform hover:-translate-y-0.5">
                <span aria-hidden className="course-shine absolute inset-y-0 left-0 w-1/3 bg-white/40" />
                <span className="relative">{cta.label}</span>
                <ArrowRight aria-hidden className="relative size-4 transition-transform group-hover:translate-x-1" />
              </a>
            )}
          </div>
          {jumps.length > 0 && (
            <nav aria-label="On this page" className="hero-fade-up mt-10 [--d:420ms]">
              <ul className="flex flex-wrap gap-2">
                {jumps.map((j) => (
                  <li key={j.href}>
                    <a href={j.href} className="group inline-flex items-center gap-1.5 rounded-full border border-ink-foreground/20 px-4 py-2 text-sm font-semibold text-ink-foreground/85 backdrop-blur transition hover:border-secondary hover:bg-secondary hover:text-ink">
                      {j.label}<ArrowDown aria-hidden className="size-3.5 transition-transform group-hover:translate-y-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        {pic && (
          <div className="hero-fade-up relative [--d:160ms] lg:-mr-[max(2rem,calc((100vw-var(--container-site))/2+2rem))] lg:self-stretch">
            <div className="school-panel relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 lg:absolute lg:inset-y-0 lg:right-0 lg:left-0 lg:aspect-auto lg:rounded-none lg:rounded-l-[3rem]">
              <Image src={pic.url} alt={pic.alt} fill priority sizes="(min-width: 1024px) 52vw, 92vw" quality={90} className="school-pan object-cover" style={{ objectPosition: pic.position ?? 'center 30%' }} />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-tr from-ink/60 via-transparent to-transparent" />
              <span aria-hidden className="school-bar absolute -inset-y-10 left-[12%] w-10 -skew-x-12 bg-white/15" />
              <span aria-hidden className="school-bar absolute -inset-y-10 left-[22%] w-3 -skew-x-12 [animation-delay:0.4s]" style={{ background: 'var(--school)' }} />
              <span aria-hidden className="school-bar absolute -inset-y-10 left-[78%] w-6 -skew-x-12 bg-secondary/60 [animation-delay:0.8s]" />
            </div>
            {courseCount > 0 && (
              <a href="#courses" className="hero-float absolute bottom-6 left-4 z-10 flex items-center gap-4 rounded-2xl border border-white/40 bg-card/95 px-5 py-4 text-card-foreground shadow-2xl shadow-black/30 backdrop-blur transition hover:-translate-y-1 md:-left-8 lg:bottom-16">
                <span className="flex size-12 items-center justify-center rounded-xl text-white" style={{ background: 'var(--school)' }}><BookOpen aria-hidden className="size-6" /></span>
                <span>
                  <span className="block font-display text-3xl leading-none">{courseCount}</span>
                  <span className="mt-1 block text-sm font-semibold text-muted-foreground">{courseCount === 1 ? 'Course' : 'Courses'}</span>
                </span>
              </a>
            )}
          </div>
        )}
      </div>
      {/* ticker: the school's name along the bottom edge */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-ink-foreground/10 bg-ink/60 py-3 backdrop-blur">
        <div className="school-ticker flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="label-mono flex items-center gap-10 text-[11px] text-ink-foreground/60">{name}<span className="text-secondary">✦</span></span>
          ))}
        </div>
      </div>
    </section>
  )
}

// 05 §4.4 School: the school banner → the page's own content → the school's courses → staff → CTA. The school's accent colour is
// set as `--school` for the whole page.
export function SchoolView({ title, hero, children, school, courses, staff }: SchoolProps) {
  const mine = school ? courses.filter((c) => c.school?.slug === school.slug) : []
  const name = school?.name ?? title
  const merged: HeroProps = {
    ...hero,
    ...(school?.image && !hero.image ? { image: school.image } : {}),
    ...(school?.description && !hero.subheading ? { subheading: school.description } : {}),
  }
  const jumps = [
    { label: 'Careers', href: '#careers' },
    ...(mine.length ? [{ label: 'Courses', href: '#courses' }] : []),
    { label: 'Campus tour', href: '#campus-tour' },
    ...(staff.length ? [{ label: 'Our staff', href: '#staff' }] : []),
    { label: 'Ask us', href: '#quickContact' },
  ]
  return (
    <div style={{ '--school': ACCENTS[school?.slug ?? ''] ?? 'var(--color-primary)' } as CSSProperties} data-school={school?.slug ?? ''}>
      {merged.image ? <SchoolHero hero={merged} name={name} courseCount={mine.length} jumps={jumps} /> : <LeadHero hero={{ ...hero, variant: undefined }} extra={{ eyebrow: 'School', variant: 'compact' }} />}
      {children}
      {mine.length > 0 && (
        <Section tone="muted" anchorId="courses" className="relative isolate overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-40 right-0 -z-10 size-[30rem] rounded-full opacity-20 blur-3xl" style={{ background: 'var(--school)' }} />
          <SectionTitle eyebrow="Courses" heading={`Courses in ${name}`} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mine.map((c) => <div key={c.id} className="reveal"><CourseCard course={c} /></div>)}
          </div>
        </Section>
      )}
      {staff.length > 0 && (
        <Section anchorId="staff">
          <SectionTitle eyebrow="People" heading="Meet our *staff*" />
          <StaffGrid staff={staff} />
        </Section>
      )}
      <Banner
        heading="Find your *course*"
        body={`Talk to us about studying with the ${name}.`}
        links={[
          { label: 'Enquire now', href: enquireHref(null), style: 'primary' },
          { label: 'All courses', href: school ? `/courses/?school=${school.slug}` : '/courses/', style: 'light' },
        ]}
      />
    </div>
  )
}
