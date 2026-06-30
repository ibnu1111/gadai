/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'gadai-production.up.railway.app'],
  },
}

module.exports = nextConfig
