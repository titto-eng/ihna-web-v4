import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from '../lib/config'

/**
 * IHNA's four course lookups and the course -> lookup assignment (`scripts/import/seeds/ihna-course-groups.json`, sources in its
 * `source` block): schools (`categories`) from the Courses mega menu, `levels` and `disciplines` from the live course finder
 * (`course-urls.json`), `universities` from the IHNA-IHM package. Read by the `lookups` and `wp-courses` steps.
 */
export type GroupRow = { slug: string; name: string; legacyId?: number; detailPath?: string | null }
export type CourseGroups = { school: string; level?: string; discipline?: string; university?: string; brochurePdf?: string }
export type IhnaGroups = {
  categories: GroupRow[]
  levels: GroupRow[]
  disciplines: GroupRow[]
  universities: GroupRow[]
  courses: Record<string, CourseGroups>
}

export const GROUPS_PATH = resolve(ROOT, 'scripts/import/seeds/ihna-course-groups.json')
export const loadGroups = (): IhnaGroups => JSON.parse(readFileSync(GROUPS_PATH, 'utf8')) as IhnaGroups

export const GROUP_COLLECTIONS = ['categories', 'levels', 'disciplines', 'universities'] as const
export type GroupCollection = (typeof GROUP_COLLECTIONS)[number]
