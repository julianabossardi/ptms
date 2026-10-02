import {
  getAbout,
  getContact,
  getGlobal,
  getHome,
  getPageProjects,
  getPtmsPage,
  type Post,
  type Project,
} from "@/lib/content";
import { absoluteUrl, excerpt, shareImageUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

// Dados estruturados (schema.org, JSON-LD) montados a partir do conteúdo do
// CMS: o Google usa para entender quem é a pessoa, o que é cada página e
// montar resultados mais ricos. Cada página emite um grafo próprio (JsonLd).
export type Node = Record<string, unknown>;

const personId = () => absoluteUrl("/#rachel");
const websiteId = () => absoluteUrl("/#site");
const imageUrl = (src: string) => absoluteUrl(shareImageUrl(src));

export function graph(...nodes: Node[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    url: absoluteUrl("/"),
    name: SITE_NAME,
    inLanguage: ["pt-BR", "en"],
    publisher: { "@id": personId() },
  };
}

// Referência curta, para autoria: nome e endereço bastam.
function personRef(): Node {
  return {
    "@type": "Person",
    "@id": personId(),
    name: getHome().nome || SITE_NAME,
    url: absoluteUrl("/"),
  };
}

export function personNode(): Node {
  const about = getAbout();
  const contato = getContact();
  const foto = about.imagens[0];
  const telefone = contato.telefone.replace(/[^\d+]/g, "");
  return {
    ...personRef(),
    description: excerpt(about.texto_pt) || undefined,
    image: foto ? imageUrl(foto) : undefined,
    email: contato.email ? `mailto:${contato.email}` : undefined,
    telephone: telefone || undefined,
    address: { "@type": "PostalAddress", addressLocality: "Rio de Janeiro", addressCountry: "BR" },
    sameAs: getGlobal().redes.map((rede) => rede.url),
  };
}

export function breadcrumbNode(itens: { nome: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: item.nome,
      item: absoluteUrl(item.path),
    })),
  };
}

export function aboutNode(): Node {
  const { reportagens } = getAbout();
  // A imprensa vira "assunto" da pessoa: matérias que falam dela.
  const imprensa = reportagens
    .filter((item) => item.link)
    .map((item) => ({
      "@type": "CreativeWork",
      name: item.titulo,
      description: item.subtitulo || undefined,
      url: item.link,
    }));
  return {
    "@type": "ProfilePage",
    "@id": absoluteUrl("/about#page"),
    url: absoluteUrl("/about"),
    name: "About",
    isPartOf: { "@id": websiteId() },
    mainEntity: { ...personNode(), subjectOf: imprensa.length > 0 ? imprensa : undefined },
  };
}

export function contactNode(): Node {
  return {
    "@type": "ContactPage",
    "@id": absoluteUrl("/contact#page"),
    url: absoluteUrl("/contact"),
    name: "Contact",
    isPartOf: { "@id": websiteId() },
    about: { "@id": personId() },
  };
}

export function workNode(): Node {
  return {
    "@type": "CollectionPage",
    "@id": absoluteUrl("/projects#page"),
    url: absoluteUrl("/projects"),
    name: "Work",
    isPartOf: { "@id": websiteId() },
    about: { "@id": personId() },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: getPageProjects().map((projeto, indice) => ({
        "@type": "ListItem",
        position: indice + 1,
        url: absoluteUrl(`/projects/${projeto.slug}`),
        name: projeto.titulo,
      })),
    },
  };
}

export function projectNode(project: Project, descricao: string): Node {
  const ano = project.periodo.match(/\b(?:19|20)\d{2}\b/)?.[0];
  const imagens = [project.capa, ...project.galeria.slice(0, 5)].filter(Boolean);
  const creditos = project.creditos
    .map((c) => `${c.funcao.trim()}: ${c.nome.trim()}`)
    .filter((c) => c.length > 2)
    .join("; ");
  const url = absoluteUrl(`/projects/${project.slug}`);
  return {
    "@type": "CreativeWork",
    "@id": `${url}#projeto`,
    url,
    name: project.titulo,
    description: descricao || undefined,
    image: imagens.length > 0 ? imagens.map(imageUrl) : undefined,
    dateCreated: ano,
    inLanguage: project.descricao_en ? ["pt-BR", "en"] : "pt-BR",
    creditText: creditos || undefined,
    contributor: { "@id": personId() },
    isPartOf: { "@id": websiteId() },
  };
}

export function blogNode(posts: Post[]): Node {
  const { subtitulo, descricao } = getPtmsPage();
  return {
    "@type": "Blog",
    "@id": absoluteUrl("/ptms#blog"),
    url: absoluteUrl("/ptms"),
    name: subtitulo ? `PTMS, ${subtitulo}` : "PTMS,",
    description: descricao || undefined,
    inLanguage: "pt-BR",
    author: personRef(),
    publisher: personRef(),
    isPartOf: { "@id": websiteId() },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.titulo,
      url: absoluteUrl(`/ptms/${post.slug}`),
      datePublished: post.data || undefined,
    })),
  };
}

export function postNode(post: Post, descricao: string): Node {
  const url = absoluteUrl(`/ptms/${post.slug}`);
  const doCorpo = [...post.corpo.matchAll(/!\[[^\]]*\]\((\/uploads\/[^)\s]+)\)/g)].map((m) => m[1]);
  const imagens = [post.thumb, ...doCorpo].filter(Boolean).slice(0, 5);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    url,
    headline: post.titulo,
    description: descricao || undefined,
    datePublished: post.data || undefined,
    image: imagens.length > 0 ? imagens.map(imageUrl) : undefined,
    inLanguage: "pt-BR",
    wordCount: post.corpo.split(/\s+/).filter(Boolean).length,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: personRef(),
    publisher: personRef(),
    isPartOf: { "@id": absoluteUrl("/ptms#blog") },
  };
}
