import { ExternalLink } from 'lucide-react'
import { Accordion, Tabs } from '@/components/page'
import { libraryCatalogue, type LibraryReference, type LibraryUnitGroup } from '@/content/library/catalogue'

// The reading list of /library/ebooks/ and /library/eresources/ (src/content/library/catalogue.ts): one tab per unit group (core,
// elective), one accordion item per unit, its references as a list linking to the HCI library catalogue.

function References({ references }: { references: LibraryReference[] }) {
  if (!references.length) return <p>No titles are listed for this unit yet: search the library collection above.</p>
  return (
    <ol className="divide-y divide-border">
      {references.map((r, i) => (
        <li key={i} className="py-4 first:pt-0">
          <p className="font-semibold text-foreground">{r.citation}</p>
          <p className="mt-1"><cite className="not-italic">{r.title}</cite></p>
          <a
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-strong underline-offset-4 hover:underline"
          >
            View in the library<span className="sr-only">: {r.title} (opens in a new tab)</span>
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        </li>
      ))}
    </ol>
  )
}

export function LibraryCatalogue({ groups = libraryCatalogue }: { groups?: LibraryUnitGroup[] }) {
  const tabs = groups
    .filter((g) => g.units.length)
    .map((g) => ({
      label: g.heading,
      content: (
        <Accordion
          depth={1}
          variant="plain"
          items={g.units.map((u) => ({ title: `${u.code}: ${u.title}`, content: <References references={u.references} /> }))}
        />
      ),
    }))
  if (!tabs.length) return null
  return <Tabs anchorId="reading-list" variant="pill" tabs={tabs} />
}
