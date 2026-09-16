import type { Metadata } from "next";
import { getGlobal, type Seo } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Título, descrição e imagem de compartilhamento de uma página. O que estiver
// na seção SEO do CMS manda; sem isso, vale o conteúdo da própria página e,
// na imagem, a de compartilhamento das Configurações.
export function pageMetadata({
  seo,
  titulo,
  descricao,
  imagem,
}: {
  seo?: Seo;
  titulo?: string;
  descricao?: string;
  imagem?: string;
}): Metadata {
  // Título escrito no CMS vale sozinho; o da página ganha "· Rachel Oliveira
  // Vieira" pelo template do layout.
  const title = seo?.titulo ? { absolute: seo.titulo } : titulo;
  const description = seo?.descricao || descricao || undefined;
  const image = imagem || getGlobal().og_image;
  const shared = seo?.titulo || (titulo ? `${titulo} · ${SITE_NAME}` : SITE_NAME);

  return {
    title,
    description,
    openGraph: {
      title: shared,
      description,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      url: SITE_URL.toString(),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: shared,
      description,
      images: image ? [image] : undefined,
    },
  };
}

// Resumo de um texto em markdown para a descrição, quando o CMS não tem uma.
export function excerpt(markdown: string, max = 160): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
}
