/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for better static generation
  trailingSlash: false,
  output: 'export',
  // Use the production custom domain on production builds, fall back to
  // the deploy-specific URL for previews/branch deploys.
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.CONTEXT === 'production'
        ? (process.env.URL || 'https://sam-morrow.com')
        : (process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://sam-morrow.com'),
  },
  // Ensure proper static generation
  generateEtags: true,
  poweredByHeader: false,
  // Configure webpack for better static assets
  webpack: (config, { isServer }) => {
    // Ensure all modules are bundled properly
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
}

module.exports = nextConfig;