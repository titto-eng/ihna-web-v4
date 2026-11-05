import type { TaskConfig } from 'payload'
import { runAfterPaid } from '@/lib/payments/after'

/** 45 §6: five retries, exponential backoff from 1 minute (Payload has no cap, so the 5th retry waits 16 min), then the step is `dead` and finance is alerted. */
export const afterPaidTask = {
  slug: 'afterPaid',
  inputSchema: [{ name: 'paymentId', type: 'text', required: true }],
  outputSchema: [{ name: 'failed', type: 'number', required: true }, { name: 'dead', type: 'number', required: true }],
  retries: { attempts: 5, backoff: { type: 'exponential', delay: 60_000 } },
  handler: async ({ input, req }) => {
    const r = await runAfterPaid(req.payload, input.paymentId)
    // Throwing makes Payload re-queue with the backoff above; steps already done are skipped next time.
    if (r.failed.length) throw new Error(`afterPaid ${input.paymentId}: retry needed (${r.failed.join(', ')})`)
    return { output: { failed: r.failed.length, dead: r.dead.length } }
  },
} as TaskConfig<'afterPaid'>
