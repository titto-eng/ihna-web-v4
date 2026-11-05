import type { StepsBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { cn } from '@/lib/cn'
import type { BlockProps } from '../types'

// Rising arc for the timeline (BON 03): header height grows with the step index.
const rise = ['md:pt-6', 'md:pt-12', 'md:pt-20', 'md:pt-28', 'md:pt-36', 'md:pt-44']
const cols: Record<number, string> = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }

export function Steps({ block, ctx }: BlockProps<Block>) {
  const steps = block.steps ?? []
  if (!steps.length) return null
  const dark = block.tone === 'ink'
  const grid = cols[Math.min(Math.max(steps.length, 2), 5)]

  if (block.variant === 'timeline') {
    return (
      <Section tone={block.tone ?? 'muted'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
        <SectionHeader eyebrow={undefined} heading={block.heading} intro={block.intro} onDark={dark} />
        <ol className={cn('grid items-end gap-4 md:grid-cols-2', grid)}>
          {steps.map((s, i) => (
            <li key={s.id ?? i} className="reveal flex flex-col">
              <div className={cn('bg-sunrise-glow flex flex-col justify-end rounded-t-[22px] p-5 text-primary-foreground', rise[Math.min(i, rise.length - 1)])}>
                <span className="label-mono text-[11px] tracking-widest opacity-90">{s.label ?? `Step ${i + 1}`}</span>
                <span className="display text-5xl">{s.value ?? ''}</span>
              </div>
              <div className="flex-1 rounded-b-[22px] border border-t-0 border-border bg-card p-5 text-card-foreground">
                <p className="label-mono text-[11px] tracking-widest text-accent">{s.title}</p>
                {s.body && <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader heading={block.heading} intro={block.intro} onDark={dark} />
      <ol className={cn('grid gap-8 md:grid-cols-2', grid)}>
        {steps.map((s, i) => (
          <li key={s.id ?? i} className={cn('border-t pt-6', dark ? 'border-ink-foreground/25' : 'border-border')}>
            <span className="display grid size-11 place-items-center rounded-full bg-foreground text-lg text-background">{i + 1}</span>
            <h3 className="display mt-5 text-2xl leading-snug">{s.title}</h3>
            {s.body && <p className={cn('mt-2', dark ? 'text-ink-foreground/75' : 'text-muted-foreground')}>{s.body}</p>}
          </li>
        ))}
      </ol>
    </Section>
  )
}
