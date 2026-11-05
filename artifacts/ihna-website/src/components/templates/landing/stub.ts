// Live "stub" landing URLs (60 §5, IHNA): the old server answers 200 with a few bytes of text and no page ("Not Active", "test").
// Rule 1 keeps them 200; they carry no content, so the route answers the same short text, noindex, and nothing else.
export function stubResponse(text: string): Response {
  return new Response(text, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'public, max-age=300' } })
}
