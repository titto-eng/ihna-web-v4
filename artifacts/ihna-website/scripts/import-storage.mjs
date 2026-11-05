import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { storage } from './storage-client.mjs'
const bucket = storage.bucket(process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID)
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))
  return results.flat()
}
const files = [...await walk('media'), ...await walk('public')]
let done = 0
await Promise.all(Array.from({ length: 16 }, async () => {
  while (files.length) {
    const file = files.pop()
    await bucket.upload(file, { destination: `ihna/${file}`, resumable: false })
    if (++done % 500 === 0) console.log(`Uploaded ${done} assets`)
  }
}))
console.log(`Uploaded ${done} assets to durable storage`)
