import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Decap CMS é servido como HTML estático em public/admin.
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
