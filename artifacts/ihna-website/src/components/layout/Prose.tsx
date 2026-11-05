import Image from '@/components/blocks/MediaImage'
import Link from 'next/link'
import { RichText as LexicalRichText, type JSXConverter, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes, SerializedHeadingNode, SerializedAutoLinkNode, SerializedLinkNode, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { cn } from '@/lib/cn'
import { localUrl } from '@/components/blocks/media'

// All rich text renders through here (rule 5): Lexical JSON → React, styled by @tailwindcss/typography.
// Imported content may contain h1; pages own their h1 (05 §4.2), so demote it.
const heading: JSXConverter<SerializedHeadingNode> = ({ node, nodesToJSX }) => {
  const Tag = (node.tag === 'h1' ? 'h2' : node.tag) as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return <Tag>{nodesToJSX({ nodes: node.children })}</Tag>
}

type DocRef = { relationTo?: string; value?: unknown } | null | undefined

// Internal link → the document's path (pages carry `path`; courses and posts have fixed prefixes, 70-urls-seo).
export function docHref(doc: DocRef): string {
  const v = doc?.value
  if (!v || typeof v !== 'object') return '#'
  const d = v as { path?: string | null; slug?: string | null }
  if (d.path) return d.path
  if (d.slug && doc?.relationTo === 'courses') return `/courses/${d.slug}/`
  if (d.slug && doc?.relationTo === 'posts') return `/blog/${d.slug}/`
  return '#'
}

const link: JSXConverter<SerializedLinkNode> = ({ node, nodesToJSX }) => {
  const children = nodesToJSX({ nodes: node.children })
  const fields = node.fields as { linkType?: string; url?: string; newTab?: boolean; doc?: DocRef }
  const href = fields.linkType === 'internal' ? docHref(fields.doc) : (fields.url ?? '#')
  if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return <a href={href} target={fields.newTab ? '_blank' : undefined} rel="noopener noreferrer">{children}</a>
  }
  return <Link href={href}>{children}</Link>
}

// Upload nodes → next/image from the populated media doc; unpopulated ids render nothing.
const upload: JSXConverter<SerializedUploadNode> = ({ node }) => {
  const media = node.value as { url?: string | null; alt?: string | null; width?: number | null; height?: number | null; mimeType?: string | null } | number | null
  if (!media || typeof media !== 'object' || !media.url) return null
  if (media.mimeType && !media.mimeType.startsWith('image/')) {
    return <a href={media.url} rel="noopener noreferrer">{media.alt || 'Download'}</a>
  }
  return <Image src={localUrl(media.url)} alt={media.alt ?? ''} width={media.width ?? 1200} height={media.height ?? 800} sizes="(min-width: 1024px) 70ch, 100vw" className="h-auto w-full rounded-xl" />
}

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading,
  link,
  autolink: link as unknown as JSXConverter<SerializedAutoLinkNode>,
  upload,
})

/** The typography classes every rich text (CMS or hardcoded) renders with. */
export const proseClassName = 'prose prose-lg max-w-prose-site prose-headings:font-display prose-headings:font-semibold prose-a:text-primary-strong prose-a:underline-offset-4'

export function Prose({ data, className }: { data: SerializedEditorState | null | undefined; className?: string }) {
  if (!data) return null
  return <LexicalRichText data={data} converters={converters} className={cn(proseClassName, className)} />
}
