import { marked } from "marked";

// Legenda: parágrafo inteiro em itálico logo abaixo de uma imagem (créditos,
// @handles). CSS não distingue isso de um parágrafo com um trecho em itálico,
// então a marcação sai daqui como .caption.
const CAPTION =
  /(<p><img[^>]*><\/p>\s*)<p><em>((?:(?!<\/em>)[\s\S])*)<\/em><\/p>/g;

// Imagens do corpo passam pelo otimizador do Next (AVIF/WebP na largura da
// tela) em vez de irem como o JPG original.
const LOCAL_IMAGE = /<img src="(\/uploads\/[^"]+)"([^>]*)>/g;
const WIDTHS = [640, 1080, 1920];

function optimized(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&amp;w=${width}&amp;q=75`;
}

// Conteúdo vem do CMS, editado pela própria cliente.
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false });
  return html
    .replace(LOCAL_IMAGE, (_, src: string, rest: string) => {
      const srcset = WIDTHS.map((width) => `${optimized(src, width)} ${width}w`).join(", ");
      return `<img src="${optimized(src, 1080)}" srcset="${srcset}" sizes="(min-width: 768px) 40rem, 100vw" loading="lazy" decoding="async"${rest}>`;
    })
    .replace(CAPTION, '$1<p class="caption">$2</p>');
}
