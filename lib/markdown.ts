import { marked } from "marked";

// Conteúdo vem do CMS, editado pela própria cliente.
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
