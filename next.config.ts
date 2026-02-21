import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger file uploads (mobile photos often 3–5MB+). Default 1MB causes
    // 500 HTML error page on mobile when body exceeds limit → "invalid JSON" client error
    serverActions: {
      bodySizeLimit: '6mb',
    },
    proxyClientMaxBodySize: '6mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow unoptimized images for placeholder/example images
    unoptimized: false,
  },
};

export default nextConfig;
