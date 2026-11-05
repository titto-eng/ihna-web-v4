import Link from 'next/link'
import { ArrowUpRight, MapPin, Phone } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { galleryCampuses } from '@/content/campuses'
import { site } from '@/content/site'
import { LoopVideo } from '@/components/media/LoopVideo.client'
import { cn } from '@/lib/cn'

// Which /contact/ campus row (site.contact.campuses) holds each campus page's address; Melbourne lists both of its sites.
const contactNames: Record<string, string[]> = {
  melbourne: ['Melbourne CBD', 'Melbourne Heidelberg'],
  sydney: ['Sydney'],
  perth: ['Perth CBD'],
  brisbane: ['Brisbane'],
}

/** Home "Our campuses": one card per campus page (src/content/campuses.ts) with its addresses and phones from src/content/site.ts. */
export function CampusShowcase({ heading = 'Our *campuses*', anchorId = 'our-campuses', video }: { heading?: string; anchorId?: string; /** A short muted loop beside the cards (the old home's campus video). */ video?: { src: string; poster: string } }) {
  const list = (
      <ul className={cn('grid gap-5 sm:grid-cols-2', !video && 'lg:grid-cols-4')}>
        {galleryCampuses.map((c, i) => {
          const sites = site.contact.campuses.filter((s) => (contactNames[c.key] ?? []).includes(s.name))
          return (
            <li key={c.key} className="reveal">
              <Link
                href={c.path}
                className="group relative flex h-full min-h-80 flex-col overflow-hidden rounded-card bg-primary-strong p-6 text-ink-foreground shadow-lg shadow-primary-strong/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary-strong/30"
              >
                {/* layered brand gradient that shifts on hover */}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary via-primary-strong to-ink transition-opacity duration-500 group-hover:opacity-80" />
                <span aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full border-[18px] border-white/10 transition-transform duration-700 group-hover:scale-125" />
                <span aria-hidden className="absolute -bottom-20 -left-10 size-56 rounded-full bg-secondary/25 blur-2xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-60" />
                <span className="relative flex items-center justify-between">
                  <span className="label-mono text-white/70">{String(i + 1).padStart(2, '0')} · Campus</span>
                  <span className="grid size-10 place-items-center rounded-full bg-white/15 transition-all duration-300 group-hover:rotate-45 group-hover:bg-secondary group-hover:text-ink">
                    <ArrowUpRight aria-hidden className="size-5" />
                  </span>
                </span>
                <span className="display relative mt-auto pt-10 text-4xl text-white">{c.name}</span>
                <span className="relative mt-4 space-y-3 border-t border-white/15 pt-4 text-sm text-white/80">
                  {sites.map((s) => (
                    <span key={s.name} className="block">
                      <span className="flex gap-2"><MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />{s.address}</span>
                      <span className="mt-1 flex items-center gap-2"><Phone aria-hidden className="size-4 shrink-0 text-secondary" />{s.phone}</span>
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
  )
  return (
    <Section anchorId={anchorId}>
      <SectionHeader heading={heading} />
      {video ? (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div className="reveal relative min-h-80 overflow-hidden rounded-card shadow-2xl shadow-primary-strong/25">
            <LoopVideo src={video.src} poster={video.poster} className="absolute inset-0 size-full object-cover" />
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <span aria-hidden className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-white/30" />
          </div>
          {list}
        </div>
      ) : list}
    </Section>
  )
}
