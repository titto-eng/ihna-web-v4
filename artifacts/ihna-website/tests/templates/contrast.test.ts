import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// 05-design-system §1 and DEC-16: every text-on-fill pair the components use reaches WCAG AA (4.5:1), read from theme.css.
const css = readFileSync(resolve(__dirname, '../../src/styles/theme.css'), 'utf8')

function token(name: string): [number, number, number] {
  const m = new RegExp(`--color-${name}:\\s*hsl\\((\\d+(?:\\.\\d+)?)\\s+(\\d+(?:\\.\\d+)?)%\\s+(\\d+(?:\\.\\d+)?)%\\)`).exec(css)
  if (!m) throw new Error(`--color-${name} is not an hsl() token`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function luminance([h, s, l]: [number, number, number]): number {
  const S = s / 100
  const L = l / 100
  const a = S * Math.min(L, 1 - L)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(f(0)) + 0.7152 * lin(f(8)) + 0.0722 * lin(f(4))
}

const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(token(a)), luminance(token(b))].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

describe('theme contrast (AA)', () => {
  // [text, fill, where]
  const pairs: [string, string, string][] = [
    ['foreground', 'primary', 'filled primary button, active tab and pill, video play disc'],
    ['primary-foreground', 'primary-strong', 'primary button hover, current SectionNav pill'],
    ['secondary-foreground', 'secondary', 'secondary button and badge'],
    ['accent-foreground', 'accent', 'accent fills'],
    ['ink-foreground', 'ink', 'ink sections and buttons'],
    ['destructive-foreground', 'destructive', 'destructive button'],
    ['primary-strong', 'background', 'links and emphasis on light surfaces'],
    ['muted-foreground', 'muted', 'secondary text on muted'],
  ]
  for (const [text, fill, where] of pairs) {
    it(`${text} on ${fill} (${where}) is at least 4.5:1`, () => {
      expect(ratio(text, fill)).toBeGreaterThanOrEqual(4.5)
    })
  }

  it('the focus ring reaches 3:1 against the page background', () => {
    expect(ratio('ring', 'background')).toBeGreaterThanOrEqual(3)
  })
})
