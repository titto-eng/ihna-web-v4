// afterPaid (45 §6): five retried steps after a payment settles. Each step's state lives in `payments.steps` (step, status, attempts),
// so a retried job skips what is done and only repeats what failed. Every external call goes through `externalCall`: DRY_RUN=1 logs, never sends.
import type { Payload } from 'payload'
import { paymentSite } from '@/content/payments'
import { site } from '@/content/site'
import { markPortalPaid, recordPortalResponse, type PortalFacts } from '@/lib/portal/payments-write'
import { envValue, financeRecipients, isDryRun, PaymentsConfigError, siteUrl } from './config'
import { externalCall, expectOk } from './external'
import { centsToDecimal, formatAud } from './money'
import { sendPaymentMail } from './mail'
import { findPayment, patchPayment } from './store'
import type { PaymentRow } from './types'

export const STEP_NAMES = ['portalRow', 'portalCallback', 'receiptEmail', 'e2Fulfilment', 'saeProvision'] as const
export type StepName = (typeof STEP_NAMES)[number]
export const MAX_STEP_ATTEMPTS = 5

export type StepCtx = { payload: Payload; row: PaymentRow; env?: Record<string, string | undefined> }
export type StepFn = (ctx: StepCtx) => Promise<'done' | 'skipped'>

// ---- 1. portalRow ---------------------------------------------------------------------------------------------------------

/** Gateway facts mapped to the portal's own columns (45 §2). SecurePay writes `sp_*`, Airwallex `aw_intent_id`, PayWay the three response columns. */
export function portalFactsFor(row: PaymentRow): PortalFacts {
  const g = row.flags.gateway ?? {}
  const base: PortalFacts = { gateway: row.gateway }
  if (row.gateway === 'securepay') {
    return { ...base, spStatus: g.paymentStatus, spBankTransactionId: g.bankTransactionId, spResponseCode: g.responseCode, spResponseMessage: g.responseMessage, spOrderId: g.orderId, spDccOrderId: g.dccOrderId }
  }
  if (row.gateway === 'airwallex') return { ...base, awIntentId: g.intentId }
  return { ...base, paymentNumber: g.paymentNumber, responseCode: g.responseCode, paymentStatus: g.paymentStatus, type: row.flags.payway?.type }
}

export const portalRowStep: StepFn = async ({ row }) => {
  if (row.kind === 'portalReturn' || !row.portalPaymentId) return 'skipped' // the portal that started that payment already owns its row
  if (row.status === 'paid') {
    await markPortalPaid(row.portalPaymentId, row.amountCents, portalFactsFor(row), row.settledAt ? new Date(row.settledAt) : new Date())
    return 'done'
  }
  if (row.status === 'failed' || row.status === 'expired' || row.status === 'cancelled') {
    await recordPortalResponse(row.portalPaymentId, portalFactsFor(row))
    return 'done'
  }
  return 'skipped'
}

// ---- 2. portalCallback (PayWay only, as today: T/template-payway-response.php:378-460) ------------------------------------

type PortalName = 'ihm' | 'hcla' | 'ihna' | 'skilldemy'
const PORTAL_URL_ENV: Record<PortalName, string> = { ihm: 'PORTAL_IHM_URL', hcla: 'PORTAL_HCLA_URL', ihna: 'PORTAL_IHNA_URL', skilldemy: 'PORTAL_SKILLDEMY_URL' }
/** `provider` hidden field: 2 = IHM, 3 = HCLA, anything else (or none) = IHNA. */
export const portalForProvider = (provider: number | undefined): 'ihm' | 'hcla' | 'ihna' => (provider === 2 ? 'ihm' : provider === 3 ? 'hcla' : 'ihna')

/** `type=skilldemy` (paid) goes to the Skilldemy portal when the site handles it (IHNA, template-payway-response.php:324-331). */
const isSkilldemy = (row: PaymentRow): boolean => paymentSite.skilldemy && row.flags.payway?.type === 'skilldemy'

/**
 * The callback from template-payway-response.php: paid -> updatePayway, autoEnrolIhnaOnline (autoenrol types) or, for Skilldemy,
 * multipleSkilldemyCourseEnrol on the Skilldemy portal; failed -> paywayPaymentCancel on the provider's portal (Skilldemy included, as before).
 */
export function portalCallbackTarget(row: PaymentRow): { portal: PortalName; path: string } | null {
  if (row.status === 'paid') {
    if (isSkilldemy(row)) return { portal: 'skilldemy', path: '/crm/SkilldemyApplications/multipleSkilldemyCourseEnrol' }
    const path = row.flags.payway?.autoenrol ? '/crm/IhnaOnlineAutoEnrolCourses/autoEnrolIhnaOnline' : '/academic/GenerateAutoEnrolInvoices/updatePayway'
    return { portal: portalForProvider(row.flags.payway?.provider), path }
  }
  if (row.status === 'failed') return { portal: portalForProvider(row.flags.payway?.provider), path: '/academic/GenerateAutoEnrolInvoices/paywayPaymentCancel' }
  return null
}

/** The callback path alone (kept for callers and tests that only need the path). */
export const portalCallbackPath = (row: PaymentRow): string | null => portalCallbackTarget(row)?.path ?? null

export const portalCallbackStep: StepFn = async ({ row, env }) => {
  if (row.gateway !== 'payway') return 'skipped' // SecurePay and Airwallex never called the portal (45 §10: open decision)
  const target = portalCallbackTarget(row)
  if (!target) return 'skipped'
  const { path, portal: which } = target
  const provider = row.flags.payway?.provider
  const base = envValue(PORTAL_URL_ENV[which], env ?? process.env)
  if (!base && !isDryRun(env ?? process.env)) throw new PaymentsConfigError(`${PORTAL_URL_ENV[which]} is not set`)
  // The portal expects its OWN row id in PaymentID; our uuid stays on our side. Portal-started payments are forwarded as received.
  const params: Record<string, string> = row.flags.payway?.params
    ? { ...row.flags.payway.params, ...(row.portalPaymentId && row.kind !== 'portalReturn' ? { PaymentID: row.portalPaymentId } : {}) }
    : {
        PaymentID: row.portalPaymentId ?? '', payment_amount: centsToDecimal(row.amountCents), payment_reference: row.invoiceNo ?? '',
        response_code: row.status === 'paid' ? '00' : '05', payment_number: row.gatewayRef ?? '', type: row.flags.payway?.type ?? 'general',
        ...(provider === undefined ? {} : { provider: String(provider) }), // IHNA sends no provider (portalForProvider: none = IHNA)
      }
  const url = `${(base ?? 'https://portal.invalid').replace(/\/$/, '')}${path}?${new URLSearchParams(params).toString()}`
  expectOk(await externalCall({ service: 'portal', note: `callback ${path.split('/').pop()}`, method: 'GET', url, encoding: 'none' }), 'portal callback')
  return 'done'
}

// ---- 3. receiptEmail ------------------------------------------------------------------------------------------------------

export const receiptUrl = (row: Pick<PaymentRow, 'paymentId' | 'payerEmail'>) => `${siteUrl()}/pay/receipt/${row.paymentId}/?e=${encodeURIComponent(row.payerEmail ?? '')}`

export const receiptEmailStep: StepFn = async ({ payload, row, env }) => {
  if (row.status !== 'paid') return 'skipped'
  if (row.payerEmail) {
    await sendPaymentMail(payload, {
      to: [row.payerEmail],
      subject: `Your payment receipt: ${site.siteName}`,
      text: `Hi ${row.payerName || 'there'},\n\nThank you. We have received your payment of ${formatAud(row.amountCents)}${row.paymentFor ? ` for ${row.paymentFor}` : ''}.\n\nYour receipt: ${receiptUrl(row)}\nReference: ${row.paymentId}\n\n${site.siteName}`,
    }, env)
  }
  await sendPaymentMail(payload, {
    to: financeRecipients(env ?? process.env),
    subject: `${paymentSite.mailTag} Payment received: ${formatAud(row.amountCents)} (${row.gateway})`,
    text: `Payment ${row.paymentId}\nGateway: ${row.gateway}\nKind: ${row.kind}\nAmount: ${formatAud(row.amountCents)}\nInvoice/reference: ${row.invoiceNo ?? '-'}\nPayer: ${row.payerName ?? '-'} <${row.payerEmail ?? '-'}>\nFor: ${row.paymentFor ?? '-'}`,
  }, env)
  return 'done'
}

// ---- 4. e2Fulfilment (T/functions.php:2486-2530): staff email + monday.com item, skipped when an item id is already stored -----------

/**
 * monday.com `column_values` for the E2 item. Column ids belong to the board, so each is configured: MONDAY_E2_NAME_COLUMN (text, payer name),
 * MONDAY_E2_EMAIL_COLUMN (email), MONDAY_E2_STUDENT_ID_COLUMN (text), MONDAY_E2_STATUS_COLUMN + MONDAY_E2_STATUS_LABEL (status label, e.g. the
 * brand). An unset id leaves that column out; the item name carries the product and payer either way.
 */
export function mondayColumnValues(row: Pick<PaymentRow, 'payerName' | 'payerEmail' | 'studentId'>, env: Record<string, string | undefined> = process.env): Record<string, unknown> {
  const col = (n: string) => envValue(n, env)
  const out: Record<string, unknown> = {}
  const name = col('MONDAY_E2_NAME_COLUMN')
  if (name && row.payerName) out[name] = row.payerName
  const email = col('MONDAY_E2_EMAIL_COLUMN')
  if (email && row.payerEmail) out[email] = { email: row.payerEmail, text: row.payerEmail }
  const student = col('MONDAY_E2_STUDENT_ID_COLUMN')
  if (student && row.studentId) out[student] = row.studentId
  const status = col('MONDAY_E2_STATUS_COLUMN')
  const label = col('MONDAY_E2_STATUS_LABEL')
  if (status && label) out[status] = { label }
  return out
}

export const e2FulfilmentStep: StepFn = async ({ payload, row, env }) => {
  if (row.status !== 'paid' || row.kind !== 'product') return 'skipped'
  if (!row.flags.monday?.itemId) {
    const token = envValue('MONDAY_API_TOKEN', env ?? process.env)
    const board = envValue('MONDAY_E2_BOARD_ID', env ?? process.env)
    if ((!token || !board) && !isDryRun(env ?? process.env)) throw new PaymentsConfigError('MONDAY_API_TOKEN and MONDAY_E2_BOARD_ID are required for E2 fulfilment')
    const res = await externalCall(
      {
        service: 'monday', note: 'create E2 item', method: 'POST', url: 'https://api.monday.com/v2', headers: { authorization: token ?? '<env:MONDAY_API_TOKEN>' },
        body: {
          query: 'mutation ($board: ID!, $name: String!, $cols: JSON!) { create_item(board_id: $board, item_name: $name, column_values: $cols) { id } }',
          variables: { board: board ?? '0', name: `${row.paymentFor ?? 'E2 order'} - ${row.payerName ?? ''}`.trim(), cols: JSON.stringify(mondayColumnValues(row, env ?? process.env)) },
        },
      },
      { dryResponse: { data: { create_item: { id: 'dry-run' } } } },
    )
    if (!res.dryRun) {
      expectOk(res, 'monday create_item')
      const id = (res.json as { data?: { create_item?: { id?: string } } } | null)?.data?.create_item?.id
      if (!id) throw new Error('monday create_item returned no id')
      await patchPayment(payload, row, { flags: { ...row.flags, monday: { itemId: String(id) } } })
    }
  }
  await sendPaymentMail(payload, {
    to: financeRecipients(env ?? process.env),
    subject: `${paymentSite.mailTag} E2 order to fulfil: ${row.paymentFor ?? ''}`,
    text: `E2 payment ${row.paymentId}\nProduct: ${row.paymentFor}\nAmount: ${formatAud(row.amountCents)}\nStudent: ${row.payerName} <${row.payerEmail}>\n\nEnrol the student in the English test tool (Canvas EAP).`,
  }, env)
  return 'done'
}

// ---- 5. saeProvision (T/functions.php:4987-5290): Graph user + licence, Canvas user, welcome email without the password ---------------

export const saeProvisionStep: StepFn = async ({ row, env }) => {
  if (row.status !== 'paid' || row.kind !== 'sae') return 'skipped'
  const have = ['MSGRAPH_TENANT_ID', 'MSGRAPH_CLIENT_ID', 'MSGRAPH_CLIENT_SECRET', 'MSGRAPH_LICENSE_SKU_ID', 'CANVAS_URL', 'CANVAS_ACCOUNT_ID', 'CANVAS_TOKEN'].every((n) => envValue(n, env ?? process.env))
  // DRY_RUN until Graph and Canvas credentials exist (45 §10). The live path also needs `saeApplications`, which is not built yet.
  await externalCall({ service: 'graph', note: 'create user and assign licence (planned)', method: 'POST', url: 'https://graph.microsoft.com/v1.0/users', body: { accountEnabled: true } }, { dryResponse: {}, dry: true })
  await externalCall({ service: 'canvas', note: 'create user (planned)', method: 'POST', url: 'https://canvas.invalid/api/v1/accounts/0/users', body: { user: {} } }, { dryResponse: {}, dry: true })
  if (!isDryRun(env ?? process.env) && have) throw new PaymentsConfigError('SAE live provisioning is not built: it needs saeApplications and a stored temporary password')
  return 'done'
}

// ---- runner ----------------------------------------------------------------------------------------------------------------

const DEFAULT_STEPS: Record<StepName, StepFn> = {
  portalRow: portalRowStep, portalCallback: portalCallbackStep, receiptEmail: receiptEmailStep, e2Fulfilment: e2FulfilmentStep, saeProvision: saeProvisionStep,
}

export type AfterPaidResult = { failed: StepName[]; dead: StepName[]; done: StepName[] }
export type AfterPaidDeps = { steps?: Partial<Record<StepName, StepFn>>; env?: Record<string, string | undefined>; maxAttempts?: number }

/**
 * Runs the steps in order, skipping those already `done`/`skipped`/`dead`. A failing step does not stop the others (a down portal must not
 * block the receipt). Attempts are counted per step; the 5th failure makes it `dead` and alerts finance. The caller throws while `failed` is non-empty.
 */
export async function runAfterPaid(payload: Payload, paymentId: string, deps: AfterPaidDeps = {}): Promise<AfterPaidResult> {
  const steps = { ...DEFAULT_STEPS, ...deps.steps }
  const max = deps.maxAttempts ?? MAX_STEP_ATTEMPTS
  const out: AfterPaidResult = { failed: [], dead: [], done: [] }
  let row = await findPayment(payload, paymentId)
  if (!row) return out
  const newlyDead: { step: StepName; error: string }[] = []

  for (const name of STEP_NAMES) {
    row = (await findPayment(payload, paymentId)) ?? row
    const state = row.steps.find((s) => s.step === name)
    if (state && ['done', 'skipped', 'dead'].includes(state.status ?? '')) {
      if (state.status === 'dead') out.dead.push(name)
      else out.done.push(name)
      continue
    }
    const attempts = (state?.attempts ?? 0) + 1
    let status: string
    let error = ''
    try {
      status = await steps[name]({ payload, row, env: deps.env })
    } catch (e) {
      error = e instanceof Error ? e.message : 'error'
      status = attempts >= max ? 'dead' : 'failed'
      console.error(`[afterPaid] ${paymentId} step ${name} attempt ${attempts} failed: ${error.slice(0, 200)}`)
    }
    row = (await findPayment(payload, paymentId)) ?? row // a step may have stored flags (monday item id)
    const next = [...row.steps.filter((s) => s.step !== name), { step: name, status, attempts }]
    await patchPayment(payload, row, { steps: next })
    if (status === 'failed') out.failed.push(name)
    else if (status === 'dead') { out.dead.push(name); newlyDead.push({ step: name, error }) } else out.done.push(name)
  }

  if (newlyDead.length) {
    try {
      await sendPaymentMail(payload, {
        to: financeRecipients(deps.env ?? process.env),
        subject: `${paymentSite.mailTag} ${newlyDead.length} post-payment step(s) failed for good`,
        text: `Payment ${paymentId} is paid but these steps gave up after ${max} attempts:\n${newlyDead.map((d) => `- ${d.step}: ${d.error.slice(0, 160)}`).join('\n')}\n\nFix the cause, then re-run them: POST ${siteUrl()}/api/payments/retry/ with {"paymentIds":["${paymentId}"]} from an admin or finance session (45 §3).`,
      }, deps.env)
    } catch (e) { console.error('[afterPaid] dead-step alert failed', e instanceof Error ? e.message : e) }
  }
  return out
}
