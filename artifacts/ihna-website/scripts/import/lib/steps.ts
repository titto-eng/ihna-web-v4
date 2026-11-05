import type { ImportStep } from './context'

/** Steps sorted as the CLI lists them: ascending `order` (default 100), ties by name. */
export const sortSteps = <T extends Pick<ImportStep, 'name' | 'order'>>(steps: T[]): T[] =>
  [...steps].sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name))

/**
 * The steps one CLI argument selects. `all` is the site's list (`ALL_STEPS` in config.ts) in its own order, or every step by
 * `order` when the site has no list; `a,b` runs the named steps in the order given. Unknown names come back in `unknown`.
 */
export function selectSteps<T extends Pick<ImportStep, 'name' | 'order'>>(arg: string, steps: T[], allSteps: readonly string[] | null): { steps: T[]; unknown: string[] } {
  const names = arg === 'all' ? allSteps : arg.split(',').map((n) => n.trim()).filter(Boolean)
  if (!names) return { steps: sortSteps(steps), unknown: [] }
  const byName = new Map(steps.map((s) => [s.name, s]))
  return { steps: names.flatMap((n) => byName.get(n) ?? []), unknown: names.filter((n) => !byName.has(n)) }
}
