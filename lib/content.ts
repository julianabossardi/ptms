import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Conteúdo gerenciado pelo Decap CMS: markdown com frontmatter em /content.
const CONTENT_DIR = path.join(process.cwd(), "content");

export type Rede = { rotulo: string; url: string };

export type Global = { redes: Rede[]; og_image?: string };

export type HomePage = {
  nome: string;
  funcao: string;
  local: string;
  collage: string[];
};

export type ContactPage = { titulo: string; corpo: string; email: string };

function readFrontmatter<T>(file: string): Partial<T> {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  return matter(raw).data as Partial<T>;
}

export function getGlobal(): Global {
  const data = readFrontmatter<Global>("config/global.md");
  return { redes: data.redes ?? [], og_image: data.og_image || undefined };
}

export function getHome(): HomePage {
  const data = readFrontmatter<HomePage>("pages/home.md");
  return {
    nome: data.nome ?? "",
    funcao: data.funcao ?? "",
    local: data.local ?? "",
    collage: data.collage ?? [],
  };
}

export function getContact(): ContactPage {
  const data = readFrontmatter<ContactPage>("pages/contact.md");
  return {
    titulo: data.titulo ?? "",
    corpo: data.corpo ?? "",
    email: data.email ?? "",
  };
}
