/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for better static generation
  trailingSlash: false,
  output: 'export',
  // Ensure proper static generation
  generateEtags: false,
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