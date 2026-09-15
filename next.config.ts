import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF primeiro: costuma sair bem menor que o JPG sem perda visível.
  images: { formats: ["image/avif", "image/webp"] },
  // Decap CMS é servido como HTML estático em public/admin.
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
