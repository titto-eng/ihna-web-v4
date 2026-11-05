import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'
import type { CourseCardData } from './courseCards'
import { CourseResults } from './CourseResults.client'
import { buildFacets, filterCourses, hasFilters, hrefWith, TAB_FACET, type FacetGroup, type Selected } from './courseFilters'

function Tabs({ group, selected }: { group: FacetGroup; selected: Selected }) {
  const current = selected[group.param]?.[0]
  const tab = 'label-mono inline-block rounded-full px-4 py-2.5 whitespace-nowrap'
  return (
    <nav aria-label={group.label} className="-mx-5 mb-8 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
      <ul className="flex gap-2">
        <li><Link href={hrefWith(selected, group.param, null)} aria-current={!current ? 'page' : undefined} className={cn(tab, !current ? 'bg-foreground text-background' : 'border border-border hover:bg-muted')}>All courses</Link></li>
        {group.options.map((o) => (
          <li key={o.slug}>
            <Link href={hrefWith(selected, group.param, o.slug)} aria-current={current === o.slug ? 'page' : undefined} className={cn(tab, current === o.slug ? 'bg-foreground text-background' : 'border border-border hover:bg-muted')}>{o.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FilterGroup({ group, selected }: { group: FacetGroup; selected: Selected }) {
  const current = selected[group.param] ?? []
  return (
    <fieldset>
      <legend className="label-mono mb-3 text-muted-foreground">{group.label}</legend>
      <ul className="space-y-1">
        {group.options.map((o) => {
          const on = current.includes(o.slug)
          return (
            <li key={o.slug}>
              <Link
                href={hrefWith(selected, group.param, on ? null : o.slug)}
                aria-current={on ? 'true' : undefined}
                className={cn('flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm', on ? 'bg-foreground font-semibold text-background' : 'hover:bg-muted', !on && o.count === 0 && 'opacity-50')}
              >
                <span>{o.name}</span><span className="tabular-nums opacity-70">{o.count}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

// 05 §4.4 CourseListing: filter rail >= lg, collapsible filters below; school tabs (TAB_FACET); URL-param facets (server) + narrowing (client).
export function CourseListingView({ title = 'Courses', intro, courses, selected }: { title?: string; intro?: string | null; courses: CourseCardData[]; selected: Selected }) {
  const facets = buildFacets(courses, selected)
  const results = filterCourses(courses, selected)
  const tabs = facets.find((f) => f.param === TAB_FACET)
  const rail = facets.filter((f) => f.param !== TAB_FACET)
  const filters = (
    <div className="space-y-8">
      {rail.map((g) => <FilterGroup key={g.param} group={g} selected={selected} />)}
      {hasFilters(selected) && <Link href="/courses/" className="inline-block text-sm font-semibold text-primary-strong underline underline-offset-4">Clear all</Link>}
    </div>
  )
  return (
    <section className="bg-background py-12 md:py-20" data-template="courseListing">
      <Container>
        <header className="mb-10 md:mb-12">
          <p className="label-mono mb-4 text-accent">Study with us</p>
          <h1 className="display text-display-md">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
        </header>
        {tabs && <Tabs group={tabs} selected={selected} />}
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside aria-label="Filters">
            <details className="rounded-card border border-border bg-card p-5 lg:hidden" open={hasFilters(selected) || undefined}>
              <summary className="label-mono cursor-pointer">Filters{hasFilters(selected) ? ' (on)' : ''}</summary>
              <div className="mt-6">{filters}</div>
            </details>
            <div className="sticky top-24 hidden lg:block">{filters}</div>
          </aside>
          <CourseResults courses={results} />
        </div>
      </Container>
    </section>
  )
}
