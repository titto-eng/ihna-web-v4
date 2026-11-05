import 'dotenv/config'
process.env.DISABLE_DB_PUSH='1'
const { getPayload } = await import('payload')
const config = (await import('../../../src/payload.config')).default
let t=Date.now(); const payload = await getPayload({ config }); console.log('getPayload', Date.now()-t,'ms')
for (const depth of [0,1,2]) { t=Date.now(); const r = await payload.find({ collection:'courses', where:{ slug:{ equals:'bachelor-of-nursing-international' } }, depth, limit:1 }); console.log(`courses.find depth=${depth}`, Date.now()-t,'ms; layout blocks:', (r.docs[0] as any)?.layout?.length) }
t=Date.now(); await payload.findGlobal({ slug:'courseShared' }); console.log('courseShared', Date.now()-t,'ms')
t=Date.now(); await payload.findGlobal({ slug:'header', depth:1 }); console.log('header global', Date.now()-t,'ms')
t=Date.now(); await payload.find({ collection:'courses', where:{ slug:{ equals:'bachelor-of-nursing-international' } }, depth:2, limit:1 }); console.log('courses.find depth=2 again', Date.now()-t,'ms')
process.exit(0)
