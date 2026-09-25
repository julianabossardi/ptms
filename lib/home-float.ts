import { getPageProjects } from "@/lib/content";
import { withSize } from "@/lib/images";

export type FloatImage = {
  src: string;
  slug: string;
  titulo: string;
  width: number;
  height: number;
};

// Quantos projetos viram imagem grande quando nenhum está marcado como
// destaque. Fallback temporário: some assim que houver um projeto marcado.
const FALLBACK_LARGE = 3;

function sized(src: string, slug: string, titulo: string): FloatImage | null {
  try {
    const { width, height } = withSize(src);
    return { src, slug, titulo, width, height };
  } catch {
    // Arquivo citado no CMS que não existe em public/: fica de fora.
    return null;
  }
}

// Grandes: a capa dos projetos em destaque. Pequenas: capa e galeria de todo
// o catálogo (com página própria), menos as que já entraram como grandes.
export function getFloatImages(): { large: FloatImage[]; small: FloatImage[] } {
  const projects = getPageProjects().filter((project) => project.capa);
  let featured = projects.filter((project) => project.destaque);
  if (featured.length === 0) featured = projects.slice(0, FALLBACK_LARGE);

  const large = featured.flatMap((p) => sized(p.capa, p.slug, p.titulo) ?? []);
  const used = new Set(large.map((image) => image.src));

  const small: FloatImage[] = [];
  for (const p of projects) {
    for (const src of new Set([p.capa, ...p.galeria])) {
      if (!src || used.has(src)) continue;
      const image = sized(src, p.slug, p.titulo);
      if (image) small.push(image);
    }
  }
  return { large, small };
}
