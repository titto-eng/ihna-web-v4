import { z } from 'zod'

// Validated once at boot. A missing required value stops the app (DEC-14, 90-security §7).
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3001'), // ihna-web dev runs on :3001 (ihm-web owns :3000)
  DATABASE_URL: z.string().startsWith('postgres'),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),
  ADMIN_BASIC_USER: z.string().optional(),
  ADMIN_BASIC_HASH: z.string().optional(),
  ADMIN_GUARD_TRUST_CF_ACCESS: z.enum(['0', '1']).optional(), // 1 = a cf-access-authenticated-user-email header skips basic auth; set only when the origin is reachable through Cloudflare Access alone
  TRUSTED_IP_HEADERS: z.string().optional(), // comma list of client-IP headers the production proxy/CDN sets or overwrites (e.g. cf-connecting-ip); unset = only the rightmost X-Forwarded-For
  EMAIL_FROM: z.string().email().default('no-reply@ihna.edu.au'),
  RESEND_API_KEY: z.string().optional(),
  DRY_RUN: z.enum(['0', '1']).default('1'),
  PAYMENTS_DRY_RUN: z.string().optional(), // payments dry run; follows DRY_RUN when unset (DEC-50)
  ENQUIRY_LIVE_ADAPTERS: z.string().optional(), // comma list: email,hubspot,portalCrm,portalStakeholder,admissionsApi,dynamics,ihnaOnline
  DYNAMICS_ENABLED: z.enum(['0', '1']).default('1'), // IHNA: Dynamics is a live destination (plan §1, DEC-12); still sends only when listed in ENQUIRY_LIVE_ADAPTERS (DEC-50)
  HUBSPOT_FORM_GUID: z.string().optional(),
  HUBSPOT_API_BASE: z.string().url().optional(), // default https://api.hubapi.com
  HUBSPOT_FORMS_BASE: z.string().url().optional(), // default https://api.hsforms.com (an EU1 portal may need the EU host)
  IHNA_ONLINE_WEBHOOK_URL: z.string().url().optional(), // ihnaOnline adapter: IHNA Online leads webhook
  IHNA_ONLINE_WEBHOOK_KEY: z.string().optional(), // sent as X-Webhook-Key
  REVALIDATE_SECRET: z.string().min(16).optional(),
  DEV_ADMIN_EMAIL: z.string().email().optional(),
  DEV_ADMIN_PASSWORD: z.string().min(12).optional(),
  DISABLE_DB_PUSH: z.enum(['0', '1']).optional(), // 1 = this process never pushes the dev schema; every script that opens Payload sets it (DEC-46)
  ENQUIRY_AUTORUN: z.enum(['0', '1']).default('1'), // 0 = the in-process job runner stays off (queues then run only on demand via /api/payload-jobs/run)
  PERF_TIMING: z.enum(['0', '1']).optional(), // 1 = the course route prints `[perf] <label> <ms>` per data step
  STUDENT_PORTAL_EMBED_ORIGIN: z.string().url().optional(), // https origin of the student portal auto-enrol iframe; default site.studentPortalOrigin (src/content/site.ts)
  PREVIEW_SECRET: z.string().optional(), // ?secret= for /api/preview (Next draft mode); unset = the route answers 503
  // Read by scripts only (the app never reads them)
  IMPORT_DRY: z.enum(['0', '1']).optional(), // 1 = `npm run import` behaves as --dry
  LEGACY_BASE_URL: z.string().url().optional(), // the WordPress site the import scripts read; default https://ihna.edu.au
  APPRUNNER_API_URL: z.string().url().optional(), // IHNA App Runner API the import scripts read (public GET only, <= 1 req/s)
  CHECK_BASE_URL: z.string().url().optional(), // site scripts/dev/check-document-links.ts checks; default http://localhost:3000
  VERIFY_GATEWAYS: z.enum(['0', '1']).optional(), // 1 = npm run verify:gateways may contact the real gateway hosts (auth-only calls)
  VERIFY_PAYWAY_TOKEN: z.enum(['0', '1']).optional(), // 1 = verify:gateways also requests an unused PayWay cart token
  // 40/41 enquiries (names only; values live in .env). Adapters read these lazily through src/lib/enquiries/config.ts.
  RECAPTCHA_SECRET_KEY: z.string().optional(), // `RECAPTCHA_SECRET` is accepted as an alias; required when NODE_ENV=production (checked below)
  RECAPTCHA_SECRET: z.string().optional(), // alias of RECAPTCHA_SECRET_KEY
  NEXT_PHASE: z.string().optional(), // set by Next itself (`phase-production-build` during `next build`); never set by hand
  RECAPTCHA_MIN_SCORE: z.string().optional(),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(), // dev: localhost (Mailpit); production uses RESEND_API_KEY
  SMTP_PORT: z.string().optional(),
  SKIP_ENSURE_DEPS: z.enum(['0', '1']).optional(), // scripts/dev/ensure-deps.mjs (`predev`): 1 skips the install / database / port preflight
  ENQUIRY_NOTIFY_TO: z.string().optional(), // fallback recipient / alert address while src/content/enquiry-routing.ts has no addresses
  HUBSPOT_PORTAL_ID: z.string().optional(),
  HUBSPOT_ACCESS_TOKEN: z.string().optional(),
  PORTAL_ENABLED: z.enum(['0', '1']).default('0'), // 50-portal-data: 0 = no portal read ever opens a connection (default until real portal access exists)
  PORTAL_QUERY_TIMEOUT_MS: z.string().optional(), // per-query cap in ms, never above 3000
  PORTAL_TZ: z.string().optional(), // IANA zone portal dates are rendered in; default Australia/Melbourne
  PORTAL_DB_HOST: z.string().optional(), // default 127.0.0.1 (ihna-web's docker fixture listens on 3308)
  PORTAL_DB_PORT: z.string().optional(), // default 3306
  PORTAL_DB_NAME: z.string().optional(), // ihna_portal; set it everywhere (portal/client.ts falls back to ihm-web's database name)
  PORTAL_DB_RO_USER: z.string().optional(), // read-only user (alias PORTAL_DB_READ_USER)
  PORTAL_DB_RO_PASSWORD: z.string().optional(), // (alias PORTAL_DB_READ_PASSWORD)
  PORTAL_DB_READ_USER: z.string().optional(),
  PORTAL_DB_READ_PASSWORD: z.string().optional(),
  PORTAL_CRM_URL: z.string().optional(),
  PORTAL_CRM_API_KEY: z.string().optional(),
  PORTAL_IHM_STAKEHOLDER_URL: z.string().optional(),
  PORTAL_IHNA_STAKEHOLDER_URL: z.string().optional(),
  ADMISSIONS_API_URL: z.string().optional(),
  ADMISSIONS_API_KEY: z.string().optional(),
  DYNAMICS_TENANT_ID: z.string().optional(),
  DYNAMICS_CLIENT_ID: z.string().optional(),
  DYNAMICS_CLIENT_SECRET: z.string().optional(),
  DYNAMICS_URL: z.string().optional(),
  // 45 payments (names only; values live in .env). Read lazily through src/lib/payments/config.ts.
  PAYMENTS_GATEWAY_MODE: z.enum(['fake', 'real']).optional(), // default: fake outside production, real in production (fake is refused there)
  PAYMENTS_ALLOW_PRODUCTION: z.enum(['0', '1']).optional(), // 1 = the real clients may use production hosts / a live PayWay merchant
  PAYMENTS_DATA_KEY: z.string().min(16).optional(), // HMAC key for signed amounts and payment ids; required in production
  PAYMENTS_MAX_INVOICE_AMOUNT: z.string().optional(),
  PAYMENTS_FINANCE_TO: z.string().optional(),
  PAYMENTS_SURCHARGE_PAYWAY_PERCENT: z.string().optional(),
  PAYMENTS_SURCHARGE_SECUREPAY_PERCENT: z.string().optional(),
  PAYMENTS_SURCHARGE_AIRWALLEX_PERCENT: z.string().optional(),
  PORTAL_DB_PAY_USER: z.string().optional(), // write-limited `payments` user (alias PORTAL_DB_PAYMENTS_USER)
  PORTAL_DB_PAY_PASSWORD: z.string().optional(), // (alias PORTAL_DB_PAYMENTS_PASSWORD)
  PORTAL_DB_PAYMENTS_USER: z.string().optional(),
  PORTAL_DB_PAYMENTS_PASSWORD: z.string().optional(),
  PAYWAY_BASE_URL: z.string().optional(),
  PAYWAY_BILLER_CODE: z.string().optional(),
  PAYWAY_MERCHANT_ID: z.string().optional(),
  PAYWAY_USERNAME: z.string().optional(),
  PAYWAY_PASSWORD: z.string().optional(),
  PAYWAY_ENCRYPTION_KEY: z.string().optional(), // base64 of a 16-byte AES-128 key
  PAYWAY_NOTIFY_USERNAME: z.string().optional(), // server-to-server notification credentials (Setup Net wizard)
  PAYWAY_NOTIFY_PASSWORD: z.string().optional(),
  PAYWAY_PROVIDER: z.string().regex(/^\d{1,3}$/).optional(), // `provider` sent with our PayWay payments (2 IHM, 3 HCLA); unset = src/content/payments.ts (IHNA: none)
  SECUREPAY_ENV: z.enum(['sandbox', 'live']).optional(), // default sandbox; SECUREPAY_AUTH_URL / SECUREPAY_API_URL override
  SECUREPAY_AUTH_URL: z.string().optional(),
  SECUREPAY_API_URL: z.string().optional(),
  SECUREPAY_CLIENT_ID: z.string().optional(),
  SECUREPAY_CLIENT_SECRET: z.string().optional(),
  SECUREPAY_MERCHANT_CODE: z.string().optional(),
  SECUREPAY_UI_CLIENT_ID: z.string().optional(),
  SECUREPAY_DCC: z.enum(['0', '1']).optional(),
  AIRWALLEX_API_URL: z.string().optional(),
  AIRWALLEX_ENV: z.enum(['demo', 'prod']).optional(),
  AIRWALLEX_CLIENT_ID: z.string().optional(),
  AIRWALLEX_API_KEY: z.string().optional(),
  AIRWALLEX_WEBHOOK_SECRET: z.string().optional(),
  PORTAL_IHM_URL: z.string().optional(), // portal callbacks (updatePayway, auto-enrol)
  PORTAL_HCLA_URL: z.string().optional(),
  PORTAL_IHNA_URL: z.string().optional(),
  PORTAL_SKILLDEMY_URL: z.union([z.literal(''), z.string().url().startsWith('https://')]).optional(), // https only. Skilldemy portal: paid PayWay type=skilldemy -> /crm/SkilldemyApplications/multipleSkilldemyCourseEnrol
  SKILLDEMY_RETURN_URL: z.string().optional(), // https page the browser returns to after a Skilldemy PayWay payment (?status=)
  PORTAL_INVOICE_LINK_KEY: z.string().optional(), // HMAC key of signed /pay-online/?invoice_id=&exp=&sig= links; unset = no invoice prefill
  PORTAL_INVOICE_LINK_MAX_DAYS: z.union([z.literal(''), z.string().regex(/^\d{1,3}$/)]).optional(), // longest accepted link lifetime (exp - now), 1-365 days; default 30
  MONDAY_API_TOKEN: z.string().optional(),
  MONDAY_E2_BOARD_ID: z.string().optional(),
  // monday.com column ids of the E2 board (45-payments §E2): text, email, text, status column + the status label to set
  MONDAY_E2_NAME_COLUMN: z.string().optional(),
  MONDAY_E2_EMAIL_COLUMN: z.string().optional(),
  MONDAY_E2_STUDENT_ID_COLUMN: z.string().optional(),
  MONDAY_E2_STATUS_COLUMN: z.string().optional(),
  MONDAY_E2_STATUS_LABEL: z.string().optional(),
  MSGRAPH_TENANT_ID: z.string().optional(),
  MSGRAPH_CLIENT_ID: z.string().optional(),
  MSGRAPH_CLIENT_SECRET: z.string().optional(),
  MSGRAPH_LICENSE_SKU_ID: z.string().optional(),
  CANVAS_URL: z.string().optional(),
  CANVAS_ACCOUNT_ID: z.string().optional(),
  CANVAS_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(), // bearer token for /api/payload-jobs/run (on-demand queue run)
  RATE_LIMIT_STORE: z.enum(['memory', 'postgres']).optional(), // default: memory in dev/test, postgres in production
  TRACKING_ENABLED: z.enum(['0', '1']).default('0'), // 80-tracking: 1 in production only; 0 = no third-party loads
  NEXT_PUBLIC_ROBOTS: z.enum(['index', 'noindex']).optional(), // staging: `noindex` = Disallow: / and noindex meta (70 check 7)
})

// An empty `KEY=` line (as copied from .env.example) means "not set": drop blank values (and stray CRs from Windows-saved .env files)
// before validation, so optional URLs and enums fall back to their defaults instead of failing as invalid.
const cleanEnv = Object.fromEntries(
  Object.entries(process.env)
    .map(([k, v]) => [k, typeof v === 'string' ? v.replace(/\r$/, '').trim() : v] as const)
    .filter(([, v]) => v !== undefined && v !== ''),
)
const parsed = schema.safeParse(cleanEnv)
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')
  throw new Error(`Invalid environment:\n  ${issues}`)
}
// A production server needs the reCAPTCHA secret (90 §7): without it every post is `unverified`. `next build` (NEXT_PHASE) does not.
if (parsed.data.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build' && !(process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET)) {
  throw new Error('Invalid environment:\n  RECAPTCHA_SECRET_KEY: required in production')
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
