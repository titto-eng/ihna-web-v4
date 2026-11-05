import { after } from 'next/server'
import type { Payload } from 'payload'
import { runJobNow } from '@/jobs/queue'
import { PAYMENTS_QUEUE } from './config'

/** Queue `afterPaid` for a settled payment and, inside a request, run it right after the response. The runner retries what fails. */
export async function queueAfterPaid(payload: Payload, paymentId: string): Promise<void> {
  const job = await payload.jobs.queue({ task: 'afterPaid', queue: PAYMENTS_QUEUE, input: { paymentId } })
  try {
    after(() => runJobNow(payload, job.id))
  } catch {
    /* no request scope (jobs, tests): the autoRun runner picks it up */
  }
}
