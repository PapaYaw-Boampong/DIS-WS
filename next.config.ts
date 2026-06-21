import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    qualities: [82, 86, 90],
    minimumCacheTTL: 31_536_000,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
