// /healthcare-courses-ballarat/thanks: the old handler redirected every request to /courses/ (thanks.php:2) and recorded nothing.
// The Ballarat pages now answer inline through /api/enquire/; this URL keeps the old redirect.
export function GET(request: Request) {
  return Response.redirect(new URL('/courses/', request.url), 302)
}
