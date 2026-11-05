import { describe, expect, it } from 'vitest'
import { run, unsafeSvgReason } from '../../scripts/import/steps/static'
import type { ImportContext } from '../../scripts/import/lib/context'

// 30-import `static` step: SVGs that carry script are skipped (90-security §7), and the step honours the CLI's `ctx.dry`.
describe('static step: SVG check', () => {
  it('passes a plain SVG', () => {
    expect(unsafeSvgReason('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z" fill="#123"/></svg>')).toBeNull()
    expect(unsafeSvgReason('<svg><title>Online courses</title><text>on sale</text><a href="https://ihm.edu.au/">x</a></svg>')).toBeNull()
  })
  it('rejects <script>, javascript: URLs and on*= handlers, in any case and with entity-encoded text', () => {
    expect(unsafeSvgReason('<svg><script>alert(1)</script></svg>')).toMatch(/<script>/)
    expect(unsafeSvgReason('<svg><SCRIPT href="x"/></svg>')).toMatch(/<script>/)
    expect(unsafeSvgReason('<svg>< script>1</script></svg>')).toMatch(/<script>/)
    expect(unsafeSvgReason('<svg><a href="javascript:alert(1)">x</a></svg>')).toMatch(/javascript:/)
    expect(unsafeSvgReason('<svg><a href="JAVASCRIPT :alert(1)">x</a></svg>')).toMatch(/javascript:/)
    expect(unsafeSvgReason('<svg onload="alert(1)"></svg>')).toMatch(/on\*=/)
    expect(unsafeSvgReason('<svg><rect ONCLICK = "x"/></svg>')).toMatch(/on\*=/)
    expect(unsafeSvgReason('<svg><a href="&#106;avascript:alert(1)">x</a></svg>')).toMatch(/javascript:/)
    expect(unsafeSvgReason('<svg><a href="&#x6A;avascript:alert(1)">x</a></svg>')).toMatch(/javascript:/)
  })
  it('run() reads the CLI context field `dry`', () => {
    // Compile-time: the import CLI passes the whole ImportContext, whose dry flag is `dry` (lib/context.ts).
    const accepts: (ctx: Pick<ImportContext, 'dry'>) => Promise<unknown> = run
    expect(typeof accepts).toBe('function')
  })
})
