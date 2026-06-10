/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: { allowedOrigins: ['inscricoes.inp.co.ao'] },
  },
}

module.exports = nextConfig
