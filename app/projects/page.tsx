import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CursorPlus from "@/components/CursorPlus";
import ProjectList, { type ProjectRow } from "@/components/ProjectList";
import { getProjects, type Project } from "@/lib/content";
import { withSize, type SizedImage } from "@/lib/images";

export const metadata: Metadata = { title: "Work" };

function toRow(project: Project): ProjectRow {
  return {
    slug: project.slug,
    titulo: project.titulo,
    cliente: project.cliente,
    periodo: project.periodo,
    thumb: project.pagina && project.capa ? withSize(project.capa) : null,
  };
}

// O parallax das imagens do catálogo entra na etapa 7.
export default function Projects() {
  const projects = getProjects();
  const withPage = projects.filter((project) => project.pagina).map(toRow);
  const cited = projects.filter((project) => !project.pagina).map(toRow);
  const cards = withPage.filter(
    (row): row is ProjectRow & { thumb: SizedImage } => row.thumb !== null,
  );

  return (
    <>
      <section className="relative bg-black">
        {/* "Work" fica preso na tela enquanto o catálogo passa por cima e
            sai junto com a seção, sem ficar grudado no resto da página. */}
        <div className="sticky top-0 flex h-svh items-center justify-center">
          <h1 className="font-display text-[19vw] leading-none font-medium text-white">
            Work
          </h1>
        </div>

        <div className="relative z-10 -mt-[100svh] grid gap-y-[24vh] px-[var(--gutter)] pt-[85svh] pb-[50vh] md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.slug}
              href={`/projects/${card.slug}`}
              data-cursor="plus"
              // Cards pares descem: desencontro das duas colunas da referência.
              className="block w-full md:w-[36vw] md:justify-self-center md:even:mt-[40vh] md:even:-mb-[40vh]"
            >
              <Image
                src={card.thumb.src}
                width={card.thumb.width}
                height={card.thumb.height}
                alt={card.titulo}
                sizes="(min-width: 768px) 36vw, 100vw"
                className="h-auto w-full"
              />
              <div className="mt-3 flex items-start justify-between gap-6 font-body text-sm">
                <div>
                  <p className="text-white">{card.titulo}</p>
                  <p className="text-gray">{card.cliente}</p>
                </div>
                <p className="shrink-0 text-white">{card.periodo}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-black px-[var(--gutter)] pb-32">
        <ProjectList withPage={withPage} cited={cited} />
      </section>

      <CursorPlus />
    </>
  );
}
