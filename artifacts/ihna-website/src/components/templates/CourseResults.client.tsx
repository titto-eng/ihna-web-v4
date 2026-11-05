'use client'

import { useId, useMemo, useState } from 'react'
import { LayoutGrid, List, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CourseCard, type CourseCardData } from './courseCards'

// Client-side narrowing of the (already URL-filtered, server-rendered) result set: a text box and the grid / detail toggle.
// Without JS the full server list shows; the count is announced politely.
export function CourseResults({ courses }: { courses: CourseCardData[] }) {
  const id = useId()
  const [q, setQ] = useState('')
  const [detailed, setDetailed] = useState(false)
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return needle ? courses.filter((c) => `${c.title} ${c.excerpt ?? ''} ${c.school?.name ?? ''} ${c.campus.map((x) => x.name).join(' ')}`.toLowerCase().includes(needle)) : courses
  }, [courses, q])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-60 flex-1">
          <label htmlFor={id} className="sr-only">Narrow these courses by name</label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={id}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Narrow by name"
            className="h-11 w-full rounded-full border border-input bg-card pr-4 pl-11 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div role="group" aria-label="Layout" className="flex gap-1 rounded-full border border-border bg-card p-1">
          {([['grid', LayoutGrid, 'Grid view'], ['detail', List, 'Detailed view']] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={detailed === (key === 'detail')}
              aria-label={label}
              onClick={() => setDetailed(key === 'detail')}
              className={cn('flex size-9 items-center justify-center rounded-full', detailed === (key === 'detail') ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}
            >
              <Icon aria-hidden className="size-4" />
            </button>
          ))}
        </div>
      </div>
      <p className="mb-6 text-sm text-muted-foreground" aria-live="polite" data-course-count>
        {shown.length} {shown.length === 1 ? 'course' : 'courses'}
      </p>
      {shown.length ? (
        <div className={cn('grid grid-cols-1 gap-6', detailed ? 'lg:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3')}>
          {shown.map((c) => <CourseCard key={c.id} course={c} detailed={detailed} />)}
        </div>
      ) : (
        <p className="rounded-card border border-border bg-card p-8 text-muted-foreground">No courses match. Try removing a filter.</p>
      )}
    </div>
  )
}
