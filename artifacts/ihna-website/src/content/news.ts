// The `/news/` archive (DEC-39, DEC-42). `source: 'posts'` lists the posts collection (IHM). IHNA's `/news/` and its WordPress
// category archive `/category/india/news/` list the four WordPress posts that live at the site root as code pages (rule 1);
// the old `ihna_news` table is not shown anywhere on the live site, so there is no news collection.
export type NewsItem = { title: string; path: string; date: string; excerpt: string }
export type NewsListing = { source: 'posts' } | { source: 'items'; title: string; metaTitle?: string; items: NewsItem[] }

export const newsListing: NewsListing = {
  source: 'items',
  title: 'News',
  metaTitle: 'News', // the live page title (parity)
  items: [
    {
      title: 'A Call to Protect Australia’s Healthcare Future',
      path: '/a-call-to-protect-australias-healthcare-future/',
      date: '2024-09-03',
      excerpt: 'Dr. Bijo Kunnumpurath, CEO of HCI Australia, raises urgent concerns about the government decision to cap international students and its impact on nursing education and the healthcare workforce.',
    },
    {
      title: 'Celebrating NAIDOC Week with IHNA Australia',
      path: '/celebrating-naidoc-week-with-ihna-australia/',
      date: '2024-07-25',
      excerpt: 'As we honour NAIDOC Week, we invite you to join us in celebrating the rich cultural heritage and contributions of Aboriginal and Torres Strait Islander peoples. Our CEO & Managing Director, Dr. Bijo Kunnumpurath, has penned an insightful article reflecting on this important occasion and the strides our organisation has made in promoting and supporting Indigenous culture and communities.',
    },
    {
      title: 'IHNA is proud to announce its all-new',
      path: '/ihna-is-proud-to-announce-its-all-new/',
      date: '2023-06-19',
      excerpt: 'With IHNA’s HLT54121 Diploma of Nursing, you can start a rewarding career as an enrolled nurse with the opportunity to work anywhere in Australia, knowing the high demand for enrolled nurses.',
    },
    {
      title: 'Australia Welcomes International Students',
      path: '/australia-welcomes-international-students/',
      date: '2023-06-19',
      excerpt: 'Australia is set to welcome skilled workers and visa holders after twenty months of border closure. From December 1, fully vaccinated eligible visa holders can enter Australia without needing to apply for a travel exemption.',
    },
  ],
}
