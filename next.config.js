/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['python-shell'],
  },
}

module.exports = nextConfig
