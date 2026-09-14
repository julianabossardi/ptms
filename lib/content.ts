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

function listMarkdown(folder: string): string[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, folder))
    .filter((file) => file.endsWith(".md"));
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

export type AboutPage = { texto_pt: string; texto_en: string; imagens: string[] };

export function getAbout(): AboutPage {
  const data = readFrontmatter<AboutPage>("pages/about.md");
  return {
    texto_pt: data.texto_pt ?? "",
    texto_en: data.texto_en ?? "",
    imagens: data.imagens ?? [],
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
  return listMarkdown("projects")
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

export type Post = {
  slug: string;
  titulo: string;
  // AAAA-MM-DD
  data: string;
  thumb: string;
  corpo: string;
};

// O YAML transforma 2026-08-19 em Date; o Decap grava texto. Os dois viram AAAA-MM-DD.
function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

function readPost(file: string): Post {
  const data = readFrontmatter<Post>(`ptms/${file}`);
  return {
    slug: file.replace(/\.md$/, ""),
    titulo: data.titulo ?? "",
    data: toIsoDate(data.data),
    thumb: data.thumb ?? "",
    corpo: data.corpo ?? "",
  };
}

// Mais recente primeiro; empate resolvido pelo título.
export function getPosts(): Post[] {
  return listMarkdown("ptms")
    .map(readPost)
    .sort(
      (a, b) =>
        b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo, "pt-BR"),
    );
}

export function getPost(slug: string) {
  const posts = getPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return null;
  const next = posts[(index + 1) % posts.length];
  return { post: posts[index], next };
}

// "19 de ago. de 2026", como na referência. UTC evita voltar um dia no fuso do Brasil.
export function formatPostDate(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
