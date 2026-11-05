# 45 — Payments

## 1. Purpose
Server-side IHNA payments (invoices and the 12 English-test "E2" products) through PayWay Net, SecurePay and Airwallex. Three rules hold everywhere: the server sets every amount and id (the browser never sends a product price), the Postgres row and the portal row exist before any gateway call, and a payment settles once. Convera and Flywire are plain external links on the chooser.

Code: `src/lib/payments/**` (pipeline), `src/content/payments.ts` (site settings, DEC-109), `src/lib/portal/payments-write.ts` (portal writes), `src/jobs/afterPaid.ts`, `src/jobs/reconcilePending.ts`, routes under `src/app/api/payments/**`, `src/app/(site)/pay/**` and the old payment paths (§5), UI in `src/components/payments/**` and `src/components/templates/{PayOnline,PaymentOptions,Receipt,payPages}.tsx`.

## 2. Data model
**Postgres `payments`** (`src/collections/Payments.ts`): the mirror of each payment our flows create.
- `paymentId` (uuid, unique): the only id exposed outside the server. Derived by HMAC from the client's `submissionId` (`sign.ts derivePaymentId`), so a retried submission maps to the same row.
- `kind`: `invoice` | `product` | `sae` | `portalReturn`. `product` (relationship to `products`), `paymentFor`, `invoiceNo`, `studentId`, `payerName`, `payerEmail`.
- Money in integer cents: `amountCents` (total), `baseCents`, `surchargeCents`, `currency` (AUD).
- `gateway`, `gatewayRef` (Airwallex intent id, PayWay receipt, SecurePay order id, `fake_…`), `status`: `pending` | `paid` | `failed` | `refunded` | `flagged` | `cancelled` | `expired`.
- `statusHistory[]` (status, at, note), `steps[]` (afterPaid step, status, attempts), `portalPaymentId` (portal row id, server only), `ip`, `settledAt`, `lastSyncedAt`.
- `flags` (json, `types.ts PaymentFlags`): `amountSig` (HMAC of paymentId|amount|currency|kind), `submissionId`, `eventIds` (last 50 applied event ids), `reason`/`reasonDetail` for `flagged` (`amount-mismatch`, `signature-mismatch`, `needs-manual-check`, `refunded`), `gateway` facts (response codes, bank transaction id, order id, intent id, receipt number), `payway` (type, provider, autoenrol, decrypted params), `chargeAttempted`, `monday.itemId`, `e2payment`. Never tokens or client secrets.

**Postgres `products`** (`src/collections/Products.ts`): `sku` (unique), `legacyE2Btn` (1–12, unique), `name`, `kind` (`prep-package` | `mock-test`), `description`, `priceCents`, `currency` (AUD), `studentDiscountPercent` (default 50; no code reads it), `accessMonths`, `gateways` (hasMany of payway/securepay/airwallex/convera/flywire, default securepay + airwallex; server-enforced on start), `active`, `sortOrder`. Versions kept (25). The dev database holds the 12 seeded products (6 prep packages at 15000 cents, 6 mock tests at 5000 cents, all active).

**Portal `ihna_portal.payments`** (MySQL), written only by `src/lib/portal/payments-write.ts` through the write-limited user `PORTAL_DB_PAY_USER` (alias `PORTAL_DB_PAYMENTS_USER`): SELECT, INSERT and column-level UPDATE on `payments`, no DELETE. All statements are constant strings with `?` placeholders; amounts are 2-dp strings built from cents. Payment writes do not depend on `PORTAL_ENABLED`.
- `insertPendingPayment`: `student_name, studentid ('0' when none), invoice_number, payment_type_id=2, email, payment_for, e2payment ('yes'|'no'), amount, total, payment_gateway, applydate=CURDATE(), created=NOW(), ip_address, status=0`. The IP column is `PORTAL_PAYMENT_IP_COLUMN` = `ip_address`, the column the old IHNA theme reads and writes (`functions.php:2032`, `:2192`); `tests/payments/portal-write-columns.test.ts` checks the insert and the fixture use it. Returns the portal row id.
- `markPortalPaid`: `status=1, paid_amount, paymentdate`, plus non-null facts (`payment_gateway`, `sp_status, sp_bankTransactionId, sp_gatewayResponseCode, sp_gatewayResponseMessage, sp_orderId, sp_dcc_orderId`, `aw_intent_id`, `payment_number, response_code, payment_status, type`) `WHERE id=? AND status=0` (idempotent).
- `recordPortalResponse`: the same fact columns on a row that stays `status=0` (failed, expired, cancelled).
- Status: 0 = pending or failed, 1 = paid. Column names follow the old theme's statements; the Docker fixture is `docker/portal-fixtures/payments.schema.sql` (grants in `load.sh`).

## 3. Admin capabilities
- `payments`: read by `admin` and `finance`; create, update and delete are denied to everyone (only server code writes, via the Local API with `overrideAccess`, DEC-3). Searchable by paymentId, invoiceNo, payerEmail, gatewayRef. Finance resolves `flagged` rows at the gateway and in the portal; a payment cannot be edited.
- **Retry dead steps**: `POST /api/payments/retry/` (`src/app/api/payments/retry/route.ts`, `src/lib/payments/retry.ts`), staff session with role admin or finance (401/403 otherwise, DEC-20). Body `{ paymentIds? }`; without ids every payment with a `dead` afterPaid step (200 at most). Each dead step goes back to `failed` with 0 attempts, `statusHistory` records the request and the user id, and `afterPaid` is queued once per payment; the response is `{ ok, requeued, paymentIds }`. There is no button in the Payments list; the dead-step mail names the call.
- `products`: read public when active (staff see all); create `finance`/`admin`; update `marketing`/`finance`/`admin`, but `priceCents`, `currency` and `studentDiscountPercent` are `finance`/`admin` only; delete `admin`.
- Finance mail (to `PAYMENTS_FINANCE_TO`, else `ENQUIRY_NOTIFY_TO`; subjects prefixed `paymentSite.mailTag` = `[IHNA payments]`): every paid payment, every flag, every refund, E2 orders to fulfil, and afterPaid steps that go `dead`.

## 4. Front-end behaviour
- **`/payment-options/`** (`PaymentOptions.tsx`): cards for PayWay, SecurePay and Airwallex linking to the pay form `paymentSite.payPath` (`/pay-online/`, DEC-11) `?gateway=…`, carrying `e2btn`, else a format-checked portal-signed `invoice_id` + `exp` + `sig` (`signedInvoiceParams`) unchanged so the signed prefill survives the chooser, else a plain `invoice_id`; plus Convera (`https://students.convera.com/ihna#!/`) and Flywire (`https://ihna.flywire.com`) as external links (`src/content/payments.ts`). With a valid `?e2btn=1..12` it names the product and price and shows only that product's allowed gateways (Convera and Flywire hidden). Invalid `e2btn`/`invoice_id` values are ignored. The footer "Pay Online" link points here; the nav "Make a Payment" link points to `/pay-online/`.
- **`/pay-online/`** (`PayFormRoute` in `src/components/templates/payPages.tsx` → `PayOnline.tsx` + `PayForm.client.tsx`): one form, two modes. `/secure-pay/` and `/airwallex/` render the same form with their gateway preselected (the page's gateway wins over `?gateway=`). Invoice mode: name, email, invoice number, optional student id, "payment for" (free text with the `paymentSite.paymentFor` suggestions), amount typed by the payer. Product mode: product select showing the server price, optional student id, no amount field. Gateway radio limited to the product's allowed gateways (default PayWay for invoices). `?gateway=`, `?e2btn=` (opens product mode) and `?invoice_id=` are read.
- **Signed invoice links** (DEC-106): `?invoice_id=<portal invoice id>&exp=<unix seconds>&sig=<hex HMAC-SHA256("invoice:<id>:<exp>") under PORTAL_INVOICE_LINK_KEY>` pre-fills the invoice number and the amount due read from `ihna_portal.invoices` (`getInvoiceForLink`, 50 §4 Q12). A link is refused after `exp` and when `exp` lies more than `PORTAL_INVOICE_LINK_MAX_DAYS` (1–365, default 30) ahead; without the key the signed prefill is off. The payer may change the pre-filled amount (DEC-23). An unsigned `?invoice_id=` pre-fills the invoice number field only when it is not a bare number (a bare number is the portal's row id, not the payer's invoice number).
- reCAPTCHA v3 token (action `enquire`) when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set. The form submits to `POST /api/payments/start/` and follows `redirectUrl` (same-site path or https only).
- **Gateway pages**: PayWay is a redirect to PayWay's hosted `MakePayment` page. `/pay/securepay/[uuid]/` loads the SecurePay UI script (`{api}/v3/ui/client/securepay-ui.min.js`, mode `checkout`, Visa/Mastercard), tokenises, and posts `{paymentId, token}` to the charge endpoint. `/pay/airwallex/[uuid]/` retrieves the intent server-side and mounts the Airwallex drop-in (`https://static.airwallex.com/components/sdk/v1/index.js`); on success it goes to `/pay/return/airwallex/?id=`. Both pages 404 for an unknown id or another gateway, redirect a settled payment to its result, and redirect to `/pay/fake/[uuid]/` in fake mode. `SECUREPAY_DCC=1` makes the SecurePay page throw.
- **`/pay/fake/[uuid]/`**: Approve, Decline, Abandon buttons posting to `/api/payments/fake/[uuid]/`. Available only outside production and in fake mode or dry run; 404 otherwise.
- **`/pay/result/[uuid]/`**: status copy, amount and "paying for"; no name or email. A pending row older than 20 s gets one `queryStatus` per view (paid/failed are settled). Failed/expired show "Try again" to `/payment-options/`. A paid result renders `PurchaseEvent` (one GA4 `purchase` per payment, `purchaseEventFor`, 80 §4).
- **`/pay/receipt/[uuid]/?e=<email>`**: rendered only when `e` matches the stored payer email (case-insensitive, constant-time); wrong email, unknown id and rate-limited callers (10 per minute per IP) all get the same 404. Shows status, amount, for, invoice/reference, payer name, gateway, date, receipt number (the uuid).
- All `/pay/*` pages, the pay forms (`/pay-online/`, `/secure-pay/`, `/airwallex/`) and `/payment-options/` are `force-dynamic` and `noindex`; `/pay/*` and the pay forms also send `referrer: no-referrer`. The info pages (`/secure-pay-card-dcc/`, `/airwallex-checkout/`, `/secure-pay-response/`, `/payway-response/`) are `noindex`. The sitemap leaves out paths starting `/pay`, `/pay-online`, `/secure-pay`, `/airwallex`, `/payway`, `/makepayment`, `/make-a-payment` (`src/lib/seo/sitemap.ts`). The payment hosts are in the site-wide CSP (`src/lib/seo/csp.ts`). HubSpot tracking does not load on paths starting `/pay-online/`, `/pay/`, `/airwallex/` and `/secure-pay/` (`exclusions` in `src/components/tracking/defaults.ts`); GTM, GA4 and Clarity do.
- `/pay-online-error/` and `/commonwealth-prac-payment/` are content route files. `/makepayment/` is not an IHNA URL (404 on live) and has no route.

## 5. URLs
Every old WordPress payment URL answers 200 at its own path; none redirects (DEC-45).

| Path | Behaviour |
|---|---|
| `/payment-options/` (`?e2btn=1..12`, `?invoice_id=` with `exp` and `sig`) | chooser |
| `/pay-online/` (`?gateway=`, `?e2btn=`, `?invoice_id=`, `exp`, `sig`) | pay form |
| `/secure-pay/`, `/airwallex/` | pay form, gateway preselected |
| `/secure-pay-card-dcc/`, `/airwallex-checkout/`, `/secure-pay-response/` | 200 info page ("start from Payment options"); `?id=`/`?data=` ignored |
| `/pay-online-error/`, `/commonwealth-prac-payment/` | content pages |
| `/makepayment/` | 404 (not an IHNA URL) |
| `/pay/securepay/[uuid]/`, `/pay/airwallex/[uuid]/`, `/pay/fake/[uuid]/` | gateway pages |
| `/pay/result/[uuid]/`, `/pay/receipt/[uuid]/?e=` | result, receipt |
| `GET /pay/return/payway/` | PayWay browser return (decrypt, verify, settle, 303 to result, or to Skilldemy for `type=skilldemy`) |
| `GET /payway-response/` | with `EncryptedParameters`: rewritten to `/pay/return/payway/` (`next.config.ts` `rewrites.beforeFiles`; PayWay's configured return URL); bare GET: 200 info page |
| `GET /pay/return/airwallex/?id=`, `GET /pay/return/securepay/?id=` | 303 to the result page (400 for a non-uuid) |
| `POST /api/payments/start/` | start (§6) |
| `POST /api/payments/securepay/charge/` | charge a SecurePay card token for the stored amount |
| `POST /api/payments/webhook/payway/` | PayWay server-to-server notification |
| `POST /api/payments/webhook/airwallex/` | Airwallex webhook |
| `/airwallex-webhook/` | `POST`: the Airwallex webhook (the route re-exports its `POST`); `GET`: empty 200. `POST /airwallex-webhook` (no slash) reaches the same handler with its body (`site.postWithoutSlash`, rewritten by `src/proxy.ts`; 70 §4); other methods there get the usual 308 |
| `POST /api/payments/fake/[uuid]/` | fake decision (form field `decision`), 303 to result |
| `POST /api/payments/retry/` | re-run dead afterPaid steps (§3) |

## 6. Integrations
**`POST /api/payments/start/`** (`start.ts handleStart`; body ≤ 8 KB, else 413; zod strict objects in `schema.ts`)
- Common fields: `kind, gateway (payway|securepay|airwallex), payerName, payerEmail, submissionId (uuid), captchaToken?`. Unknown keys are 400.
- `invoice`: `invoiceNumber, studentId?, paymentFor, amount`. The typed amount is parsed to cents (plain AUD, ≤ 2 dp); below 1.00 or above `PAYMENTS_MAX_INVOICE_AMOUNT` (default 50,000) is 400.
- `product`: `productId` (numeric id or sku) or `e2btn`, `studentId?`. Price = `products.priceCents` of an active product (404 if none); a gateway not in `product.gateways` is 400; `invoiceNo` = `E2-<legacyE2Btn|sku>-<first 8 of uuid>`; `e2payment` = yes. Any `amount`-like key is 400 (strict schema).
- `sae`: answers 501 `sae_not_available` before any row is created (DEC-48).
- Order: rate limit (5 per minute per IP, 429) → reCAPTCHA (`verifyCaptcha` required; held → 400; no secret configured → allowed) → derive `paymentId` → existing row reused, else price, add `surchargePercent(gateway)`, sign, create `pending` row (500 if it cannot be written) → row not `pending` → 409 → portal row insert if none (failure → row `failed`, 500, no gateway call) → `createSession` (failure → row `failed`, 502, or 503 for configuration) → **202** `{ok, paymentId, redirectUrl, clientSecret?, intentId?}`, `Cache-Control: no-store`.

**Gateway clients** (`gateways/*.ts`, interface `Gateway { createSession, queryStatus }`; `getGateway(name)` returns the FakeGateway in fake mode, else runs `assertSandboxOnly` and returns the real client). Every outbound call goes through `external.ts externalCall`.

| Gateway | Session | Settlement | `queryStatus` |
|---|---|---|---|
| PayWay Net (`payway.ts`) | `POST {PAYWAY_BASE_URL}/RequestToken` (form: login, biller, merchant, `payment_reference` = invoice no., else the uuid without dashes, at most 20 characters, `payment_amount` from the row, `return_link_url` = `/pay/return/payway/?PaymentID&type&StudentName&StudentEmail&PaymentPurpose`, hidden fields `PaymentID`=uuid, `type=general`, payer and purpose; `provider` only when `PAYWAY_PROVIDER` or `paymentSite.paywayProvider` sets one (IHNA: none, so it is neither sent nor listed in the return URL); `reply_link_url` = `/api/payments/webhook/payway/` with post type `extended` only when `PAYWAY_NOTIFY_PASSWORD` is set) → redirect to `MakePayment?BillerCode=&token=`. Default host `https://payway.stgeorge.com.au`. Test = `PAYWAY_MERCHANT_ID=TEST`. | Browser return: `EncryptedParameters`+`Signature`, AES-128-CBC, zero IV, PKCS-7, signature = AES(MD5(text)) (`payway-crypto.ts`); bad signature → 400. Paid when `response_code` 00/08 and, if sent, `payment_status=approved` and `summary_code=0`. Notification: Basic auth or `username`/`password` fields vs `PAYWAY_NOTIFY_*` (401 otherwise), form or XML, paid when `fl_success=1` and `cd_response` 00/08. Both check the total PayWay charged (`payment_amount` in the return, `am_payment` in the notification; both include any PayWay surcharge, and the return has no surcharge field) against `amountCents`, which already holds our surcharge, so a PayWay-side surcharge is an `amount-mismatch` whichever message arrives first. Both use event id `payway-receipt:<receipt>`, so return + notification settle once. The notification answers 200 for ids that are not ours. | always `unknown` (no PayWay Net status API) |
| SecurePay (`securepay.ts`) | No remote call: `redirectUrl` = `/pay/securepay/<uuid>/`. | Charge endpoint (body `{paymentId, token}`, 10 per minute per IP; 404 in fake mode; 503 under dry run in production): OAuth client credentials (token cached) → `POST {api}/v2/payments {merchantCode, token, ip, amount (cents from the row), orderId=uuid}` with `Idempotency-Key`=uuid. Payment Object `status` paid/failed settles; `unknown` leaves the row pending with `chargeAttempted`; 4xx without a status is a non-retryable error, 5xx/429 retryable (502). `initiateOrder` (DCC/3DS2) exists but no page calls it. | `unknown` when `chargeAttempted` is set, else `pending` |
| Airwallex (`airwallex.ts`) | Login (`x-client-id`, `x-api-key`; token cached) → `POST /api/v1/pa/payment_intents/create {request_id=uuid, amount (major units), currency, merchant_order_id=uuid, return_url, metadata.paymentId}` → `redirectUrl` = `/pay/airwallex/<uuid>/`, `gatewayRef` = intent id. | Webhook: hex HMAC-SHA256(`x-timestamp` + raw body) with `AIRWALLEX_WEBHOOK_SECRET`, ±5 min, else 401. `payment_intent.succeeded` → paid for `captured_amount` (else `amount`); `payment_intent.cancelled` → failed; `refund.accepted`/`refund.settled` → refunded (found by `payment_intent_id`); others ignored. Unknown payments answer 200. | `GET payment_intents/{id}`: SUCCEEDED → paid, CANCELLED → failed, open states → pending, 404 → unknown |
| fake (`fake.ts`) | In-memory; `redirectUrl` = `/pay/fake/<uuid>/`. | Approve → paid for the stored amount; Decline → failed; Abandon → unchanged. | from the recorded decision |

**`settle(paymentId, outcome)`** (`settle.ts`): used by the PayWay return and notification, the SecurePay charge, the Airwallex webhook, `reconcilePending`, the result page and the fake gateway.
- Replayed event id → ignored. Stored amount failing its signature → `flagged` (`signature-mismatch`).
- Paid: the confirmed amount must equal `amountCents`, else `flagged` (`amount-mismatch`). A compare-and-set on `status` (`store.ts casStatus`, one SQL UPDATE) moves `pending|failed|expired` (plus `flagged` when the reason is `needs-manual-check`) to `paid` and queues `afterPaid`.
- Failed/cancelled/expired: only from `pending`; queues `afterPaid` for PayWay and `portalReturn` rows (portal cancel callback).
- Refunded: only from `paid`; finance is alerted; the portal row is not changed.
- Every flag mails finance.

**PayWay return for portal-started payments**: a decrypted `PaymentID` that is not a uuid is stored as `kind=portalReturn` (id derived from it, `portalPaymentId` = the portal's id, `payway.autoenrol` = `type` in `paymentSite.autoEnrolTypes`) and only forwarded to the portal callback. A `type=skilldemy` return sends the browser to `SKILLDEMY_RETURN_URL?status=<payment_status>` (https only, else our result page; `handlers.ts skilldemyReturnUrl`).

**`reconcilePending`** (`reconcile.ts`, job every 15 min on queue `payments`, cron `0 */15 * * * *`): up to 50 rows `pending` for more than 10 min and less than 7 days, oldest first. `queryStatus` paid/failed → `settle`; `unknown` → `flagged` `needs-manual-check` + finance mail; `pending` older than 24 h → `expired`. One row's error does not stop the others.

**`afterPaid`** (`after.ts runAfterPaid`, task in `src/jobs/afterPaid.ts`, queue `payments`): queued with `payload.jobs.queue` and run immediately after the response via `next/server after()`; the task retries 5 times with exponential backoff from 1 minute. Steps run in order; each step's state is kept in `payments.steps`, `done`/`skipped`/`dead` steps are not rerun, a failing step does not stop the others, and the 5th failure makes the step `dead` and mails finance; a dead step runs again only through `POST /api/payments/retry/` (§3).
1. `portalRow`: paid → `markPortalPaid`; failed/expired/cancelled → `recordPortalResponse`. Skipped for `portalReturn`.
2. `portalCallback` (PayWay only): GET on the portal chosen by `provider` (2 → `PORTAL_IHM_URL`, 3 → `PORTAL_HCLA_URL`, else or none → `PORTAL_IHNA_URL`) + `/academic/GenerateAutoEnrolInvoices/updatePayway` (paid), `/crm/IhnaOnlineAutoEnrolCourses/autoEnrolIhnaOnline` (paid, `payway.autoenrol`: `type` `autoenrol` or `ihnaonline`), `{PORTAL_SKILLDEMY_URL}/crm/SkilldemyApplications/multipleSkilldemyCourseEnrol` (paid, `type=skilldemy`, `paymentSite.skilldemy`) or `/academic/GenerateAutoEnrolInvoices/paywayPaymentCancel` (failed, Skilldemy included), with the decrypted PayWay params and `PaymentID` = the portal row id (portal-started payments forwarded as received). Our own PayWay payments carry `type=general` and no provider, so their callback is `updatePayway` / `paywayPaymentCancel` on `PORTAL_IHNA_URL`.
3. `receiptEmail` (paid): payer mail (subject "Your payment receipt: <site.siteName>") with the receipt link `{NEXT_PUBLIC_SITE_URL}/pay/receipt/<uuid>/?e=<email>`, and a finance notice.
4. `e2Fulfilment` (paid products): monday.com `create_item` on `MONDAY_E2_BOARD_ID`, item name `<paymentFor> - <payerName>`, `column_values` from the row under the board's column ids (`mondayColumnValues`: `MONDAY_E2_NAME_COLUMN` payer name, `MONDAY_E2_EMAIL_COLUMN` email, `MONDAY_E2_STUDENT_ID_COLUMN` student id, `MONDAY_E2_STATUS_COLUMN` + `MONDAY_E2_STATUS_LABEL` status label; an unset id leaves that column out) (skipped when `flags.monday.itemId` is stored) and a finance mail to enrol the student.
5. `saeProvision` (paid `sae`): only records planned Graph and Canvas calls; throws when not in dry run and all Graph/Canvas variables are set. No `sae` payment can be started (501), so it never runs on a real row.

Mail goes through the Payload email adapter (`mail.ts sendPaymentMail`).

**Jobs runner** (`src/jobs/index.ts`): `autoRun` on queue `payments` every minute in production, every 20 s in development; disabled when `NODE_ENV=test` or `ENQUIRY_AUTORUN=0`. The deploy target is the Docker image (00 "Deploy"), so the runner is `autoRun` inside the container's Node process; no external cron exists. `/api/payload-jobs/run` (`Authorization: Bearer $CRON_SECRET` or an admin session) runs a queue on demand.

**Modes**
- `PAYMENTS_GATEWAY_MODE`: `fake` (default unless `NODE_ENV=production`) uses the FakeGateway for every gateway and `externalCall` never contacts a gateway host; `real` (default in production) uses the clients. `fake` in production throws (DEC-48).
- Dry run (`config.ts isDryRun`; the portal write guard uses the same rule, `isPaymentsDryRun` in `src/lib/portal/payments-write.ts`): `PAYMENTS_DRY_RUN`, else `DRY_RUN`, else `1`; an empty value counts as unset, so `PAYMENTS_DRY_RUN=` follows `DRY_RUN`; `1` means dry (DEC-50, `tests/payments/dry-run-empty.test.ts`). Under dry run `externalCall` logs the request (host, path, masked body) to `dryRunLog` and returns a synthetic answer: PayWay and Airwallex sessions redirect to `/pay/fake/<uuid>/`; the SecurePay page shows a dry-run button whose charge is simulated as paid (refused in production); portal callbacks, monday.com, Graph and Canvas are logged, not sent, and their missing variables are tolerated; payment mail is sent only to a local mail catcher (Mailpit), otherwise skipped; portal writes are refused unless `PORTAL_DB_HOST` is local (`127.0.0.1`, `localhost`, `::1`, `portal-mysql`).
- `PAYMENTS_ALLOW_PRODUCTION=1` is required before a real client may use a production host (`api.airwallex.com`, `payments.auspost.net.au`, `welcome.api2.auspost.com.au`) or a PayWay merchant other than `TEST`. Under dry run a production target is refused even with it. Enforced in `assertSandboxOnly` (`gateways/index.ts`), again in `externalCall`, and in PayWay `createSession`.
- Hosts (`gateways/endpoints.ts`): `AIRWALLEX_ENV=demo|prod` → `https://api-demo.airwallex.com` | `https://api.airwallex.com`; `SECUREPAY_ENV=sandbox|live` → `https://payments-stest.npe.auspost.zone` + `https://welcome.api2.sandbox.auspost.com.au/oauth/token` | `https://payments.auspost.net.au` + `https://welcome.api2.auspost.com.au/oauth/token`; `*_URL` variables override. Sandbox = `PAYMENTS_GATEWAY_MODE=real`, `DRY_RUN=0`, `PAYMENTS_ALLOW_PRODUCTION=0`, `AIRWALLEX_ENV=demo`, `SECUREPAY_ENV=sandbox`, `PAYWAY_MERCHANT_ID=TEST`; production additionally `PAYMENTS_ALLOW_PRODUCTION=1`, `AIRWALLEX_ENV=prod`, `SECUREPAY_ENV=live`, a live merchant id (DEC-52).
- PayWay accepts token requests only from IPs on the facility's allowlist (Setup Net > Security Information).

**Env** (validated in `src/env.ts`; names in `.env.example`)
- General: `NEXT_PUBLIC_SITE_URL`, `DRY_RUN`, `PAYMENTS_DRY_RUN`, `PAYMENTS_GATEWAY_MODE`, `PAYMENTS_ALLOW_PRODUCTION`, `PAYMENTS_DATA_KEY` (HMAC key; required in production, derived from `PAYLOAD_SECRET` elsewhere), `PAYMENTS_MAX_INVOICE_AMOUNT`, `PAYMENTS_FINANCE_TO`, `PAYMENTS_SURCHARGE_{PAYWAY,SECUREPAY,AIRWALLEX}_PERCENT` (0 < n ≤ 10, default 0), `CRON_SECRET`, `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RATE_LIMIT_STORE`
- Portal DB: `PORTAL_DB_HOST`, `PORTAL_DB_PORT`, `PORTAL_DB_NAME` (`ihna_portal`), `PORTAL_DB_PAY_USER`, `PORTAL_DB_PAY_PASSWORD`
- PayWay: `PAYWAY_BASE_URL`, `PAYWAY_BILLER_CODE`, `PAYWAY_MERCHANT_ID`, `PAYWAY_USERNAME`, `PAYWAY_PASSWORD`, `PAYWAY_ENCRYPTION_KEY` (base64 of 16 bytes), `PAYWAY_NOTIFY_USERNAME`, `PAYWAY_NOTIFY_PASSWORD`, `PAYWAY_PROVIDER` (digits; unset = none)
- SecurePay: `SECUREPAY_ENV`, `SECUREPAY_AUTH_URL`, `SECUREPAY_API_URL`, `SECUREPAY_CLIENT_ID`, `SECUREPAY_CLIENT_SECRET`, `SECUREPAY_MERCHANT_CODE`, `SECUREPAY_UI_CLIENT_ID`, `SECUREPAY_DCC`
- Airwallex: `AIRWALLEX_ENV`, `AIRWALLEX_API_URL`, `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET`
- Portal callbacks: `PORTAL_IHM_URL`, `PORTAL_HCLA_URL`, `PORTAL_IHNA_URL`, `PORTAL_SKILLDEMY_URL` (https URL or empty, validated), `SKILLDEMY_RETURN_URL` (used only when https)
- Signed invoice links: `PORTAL_INVOICE_LINK_KEY`, `PORTAL_INVOICE_LINK_MAX_DAYS`
- monday.com: `MONDAY_API_TOKEN`, `MONDAY_E2_BOARD_ID`, `MONDAY_E2_NAME_COLUMN`, `MONDAY_E2_EMAIL_COLUMN`, `MONDAY_E2_STUDENT_ID_COLUMN`, `MONDAY_E2_STATUS_COLUMN`, `MONDAY_E2_STATUS_LABEL` (column ids from the live board)
- Microsoft Graph and Canvas (read only by `saeProvision`): `MSGRAPH_TENANT_ID`, `MSGRAPH_CLIENT_ID`, `MSGRAPH_CLIENT_SECRET`, `MSGRAPH_LICENSE_SKU_ID`, `CANVAS_URL`, `CANVAS_ACCOUNT_ID`, `CANVAS_TOKEN`

**Credential check**: `VERIFY_GATEWAYS=1 npm run verify:gateways` (`scripts/dev/verify-gateways.ts`, DEC-49) runs auth-only calls: SecurePay OAuth token, Airwallex login, PayWay key round trip + host reachability, and with `VERIFY_PAYWAY_TOKEN=1` a PayWay cart token request (proves login, biller code and IP allowlist; the token is discarded). No order, intent or charge is created; production endpoints are skipped without `PAYMENTS_ALLOW_PRODUCTION=1`; values are never printed.

## 7. Import / seed
- `src/collections/seed/products.ts` defines the 12 E2 products (`seedProducts`, idempotent on `sku`): `legacyE2Btn` 1–6 preparation packages (IELTS Academic, IELTS General, PTE, OET Nurses, OET Doctors, TOEFL), AUD 150.00, 3 months; 7–12 mock tests (IELTS General, IELTS Academic, PTE, TOEFL, OET Nurses, OET Doctors), AUD 50.00. All `gateways` = securepay + airwallex. `npm run seed:products` (`scripts/dev/seed-products.ts`) runs it against `DATABASE_URL` in any environment after `npm run payload migrate`; existing products are never changed, so prices finance edits in the admin stay. The test helpers (`tests/payments/helpers.ts`, `tests/collections/content.test.ts`) call it too.
- No payment history is imported.

## 8. Acceptance checks
Node tests (`npm run test:int`; need the Docker portal fixture on port 3308: `docker compose up -d portal-mysql && bash docker/portal-fixtures/load.sh`) in `tests/payments/`:
1. `payway-crypto.test.ts`: fixture decrypts; tampered signature, altered ciphertext, wrong or missing key throw.
2. `airwallex-webhook.test.ts`: valid → paid; altered body, wrong secret, stale timestamp → 401; replay → one transition, one job, one receipt; amount mismatch → flagged; refund only from paid.
3. `start-contract.test.ts`: product with `amount` → 400; stored total = server price for all 12; PayWay for a product → 400; invoice amounts validated; idempotent on `submissionId`; 5 per minute; SAE → 501; gateway outage → 502 and `failed`.
4. `row-first.test.ts`: portal insert fails → 500, no `createSession`, row `failed`.
5. `return-amount.test.ts`: PayWay return amount mismatch → flagged; bad signature → 400; replay → one job; portal-started payment → `portalReturn`.
6. `gateway-flows.test.ts`: PayWay notification settles once with the return; SecurePay `unknown` → pending → `needs-manual-check`.
7. `gateway-contracts.test.ts`: exact requests per gateway against mocked fetch.
8. `aftersteps.test.ts`: two failures then success → `attempts=3`; 5th failure → `dead`; monday item created once. `retry.test.ts`: retry resets only dead steps and queues once; the route is admin/finance only. `monday-columns.test.ts`: column ids from env, unset ids left out.
9. `reconcile.test.ts`: pending 11 min with fake paid → paid and receipt; < 10 min untouched; 24 h → expired; PayWay → flagged.
10. `dry-run.test.ts`: dry run never calls fetch; production host refused under dry run and without `PAYMENTS_ALLOW_PRODUCTION=1`; fake mode refused in production. `dry-run-empty.test.ts`: an empty `PAYMENTS_DRY_RUN` follows `DRY_RUN`.
11. `ihna-portal-callbacks.test.ts`: no provider → `PORTAL_IHNA_URL` (2 → `PORTAL_IHM_URL`, 3 → `PORTAL_HCLA_URL`); `autoenrol` and `ihnaonline` → autoEnrolIhnaOnline; `type=skilldemy` → Skilldemy enrol when paid, provider portal cancel when failed, browser back to `SKILLDEMY_RETURN_URL` (https only).
12. `portal-write-columns.test.ts` (insert writes `ip_address`, the fixture has it), `portal-user.test.ts` (PAY user cannot DELETE or touch other tables or columns), `webhook-slash.test.ts` (the trailing-slash rules leave only `/airwallex-webhook` alone), `purchase-event.test.ts`, `flow.test.ts`, `receipt.test.ts`, `jobs.test.ts`, `csp.test.ts`, `no-raw-sql.test.ts`.

Page tests (`npm run test:blocks`): `tests/payments/pages.test.tsx` (`/pay-online/` incl. the signed invoice prefill: refused when tampered or expired; an unsigned bare number is not pre-filled; the chooser passes `invoice_id`, `exp`, `sig` on; `/secure-pay/` and `/airwallex/` preselection, the four info pages, no `/makepayment/` route, `/payment-options/` incl. `?e2btn=1,6,7,12`, receipt 404s, result page, fake page 404 in production).

URL statuses on the dev server (`npm run dev -- -p 3001`):
```
for p in /pay-online/ /payment-options/ /secure-pay/ /airwallex/ /secure-pay-card-dcc/ /airwallex-checkout/ /secure-pay-response/ /payway-response/ /airwallex-webhook/ /pay-online-error/ /commonwealth-prac-payment/ /makepayment/; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3001$p")" "$p"; done
```
Every path answers 200 except `/makepayment/` (404). The parity crawl (`scripts/parity/out/parity-ihna.csv`) has the eleven 200 paths as OK or ACCEPTED.

End to end (`npm run test:e2e:payments`, dev server at `PLAYWRIGHT_BASE_URL`, else `NEXT_PUBLIC_SITE_URL`, default :3001, fake mode, Docker portal, Mailpit; the gateway test secrets `PAYWAY_ENCRYPTION_KEY` and `AIRWALLEX_WEBHOOK_SECRET` are set in the test process by `usePaymentsEnv` (`tests/payments/helpers.ts`), never in the dev `.env`): `tests/e2e/payments/payments.pay.e2e.spec.ts` (fake invoice → approve → receipt with right/wrong email, tamper, reconcile, E2 chooser, E2 amount → 400, SAE 501) and `ihna-urls.pay.e2e.spec.ts` (every IHNA payment URL's status, `/secure-pay/` → paid → receipt; a wrongly signed event to `/airwallex-webhook/` and `/airwallex-webhook` is refused by the handler (401, no 308) and a PayWay return with a bad signature at `/payway-response/` is 400 from the return handler; the same handlers with the test secrets settle the Airwallex payment once, flag a wrong amount, and settle the PayWay return to its result page).

## 9. Differences from ihm-web
The pipeline files are shared (`SHARED-FILES.md`); IHNA's site values live in `src/content/payments.ts` (`paymentSite`, DEC-109) and `site.payPath`.
- Pay form: `/pay-online/` (DEC-11); ihm-web's is `/makepayment/`, which is 404 on IHNA.
- Old payment URLs (DEC-45): `/secure-pay/` and `/airwallex/` preselect a gateway, three info pages, `/payway-response/` rewritten to the return handler only with `EncryptedParameters` (ihm-web's `/payway-response/` route re-exports the return handler for every GET), `/airwallex-webhook/` POST, also without the slash (`site.postWithoutSlash`; ihm-web has none).
- PayWay `provider`: none (callbacks go to `PORTAL_IHNA_URL`); ihm-web sends 2 on every payment.
- Auto-enrol `type` values `autoenrol` and `ihnaonline`; ihm-web only `autoenrol`. Skilldemy payments (`type=skilldemy`) exist only on IHNA.
- Portal row: database `ihna_portal`, IP column `ip_address`; ihm-web writes `ip_addr` into `ihmedu_portal`.
- Signed, expiring invoice links (DEC-106); ihm-web's pay form takes a plain `invoice_id`.
- Mail subject prefix `[IHNA payments]` and `site.siteName` in the receipt; ihm-web hard-codes `[IHM payments]`.
- Convera and Flywire links and the "payment for" suggestions are IHNA's (`paymentSite`).

## 10. Open questions
- `pay_online` posts: other systems send `type=ihnaonline` payments to `/wp-admin/admin-post.php?action=pay_online` with the amount, `course_id` and `fee_type` set by the sender (old theme `functions.php` `pay_online_submit`); `/wp-admin/*` answers 410 (proxy) and no route accepts them (rule 6). Who sends them, and can the portal sign the amount or expose an invoice API?
- Signed invoice links: the portal must generate `exp` and `sig` (HMAC of `invoice:<id>:<exp>`) with `PORTAL_INVOICE_LINK_KEY` before `?invoice_id=` links prefill anything (blocked on live `ihna_portal` access). A valid link stays in the pay form's URL, which GTM, GA4 and Clarity see as the page location until it expires. A signed link fixes the invoice number, not the amount (DEC-23): does finance want signed invoices locked to the amount due?
- Skilldemy PayWay payments: still in use? Production callback contract and return URL.
- E2 and the portals: the old theme's PayWay response handler (`template-payway-response.php:152`) marks E2 payments `provider=2` (the portal at `PORTAL_IHM_URL`). E2 products here offer SecurePay and Airwallex only, which call no portal. Confirm with the portal owner which portal must learn of an E2 payment.
- Gateway sandboxes (PayWay test facility, SecurePay, Airwallex demo): blocked on access; payments run in fake mode and dry run until then (DEC-48).
- SAE payments: `sae` answers 501 and `saeProvision` only plans its calls; the `saeApplications` data and live Graph/Canvas provisioning do not exist (DEC-48).
- Surcharge: per-gateway percentages default to 0 until finance sets them.
- SecurePay DCC: refused, because the foreign amount would come from the browser. Finance to confirm AUD-only SecurePay, and whether PayWay stays enabled for IHNA.
- E2 chooser: the live IHNA chooser offers Flywire for E2 products; here a product shows only its `products.gateways` (SecurePay and Airwallex). Finance decides whether a product's gateways change.
- Airwallex dashboard: confirm the configured webhook URL (`/airwallex-webhook/`, with or without the slash, or `/api/payments/webhook/airwallex/`); `reconcilePending` covers a missed webhook within about 15 min.
- Portal callbacks for SecurePay and Airwallex: only PayWay calls the portal.
- Refunds: recorded as `refunded` with a finance alert; the portal row is not changed.
- PayWay status lookup: pending PayWay rows without a notification are flagged for a manual check; a REST lookup needs a separate key and a confirmed reference mapping.
- Student discount: `studentDiscountPercent` exists on products but is not applied.
- Portal `payments` column names follow the old theme's code until the live table definition is confirmed (`payments-write.ts`, 50 §10).

**Rotation list** (env names only)
- PayWay: `PAYWAY_ENCRYPTION_KEY`, `PAYWAY_USERNAME`, `PAYWAY_PASSWORD`, `PAYWAY_NOTIFY_USERNAME`, `PAYWAY_NOTIFY_PASSWORD`, `PAYWAY_BILLER_CODE`, `PAYWAY_MERCHANT_ID`
- SecurePay: `SECUREPAY_CLIENT_ID`, `SECUREPAY_CLIENT_SECRET`, `SECUREPAY_UI_CLIENT_ID`, `SECUREPAY_MERCHANT_CODE`
- Airwallex: `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET`
- Portal DB: `PORTAL_DB_PAY_PASSWORD`
- Signed invoice links: `PORTAL_INVOICE_LINK_KEY` (rotating it voids every link the portal has issued)
- monday.com: `MONDAY_API_TOKEN`
- Microsoft Graph: `MSGRAPH_CLIENT_SECRET`
- Canvas: `CANVAS_TOKEN`
- Internal: `CRON_SECRET`; `PAYMENTS_DATA_KEY` (rotating it invalidates the amount signatures of unsettled rows, which then settle as `flagged`)
