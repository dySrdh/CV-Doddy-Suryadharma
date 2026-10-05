/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // ship the serverless Chromium binaries with the PDF function
    outputFileTracingIncludes: { '/api/pdf': ['./node_modules/@sparticuz/chromium/bin/**'] },
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
}

module.exports = nextConfig
