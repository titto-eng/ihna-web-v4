import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { redirects } from './src/content/redirects'
import { site } from './src/content/site'
import { trailingSlashRedirects } from './src/lib/trailing-slash'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/** HSTS (90-security §4): two years, subdomains included; production only, so a local http://localhost never pins itself. */
export const HSTS_VALUE = 'max-age=63072000; includeSubDomains'
export const productionHeaders = (nodeEnv: string | undefined) =>
  nodeEnv === 'production' ? [{ source: '/:path*', headers: [{ key: 'Strict-Transport-Security', value: HSTS_VALUE }] }] : []

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', ...(process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : [])],
  output: 'standalone', // Dockerfile copies .next/standalone (00-architecture §6 Deploy)
  poweredByHeader: false,
  headers: async () => productionHeaders(process.env.NODE_ENV),
  trailingSlash: true, // WordPress-style URLs (rule 1); non-slashed requests get a 308
  // Next's own trailing-slash redirects are replaced by the same two rules (first in `redirects`), minus `site.postWithoutSlash`: a webhook
  // POSTed without the slash must reach its handler with the body (src/proxy.ts rewrites it; other methods still get the 308 there).
  skipTrailingSlashRedirect: true,
  // Exact old-URL redirects (70-urls-seo §4). The list is code: src/content/redirects.ts.
  // `statusCode` instead of `permanent`: Next would answer 308/307, the old site and the parity crawl expect 301/302.
  redirects: async () => [
    ...trailingSlashRedirects(site.postWithoutSlash),
    ...redirects.map((r) => ({ source: r.from, destination: r.to, statusCode: r.permanent ? 301 : 302 })),
  ],
  // 45-payments §5: /payway-response/ is a live page (200) and PayWay's configured return URL. A return (signed parameters in the query)
  // goes to the return handler; a bare GET renders src/app/(site)/payway-response/page.tsx.
  rewrites: async () => ({
    beforeFiles: [{ source: '/payway-response/', has: [{ type: 'query', key: 'EncryptedParameters' }], destination: '/pay/return/payway/' }],
    afterFiles: [],
    fallback: [],
  }),
  images: {
    // 90 is used by the course hero photo, so it stays crisp on large screens
    qualities: [75, 90],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      // images of the IHNA landing pages, copied from the old pages into public/landing/ (60-landing)
      {
        pathname: '/landing/**',
      },
      // content images of the hardcoded pages (public/images/ihna/, copied once from the old site)
      {
        pathname: '/images/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
