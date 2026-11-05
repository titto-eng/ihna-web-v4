import type { Payload } from 'payload'

export const ENQUIRY_QUEUE = 'enquiries'

/** Queue `deliverEnquiry` for a saved enquiry (40 §4 step 6). Returns the job id so the caller can run it straight away. */
export async function queueDeliverEnquiry(payload: Payload, enquiryId: number | string): Promise<number | string> {
  const job = await payload.jobs.queue({ task: 'deliverEnquiry', queue: ENQUIRY_QUEUE, input: { enquiryId: Number(enquiryId) } })
  return job.id
}

/** Best effort "run it now" so the visitor's enquiry is delivered in seconds. Failures are left to the cron/autoRun runner. */
export async function runJobNow(payload: Payload, jobId: number | string): Promise<void> {
  try {
    await payload.jobs.runByID({ id: jobId, silent: true })
  } catch (e) {
    console.error('[enquire] immediate delivery run failed; the queue runner will retry', e instanceof Error ? e.message : e)
  }
}
