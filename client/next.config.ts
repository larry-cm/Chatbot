import type { NextConfig } from "next";

const BUN_SERVER_URL = process.env.SERVER_URL ?? "http://localhost:1234";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BUN_SERVER_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
