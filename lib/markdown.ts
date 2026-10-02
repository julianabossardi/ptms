import { marked } from "marked";

// Legenda: parágrafo inteiro em itálico logo abaixo de uma imagem (créditos,
// @handles). CSS não distingue isso de um parágrafo com um trecho em itálico,
// então a marcação sai daqui como .caption.
const CAPTION =
  /(<p><img[^>]*><\/p>\s*)<p><em>((?:(?!<\/em>)[\s\S])*)<\/em><\/p>/g;

// Imagem sozinha num parágrafo, com a legenda logo abaixo, se houver.
const IMAGE_BLOCK =
  /<p>(<img[^>]*>)<\/p>(\s*<p><em>((?:(?!<\/em>)[\s\S])*)<\/em><\/p>)?/g;

// Imagens do corpo passam pelo otimizador do Next (AVIF/WebP na largura da
// tela) em vez de irem como o JPG original.
const LOCAL_IMAGE = /<img src="(\/uploads\/[^"]+)"([^>]*)>/g;
const WIDTHS = [640, 1080, 1920];

function optimized(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&amp;w=${width}&amp;q=75`;
}

const escapeAttr = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Texto alternativo de uma imagem sem alt: a legenda dela (sem o "crédito:"
// do começo) ou, sem legenda, o título da página e o número da imagem.
// Leitores de tela e o Google dependem disso; o conteúdo importado costuma
// vir sem alt nenhum.
function altFrom(legenda: string | undefined, padrao: string | undefined, n: number) {
  const texto = legenda
    ?.replace(/<[^>]+>/g, "")
    .replace(/^\s*cr[eé]dito:\s*/i, "")
    .replace(/\.$/, "")
    .trim();
  if (texto) return texto.slice(0, 125);
  // Sem o ponto final do título: "título., imagem 1" fica estranho.
  const titulo = padrao?.replace(/[.!?…\s]+$/, "");
  return titulo ? escapeAttr(`${titulo}, imagem ${n}`) : "";
}

// Conteúdo vem do CMS, editado pela própria cliente. `altPadrao` (em geral o
// título da página) serve de texto alternativo para imagem sem legenda.
export function renderMarkdown(source: string, altPadrao?: string): string {
  let n = 0;
  const html = marked.parse(source, { async: false });
  return html
    .replace(IMAGE_BLOCK, (bloco: string, img: string, _legenda?: string, texto?: string) => {
      n += 1;
      if (/alt="[^"]+"/.test(img)) return bloco;
      const alt = altFrom(texto, altPadrao, n);
      if (!alt) return bloco;
      const novo = /alt="[^"]*"/.test(img)
        ? img.replace(/alt="[^"]*"/, `alt="${alt}"`)
        : img.replace(/^(<img src="[^"]*")/, `$1 alt="${alt}"`);
      return bloco.replace(img, novo);
    })
    .replace(LOCAL_IMAGE, (_, src: string, rest: string) => {
      const srcset = WIDTHS.map((width) => `${optimized(src, width)} ${width}w`).join(", ");
      return `<img src="${optimized(src, 1080)}" srcset="${srcset}" sizes="(min-width: 768px) 40rem, 100vw" loading="lazy" decoding="async"${rest}>`;
    })
    .replace(CAPTION, '$1<p class="caption">$2</p>');
}
