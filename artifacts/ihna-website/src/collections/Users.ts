import type { CollectionConfig } from 'payload'
import { fieldRoles, isAdmin, ROLES, selfOrAdmin } from '@/lib/access'

// Staff accounts for /admin. Payload's built-in auth (D10): sessions, lockout, forgot/reset.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    removeTokenFromResponses: true,
    cookies: { sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' },
  },
  admin: { useAsTitle: 'email', group: 'Admin' },
  access: {
    create: isAdmin,
    read: selfOrAdmin('users'), // alumni ids can collide with user ids: selfOrAdmin checks the collection
    update: selfOrAdmin('users'),
    delete: isAdmin,
    unlock: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['viewer'],
      options: ROLES.map((r) => ({ label: r, value: r })),
      saveToJWT: true,
      access: { update: fieldRoles() },
    },
  ],
}
