import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "api.next.shaqyrym.online",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
