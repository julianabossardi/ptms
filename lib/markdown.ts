import { marked } from "marked";

// Legenda: parágrafo inteiro em itálico logo abaixo de uma imagem (créditos,
// @handles). CSS não distingue isso de um parágrafo com um trecho em itálico,
// então a marcação sai daqui como .caption.
const CAPTION =
  /(<p><img[^>]*><\/p>\s*)<p><em>((?:(?!<\/em>)[\s\S])*)<\/em><\/p>/g;

// Conteúdo vem do CMS, editado pela própria cliente.
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false });
  return html.replace(CAPTION, '$1<p class="caption">$2</p>');
}
