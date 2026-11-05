import { describe, expect, it } from 'vitest'
import { jobsConfig, jobTasks } from '@/jobs'
import { afterPaidTask } from '@/jobs/afterPaid'
import { reconcilePendingTask } from '@/jobs/reconcilePending'
import { PAYMENTS_QUEUE } from '@/lib/payments/config'

describe('payment jobs are registered', () => {
  it('afterPaid and reconcilePending are in the jobs index', () => {
    expect(jobTasks.map((t) => t.slug)).toEqual(expect.arrayContaining(['afterPaid', 'reconcilePending', 'deliverEnquiry', 'scrubEnquiryIps']))
  })
  it('afterPaid retries 5 times with exponential backoff from 1 minute', () => {
    expect(afterPaidTask.retries).toEqual({ attempts: 5, backoff: { type: 'exponential', delay: 60_000 } })
  })
  it('reconcilePending is scheduled every 15 minutes on the payments queue, which autoRun drives', () => {
    expect(reconcilePendingTask.schedule).toEqual([{ cron: '0 */15 * * * *', queue: PAYMENTS_QUEUE }])
    expect((jobsConfig.autoRun as { queue?: string }[]).map((a) => a.queue)).toEqual(expect.arrayContaining(['enquiries', 'maintenance', 'payments']))
  })
})
