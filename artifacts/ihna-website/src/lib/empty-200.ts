// The answer of an old PHP include URL (src/content/static-paths.ts EMPTY_200_PATHS): 200 with an empty body, as on live; noindex.
const headers = () => new Headers({ 'Content-Type': 'text/html; charset=UTF-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=3600' })

export const GET = () => new Response(null, { status: 200, headers: headers() })
export const HEAD = GET
