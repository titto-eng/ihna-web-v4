// Where `documents` (DEC-68) are served: the old static PDF stores of the site, kept at their exact URLs (rule 1). Site-specific
// constants read by src/collections/Documents.ts, the file route (src/app/(site)/pdf/) and the proxy's rewrite (src/proxy.ts).
// IHNA: the stores that answer on ihna.edu.au (checked file by file on 2026-10-21). `/brochures/` is kept for course brochure
// documents (DEC-69); the old IHNA brochure PDFs there are 404 on live and are not imported.

/** URL prefixes a document may live under. */
export const DOCUMENT_PREFIXES = [
  '/pdf/',
  '/ihna-policies/',
  '/ihna-procedures/',
  '/IHNA_International_Course_Guide/',
  '/alumni/docs/',
  '/wp-content/uploads/pdf/',
  '/wp-content/uploads/guides/',
  '/brochures/',
] as const

/**
 * Old URLs that serve another document's file with 200 (no redirect: the parity crawl expects 200 at both). Key and value are decoded
 * paths; the value is a document `publicPath`. The import skips the key's static copy so only one document holds the file.
 * IHNA: none.
 */
export const DOCUMENT_ALIASES: Readonly<Record<string, string>> = {}
