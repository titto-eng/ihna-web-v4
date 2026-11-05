import type { AdmissionsPanelBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { Prose } from '@/components/layout/Prose'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { CtaRow } from '@/components/CtaLink'
import { AudienceOnly } from '@/components/audience/AudienceOnly'
import { AudienceSwitch } from '@/components/audience/AudienceSwitch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Audience, BlockProps } from '../types'

const audiences: Audience[] = ['domestic', 'international']

// BON 05: both versions are in the server HTML; CSS hides the inactive one (works without JS).
export function AdmissionsPanel({ block, ctx }: BlockProps<Block>) {
  const cards = block.cards ?? []
  const steps = block.steps ?? []
  const lead: Record<Audience, Block['domestic']> = { domestic: block.domestic, international: block.international }
  return (
    <Section tone={block.tone ?? 'card'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader eyebrow={block.eyebrow} heading={block.heading} />
      <AudienceSwitch className="mb-10" />
      {audiences.map((a) => {
        const mine = cards.filter((c) => !c.audience || c.audience === 'both' || c.audience === a)
        return (
          <AudienceOnly key={a} audience={a}>
            <Badge variant="outline" className="label-mono mb-6 rounded-full px-3 text-[10px] tracking-widest">{a}</Badge>
            {lead[a] && <Prose data={lead[a]} className="mb-10 max-w-none text-muted-foreground" />}
            {mine.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-3">
                {mine.map((c, i) => (
                  <Card key={c.id ?? i} className="gap-0 bg-background py-0">
                    <CardContent className="flex flex-col p-8">
                      <h3 className="label-mono text-xs tracking-widest text-accent">{c.label}</h3>
                      {c.value && <p className="display mt-4 text-4xl">{c.value}</p>}
                      {c.body && <p className="mt-4 text-muted-foreground">{c.body}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </AudienceOnly>
        )
      })}
      {(steps.length > 0 || (block.links?.length ?? 0) > 0) && (
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h3 className="display text-3xl">From application to orientation</h3>
            <CtaRow items={block.links} className="mt-6 flex flex-wrap gap-3" />
          </div>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.id ?? i} className="flex items-center gap-5 rounded-2xl border border-border bg-background p-5">
                <span className="display grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-lg text-background">{i + 1}</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Section>
  )
}
