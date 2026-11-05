import type { Access, FieldAccess } from 'payload'

export const ROLES = ['admin', 'marketing', 'events', 'finance', 'viewer'] as const
export type Role = (typeof ROLES)[number]

type UserLike = { collection?: string; roles?: Role[] | null } | null | undefined

/**
 * Staff = a `users` document. Alumni are never staff (90-security §2): Payload's default access is
 * "any logged-in user", so every collection declares all four operations explicitly.
 * A user object without `collection` (Local API `user:` option) counts as staff when it carries roles.
 */
export const isStaff = (user: UserLike): boolean =>
  Boolean(user && (user.collection === 'users' || (user.collection == null && Array.isArray(user.roles))))

export const hasRole = (user: UserLike, ...allowed: Role[]): boolean =>
  isStaff(user) && Boolean(user?.roles?.some((r) => allowed.includes(r)))

export const isAdmin: Access = ({ req }) => hasRole(req.user as UserLike, 'admin')

/** Admin plus the listed roles. */
export const roles =
  (...allowed: Role[]): Access =>
  ({ req }) =>
    hasRole(req.user as UserLike, 'admin', ...allowed)

/** Field-level: admin plus the listed roles (boolean only, no query constraints). */
export const fieldRoles =
  (...allowed: Role[]): FieldAccess =>
  ({ req }) =>
    hasRole(req.user as UserLike, 'admin', ...allowed)

export const anyone: Access = () => true

export const denyAll: Access = () => false

export const loggedIn: Access = ({ req }) => Boolean(req.user)

/** Any staff role, including `viewer`. Never alumni. */
export const staffOnly: Access = ({ req }) => isStaff(req.user as UserLike)

/** Field-level twin of `staffOnly`. */
export const staffField: FieldAccess = ({ req }) => isStaff(req.user as UserLike)

/** Public sees published docs only; staff (any role) also see drafts. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req.user as UserLike)) return true
  return { _status: { equals: 'published' } }
}

/** Lookups, products: public sees `active: true` only; staff see everything. */
export const activeOrStaff: Access = ({ req }) => {
  if (isStaff(req.user as UserLike)) return true
  return { active: { equals: true } }
}

/** Own document for the given auth collection, everything for admin, nothing for anyone else. */
export const selfOrAdmin =
  (collection: 'users' | 'alumni'): Access =>
  ({ req }) => {
    const user = req.user as (UserLike & { id?: string | number }) | null | undefined
    if (!user) return false
    if (hasRole(user, 'admin')) return true
    const own = user.collection === collection || (collection === 'users' && isStaff(user))
    return own ? { id: { equals: user.id } } : false
  }
