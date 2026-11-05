import { Section } from '@/components/layout/Section'
import type { SectionProps } from '@/blocks/sectionFields'

// Course data blocks are stubs until the course module lands: a labelled placeholder so pages never break.
export function CourseBlockStub({
  slug, title, detail, section, depth,
}: { slug: string; title: string; detail?: string; section: SectionProps; depth?: number }) {
  return (
    <Section tone={section.tone ?? 'default'} spacing={section.spacing ?? 'compact'} anchorId={section.anchorId} depth={depth}>
      <div data-course-block={slug} className="rounded-2xl border border-dashed border-border bg-card/60 p-6 md:p-8">
        <p className="label-mono text-xs tracking-widest text-muted-foreground">Course data · {slug}</p>
        <h2 className="display mt-2 text-2xl">{title}</h2>
        {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
        <p className="mt-3 text-sm text-muted-foreground">Placeholder. Live course data renders here once the course module is connected.</p>
      </div>
    </Section>
  )
}
