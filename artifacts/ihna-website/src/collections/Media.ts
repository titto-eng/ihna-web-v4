import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'
import { anyone, isAdmin, roles } from '@/lib/access'

/** 90-security §4 Uploads: images and PDFs in `media` are capped at 20 MB (the global parser limit is 50 MB, for `documents`). */
export const MEDIA_MAX_BYTES = 20 * 1024 * 1024

export const limitMediaSize: CollectionBeforeValidateHook = ({ data, req }) => {
  const size = req.file?.size
  if (typeof size === 'number' && size > MEDIA_MAX_BYTES) {
    throw new APIError(`The file is ${Math.ceil(size / 1048576)} MB; media files are limited to ${MEDIA_MAX_BYTES / 1048576} MB`, 413)
  }
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  hooks: { beforeValidate: [limitMediaSize] },
  access: {
    read: anyone,
    create: roles('marketing', 'events'),
    update: roles('marketing', 'events'),
    delete: isAdmin,
  },
  upload: {
    staticDir: 'media',
    // 90-security §5: images and PDFs only; SVG excluded (script risk) until sanitised uploads exist.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 400 },
      { name: 'card', width: 768 },
      { name: 'hero', width: 1600 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
    focalPoint: true,
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
    { name: 'credit', type: 'text' },
    { name: 'legacyPath', type: 'text', unique: true, index: true, admin: { readOnly: true, description: 'Original wp-content/uploads path' } },
  ],
}
