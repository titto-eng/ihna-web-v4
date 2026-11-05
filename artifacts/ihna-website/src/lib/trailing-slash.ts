// Used by next.config.ts (45 §5, 70 §5). Plain code: next.config imports it before anything else is compiled.

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Next's `trailingSlash: true` redirects (next/dist/lib/load-custom-routes.js), written out so some paths can be left out: `/file.ext/`
 * → `/file.ext` and `/path` → `/path/` (308), `.well-known` untouched. `except` are exact paths without the slash.
 * Checked by tests/payments/webhook-slash.test.ts against Next's own route matcher.
 */
export const trailingSlashRedirects = (except: readonly string[] = []) => {
  const skip = except.map((p) => `(?!${escapeRe(p.replace(/^\//, ''))}$)`).join('')
  return [
    {
      source: '/:file((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/]+\\.\\w+)/', destination: '/:file', permanent: true,
      missing: [{ type: 'header' as const, key: 'x-nextjs-data' }],
    },
    // `(?!/)`: Next lets a custom source match with a trailing slash too (modifyRouteRegex), which would redirect `/x/` to itself
    { source: `/:notfile((?!\\.well-known(?:/.*)?)${skip}(?:[^/]+/)*[^/\\.]+(?!/))`, destination: '/:notfile/', permanent: true },
  ]
}
