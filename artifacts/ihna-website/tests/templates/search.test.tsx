import { describe, expect, it } from 'vitest'
import { html } from './html'
import { SearchView } from '@/components/templates/SearchResults'
import { cleanQuery } from '@/components/templates/searchTypes'

describe('search page', () => {
  const hit = (type: 'course' | 'page' | 'post', title: string, path: string) => ({ type, title, path, snippet: null, rank: 1 })

  it('groups results by type', async () => {
    const out = await html(<SearchView results={{ q: 'nursing', total: 3, courses: [hit('course', 'Bachelor of Nursing', '/courses/bachelor-of-nursing/')], pages: [hit('page', 'Nursing registration', '/nursing-registration/')], posts: [hit('post', 'Nursing news', '/blog/n/')] }} />)
    expect(out).toContain('data-search-group="Courses"')
    expect(out).toContain('data-search-group="Pages"')
    expect(out).toContain('data-search-group="News and blog"')
    expect(out).toContain('href="/courses/bachelor-of-nursing/"')
    expect(out).toContain('3 results')
  })

  it('handles no results and an empty query', async () => {
    expect(await html(<SearchView results={{ q: 'zzzz', total: 0, courses: [], pages: [], posts: [] }} />)).toContain('No results')
    expect(await html(<SearchView results={{ q: '', total: 0, courses: [], pages: [], posts: [] }} />)).toContain('at least 2 letters')
  })

  it('cleans the query', () => {
    expect(cleanQuery('  nursing   course ')).toBe('nursing course')
    expect(cleanQuery(['a b', 'c'])).toBe('a b')
    expect(cleanQuery(undefined)).toBe('')
    expect(cleanQuery('x'.repeat(500))).toHaveLength(100)
  })
})
