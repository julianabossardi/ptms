import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Conteúdo gerenciado pelo Decap CMS: markdown com frontmatter em /content.
const CONTENT_DIR = path.join(process.cwd(), "content");

export type Rede = { rotulo: string; url: string };

// Seção SEO do CMS. O slug só vale onde o endereço vem do conteúdo (projetos
// e posts); nas páginas fixas, a rota é do código.
export type Seo = { titulo: string; descricao: string; slug: string };

function readSeo(data: { seo?: Partial<Seo> }): Seo {
  const seo = data.seo ?? {};
  return {
    titulo: seo.titulo ?? "",
    descricao: seo.descricao ?? "",
    slug: seo.slug ?? "",
  };
}

// Slug escrito no CMS: sem acento, minúsculo e com hífens.
function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Dois conteúdos não podem responder pelo mesmo endereço: o primeiro fica com
// o slug e o seguinte volta para o nome do arquivo.
function withUniqueSlugs<T extends { slug: string; arquivo: string }>(items: T[]): T[] {
  const used = new Set<string>();
  return items.map((item) => {
    let slug = item.slug || item.arquivo;
    if (used.has(slug)) slug = used.has(item.arquivo) ? `${item.arquivo}-2` : item.arquivo;
    used.add(slug);
    return { ...item, slug };
  });
}

export type Global = { redes: Rede[]; og_image?: string };

export type HomePage = {
  nome: string;
  // Até três: o primeiro à esquerda, o segundo no centro, o terceiro à direita.
  cargos: string[];
  seo: Seo;
};

export type WorkPage = { seo: Seo };

export type ContactPage = {
  titulo: string;
  corpo: string;
  email: string;
  telefone: string;
  seo: Seo;
};

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
    cargos: (data.cargos ?? []).slice(0, 3),
    seo: readSeo(data),
  };
}

export function getWork(): WorkPage {
  return { seo: readSeo(readFrontmatter<WorkPage>("pages/work.md")) };
}

export function getContact(): ContactPage {
  const data = readFrontmatter<ContactPage>("pages/contact.md");
  return {
    titulo: data.titulo ?? "",
    corpo: data.corpo ?? "",
    email: data.email ?? "",
    telefone: data.telefone ?? "",
    seo: readSeo(data),
  };
}

// Matéria na seção Press do About. Sem imagem, o card mostra um espaço
// reservado; sem link, não é clicável.
export type Reportagem = {
  titulo: string;
  subtitulo: string;
  imagem: string;
  link: string;
};

export type AboutPage = {
  texto_pt: string;
  texto_en: string;
  imagens: string[];
  reportagens: Reportagem[];
  seo: Seo;
};

export function getAbout(): AboutPage {
  const data = readFrontmatter<AboutPage>("pages/about.md");
  return {
    texto_pt: data.texto_pt ?? "",
    texto_en: data.texto_en ?? "",
    imagens: data.imagens ?? [],
    reportagens: (data.reportagens ?? []).map((item) => ({
      titulo: item.titulo ?? "",
      subtitulo: item.subtitulo ?? "",
      imagem: item.imagem ?? "",
      link: item.link ?? "",
    })),
    seo: readSeo(data),
  };
}

export type PtmsPage = { subtitulo: string; descricao: string; seo: Seo };

export function getPtmsPage(): PtmsPage {
  const data = readFrontmatter<PtmsPage>("pages/ptms.md");
  return {
    subtitulo: data.subtitulo ?? "",
    descricao: data.descricao ?? "",
    seo: readSeo(data),
  };
}

export type Credito = { funcao: string; nome: string };

export type Project = {
  // Endereço do projeto: o slug do CMS ou, sem ele, o nome do arquivo.
  slug: string;
  arquivo: string;
  seo: Seo;
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
  const arquivo = file.replace(/\.md$/, "");
  const seo = readSeo(data);
  return {
    slug: toSlug(seo.slug),
    arquivo,
    seo,
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
  return withUniqueSlugs(
    listMarkdown("projects")
      .map(readProject)
      .sort(
        (a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, "pt-BR"),
      ),
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
  // Endereço do post: o slug do CMS ou, sem ele, o nome do arquivo.
  slug: string;
  arquivo: string;
  seo: Seo;
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
  const arquivo = file.replace(/\.md$/, "");
  const seo = readSeo(data);
  return {
    slug: toSlug(seo.slug),
    arquivo,
    seo,
    titulo: data.titulo ?? "",
    data: toIsoDate(data.data),
    thumb: data.thumb ?? "",
    corpo: data.corpo ?? "",
  };
}

// Mais recente primeiro; empate resolvido pelo título.
export function getPosts(): Post[] {
  return withUniqueSlugs(
    listMarkdown("ptms")
      .map(readPost)
      .sort(
        (a, b) =>
          b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo, "pt-BR"),
      ),
  );
}

export function getPost(slug: string) {
  const posts = getPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return null;
  const next = posts[(index + 1) % posts.length];
  return { post: posts[index], next };
}

// Cores dominantes das imagens de cada post, geradas no build por
// scripts/extract-palettes.mjs. A chave é o nome do arquivo, não o slug. Sem
// o arquivo ou sem imagens, vem vazio.
export function getPalette(arquivo: string): string[] {
  const file = path.join(CONTENT_DIR, "ptms/palettes.json");
  if (!fs.existsSync(file)) return [];
  const palettes = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    string[]
  >;
  return palettes[arquivo] ?? [];
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

// Paginação da listagem do PTMS: cinco posts por página, a primeira em /ptms
// e as seguintes em /ptms/pagina/2, 3...
export const POSTS_PER_PAGE = 5;

export function getPostsPage(page: number) {
  const posts = getPosts();
  const pages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  return { posts: posts.slice(start, start + POSTS_PER_PAGE), page, pages };
}
