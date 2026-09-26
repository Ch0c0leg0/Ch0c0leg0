import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine du workspace explicite (évite l'inférence erronée de Turbopack
  // quand un dossier parent contient d'autres lockfiles).
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;