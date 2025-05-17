import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'nft-cdn.alchemy.com',
      'res.cloudinary.com',
      'ipfs.io',
      'gateway.pinata.cloud',
      'cloudflare-ipfs.com',
      'gateway.ipfs.io',
      'dweb.link',
      'i.seadn.io'
    ],
    unoptimized: true,
  },
};

export default nextConfig;