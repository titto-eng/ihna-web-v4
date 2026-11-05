// 20-blocks acceptance: every block config ≤ 40 lines and free of DB calls (AGENTS.md module rules).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'src', 'blocks')
const MAX_LINES = 40
const forbidden = [/getPayload\(/, /payload\.find/, /\.findByID\(/, /mysql2/, /from ['"]@\/lib\/portal/]
let failures = 0

for (const dir of readdirSync(root)) {
  const file = join(root, dir, 'config.ts')
  try { statSync(file) } catch { continue }
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n').filter((l) => l.trim() !== '').length
  if (lines > MAX_LINES) { console.error(`✗ ${dir}/config.ts has ${lines} non-empty lines (max ${MAX_LINES})`); failures++ }
  for (const re of forbidden) if (re.test(src)) { console.error(`✗ ${dir}/config.ts matches forbidden pattern ${re}`); failures++ }
}
if (failures) { console.error(`${failures} block check(s) failed`); process.exit(1) }
console.log('✓ block configs OK')
