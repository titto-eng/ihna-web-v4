// Caching and failure behaviour (50-portal-data §4 "Failure"). Server-only.
// `unstable_cache` tags: `portal` and `portal:<khId>` (calendar `portal:calendar`, countries `portal:countries`), 15 minutes.
// A cached function throws on error, so Next never stores a failure and keeps serving the stale entry. A failure is
// remembered separately for 60 s (negative cache) so a down or broken portal costs one attempt a minute, not one per view.
// Cold cache + error: the caller gets `{ unavailable: true, data: <empty> }`. Pages never see an exception.
import { revalidateTag, unstable_cache } from 'next/cache'
import type { PortalResult } from './types'

export const PORTAL_REVALIDATE_SECONDS = 900
export const PORTAL_NEGATIVE_SECONDS = 60

/** Scope of a cached read: a course (kh id) or a named shared list. IHNA adds census, agents, packages, courses (src/lib/portal/ihna.ts). */
export type PortalTag = number | 'calendar' | 'countries' | 'census' | 'agents' | 'packages' | 'courses'

export const tagsFor = (scope: PortalTag): string[] => ['portal', `portal:${scope}`]

// Failures per scope+key (until epoch ms). Held on globalThis so dev hot reloads keep it. Bounded: at NEGATIVE_MAX_KEYS the oldest
// entry is dropped (a Map iterates in insertion order), so a burst of distinct failing keys cannot grow it without limit.
const g = globalThis as unknown as { __portalNegative?: Map<string, number> }
const negative = (g.__portalNegative ??= new Map<string, number>())
export const NEGATIVE_MAX_KEYS = 1000
const remember = (key: string, until: number) => {
  negative.delete(key)
  while (negative.size >= NEGATIVE_MAX_KEYS) negative.delete(negative.keys().next().value as string)
  negative.set(key, until)
}

export async function cached<T>(name: string, scope: PortalTag, args: (string | number | null)[], fn: () => Promise<T>, empty: T): Promise<PortalResult<T>> {
  const key = [scope, name, ...args.map(String)].join('|')
  const until = negative.get(key)
  if (until !== undefined) {
    if (until > Date.now()) return { unavailable: true, data: empty }
    negative.delete(key)
  }
  try {
    const data = await unstable_cache(fn, ['portal', name, String(scope), ...args.map(String)], {
      tags: tagsFor(scope),
      revalidate: PORTAL_REVALIDATE_SECONDS,
    })()
    return { unavailable: false, data }
  } catch (e) {
    remember(key, Date.now() + PORTAL_NEGATIVE_SECONDS * 1000)
    console.warn(`portal.unavailable ${JSON.stringify({ query: name, scope, code: (e as { code?: string }).code ?? 'error' })}`)
    return { unavailable: true, data: empty }
  }
}

/** Expire one course's portal data, or everything when called without an id. Used by POST /api/revalidate/portal. */
export function revalidatePortal(scope?: PortalTag): void {
  for (const k of [...negative.keys()]) if (scope === undefined || k.startsWith(`${scope}|`)) negative.delete(k)
  revalidateTag(scope === undefined ? 'portal' : `portal:${scope}`, { expire: 0 })
}
