import { mkdir, access } from 'node:fs/promises'
import path from 'node:path'
import { storage } from './storage-client.mjs'
export async function restorePublic() {
  const bucket = storage.bucket(process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID)
  const [files] = await bucket.getFiles({ prefix: 'ihna/public/' })
  if (!files.length) throw new Error('IHNA public assets have not been imported into App Storage.')
  let restored = 0
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (files.length) {
      const file = files.pop()
      const relative = file.name.slice('ihna/public/'.length)
      if (!relative || relative === 'robots.txt' || relative.split('/').includes('..')) continue
      const destination = path.join('public', relative)
      try { await access(destination); continue } catch {}
      await mkdir(path.dirname(destination), { recursive: true })
      await file.download({ destination })
      restored++
    }
  }))
  console.log(`Restored ${restored} public assets`)
}
