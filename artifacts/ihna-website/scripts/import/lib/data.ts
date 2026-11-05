import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'csv-parse/sync'
import { INVENTORY_DIR, SITE } from './config'

// Inventory loaders. Big files are read by code only and never printed (AGENTS.md).
export type WpItem = {
  id: number
  date: string
  modified: string
  slug: string
  type: string
  link: string
  title: { rendered: string }
  parent?: number
  menu_order?: number
  template?: string
  content: string | null
  content_error?: string | number
  excerpt?: string
}
export type PageRow = Record<'url' | 'path' | 'title' | 'wp_type' | 'wp_id' | 'parent_path' | 'template' | 'suggested_page_type' | 'in_sitemap' | 'payload_collection' | 'notes', string>
export type AnalysisRow = Record<string, string> & { wp_id: string; class: string }

const json = <T>(file: string): T => JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}`, file), 'utf8')) as T
const csv = <T>(file: string): T[] => parse(readFileSync(resolve(INVENTORY_DIR, `v2/${SITE}`, file), 'utf8'), { columns: true, skip_empty_lines: true, relax_column_count: true }) as T[]

export const loadPages = () => json<WpItem[]>('pages.json')
export const loadPosts = () => json<WpItem[]>('posts.json')
export const loadPageRows = () => csv<PageRow>('pages.csv')
export const loadAnalysis = () => csv<AnalysisRow>('html-analysis.csv')

export const pathOf = (link: string): string => {
  const p = new URL(link).pathname
  return p.endsWith('/') ? p : `${p}/`
}

/** Decodes the few HTML entities WordPress leaves in `title.rendered`. */
export const decodeTitle = (s: string): string =>
  s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim()
