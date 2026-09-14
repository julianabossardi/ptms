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

export type Credito = { funcao: string; nome: string };

export type Project = {
  slug: string;
  titulo: string;
  cliente: string;
  periodo: string;
  ordem: number;
  // false: projeto só citado na lista do Work, sem rota própria.
  pagina: boolean;
  capa: string;
  descricao_pt: string;
  descricao_en: string;
  creditos: Credito[];
  galeria: string[];
};

function readProject(file: string): Project {
  const data = readFrontmatter<Project>(`projects/${file}`);
  return {
    slug: file.replace(/\.md$/, ""),
    titulo: data.titulo ?? "",
    cliente: data.cliente ?? "",
    // YAML lê "2025" como número; o campo é texto livre ("2025 - hoje").
    periodo: String(data.periodo ?? ""),
    ordem: Number(data.ordem ?? 0),
    pagina: data.pagina ?? true,
    capa: data.capa ?? "",
    descricao_pt: data.descricao_pt ?? "",
    descricao_en: data.descricao_en ?? "",
    creditos: data.creditos ?? [],
    galeria: data.galeria ?? [],
  };
}

// Menor `ordem` primeiro; empate resolvido pelo título.
export function getProjects(): Project[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, "projects"))
    .filter((file) => file.endsWith(".md"))
    .map(readProject)
    .sort(
      (a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, "pt-BR"),
    );
}

export function getPageProjects(): Project[] {
  return getProjects().filter((project) => project.pagina);
}

export function getProject(slug: string) {
  const projects = getPageProjects();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return null;
  // O último projeto aponta de volta para o primeiro.
  const next = projects[(index + 1) % projects.length];
  return { project: projects[index], next };
}
