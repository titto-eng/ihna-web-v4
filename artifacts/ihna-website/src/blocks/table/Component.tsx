import type { TableBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/cn'
import type { BlockProps } from '../types'

// rows is JSON: coerce defensively, it may come from the importer.
export const toRows = (raw: unknown): string[][] =>
  Array.isArray(raw) ? raw.filter(Array.isArray).map((r) => (r as unknown[]).map((c) => (c == null ? '' : String(c)))) : []

export function TableBlockView({ block, ctx }: BlockProps<Block>) {
  const rows = toRows(block.rows)
  if (!rows.length) return null
  const [head, ...body] = block.headerRow === false ? [undefined, ...rows] : rows
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div className="min-w-0 max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          {block.caption && <TableCaption className="mt-0 border-t border-border p-4 text-left">{block.caption}</TableCaption>}
          {head && (
            <TableHeader>
              <TableRow className="bg-primary-strong hover:bg-primary-strong">
                {head.map((c, i) => <TableHead key={i} className={cn("label-mono h-auto px-4 py-3.5 text-[11px] whitespace-normal text-ink-foreground", i === 0 && "min-w-[14rem]")}>{c}</TableHead>)}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {body.map((r, ri) => (
              <TableRow key={ri} className={cn(block.variant !== 'plain' && ri % 2 === 1 && 'bg-muted/40')}>
                {(r ?? []).map((c, ci) => <TableCell key={ci} className={cn("px-4 py-3 align-top whitespace-normal", ci === 0 ? "min-w-[14rem] font-medium" : "tabular-nums")}>{c}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  )
}
