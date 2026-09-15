import type { ReactNode } from "react";
import CursorPlus from "@/components/CursorPlus";
import HomeRing, { type RingProject } from "@/components/HomeRing";
import { getHome, getPageProjects } from "@/lib/content";

// Parte do título que entra deslizando por dentro de uma máscara, em 400ms:
// o nome desce de cima, a função vem da esquerda e a cidade da direita
// (.slide-mask e .slide-from-* em globals.css).
function SlideIn({
  children,
  from,
  delay = 0,
}: {
  children: ReactNode;
  from: "top" | "left" | "right";
  delay?: number;
}) {
  return (
    <span className="slide-mask">
      <span className={`slide-from-${from}`} style={{ animationDelay: `${delay}ms` }}>
        {children}
      </span>
    </span>
  );
}

export default function Home() {
  const { nome, funcao, local } = getHome();
  // O anel usa as capas dos projetos com página própria, na ordem do Work.
  const projects: RingProject[] = getPageProjects()
    .filter((project) => project.capa)
    .map(({ slug, titulo, capa }) => ({ slug, titulo, capa }));

  return (
    // Ocupa a tela descontando a faixa fina do rodapé da Home.
    <section className="relative flex min-h-[calc(100svh-2.5rem)] flex-col overflow-hidden bg-black">
      {/* Nome no centro; função e cidade embaixo, presas às pontas do nome.
          No celular e no tablet o nome ocupa quase toda a largura. */}
      <div className="flex justify-center px-[var(--gutter)] pt-[10vh] font-display leading-[1.1] font-medium">
        <div className="w-fit">
          <h1 className="text-[10vw] text-white lg:text-[min(7vw,9rem)]">
            <SlideIn from="top">{nome}</SlideIn>
          </h1>
          <div className="mt-[0.3em] flex justify-between gap-6 text-[max(0.875rem,3.3vw)] text-pink lg:text-[min(2.3vw,3rem)]">
            <p>
              <SlideIn from="left" delay={250}>
                {funcao}
              </SlideIn>
            </p>
            <p>
              <SlideIn from="right" delay={250}>
                {local}
              </SlideIn>
            </p>
          </div>
        </div>
      </div>

      {projects.length > 0 && <HomeRing projects={projects} />}

      <CursorPlus />
    </section>
  );
}
