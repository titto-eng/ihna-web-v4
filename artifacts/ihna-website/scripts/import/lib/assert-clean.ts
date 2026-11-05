// Rule 5 (AGENTS.md): no old HTML, class or inline style reaches the database. Run on every document before it is written
// and again by the tests. `class=`/`style=` are checked as attribute syntax so Lexical's own `"style": ""` keys do not trip it.
const PATTERNS: [RegExp, string][] = [
  [/\bclass\s*=/i, 'class='],
  [/\bstyle\s*=/i, 'style='],
  [/\bclassName\b/, 'className'],
  [/<\s*(div|span|script|style|iframe|section|font)\b/i, 'raw html tag'],
  [/\son[a-z]+\s*=\s*["']/i, 'on* handler'],
  [/javascript:/i, 'javascript: url'],
  [/\/wp-content\/themes\//i, 'theme asset url'],
  [/"style"\s*:\s*"[^"]+"\s*,\s*"text"/, 'non-empty lexical text style'], // block fields named `style` (cta links) are legitimate
]

export function findLegacyMarkup(value: unknown): string[] {
  const dump = JSON.stringify(value) ?? ''
  const unescaped = dump.replace(/\\"/g, '"')
  return PATTERNS.filter(([re]) => re.test(unescaped)).map(([, label]) => label)
}

export function assertNoLegacyMarkup(value: unknown, label: string): void {
  const hits = findLegacyMarkup(value)
  if (hits.length) throw new Error(`rule 5: ${label} contains ${hits.join(', ')}`)
}
