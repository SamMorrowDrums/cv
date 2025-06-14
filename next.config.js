/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for better static generation
  trailingSlash: false,
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
  // Configure for better SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

module.exports = nextConfig