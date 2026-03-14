import type { NextConfig } from "next";
import packageJson from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: false,
      hmrRefreshes: false,
    },
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  // Necessario per il build Docker standalone
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.espressamente.it",
      },
      {
        // MinIO locale per sviluppo
        protocol: "http",
        hostname: "localhost",
        port: "9095",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
    ],
  },
  async rewrites() {
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/api$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
