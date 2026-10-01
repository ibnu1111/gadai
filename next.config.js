/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'gadai-production.up.railway.app' },
    ],
    // localPatterns acts as an allowlist once defined - must cover ALL local image
    // paths (not just the logo), otherwise every other local <Image> (e.g. /images/*)
    // gets blocked. This also permits the ?v=<ASSET_VERSION> cache-busting query
    // param on the logo (see src/lib/business.ts).
    localPatterns: [{ pathname: '/**' }],
  },
  async redirects() {
    return [
      // Consolidate SEO signals onto the apex domain: www is only attached as a
      // custom domain on Railway for coverage, it should never serve content directly.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.gadaijogja.com' }],
        destination: 'https://gadaijogja.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
