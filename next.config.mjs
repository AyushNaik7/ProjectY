/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude clerk-nextjs test folder from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Ignore clerk-nextjs folder during build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/clerk-nextjs/**', '**/node_modules/**'],
    };
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ],
      },
    ];
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Image optimization
  images: {
    domains: ['ysbaxsczgauyslcbmazy.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
