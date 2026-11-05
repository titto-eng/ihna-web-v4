import { describe, expect, it } from 'vitest'
import { html, count } from './html'
import { sharedStatsBlock } from '@/components/templates/CourseDetail'
import { LibraryCatalogue } from '@/components/templates/LibraryCatalogue'
import { libraryCatalogue } from '@/content/library/catalogue'
import { RenderBlocks } from '@/components/RenderBlocks'

describe('courseShared stats band', () => {
  it('is nothing when the global holds no complete figure', () => {
    expect(sharedStatsBlock(undefined)).toBeNull()
    expect(sharedStatsBlock([])).toBeNull()
    expect(sharedStatsBlock([{ value: '300+', label: ' ' }, { value: null, label: 'Students' }])).toBeNull()
  })

  it('renders the figures as a stats band', async () => {
    const block = sharedStatsBlock([{ value: '300+', label: 'Industry partnerships' }, { value: ' 35,000+ ', label: 'Students studied with IHNA' }])
    expect(block).toMatchObject({ blockType: 'stats', items: [{ value: '300+' }, { value: '35,000+' }] })
    const out = await html(<RenderBlocks blocks={[block!]} ctx={{ depth: 0 }} />)
    expect(out).toContain('id="course-stats"')
    expect(out).toContain('Industry partnerships')
    expect(count(out, /<dt/g)).toBe(2)
  })
})

describe('library reading list', () => {
  it('holds the live list: core and elective units with catalogue links', () => {
    expect(libraryCatalogue.map((g) => [g.heading, g.units.length])).toEqual([['Core Units', 20], ['Elective Units', 20]])
    const refs = libraryCatalogue.flatMap((g) => g.units.flatMap((u) => u.references))
    expect(refs).toHaveLength(228)
    for (const r of refs) expect(r.href).toMatch(/^https:\/\/library\.hci\.edu\.au\//)
  })

  it('renders a tab per group, a unit per accordion item and an empty unit as a note', async () => {
    const out = await html(
      <LibraryCatalogue
        groups={[
          { heading: 'Core Units', units: [{ code: 'CHCDIV001', title: 'Work with diverse people', references: [{ citation: 'Hinkson, M. (2008).', title: 'An appreciation of difference.', href: 'https://library.hci.edu.au/permalink/x' }] }] },
          { heading: 'Elective Units', units: [{ code: 'HLTAID011', title: 'Provide First Aid', references: [] }] },
        ]}
      />,
    )
    expect(out).toContain('Core Units')
    expect(out).toContain('Elective Units')
    expect(out).toContain('CHCDIV001: Work with diverse people')
  })

  it('renders nothing without groups', async () => {
    expect(await html(<LibraryCatalogue groups={[]} />)).toBe('')
  })
})
