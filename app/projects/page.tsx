import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CursorPlus from "@/components/CursorPlus";
import Parallax from "@/components/Parallax";
import ProjectList, { type ProjectRow } from "@/components/ProjectList";
import { getProjects, getWork, type Project } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { withSize, type SizedImage } from "@/lib/images";

export const metadata: Metadata = pageMetadata({ seo: getWork().seo, titulo: "Work" });

// Velocidade de parallax de cada card, na ordem do catálogo (volta ao início
// se houver mais projetos). Cards ímpares formam a coluna esquerda e pares a
// direita; cada coluna alterna lento e rápido com média perto de 1, para
// nenhuma parecer correr mais que a outra. Escritas à mão: ajuste a olho.
const SPEEDS = [0.85, 1.12, 1.12, 0.88, 0.9, 1.15, 1.15, 0.85, 0.95];

function toRow(project: Project): ProjectRow {
  return {
    slug: project.slug,
    titulo: project.titulo,
    cliente: project.cliente,
    periodo: project.periodo,
    thumb: project.pagina && project.capa ? withSize(project.capa) : null,
  };
}

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
            sai junto com a seção, sem ficar grudado no resto da página. O
            espaço no fim do catálogo segura o "Work" até a última foto sair
            da tela; ele sai antes de a tabela chegar. */}
        <div className="sticky top-0 flex h-svh items-center justify-center">
          <h1 className="font-display text-[19vw] leading-none font-medium text-white">
            Work
          </h1>
        </div>

        <Parallax className="relative z-10 -mt-[100svh] grid gap-y-[24vh] px-[var(--gutter)] pt-[85svh] pb-[105svh] md:grid-cols-2">
          {cards.map((card, index) => (
            <Link
              key={card.slug}
              href={`/projects/${card.slug}`}
              data-cursor="plus"
              data-speed={SPEEDS[index % SPEEDS.length]}
              // Cards pares descem meio card (capa 2:3 + espaço): cada um fica entre
              // dois da coluna esquerda.
              className="group block w-full md:w-[36vw] md:justify-self-center md:even:mt-[calc(27vw+12vh)] md:even:-mb-[calc(27vw+12vh)]"
            >
              {/* Zoom suave no hover: a foto cresce dentro da moldura. */}
              <span className="block overflow-hidden">
                <Image
                  src={card.thumb.src}
                  width={card.thumb.width}
                  height={card.thumb.height}
                  alt={card.titulo}
                  sizes="(min-width: 768px) 36vw, 100vw"
                  className="h-auto w-full transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
                />
              </span>
              <div className="mt-3 flex items-start justify-between gap-6 font-body text-sm">
                <div>
                  <p className="hover-arrow text-white transition-colors group-hover:text-pink">
                    {card.titulo}
                  </p>
                  <p className="text-gray">{card.cliente}</p>
                </div>
                <p className="shrink-0 text-white">{card.periodo}</p>
              </div>
            </Link>
          ))}
        </Parallax>
      </section>

      <section className="bg-black px-[var(--gutter)] pb-32">
        <ProjectList withPage={withPage} cited={cited} />
      </section>

      <CursorPlus />
    </>
  );
}
