import { getPayload, type CollectionSlug, type Payload } from 'payload'
import config from '@/payload.config'
import type { Role } from '@/lib/access'

// Integration helpers: real Postgres through the Local API. Every test cleans up what it creates.
export const nonce = () => Math.random().toString(36).slice(2, 8)

export async function boot(): Promise<Payload> {
  return getPayload({ config: await config })
}

export type Created = { collection: CollectionSlug; id: number | string }

export class Cleanup {
  private items: Created[] = []

  track(collection: CollectionSlug, id: number | string) {
    this.items.push({ collection, id })
  }

  async run(payload: Payload) {
    for (const { collection, id } of [...this.items].reverse()) {
      await payload.delete({ collection, id, overrideAccess: true }).catch(() => {})
    }
    this.items = []
  }
}

/** A staff user document shaped like `req.user` (has `collection`), for Local API calls with overrideAccess:false. */
export async function makeStaff(payload: Payload, cleanup: Cleanup, role: Role, tag: string) {
  const doc = await payload.create({
    collection: 'users',
    data: { email: `t-${tag}-${role}@example.test`, password: `Pw-${tag}-${role}-0123456789`, name: `Test ${role}`, roles: [role] },
    overrideAccess: true,
  })
  cleanup.track('users', doc.id)
  return { ...doc, collection: 'users' as const }
}

export async function makeAlumnus(payload: Payload, cleanup: Cleanup, tag: string, verified = false) {
  const password = `Pw-${tag}-alumni-0123456789`
  const doc = await payload.create({
    collection: 'alumni',
    data: { email: `t-${tag}-alumni@example.test`, password, firstName: 'Test', lastName: 'Alumnus', _verified: verified },
    disableVerificationEmail: true,
    overrideAccess: true,
  })
  cleanup.track('alumni', doc.id)
  return { doc: { ...doc, collection: 'alumni' as const }, password }
}

/** Payload's ValidationError message is generic; our text lives in `data.errors[].message`. */
export async function rejectsWith(promise: Promise<unknown>, pattern: RegExp) {
  const err = (await promise.then(
    () => null,
    (e: unknown) => e,
  )) as { message?: string; data?: { errors?: { message?: string }[] } } | null
  if (!err) throw new Error(`expected a rejection matching ${pattern}`)
  const text = [err.message, ...(err.data?.errors ?? []).map((e) => e.message)].join(' | ')
  if (!pattern.test(text)) throw new Error(`rejection "${text}" does not match ${pattern}`)
}
