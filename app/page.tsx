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
        className="absolute inset-0 grid grid-cols-10 grid-rows-2"
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
      <div className="px-[var(--gutter)] pt-[18vh] font-body text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-semibold tracking-[-0.03em] text-white lg:h-[38vh] lg:p-0">
        <h1 className="lg:absolute lg:top-[14vh] lg:left-[8%]">
          <BlockReveal delay={0}>{nome}</BlockReveal>
        </h1>
        <p className="mt-3 lg:absolute lg:top-[20vh] lg:left-[44%] lg:mt-0">
          <BlockReveal delay={300}>{funcao}</BlockReveal>
        </p>
        <p className="mt-3 lg:absolute lg:top-[26vh] lg:left-[74%] lg:mt-0">
          <BlockReveal delay={600}>{local}</BlockReveal>
        </p>
      </div>

      {projects.length > 0 && <HomeRing projects={projects} />}

      <CursorPlus />
    </section>
  );
}
