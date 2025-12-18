import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    const rewrites = [
      {
        source: "/api/send",
        destination: "https://analytics.notesbuddy.in/api/send",
      },
    ];

    // Only add script.js rewrite if UMAMI_SRC is configured
    if (process.env.NEXT_PUBLIC_UMAMI_SRC) {
      rewrites.unshift({
        source: "/script.js",
        destination: process.env.NEXT_PUBLIC_UMAMI_SRC,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
