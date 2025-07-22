// Front-End/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['source.unsplash.com']
  },
  // Pour le build static
  output: 'export',
  distDir: 'out',
  // Pour l'API externe
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  typescript: {
    // Pour le build en production même avec des erreurs TS
    ignoreBuildErrors: true,
  },
  eslint: {
    // Pour le build en production même avec des erreurs ESLint
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;