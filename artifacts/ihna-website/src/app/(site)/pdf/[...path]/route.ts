import { serveDocumentPath } from '../serve'

// GET/HEAD /pdf/<path>.pdf (direct) and /pdf/~/<prefix>/<path>.pdf (the proxy's rewrite of every document URL, so the `documents`
// collection wins over a static copy in public/). See ../serve.ts for the lookup order.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Ctx = { params: Promise<{ path: string[] }> }

const handle = async (req: Request, ctx: Ctx) => serveDocumentPath(req, (await ctx.params).path)

export const GET = handle
export const HEAD = handle
