import type { Lookup } from './data'

// Which lookup row (school, campus) a CMS page stands for. The pages carry no relationship to the lookups, so the match is by name or slug.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Title equal to the name, path equal to the slug, or one name contained in the other ("School of Nursing" ~ "IHNA School of Nursing"). */
export function pageMatchesSchool(page: { title: string; path?: string | null }, school: Lookup): boolean {
  const slugWords = school.slug.replace(/-/g, ' ')
  const title = norm(page.title)
  const name = norm(school.name)
  return title === name || norm(page.path ?? '') === slugWords || title.includes(name) || (title.split(' ').length > 1 && name.includes(title))
}

export function pageMatchesCampus(page: { title: string; path?: string | null }, campus: Lookup): boolean {
  if (campus.detailPath && page.path === campus.detailPath) return true
  const hay = norm(`${page.path ?? ''} ${page.title}`)
  return hay.split(' ').includes(campus.slug) || hay.split(' ').includes(norm(campus.name))
}

export const findSchool = (page: { title: string; path?: string | null }, schools: Lookup[]) => schools.find((s) => pageMatchesSchool(page, s)) ?? null
export const findCampus = (page: { title: string; path?: string | null }, campuses: Lookup[]) => campuses.find((c) => pageMatchesCampus(page, c)) ?? null
