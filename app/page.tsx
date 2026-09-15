import type { ReactNode } from "react";
import CursorPlus from "@/components/CursorPlus";
import HomeRing, { type RingProject } from "@/components/HomeRing";
import { getHome, getPageProjects } from "@/lib/content";

const REVEAL_COLS = 10;
const REVEAL_ROWS = 2;
const REVEAL_STEP_MS = 40;

// Rótulo que surge em blocos, como o menu: blocos pretos cobrem o texto e
// somem da esquerda para a direita (.reveal-block em globals.css).
function BlockReveal({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="relative inline-block">
      {children}
      <span
        aria-hidden
        // Passa um pouco da linha: a Oswald sobe e desce além da altura dela.
        className="absolute inset-x-0 -inset-y-[0.15em] grid grid-cols-10 grid-rows-2"
      >
        {Array.from({ length: REVEAL_COLS * REVEAL_ROWS }, (_, i) => (
          <span
            key={i}
            className="reveal-block"
            style={{
              animationDelay: `${delay + ((i % REVEAL_COLS) + Math.floor(i / REVEAL_COLS)) * REVEAL_STEP_MS}ms`,
            }}
          />
        ))}
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
      {/* Nome no centro; função e cidade embaixo, presas às pontas do nome. */}
      <div className="flex justify-center px-[var(--gutter)] pt-[10vh] font-display leading-[1.1] font-medium">
        <div className="w-fit">
          <h1 className="text-[clamp(1.75rem,5.2vw,6.5rem)] text-white">
            <BlockReveal delay={0}>{nome}</BlockReveal>
          </h1>
          <div className="mt-[0.3em] flex justify-between gap-6 text-[clamp(0.875rem,1.7vw,2.125rem)] text-pink">
            <p>
              <BlockReveal delay={300}>{funcao}</BlockReveal>
            </p>
            <p>
              <BlockReveal delay={450}>{local}</BlockReveal>
            </p>
          </div>
        </div>
      </div>

      {projects.length > 0 && <HomeRing projects={projects} />}

      <CursorPlus />
    </section>
  );
}
