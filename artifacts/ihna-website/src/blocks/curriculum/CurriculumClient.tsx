'use client'

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/cn'

export type Unit = { id: string; code?: string | null; title: string; credit?: number | null; kind: 'core' | 'elective' | 'placement' }
export type Year = { id: string; label: string; semesters: { name: string; units: Unit[] }[] }

// BON 04: pill year tabs, semesters side by side in 2 columns.
export function CurriculumClient({ years, header }: { years: Year[]; header: ReactNode }) {
  return (
    <Tabs defaultValue={years[0]?.id} className="gap-0">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
        {header}
        <TabsList aria-label="Year" className="max-w-full overflow-x-auto rounded-full border border-border p-1">
          {years.map((y) => (
            <TabsTrigger key={y.id} value={y.id} className="rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-foreground">
              {y.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {years.map((y) => (
        <TabsContent key={y.id} value={y.id} className="grid gap-6 md:grid-cols-2">
          {y.semesters.map((s, si) => (
            <div key={si} className="rounded-card border border-border bg-card p-6 md:p-8">
              {s.name && <h3 className="label-mono text-xs tracking-widest text-accent">{y.label} · {s.name}</h3>}
              <ul className="mt-4 divide-y divide-border">
                {s.units.map((u) => (
                  <li key={u.id} className="flex items-baseline gap-4 py-4">
                    {u.code && <span className="label-mono w-14 shrink-0 text-xs tracking-normal text-muted-foreground">{u.code}</span>}
                    <span className={cn('display text-lg leading-snug', u.kind === 'placement' && 'text-primary-strong')}>{u.title}</span>
                    {(u.kind !== 'core' || u.credit) && (
                      <span className="label-mono ml-auto shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] tracking-widest">
                        {u.kind !== 'core' ? u.kind : ''}{u.kind !== 'core' && u.credit ? ' · ' : ''}{u.credit ? `${u.credit} cp` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
