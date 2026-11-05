/**
 * Accepted differences of the parity crawl (scripts/parity/crawl.ts): a row whose new-site answer differs from the live site
 * for a known, legitimate reason is reported as ACCEPTED with that reason instead of STATUS_DIFF / REDIRECT_DIFF / TITLE_DIFF.
 * Nothing is hidden: the row stays in the CSV, the note starts with `ACCEPTED(<rule id>): <reason>` and the summary counts it.
 * Rules are per site; IHM has none (its crawl is unchanged). Pure module, no I/O (tests/seo/parity-accept.test.ts).
 */

export interface Answer {
  error?: string;
  first: number; // status of the first response, 0 when none
  firstLocation?: string;
  slashOnly: boolean;
  finalUrl: string;
  finalStatus: number;
  title?: string;
  h1?: string;
  bytes?: number;
  textLen?: number;
}

export interface AcceptContext {
  path: string; // request path as crawled
  exp: string; // the crawl's expectation (live200, gone404, redirect301, redirected, same, …)
  result: string; // the crawl's verdict before this step
  live: Answer;
  next: Answer;
  landing?: { live_status: string; recommendation: string; section: string };
  pageType?: string;
}

export interface AcceptRule {
  id: string;
  reason: string;
  test: (c: AcceptContext) => boolean;
}

const is404 = (a: Answer) => a.first === 404 || (a.slashOnly && a.finalStatus === 404);
const is200 = (a: Answer) => !a.error && a.finalStatus === 200 && (a.first === 200 || a.slashOnly);
const isRedirect = (a: Answer) => a.first >= 300 && a.first < 400 && !a.slashOnly;
const servedOk = (a: Answer) => !a.error && a.finalStatus === 200;
// An empty body: no bytes at all, or an HTML page with no visible text.
const emptyBody = (a: Answer) => is200(a) && (a.bytes === 0 || a.textLen === 0);

// The IHNA theme answers any /blog/<anything>/ with its blog template and no post: title "IHNA Blogs", empty <h1>.
const IHNA_BLOG_CATCH_ALL = (a: Answer) => is200(a) && /^ihna blogs$/i.test((a.title ?? '').trim()) && !(a.h1 ?? '').trim();

// Live answers 200 only without the slash (study-at-ihna/.htaccess rewrite); AGENTS rule 1 keeps the slashed form.
const IHNA_SLASH_FORMS = new Set(['/study-at-ihna/diploma-nursing-int/']);
// The gateway pages and their return/error pages (inventory payments.csv); /makepayment/ stays a 404 as on live.
const IHNA_PAYMENT_PAGES = new Set([
  '/pay-online/', '/pay-online-error/', '/payway-response/', '/secure-pay/', '/secure-pay-response/', '/secure-pay-card-dcc/',
  '/airwallex/', '/airwallex-checkout/', '/airwallex-webhook/', '/payment-options/',
]);

export const ACCEPT_RULES: Record<string, AcceptRule[]> = {
  ihm: [],
  ihna: [
    {
      id: 'live-redirect-to-404',
      reason: 'live redirects to a page that is itself 404 (a dead end); 404 here',
      test: (c) => isRedirect(c.live) && c.live.finalStatus === 404 && is404(c.next),
    },
    {
      id: 'slash-form',
      reason: 'live .htaccess serves the unslashed URL (200) and 404s the slashed one; the trailing-slash rule serves the page here',
      test: (c) => IHNA_SLASH_FORMS.has(c.path) && is404(c.live) && servedOk(c.next),
    },
    {
      id: 'demo-placeholder',
      reason: 'demo/ test pages answer a minimal noindex 200 ("Page not available") here by decision (DEC-113)',
      test: (c) => c.path.startsWith('/demo/') && is200(c.live) && is200(c.next) && /^page not available\b/i.test(c.next.title ?? ''),
    },
    {
      id: 'payment-page',
      reason: 'payment page rebuilt by the payments module (45-payments); its title names the new flow',
      test: (c) => c.result === 'TITLE_DIFF' && IHNA_PAYMENT_PAGES.has(c.path),
    },
    {
      id: 'live-403-folder',
      reason: 'folder without an index: live answers 403 (directory listing forbidden), 404 here',
      test: (c) => (c.live.first === 403 || c.live.finalStatus === 403) && is404(c.next),
    },
    {
      id: 'blog-catch-all',
      reason: 'live /blog/* catch-all answers an empty "IHNA Blogs" 200 for any path; no post at this path',
      test: (c) =>
        c.path.startsWith('/blog/') && c.path.replace(/\/+$/, '') !== '/blog' && IHNA_BLOG_CATCH_ALL(c.live) &&
        (is404(c.next) || (isRedirect(c.next) && servedOk(c.next))),
    },
    {
      id: 'blog-template-title',
      reason: 'live renders the post inside the generic "IHNA Blogs" template title; the new page titles the post',
      test: (c) => c.result === 'TITLE_DIFF' && c.path.startsWith('/blog/') && /^ihna blogs$/i.test((c.live.title ?? '').trim()),
    },
    {
      id: 'empty-stub',
      reason: 'live answers an empty body (stub); the new site answers it without the old emptiness',
      test: (c) => emptyBody(c.live) && !c.next.error && c.next.finalStatus < 500 && !is404(c.next),
    },
  ],
};

/** The first rule that accepts this non-OK row, or undefined. OK and NEW_ERROR rows are never re-classified. */
export function acceptedBy(site: string, c: AcceptContext): AcceptRule | undefined {
  if (c.result === 'OK' || c.result === 'NEW_ERROR') return undefined;
  return (ACCEPT_RULES[site] ?? []).find((r) => r.test(c));
}
