'use client'

import { Check, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CtaRow, type CtaItem } from '@/components/CtaLink'

export type Path = {
  id: string; label: string; title: string; tagline?: string | null; structure?: string | null; body?: string | null
  suits?: string | null; advantages: string[]; progression?: string | null; notice?: string | null; ctas: CtaItem[]
}

const sub = 'label-mono text-xs tracking-widest opacity-60'

// BON 01: A/B/C cards act as tabs; panel is a two-column ink block.
export function PathwaysClient({ paths }: { paths: Path[] }) {
  return (
    <Tabs defaultValue={paths[0]?.id} className="gap-6">
      <TabsList aria-label="Pathways" className="grid w-full gap-3 md:grid-cols-3">
        {paths.map((p) => (
          <TabsTrigger
            key={p.id}
            value={p.id}
            className="group h-auto flex-col items-start justify-start gap-0 rounded-2xl border border-ink-foreground/20 p-6 text-left whitespace-normal transition-all duration-500 hover:border-ink-foreground/50 data-[state=active]:border-secondary data-[state=active]:bg-secondary data-[state=active]:text-ink"
          >
            <span className="display text-6xl italic opacity-80">{p.label}</span>
            <span className="display mt-4 block text-2xl">{p.title}</span>
            {p.tagline && <span className="mt-1 block text-sm opacity-90">{p.tagline}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
      {paths.map((p) => (
        <TabsContent key={p.id} value={p.id} className="grid gap-px overflow-hidden rounded-3xl bg-ink-foreground/15 lg:grid-cols-[1.2fr_1fr]">
          <div className="bg-ink p-8 md:p-12">
            {p.structure && <p className="label-mono text-xs tracking-widest text-secondary">{p.structure}</p>}
            {p.body && <p className="display mt-4 text-2xl leading-snug md:text-3xl">{p.body}</p>}
            {p.suits && (<><p className={`${sub} mt-8`}>Who it suits</p><p className="mt-2 opacity-85">{p.suits}</p></>)}
            <CtaRow items={p.ctas} onDark className="mt-10 flex flex-wrap gap-3" />
          </div>
          <div className="bg-ink-raised p-8 md:p-12">
            {p.advantages.length > 0 && (
              <>
                <p className={sub}>Advantages</p>
                <ul className="mt-4 space-y-3">
                  {p.advantages.map((a, i) => (
                    <li key={i} className="flex gap-3"><Check aria-hidden className="mt-1 size-4 shrink-0 text-secondary" />{a}</li>
                  ))}
                </ul>
              </>
            )}
            {p.progression && (<><p className={`${sub} mt-8`}>Progression, honestly</p><p className="mt-2 opacity-85">{p.progression}</p></>)}
            {p.notice && (
              <p className="mt-6 flex gap-3 rounded-xl border border-secondary/40 p-4 text-sm">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />{p.notice}
              </p>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
