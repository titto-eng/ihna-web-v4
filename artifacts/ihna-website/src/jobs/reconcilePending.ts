import type { TaskConfig } from 'payload'
import { PAYMENTS_QUEUE } from '@/lib/payments/config'
import { reconcilePending } from '@/lib/payments/reconcile'

/** Every 15 minutes on the `payments` queue (scheduled by the same autoRun runner as the enquiry jobs). */
export const reconcilePendingTask = {
  slug: 'reconcilePending',
  inputSchema: [],
  outputSchema: [
    { name: 'checked', type: 'number', required: true }, { name: 'paid', type: 'number', required: true },
    { name: 'flagged', type: 'number', required: true }, { name: 'expired', type: 'number', required: true },
  ],
  schedule: [{ cron: '0 */15 * * * *', queue: PAYMENTS_QUEUE }],
  handler: async ({ req }) => {
    const r = await reconcilePending(req.payload)
    return { output: { checked: r.checked, paid: r.paid, flagged: r.flagged, expired: r.expired } }
  },
} as TaskConfig<'reconcilePending'>
