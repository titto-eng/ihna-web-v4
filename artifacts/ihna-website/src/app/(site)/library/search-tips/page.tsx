// Search tips: the old page's four tabs (Combination / Omitting / Grouping words, Wildcards) shown as four cards.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ValueCards, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Improve Your Searches',
  path: '/library/search-tips/',
  description: 'Refine your search if you find too many or not enough results.',
})

export default function LibrarySearchTipsRoute() {
  return (
    <>
      <Hero heading="Improve Your Searches" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-search-tips.webp', alt: 'Students searching for resources together', width: 524, height: 655 })} />
      <SectionNav section="library" current="/library/search-tips/" />
      <ValueCards
        tone="default"
        columns={2}
        eyebrow="Search tips"
        intro="Refine your search if you find too many or not enough results."
        items={[
          {
            title: 'Combination Words',
            mark: '+',
            body: (
              <>
                <p>And, OR and NOT: Cobination of Key words to find more relevant information.</p>
                <p>Are specific words used to combine key words to improve chances of finding relevant information. Most used are AND, OR and NOT.</p>
              </>
            ),
          },
          {
            title: 'Omitting Words',
            mark: '−',
            body: (
              <>
                <p>To exclude words or Phrases from your search results, Type NOT before the word or Phrase you want to exclude.</p>
                <p><strong>Tips: </strong>Always type OR, AND, NOT in upper case. Otherwise, LibrarySearch will treat them as keywords.</p>
              </>
            ),
          },
          {
            title: 'Grouping words',
            mark: '()',
            body: (
              <>
                <p>Use parentheses () to group words you are searching.</p>
                <p>For Example: Shakesspeare (Drama OR Poem).</p>
                <p><strong>Tips: </strong>With this parentheses librarySearch result will contains ‘Shakespeare’ and ‘Drama’, ‘Shakespeare’ and ‘Poem’, which shows the result contain all three words. Excepts parentheses this search will not work properly.</p>
              </>
            ),
          },
          {
            title: 'Wildcards',
            mark: '*',
            body: (
              <>
                <p>Wildcards are single characters that allow you to expand your search.</p>
                <p>Usages of special charactors Like * and ?</p>
                <p>Inserting an asterisk(*) wildcard to replace multiple characters in a word</p>
                <p>For Example: Nurs*</p>
              </>
            ),
          },
        ]}
      />
    </>
  )
}
