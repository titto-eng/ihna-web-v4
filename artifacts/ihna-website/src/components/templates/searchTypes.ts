export type SearchHit = { type: 'course' | 'page' | 'post'; title: string; path: string; snippet: string | null; rank: number }
export type SearchResults = { q: string; courses: SearchHit[]; pages: SearchHit[]; posts: SearchHit[]; total: number }
export const MIN_QUERY = 2
export const cleanQuery = (raw: unknown): string => (typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0] ?? '') : '').replace(/\s+/g, ' ').trim().slice(0, 100)
