/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ottimizzazioni immagini
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Header di sicurezza
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',   value: 'on' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(self), microphone=()' },
        ],
      },
      {
        // Cache lunga per assets statici
        source: '/icons/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  // Redirect
  async redirects() {
    return [
      { source: '/app', destination: '/', permanent: false },
    ]
  },

  // Compressione
  compress: true,

  // Logging ridotto in produzione
  logging: { fetches: { fullUrl: false } },
}

export default nextConfig
