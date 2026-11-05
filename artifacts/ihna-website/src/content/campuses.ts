// Campus visit cards (name, street address, phone) for the campus and contact templates. Hand-edited code (no CMS global behind it). Keep it plain data.
export type CampusContact = { name: string; address: string; tel: string | null }

/** Keyed by the campus lookup slug. Empty on IHNA: the campus addresses are in the campus pages' own content and `site.contact`. */
export const campusContacts: Record<string, CampusContact[]> = {}

// The four city campuses of the old App Runner content API (blog/gallery data, 30-import `apprunner`). `apprunnerId` is the
// public id the old `/all-events/?campus=<id>` links carry; `path` is the campus page route file. Galleries link campuses by `key`.
export type GalleryCampusKey = 'melbourne' | 'sydney' | 'perth' | 'brisbane'
export type GalleryCampus = { key: GalleryCampusKey; name: string; apprunnerId: string; path: string }

export const galleryCampuses: GalleryCampus[] = [
  { key: 'melbourne', name: 'Melbourne', apprunnerId: '65cdce929990767ff90f9e12', path: '/ihna-melbourne-campus/' },
  { key: 'sydney', name: 'Sydney', apprunnerId: '65cdceac9990767ff90f9e16', path: '/ihna-sydney-campus/' },
  { key: 'perth', name: 'Perth', apprunnerId: '65cdcea09990767ff90f9e14', path: '/ihna-perth-campus/' },
  { key: 'brisbane', name: 'Brisbane', apprunnerId: '65cdceb49990767ff90f9e18', path: '/ihna-brisbane-campus/' },
]

/** `?campus=` value (an App Runner id, or a key) → campus; anything else → null (the page then shows every campus). */
export const galleryCampusOf = (value: string | null | undefined): GalleryCampus | null =>
  (value && galleryCampuses.find((c) => c.apprunnerId === value || c.key === value.toLowerCase())) || null
