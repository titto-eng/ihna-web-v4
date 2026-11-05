import type { ArrayField, Field, UploadField } from 'payload'

// Shared field builders (20-blocks §2). Pure; no Local API.
export const heading = (name = 'heading', required = false): Field => ({ name, type: 'text', required })

export const media = (name = 'image', required = false): UploadField => ({ name, type: 'upload', relationTo: 'media', required })

export const textList = (name: string, description?: string): ArrayField => ({
  name, type: 'array', admin: { description }, fields: [{ name: 'text', type: 'text', required: true }],
})

export const links = (name = 'ctas', maxRows = 2): ArrayField => ({
  name, type: 'array', maxRows,
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'href', type: 'text', required: true },
    { name: 'style', type: 'select', defaultValue: 'primary', options: ['primary', 'secondary', 'link'] },
  ],
})

export const variant = (options: string[], defaultValue = options[0]): Field => ({
  name: 'variant', type: 'select', defaultValue, options,
})
