import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import CursorPlus from "@/components/CursorPlus";
import { getHome, getPageProjects } from "@/lib/content";

// Quantas fotos do collage entram no anel.
const RING_MAX = 12;
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
  const { nome, funcao, local, collage } = getHome();
  // O projeto em destaque é o primeiro da ordem do Work.
  const [featured] = getPageProjects();
  const ring = collage.slice(0, RING_MAX);

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-black">
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

      {/* Anel de fotos girando em 3D em volta do projeto em destaque, como
          na referência (.ring-scene em globals.css). */}
      <div className="ring-scene relative flex min-h-[60svh] flex-1 items-center justify-center py-[6vh]">
        {ring.length > 0 && (
          <div
            aria-hidden
            className="ring"
            style={{ "--count": ring.length } as CSSProperties}
          >
            {ring.map((src, k) => (
              <div
                key={`${src}-${k}`}
                className="ring-item"
                style={{ "--k": k } as CSSProperties}
              >
                <div className="relative aspect-[5/7] w-full">
                  <Image src={src} alt="" fill sizes="10vw" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        )}

        {featured?.capa && (
          <Link
            href={`/projects/${featured.slug}`}
            data-cursor="plus"
            className="ring-card group relative block w-[min(60vw,400px)] lg:w-[min(28vw,400px)]"
          >
            <span className="flex items-center justify-between gap-4 bg-white px-2 py-1 font-body text-sm text-black">
              <span className="truncate">{featured.titulo}</span>
              <span className="shrink-0 bg-pink px-1 transition-colors group-hover:bg-black group-hover:text-pink">
                Acesse o projeto
              </span>
            </span>
            <span className="relative block aspect-[6/7] w-full">
              <Image
                src={featured.capa}
                alt={featured.titulo}
                fill
                preload
                sizes="(min-width: 1024px) 28vw, 60vw"
                className="object-cover"
              />
            </span>
          </Link>
        )}
      </div>

      <CursorPlus />
    </section>
  );
}
