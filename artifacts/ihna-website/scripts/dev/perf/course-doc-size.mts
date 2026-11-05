// Size and shape of the course docs the route caches/renders (no dev server needed): npx tsx scripts/dev/perf/course-doc-size.mts
import 'dotenv/config'
process.env.DISABLE_DB_PUSH = '1'
const { getPayload } = await import('payload')
const config = (await import('../../../src/payload.config')).default
const payload = await getPayload({ config })
const slugs = ['bachelor-of-nursing-international', 'bachelor-of-social-work', 'graduate-certificate-in-advanced-nursing-australian-nursing-practice', 'diabetes-nursing', 'master-of-nursing-international']
const count = (o: unknown, type: string, acc: Record<string, number> = {}): Record<string, number> => {
  if (Array.isArray(o)) o.forEach((x) => count(x, type, acc))
  else if (o && typeof o === 'object') {
    const b = (o as { blockType?: string }).blockType
    if (b) acc[b] = (acc[b] ?? 0) + 1
    Object.values(o).forEach((x) => count(x, type, acc))
  }
  return acc
}
for (const slug of slugs) for (const depth of [0, 1, 2]) {
  const t = Date.now()
  const { docs } = await payload.find({ collection: 'courses', where: { path: { equals: `/courses/${slug}/` } }, depth, limit: 1 })
  const ms = Date.now() - t
  const d = docs[0]
  console.log(slug.slice(0, 40).padEnd(40), 'depth', depth, `${ms}ms`, `${Math.round(JSON.stringify(d).length / 1024)}KB`, depth === 1 ? JSON.stringify(count(d, 'x')) : '')
}
process.exit(0)
