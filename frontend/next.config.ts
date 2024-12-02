import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
 //   ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
        
      },
      {
        hostname: "firebasestorage.googleapis.com"
      }
    ],
  },
};

export default nextConfig;
