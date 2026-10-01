/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'gadai-production.up.railway.app' },
    ],
    // Allows the ?v=<ASSET_VERSION> cache-busting query param on the logo (see src/lib/business.ts).
    localPatterns: [{ pathname: '/logo-gadai.png' }],
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
