import type { JobsConfig, TaskConfig } from 'payload'
import { hasRole } from '@/lib/access'
import { safeEqual } from '@/lib/security/safeEqual'
import { afterPaidTask } from './afterPaid'
import { deliverEnquiryTask } from './deliverEnquiry'
import { reconcilePendingTask } from './reconcilePending'
import { scrubEnquiryIpsTask, MAINTENANCE_QUEUE } from './scrubEnquiryIps'
import { ENQUIRY_QUEUE } from './queue'
import { PAYMENTS_QUEUE } from '@/lib/payments/config'

// Payload Jobs (40 §6, 00-architecture "Deploy shape"). Other modules append their tasks to `jobTasks`.
export const jobTasks: TaskConfig<never>[] = [
  deliverEnquiryTask as unknown as TaskConfig<never>,
  scrubEnquiryIpsTask as unknown as TaskConfig<never>,
  afterPaidTask as unknown as TaskConfig<never>, // 45-payments: portal row + callbacks, receipt, E2, SAE
  reconcilePendingTask as unknown as TaskConfig<never>, // 45-payments: every 15 min on the `payments` queue
]

const autoRunEnabled = (): boolean =>
  process.env.NODE_ENV !== 'test' && process.env.ENQUIRY_AUTORUN !== '0'

/**
 * `autoRun`: every minute in production (the Docker image's Node process is the only scheduler), every 20 s in development so
 * a retry is visible quickly. `/api/payload-jobs/run` (`Authorization: Bearer $CRON_SECRET` or an admin session) runs a queue on demand.
 */
export const jobsConfig: JobsConfig = {
  tasks: jobTasks,
  access: {
    run: ({ req }) => {
      const secret = process.env.CRON_SECRET
      if (secret && safeEqual(req.headers.get('authorization') ?? '', `Bearer ${secret}`)) return true
      return hasRole(req.user as never, 'admin')
    },
  },
  autoRun: [
    { cron: process.env.NODE_ENV === 'production' ? '0 * * * * *' : '*/20 * * * * *', queue: ENQUIRY_QUEUE, limit: 20, silent: { info: true } },
    // 45-payments: `afterPaid` jobs and the 15-minute `reconcilePending` schedule
    { cron: process.env.NODE_ENV === 'production' ? '0 * * * * *' : '*/20 * * * * *', queue: PAYMENTS_QUEUE, limit: 20, silent: { info: true } },
    // schedules and runs the daily `scrubEnquiryIps`
    { cron: '0 */10 * * * *', queue: MAINTENANCE_QUEUE, limit: 5, silent: { info: true } },
  ],
  shouldAutoRun: () => autoRunEnabled(),
}
