import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@spendflow/shared'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
