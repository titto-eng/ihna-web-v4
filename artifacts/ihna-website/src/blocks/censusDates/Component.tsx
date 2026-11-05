import type { CensusDatesBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { courseOf, warnNoCourse } from '@/components/templates/courseContext'
import { PortalNotice } from '@/components/templates/PortalNotice'
import { censusTable, getCensusDates } from '@/lib/portal'
import type { BlockProps } from '../types'

const HEAD = ['Course Intake', 'Course Start Date', 'Course End Date', 'Census Date', 'Orientation Date']

// The live course pages show this table (ihm.edu.au's `[IHMCensusDate]`); it is the CourseDetail default (DEC-7). Empty -> nothing, as live.
export async function CensusDates({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('censusDates')
    return null
  }
  if (!course.khId) return null
  const result = await getCensusDates(course.khId)
  const rows = censusTable(result.data)
  if (result.unavailable) {
    return (
      <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'compact'} anchorId={block.anchorId} depth={ctx?.depth}>
        <PortalNotice />
      </Section>
    )
  }
  if (!rows.length) return null
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="censusDates">
        <h2 className="display text-display-md">Course Start Dates</h2>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                {HEAD.map((h) => <TableHead key={h} className="label-mono h-auto px-4 py-3 text-xs text-foreground">{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.start}>
                  <TableCell className="px-4 py-3 font-medium">{r.intake}</TableCell>
                  <TableCell className="px-4 py-3">{r.start}</TableCell>
                  <TableCell className="px-4 py-3">{r.end}</TableCell>
                  <TableCell className="px-4 py-3">{r.census}</TableCell>
                  <TableCell className="px-4 py-3">{r.orientation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {block.note && <p className="mt-4 text-sm text-muted-foreground">{block.note}</p>}
      </div>
    </Section>
  )
}
