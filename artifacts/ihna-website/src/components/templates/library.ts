// The HCI library catalogue (Primo) used by the library pages (template-library-course-units-page.php). Plain data, safe on server and client.
export const PRIMO_SEARCH = 'https://library.hci.edu.au/discovery/search'
const FIXED: Record<string, string> = {
  vid: '61IOHAM_INST:61IOHAM', tab: 'Everything', search_scope: 'MyInst_and_CI', mode: 'basic', displayMode: 'full', bulkSize: '10',
  highlight: 'true', dum: 'true', displayField: 'all', pcAvailabiltyMode: 'true',
}
/** The catalogue home. */
export const PRIMO_HOME = `${PRIMO_SEARCH}?vid=${encodeURIComponent(FIXED.vid)}`
/** The old form's search: `query=any,contains,<term>` with commas replaced by spaces. */
export const primoSearchUrl = (term: string): string =>
  `${PRIMO_SEARCH}?${new URLSearchParams({ ...FIXED, query: `any,contains,${term.replace(/,/g, ' ').trim()}` }).toString()}`
