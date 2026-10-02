import type { MetadataRoute } from "next";
import { getPageProjects, getPosts, getPostsPage } from "@/lib/content";
import { absoluteUrl, shareImageUrl } from "@/lib/seo";

// Mapa do site para o Google: todas as páginas públicas, com as fotos dos
// projetos e dos posts (sitemap de imagens). Sai do conteúdo do CMS, então
// um projeto ou post novo entra sozinho no próximo deploy. Sem datas de
// modificação: o conteúdo não guarda quando foi editado, e uma data inventada
// só atrapalha.
export default function sitemap(): MetadataRoute.Sitemap {
  const imagens = (fotos: string[]) =>
    fotos.filter(Boolean).map((foto) => absoluteUrl(shareImageUrl(foto)));
  const { pages } = getPostsPage(1);

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/projects") },
    ...getPageProjects().map((projeto) => ({
      url: absoluteUrl(`/projects/${projeto.slug}`),
      images: imagens([projeto.capa, ...projeto.galeria]),
    })),
    { url: absoluteUrl("/about") },
    { url: absoluteUrl("/ptms") },
    ...Array.from({ length: Math.max(pages - 1, 0) }, (_, i) => ({
      url: absoluteUrl(`/ptms/pagina/${i + 2}`),
    })),
    ...getPosts().map((post) => ({
      url: absoluteUrl(`/ptms/${post.slug}`),
      images: imagens([post.thumb]),
    })),
    { url: absoluteUrl("/contact") },
  ];
}
