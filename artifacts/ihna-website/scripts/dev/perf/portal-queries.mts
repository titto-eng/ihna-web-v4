import 'dotenv/config'
const t0=Date.now()
const q = await import('../../../src/lib/portal/queries')
const names = Object.keys(q).filter(k => typeof (q as any)[k]==='function')
console.log('exports:', names.join(', '))
for (const n of names) {
  const t=Date.now()
  try { const r = await (q as any)[n](61); console.log(n, Date.now()-t,'ms', Array.isArray(r)? r.length+' rows' : typeof r) }
  catch (e) { console.log(n, Date.now()-t,'ms ERROR', (e as Error).message.slice(0,80)) }
}
console.log('total', Date.now()-t0,'ms')
