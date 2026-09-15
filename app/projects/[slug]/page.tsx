import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CursorPlus from "@/components/CursorPlus";
import BlockReveal, { BlockPhoto } from "@/components/BlockReveal";
import { getPageProjects, getProject } from "@/lib/content";
import { withSize, type SizedImage } from "@/lib/images";
import { renderMarkdown } from "@/lib/markdown";

// Só projetos com página própria viram rota; qualquer outro slug responde 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPageProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getProject(slug)?.project.titulo };
}

type GalleryImage = SizedImage & { n: number };

type GalleryRow =
  | { kind: "full"; image: GalleryImage }
  | { kind: "single"; image: GalleryImage }
  | { kind: "pair"; images: [GalleryImage, GalleryImage] };

// Ritmo fixo: uma linha larga, depois uma dupla desencontrada, e repete. A
// linha larga só ocupa a largura toda com foto horizontal; vertical fica
// centralizada. O ritmo não depende da ordem, então resiste quando a cliente
// reordena.
function groupGallery(images: GalleryImage[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let i = 0;
  while (i < images.length) {
    const image = images[i];
    const wideSlot = rows.length % 2 === 0;
    if (wideSlot) {
      const landscape = image.width > image.height;
      rows.push({ kind: landscape ? "full" : "single", image });
      i += 1;
    } else if (i === images.length - 1) {
      // Sobrou uma só na vaga de dupla: centraliza, sem repetir linha larga.
      rows.push({ kind: "single", image });
      i += 1;
    } else {
      rows.push({ kind: "pair", images: [image, images[i + 1]] });
      i += 2;
    }
  }
  return rows;
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const entry = getProject(slug);
  if (!entry) notFound();

  const { project, next } = entry;
  const gallery = project.galeria.map((src, index) => ({
    ...withSize(src),
    n: index + 1,
  }));
  const rows = groupGallery(gallery);
  const alt = (image: GalleryImage) => `${project.titulo}, imagem ${image.n}`;

  return (
    <article className="bg-black">
      {/* O cabeçalho fica preso por cima da capa enquanto ela sobe e sai
          exatamente quando a capa termina: a seção acaba no fim da imagem. */}
      <section className="relative">
        <header className="pointer-events-none sticky top-0 z-20 px-[var(--gutter)] pt-[20vh] pb-[6vh]">
          <h1 className="font-display text-[clamp(3.5rem,9vw,10rem)] leading-[0.95] font-medium">
            {project.titulo}
          </h1>
          <div className="mt-6 flex items-baseline justify-between gap-6 font-body text-sm">
            <p>{project.cliente}</p>
            <p className="shrink-0">{project.periodo}</p>
          </div>
        </header>

        {project.capa && (
          <div className="px-[var(--gutter)]">
            <div className="relative mx-auto aspect-[4/5] w-full md:w-[42vw]">
              <Image
                src={project.capa}
                alt={project.titulo}
                fill
                preload
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-12 px-[var(--gutter)] py-[10vw] md:grid-cols-2">
        <div className="max-w-[30rem] space-y-6 font-body text-sm leading-relaxed">
          <div
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(project.descricao_pt),
            }}
          />
          {project.descricao_en && (
            <div
              lang="en"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(project.descricao_en),
              }}
            />
          )}
        </div>

        {project.creditos.length > 0 && (
          <dl className="grid content-start gap-4 font-body text-xs">
            {project.creditos.map((credito) => (
              <div key={`${credito.funcao}-${credito.nome}`}>
                <dt className="text-gray">{credito.funcao}</dt>
                <dd>{credito.nome}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {rows.length > 0 && (
        // As fotos chegam em blocos, como o menu (components/BlockReveal).
        <BlockReveal className="flex flex-col gap-[6vw] px-[var(--gutter)] pb-[12vw]">
          {rows.map((row) => {
            if (row.kind === "full") {
              return (
                <BlockPhoto
                  key={row.image.src}
                  image={row.image}
                  alt={alt(row.image)}
                  sizes="100vw"
                  columns={12}
                />
              );
            }

            if (row.kind === "single") {
              return (
                <BlockPhoto
                  key={row.image.src}
                  image={row.image}
                  alt={alt(row.image)}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  columns={6}
                  className="mx-auto w-full md:w-1/2"
                />
              );
            }

            const [first, second] = row.images;
            return (
              <div
                key={first.src}
                className="grid gap-[var(--gutter)] md:grid-cols-2 md:items-start"
              >
                <BlockPhoto
                  image={first}
                  alt={alt(first)}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  columns={6}
                />
                {/* A segunda desce: desencontro observado na referência. */}
                <BlockPhoto
                  image={second}
                  alt={alt(second)}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  columns={6}
                  className="md:mt-[14vw]"
                />
              </div>
            );
          })}
        </BlockReveal>
      )}

      <nav
        aria-label="Outros projetos"
        className="mx-[var(--gutter)] flex flex-col gap-10 border-t border-gray/30 pt-10 pb-24 md:flex-row md:items-end md:justify-between"
      >
        <Link
          href="/projects"
          className="w-fit font-body text-sm transition-colors hover:text-pink"
        >
          ← Back to Work
        </Link>

        <Link
          href={`/projects/${next.slug}`}
          data-cursor="plus"
          className="group flex items-end gap-5 self-end"
        >
          <span className="text-right">
            <span className="block font-body text-xs text-gray">
              Next project →
            </span>
            <span className="mt-2 block font-display text-[clamp(2rem,4vw,3.5rem)] leading-none font-medium transition-colors group-hover:text-pink">
              {next.titulo}
            </span>
            <span className="mt-2 block font-body text-sm text-gray">
              {next.cliente}
            </span>
          </span>
          {next.capa && (
            // Levemente apagada; acende no hover junto com o título.
            <span className="relative block aspect-[4/5] w-24 shrink-0 opacity-60 transition-opacity group-hover:opacity-100 md:w-32">
              <Image
                src={next.capa}
                alt=""
                fill
                sizes="8rem"
                className="object-cover"
              />
            </span>
          )}
        </Link>
      </nav>

      <CursorPlus />
    </article>
  );
}
