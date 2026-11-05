// Pure helpers for draft preview (10-content-model §Versions): no Payload import, so collection configs can build their
// `admin.livePreview.url` from them without a circular import. The route handler lives in src/lib/preview.ts.
export const PREVIEW_ROUTE = '/api/preview/'
export const PREVIEW_EXIT_ROUTE = '/api/preview/exit/'

export const previewSecret = (): string | undefined => process.env.PREVIEW_SECRET || undefined

/** The URL for `admin.livePreview.url`: the preview route with the document's path and the secret. */
export function previewUrl(path: string, origin = process.env.NEXT_PUBLIC_SITE_URL ?? ''): string {
  const q = new URLSearchParams({ path, secret: previewSecret() ?? '' })
  return `${origin}${PREVIEW_ROUTE}?${q.toString()}`
}

/** A site-relative path: one leading slash, no scheme, host or backslash, so the redirect can never leave the site. */
export const isSitePath = (path: string | null | undefined): path is string =>
  typeof path === 'string' && /^\/(?![/\\])/.test(path) && !path.includes('\\')
