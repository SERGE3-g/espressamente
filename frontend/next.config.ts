import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
