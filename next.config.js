// /Users/parthkaran/Documents/claude_projects/liquidswap/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  images: {
    domains: ['stellar.expert'],
  },
  env: {
    // Exposing NEXT_PUBLIC_* variables to the client-side
    // These will be picked up automatically by Next.js if they start with NEXT_PUBLIC_
    // but can also be explicitly mapped here if needed.
  },
};

module.exports = nextConfig;
