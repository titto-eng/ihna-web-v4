'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Home course tabs: one tab per school (the old home's course tabs); the panels are rendered on the server. Arrow keys move along. */
export function HomeCourseTabs({ tabs }: { tabs: { label: string; count: number; panel: ReactNode }[] }) {
  const [active, setActive] = useState(0)
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (active + d + tabs.length) % tabs.length
    setActive(n)
    refs.current[n]?.focus()
  }
  return (
    <div>
      <div role="tablist" aria-label="Courses by school" tabIndex={-1} onKeyDown={onKey} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:justify-center md:px-0">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => { refs.current[i] = el }}
            role="tab"
            id={`${id}-t${i}`}
            aria-controls={`${id}-p${i}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              'group relative inline-flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300',
              i === active ? 'border-transparent bg-primary-strong text-white shadow-lg shadow-primary-strong/30' : 'border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary-strong',
            )}
          >
            {t.label}
            <span className={cn('rounded-full px-2 py-0.5 text-xs', i === active ? 'bg-secondary text-ink' : 'bg-muted text-muted-foreground')}>{t.count}</span>
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`} hidden={i !== active} className={cn('mt-10', i === active && 'tab-panel-in')}>
          {t.panel}
        </div>
      ))}
    </div>
  )
}
