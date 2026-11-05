// Prefix / contains rules, applied by src/proxy.ts BEFORE routing (DEC-64). Exact redirects are src/content/redirects.ts.
// Only rules whose target is live are listed (DEC-31).

export type LegacyRule =
  | { kind: 'contains'; needle: string; to: string; status: 301 | 302; note: string }
  | { kind: 'prefix'; prefix: string; to: string; status: 301 | 302; note: string }

// Live pages under a redirected prefix (landing-pages.csv live rows) are served, not redirected.
// IHNA: none. No live redirect behaves as a prefix or "contains" rule for a URL that reaches a page: header.php's 14 "contains"
// rules run only for WordPress URLs, so the 4 whose target is live are exact rules in src/content/redirects.ts.
export const LEGACY_EXCEPTIONS: string[] = []

export const LEGACY_RULES: LegacyRule[] = []

/** Returns the target for a legacy rule, or null. Exact redirects are answered by next.config.ts (src/content/redirects.ts). */
export function matchLegacyRule(pathname: string): { to: string; status: 301 | 302 } | null {
  const path = pathname.toLowerCase()
  if (LEGACY_EXCEPTIONS.some((e) => path === e || path.startsWith(e))) return null
  for (const rule of LEGACY_RULES) {
    if (rule.kind === 'prefix' && path.startsWith(rule.prefix) && path !== rule.to) return { to: rule.to, status: rule.status }
    if (rule.kind === 'contains' && path.includes(rule.needle) && path !== rule.to) return { to: rule.to, status: rule.status }
  }
  return null
}
