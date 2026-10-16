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
  // The portal holds pupil, family and finance records. robots.txt asks
  // crawlers not to index it; these headers tell them not to, and stop a
  // portal page being framed or leaking its URL as a referrer.
  // The principal's message became "A Message from Mummy"; keep old links
  // and search results working.
  async redirects() {
    return [
      {
        source: "/about/principal-message",
        destination: "/about/message-from-mummy",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/portal/:path*",
        headers: [
          {
            key: "x-robots-tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          { key: "x-frame-options", value: "DENY" },
          { key: "referrer-policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
