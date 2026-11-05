import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { censusDisplayDate, idParam, readCensus, type CensusData, type CensusSelection } from '@/lib/portal/ihna'
import { CensusAutoSubmit } from './CensusPicker.client'
import { PortalNotice } from './PortalNotice'
import { LeadHero, type HeroProps } from './pageParts'

// Unit census dates (template-census-date-kh.php): campus -> course -> intake -> semester, then the unit table, from `ihna_portal`
// (src/lib/portal/ihna.ts readCensus). A GET form read on the server: no AJAX, no SQL built from the query string. A chosen value that is
// not among its options (stale link, edited URL) is dropped together with the levels below it.

type SP = Record<string, string | string[] | undefined>

const HEAD = ['#', 'Year', 'Unit Code', 'Start Date', 'End Date', 'Census Date', 'EFTSL Value']

/** The selection, read level by level: a value that is not among its level's options is dropped with the levels below it (`readCensus`). */
export async function loadCensus(sp: SP): Promise<{ unavailable: boolean; data: CensusData; sel: CensusSelection }> {
  const raw = { campus: idParam(sp.campus), course: idParam(sp.course), batch: idParam(sp.batch), semester: idParam(sp.semester) }
  const { unavailable, data, sel } = await readCensus(raw)
  return { unavailable, data, sel }
}

function Picker({ name, label, value, options, disabled }: { name: string; label: string; value: number | null | undefined; options: { id: number; name: string }[]; disabled?: boolean }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={value ? String(value) : ''}
        disabled={disabled}
        className="h-11 rounded-lg border border-input bg-background px-3 text-base disabled:opacity-50"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  )
}

export async function CensusView({ hero, children, searchParams }: { hero: HeroProps; children?: ReactNode; searchParams: SP }) {
  const { unavailable, data, sel } = await loadCensus(searchParams)
  return (
    <>
      <LeadHero hero={hero} extra={{ eyebrow: 'Current students' }} />
      {children}
      <Section tone="muted" spacing="compact" anchorId="census-table">
        {unavailable ? (
          <PortalNotice />
        ) : (
          <div className="space-y-8">
            <p className="max-w-3xl text-lg">Please select campus, course, intake and semester to see the census dates of each unit.</p>
            <CensusAutoSubmit>
              <Picker name="campus" label="Campus" value={sel.campus} options={data.campuses} />
              <Picker name="course" label="Course" value={sel.course} options={data.courses.map((c) => ({ id: c.id, name: c.code ? `${c.code} ${c.name}` : c.name }))} disabled={!sel.campus} />
              <Picker name="batch" label="Intake" value={sel.batch} options={data.batches} disabled={!sel.course} />
              <Picker name="semester" label="Semester" value={sel.semester} options={data.semesters} disabled={!sel.batch} />
              <noscript><Button type="submit">Show census dates</Button></noscript>
            </CensusAutoSubmit>
            {sel.semester && (
              data.units.length ? (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card" data-testid="census-units">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/60 hover:bg-muted/60">
                        {HEAD.map((h) => <TableHead key={h} className="label-mono h-auto px-4 py-3 text-xs text-foreground">{h}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.units.map((u, i) => (
                        <TableRow key={`${u.unitCode}-${i}`}>
                          <TableCell className="px-4 py-3">{i + 1}</TableCell>
                          <TableCell className="px-4 py-3">{u.year}</TableCell>
                          <TableCell className="px-4 py-3 font-medium">{u.unitCode}</TableCell>
                          <TableCell className="px-4 py-3">{censusDisplayDate(u.start)}</TableCell>
                          <TableCell className="px-4 py-3">{censusDisplayDate(u.end)}</TableCell>
                          <TableCell className="px-4 py-3">{censusDisplayDate(u.census)}</TableCell>
                          <TableCell className="px-4 py-3">{u.eftslFactor ?? ' - '}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground">No units are recorded for this semester yet.</p>
              )
            )}
          </div>
        )}
      </Section>
    </>
  )
}
