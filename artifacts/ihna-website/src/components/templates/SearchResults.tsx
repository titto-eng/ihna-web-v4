import Link from 'next/link'
import { Search } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { MIN_QUERY, type SearchHit, type SearchResults } from './searchTypes'

function Group({ label, hits }: { label: string; hits: SearchHit[] }) {
  if (!hits.length) return null
  return (
    <section aria-labelledby={`search-${label}`} className="mt-12" data-search-group={label}>
      <h2 id={`search-${label}`} className="label-mono mb-4 text-accent">{label} ({hits.length})</h2>
      <ul className="divide-y divide-border rounded-card border border-border bg-card">
        {hits.map((h) => (
          <li key={`${h.type}-${h.path}`}>
            <Link href={h.path} className="block p-5 hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2">
              <span className="display text-xl leading-snug">{h.title}</span>
              {h.snippet && <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{h.snippet}</span>}
              <span className="mt-1 block text-xs text-muted-foreground">{h.path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// /search/?q= : results grouped by type. The route sets noindex.
export function SearchView({ results }: { results: SearchResults }) {
  const searched = results.q.length >= MIN_QUERY
  return (
    <section className="bg-background py-12 md:py-20" data-template="search">
      <Container narrow>
        <h1 className="display text-display-md">Search</h1>
        <form action="/search/" method="get" role="search" className="mt-8 flex gap-3">
          <label htmlFor="site-search" className="sr-only">Search courses, pages and news</label>
          <input id="site-search" name="q" type="search" defaultValue={results.q} placeholder="Search courses, pages and news" className="h-12 min-w-0 flex-1 rounded-full border border-input bg-card px-5 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
          <Button type="submit" size="lg"><Search aria-hidden />Search</Button>
        </form>
        {searched ? (
          <>
            <p className="mt-8 text-muted-foreground" aria-live="polite">
              {results.total ? `${results.total} ${results.total === 1 ? 'result' : 'results'} for “${results.q}”` : `No results for “${results.q}”. Try a different word, or browse the courses.`}
            </p>
            <Group label="Courses" hits={results.courses} />
            <Group label="Pages" hits={results.pages} />
            <Group label="News and blog" hits={results.posts} />
            {results.total === 0 && <p className="mt-6"><Link href="/courses/" className="font-semibold text-primary-strong underline underline-offset-4">Browse all courses</Link></p>}
          </>
        ) : (
          <p className="mt-8 text-muted-foreground">Type at least {MIN_QUERY} letters to search.</p>
        )}
      </Container>
    </section>
  )
}
