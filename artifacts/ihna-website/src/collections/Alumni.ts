import type { CollectionConfig } from 'payload'
import { env } from '@/env'
import { site as siteSettings } from '@/content/site'
import { fieldRoles, isAdmin, selfOrAdmin } from '@/lib/access'
import { alumniBeforeOperation, alumniPasswordPolicy } from '@/lib/alumni/hooks'

const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

const mail = (heading: string, intro: string, url: string, cta: string) =>
  `<p>${heading}</p><p>${intro}</p><p><a href="${url}">${cta}</a></p><p>If you did not expect this email, you can ignore it.</p>`

// Alumni accounts. Payload auth, but never staff: no admin panel, and every staff collection checks `isStaff`.
// Accounts are created by the signup server action or the import (Local API), not by REST (create is admin only).
export const Alumni: CollectionConfig = {
  slug: 'alumni',
  labels: { singular: 'Alumnus', plural: 'Alumni' },
  auth: {
    tokenExpiration: 12 * 60 * 60, // 90-security §4
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    removeTokenFromResponses: true,
    cookies: { sameSite: 'Lax', secure: env.NODE_ENV === 'production' },
    verify: {
      generateEmailSubject: () => `Verify your ${siteSettings.shortName} alumni account`,
      generateEmailHTML: ({ token }) =>
        mail(`Welcome to the ${siteSettings.shortName} alumni community.`, 'Confirm your email address to finish setting up your account.',
          `${site}/alumni/verify/?token=${encodeURIComponent(token)}`, 'Verify my email'),
    },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: () => `Reset your ${siteSettings.shortName} alumni password`,
      generateEmailHTML: (args) =>
        mail('Reset your password.', 'Use the link below to choose a new password. It expires in one hour.',
          `${site}/alumni/reset-password/?token=${encodeURIComponent(args?.token ?? '')}`, 'Choose a new password'),
    },
  },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'firstName', 'lastName', 'graduationYear', '_verified'], group: 'Admin' },
  access: {
    admin: () => false, // alumni never reach /admin
    create: isAdmin,
    read: selfOrAdmin('alumni'),
    update: selfOrAdmin('alumni'),
    delete: isAdmin,
    unlock: isAdmin,
  },
  hooks: {
    beforeOperation: [alumniBeforeOperation], // 10/min per IP on login + forgot-password, reset-password policy (src/lib/alumni)
    beforeValidate: [alumniPasswordPolicy],
    beforeChange: [
      ({ data, req, originalDoc }) => {
        // An alumnus must not verify themselves by PATCHing `_verified` (Payload's default field access allows it),
        // nor move a verified account to an address nobody confirmed: the email changes through staff.
        if (req.user?.collection === 'alumni') {
          delete data._verified
          if (originalDoc?.email) data.email = originalDoc.email // restored, not deleted: email is required
        }
        if (data.password) data.passwordSetAt = new Date().toISOString()
        return data
      },
    ],
  },
  fields: [
    { type: 'row', fields: [{ name: 'firstName', type: 'text', required: true }, { name: 'lastName', type: 'text', required: true }] },
    { type: 'row', fields: [{ name: 'graduationYear', type: 'number', min: 1900, max: 2100 }, { name: 'course', type: 'text' }] },
    { name: 'marketingConsent', type: 'checkbox', defaultValue: false },
    { name: 'legacyId', type: 'number', unique: true, index: true, access: { create: fieldRoles(), update: fieldRoles() }, admin: { readOnly: true } },
    { name: 'passwordSetAt', type: 'date', access: { create: fieldRoles(), update: fieldRoles() }, admin: { readOnly: true } },
  ],
}
