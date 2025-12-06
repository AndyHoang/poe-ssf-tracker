import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow PoE CDN images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web.poecdn.com",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
