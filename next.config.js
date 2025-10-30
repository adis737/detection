/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['python-shell'],
  },
  output: 'standalone'
}

module.exports = nextConfig
