// Paths are stored with leading and trailing slash: "/about-us/who-we-are/" (rule 1, DEC-23).

export const normalisePath = (input: string): string => {
  let p = input.trim()
  if (!p.startsWith('/')) p = `/${p}`
  if (!p.endsWith('/')) p = `${p}/`
  return p.replace(/\/{2,}/g, '/')
}

export const slugsToPath = (slugs: string[] | undefined): string =>
  slugs && slugs.length ? normalisePath(slugs.join('/')) : '/'

/** Kebab-case slug from free text. */
export const slugify = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const courseUrl = (slug: string): string => normalisePath(`/courses/${slug}`)
export const postUrl = (slug: string): string => normalisePath(`/blog/${slug}`)
export const landingUrl = (section: string, slug: string): string => normalisePath(`/${section}/${slug}`)
