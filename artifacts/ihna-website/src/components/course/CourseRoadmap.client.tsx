'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export type RoadmapItem = { id: string; label: string }

/** Which section is in view, and how far through the page's sections the reader is (0..1). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!ids.length) return
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e))
    const onScroll = () => {
      const line = window.innerHeight * 0.32
      let current = els[0]?.id ?? ''
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id
      setActive(current)
      const first = els[0]
      const last = els[els.length - 1]
      if (first && last) {
        const start = first.getBoundingClientRect().top + window.scrollY - line
        const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight
        setProgress(Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start))))
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])
  return { active, progress }
}

/** Desktop: the course "roadmap", a numbered vertical guide to the page with a progress rail and the current chapter lit. */
export function CourseRoadmap({ items }: { items: RoadmapItem[] }) {
  const { active, progress } = useActiveSection(items.map((i) => i.id))
  return (
    <nav aria-label="On this page" className="relative">
      <p className="label-mono mb-4 text-[11px] text-primary-strong">Your course roadmap</p>
      <div className="relative">
        <span aria-hidden className="absolute top-3 bottom-3 left-[15px] w-0.5 rounded-full bg-border" />
        <span
          aria-hidden
          className="absolute top-3 left-[15px] w-0.5 origin-top rounded-full bg-gradient-to-b from-primary via-mint to-secondary transition-[height] duration-300"
          style={{ height: `calc((100% - 1.5rem) * ${progress})` }}
        />
        <ol className="relative space-y-1">
          {items.map((it, i) => {
            const on = it.id === active
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  aria-current={on ? 'true' : undefined}
                  className={cn('group flex items-center gap-3 rounded-xl py-1.5 pr-2 text-sm transition-colors', on ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground')}
                >
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-semibold tabular-nums transition-all duration-300',
                      on ? 'scale-110 border-secondary bg-secondary text-ink shadow-lg shadow-secondary/40' : 'border-border bg-card group-hover:border-primary group-hover:text-primary-strong',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug">{it.label}</span>
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

/** Small screens: a sticky row of chapter chips that scrolls itself to keep the current chapter visible, plus a progress bar. */
export function CourseChips({ items }: { items: RoadmapItem[] }) {
  const { active, progress } = useActiveSection(items.map((i) => i.id))
  const listRef = useRef<HTMLUListElement>(null)
  // keep the current chip visible by scrolling the chip row itself (scrollIntoView would also scroll the page)
  useEffect(() => {
    const list = listRef.current
    const chip = document.getElementById(`chip-${active}`)
    if (!list || !chip) return
    list.scrollTo({ left: chip.offsetLeft - list.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
  }, [active])
  return (
    <nav aria-label="On this page" className="sticky top-[72px] z-30 border-b border-border bg-background/90 backdrop-blur lg:hidden">
      <ul ref={listRef} className="relative flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none]">
        {items.map((it, i) => (
          <li key={it.id} id={`chip-${it.id}`} className="shrink-0">
            <a
              href={`#${it.id}`}
              className={cn(
                'block rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
                it.id === active ? 'border-secondary bg-secondary text-ink' : 'border-border bg-card text-muted-foreground',
              )}
            >
              <span className="mr-1 tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
      <span aria-hidden className="block h-0.5 origin-left bg-gradient-to-r from-primary via-mint to-secondary" style={{ transform: `scaleX(${progress})` }} />
    </nav>
  )
}
