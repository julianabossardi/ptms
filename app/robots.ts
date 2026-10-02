import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Tudo público pode ser indexado; o CMS e as rotas de login ficam de fora.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
