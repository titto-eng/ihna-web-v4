import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The mail transport is a mock nodemailer transport handed to Payload's real nodemailer adapter: nothing here can reach a mail server
// (no DNS, no socket). The question is only whether a send was attempted.
const sendMail = vi.fn(async () => ({ messageId: 'x' }))
// IHM's form registry (its subject map gives 'IHM : Quick Enquiry' to a form without its own subject)
vi.mock('@/content/forms', () => import('./fixtures/forms'))

const { runAdapter } = await import('@/lib/adapters')
const { isLocalMailCatcher } = await import('@/lib/enquiries/config')
const { sendInternalMail } = await import('@/lib/adapters/email')
const { nodemailerAdapter } = await import('@payloadcms/email-nodemailer')

const routing = { recipientGroups: [{ key: 'marketing', to: ['marketing@example.test'], cc: [] }], alertTo: [], defaultSourceId: 24 }
const input = (env: Record<string, string>) => ({
  enquiry: { id: 1, publicId: 'p1', submissionId: 's1', formKey: 'quick-enquiry', firstName: 'A', lastName: 'B', email: 'a@example.test', data: { firstName: 'A' } },
  form: { key: 'quick-enquiry', fields: [{ name: 'firstName', type: 'text' as const, label: 'First name' }], destinations: [] },
  destination: { adapter: 'email' as const, config: { recipientGroup: 'marketing' } },
  target: 'marketing', campaign: null, course: null, campus: null, routing, sourceId: 24, env,
})

/** A payload whose sendEmail goes through the real nodemailer adapter, with the mock transport. */
async function payloadFor() {
  const adapter = (await nodemailerAdapter({ defaultFromAddress: 'no-reply@example.test', defaultFromName: 'IHM', transport: { sendMail, verify: async () => true } as never, skipVerify: true }))({ payload: {} as never }) as unknown as { sendEmail: (m: unknown) => Promise<unknown> }
  return { sendEmail: adapter.sendEmail } as never
}

beforeEach(() => sendMail.mockClear())
afterEach(() => vi.unstubAllEnvs())

describe('DRY_RUN never sends real email', () => {
  it('SMTP_HOST=smtp.example.com with DRY_RUN=1: recorded in the row, nothing sent', async () => {
    const env = { DRY_RUN: '1', NODE_ENV: 'test', SMTP_HOST: 'smtp.example.com', SMTP_PORT: '587' }
    const payload = await payloadFor()
    const out = await runAdapter({ ...input(env), payload })
    expect(out.status).toBe('dry_run')
    expect(sendMail).not.toHaveBeenCalled()
    const rec = out.dryRunRequest as { message: { to: string[]; subject: string }; mailpit?: string }
    expect(rec.message.to).toEqual(['marketing@example.test'])
    expect(rec.message.subject).toBe('IHM : Quick Enquiry')
    expect(rec.mailpit).toBeUndefined()
    // the dead-delivery alert obeys the same rule
    expect(await sendInternalMail(payload, { to: ['tech@example.test'], subject: 's', text: 't' }, env)).toBe('skipped')
    expect(sendMail).not.toHaveBeenCalled()
  })

  it.each([['mail.example.org', '1025'], ['smtp.sendgrid.net', '25'], ['10.0.0.5', '1025'], ['localhost.evil.test', '1025'], ['localhost', '587'], ['localhost', '25']])('%s:%s is not a dev mail catcher', async (host, port) => {
    const env = { DRY_RUN: '1', NODE_ENV: 'test', SMTP_HOST: host, SMTP_PORT: port }
    expect(isLocalMailCatcher(env)).toBe(false)
    await runAdapter({ ...input(env), payload: await payloadFor() })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('a Resend key always means no send under DRY_RUN, even with a localhost SMTP_HOST', async () => {
    const env = { DRY_RUN: '1', NODE_ENV: 'test', SMTP_HOST: 'localhost', SMTP_PORT: '1025', RESEND_API_KEY: 'not-a-real-key' }
    expect(isLocalMailCatcher(env)).toBe(false)
    await runAdapter({ ...input(env), payload: await payloadFor() })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it.each([['localhost', '1025'], ['127.0.0.1', '1025'], ['::1', '1025'], ['mailpit', '1025'], ['localhost', '8025']])('control: %s:%s (Mailpit) does receive the dry-run message', async (host, port) => {
    const env = { DRY_RUN: '1', NODE_ENV: 'test', SMTP_HOST: host, SMTP_PORT: port }
    expect(isLocalMailCatcher(env)).toBe(true)
    const out = await runAdapter({ ...input(env), payload: await payloadFor() })
    expect(out.status).toBe('dry_run')
    expect(sendMail).toHaveBeenCalledTimes(1)
    expect((out.dryRunRequest as { mailpit?: string }).mailpit).toMatch(/delivered to Mailpit/)
  })

  it('production with no SMTP_HOST and no Resend key has no catcher', () => {
    expect(isLocalMailCatcher({ NODE_ENV: 'production' })).toBe(false)
  })
})
