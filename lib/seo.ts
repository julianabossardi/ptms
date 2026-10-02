import type { Metadata } from "next";
import { getAbout, getGlobal, getHome, type Project, type Seo } from "@/lib/content";
import { withSize } from "@/lib/images";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Endereço absoluto de um caminho do site (sitemap, dados estruturados).
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

const SHARE_WIDTH = 1200;

// Endereço da imagem de compartilhamento: passa pelo otimizador do Next, em
// 1200px, e não pelo arquivo cru, que chega a vários MB (o WhatsApp, por
// exemplo, desiste de preview com imagem pesada). Os robôs das redes não
// pedem AVIF, então recebem JPEG/PNG.
export function shareImageUrl(src: string): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${SHARE_WIDTH}&q=75`;
}

function shareImage(src: string, alt: string) {
  const url = shareImageUrl(src);
  try {
    // O otimizador não amplia: uma foto de 1066px sai com 1066px.
    const { width, height } = withSize(src);
    const largura = Math.min(width, SHARE_WIDTH);
    return { url, width: largura, height: Math.round((largura * height) / width), alt };
  } catch {
    return { url, alt };
  }
}

type Pagina = {
  seo?: Seo;
  titulo?: string;
  // Título que já traz o nome do site, sem o "· Rachel Oliveira Vieira".
  semSufixo?: boolean;
  descricao?: string;
  imagem?: string;
  imagemAlt?: string;
  // Caminho da página (/about): vira o endereço canônico e o og:url.
  path: string;
  tipo?: "website" | "article";
  // AAAA-MM-DD, só para artigos.
  publicadoEm?: string;
};

// Título, descrição, endereço canônico e preview de compartilhamento de uma
// página. O que estiver na seção SEO do CMS manda; sem isso, vale o conteúdo
// da própria página e, na imagem, a das Configurações e, por fim, a foto do
// About.
export function pageMetadata({
  seo,
  titulo,
  semSufixo,
  descricao,
  imagem,
  imagemAlt,
  path,
  tipo = "website",
  publicadoEm,
}: Pagina): Metadata {
  const title = seo?.titulo
    ? { absolute: seo.titulo }
    : semSufixo && titulo
      ? { absolute: titulo }
      : titulo;
  const description = seo?.descricao || descricao || undefined;
  const origem = imagem || getGlobal().og_image || getAbout().imagens[0];
  const image = origem ? shareImage(origem, imagemAlt ?? titulo ?? SITE_NAME) : undefined;
  const shared =
    seo?.titulo || (titulo ? (semSufixo ? titulo : `${titulo} · ${SITE_NAME}`) : SITE_NAME);

  const comum = {
    title: shared,
    description,
    siteName: SITE_NAME,
    locale: "pt_BR",
    url: path,
    images: image ? [image] : undefined,
  };
  const openGraph: Metadata["openGraph"] =
    tipo === "article"
      ? { ...comum, type: "article", publishedTime: publicadoEm, authors: [SITE_NAME] }
      : { ...comum, type: "website" };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: shared,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

// Resumo de um texto em markdown para a descrição, quando o CMS não tem uma:
// frases inteiras enquanto couberem; só corta no meio de uma frase se a
// primeira já for maior que o limite.
export function excerpt(markdown: string, max = 175): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;

  const frases = text.match(/[^.!?…]+[.!?…]+(?=\s|$)/g) ?? [];
  let resumo = "";
  for (const frase of frases) {
    if ((resumo + frase).trim().length > max) break;
    resumo += frase;
  }
  if (resumo.trim().length >= 50) return resumo.trim();

  const corte = text.slice(0, max);
  return `${corte.slice(0, corte.lastIndexOf(" ")).trimEnd()}…`;
}

// Descrição de um projeto: o texto da própria página (PT, depois EN) e, sem
// texto, uma frase montada com os dados do projeto.
export function projectDescription(project: Project): string {
  const texto = excerpt(project.descricao_pt) || excerpt(project.descricao_en);
  if (texto) return texto;
  const cliente = project.cliente ? ` — ${project.cliente}` : "";
  const periodo = project.periodo ? `, ${project.periodo}` : "";
  return `${project.titulo}${cliente}${periodo}. Projeto de ${getHome().nome}.`;
}
