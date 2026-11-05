import type { CurriculumBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import type { BlockProps } from '../types'
import { CurriculumClient, type Year } from './CurriculumClient'

export function Curriculum({ block, ctx }: BlockProps<Block>) {
  const years: Year[] = (block.years ?? []).map((y, yi) => {
    const groups = new Map<string, Year['semesters'][number]['units']>()
    ;(y.units ?? []).forEach((u, ui) => {
      const key = u.semester ?? ''
      groups.set(key, [...(groups.get(key) ?? []), { id: u.id ?? `${yi}-${ui}`, code: u.code, title: u.title, credit: u.credit, kind: u.kind ?? 'core' }])
    })
    return { id: y.id ?? `year-${yi}`, label: y.label, semesters: [...groups].map(([name, units]) => ({ name, units })) }
  })
  if (!years.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <CurriculumClient years={years} header={<SectionHeader eyebrow={block.eyebrow} heading={block.heading} className="mb-0 md:mb-0" />} />
    </Section>
  )
}
