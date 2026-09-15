import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import CursorPlus from "@/components/CursorPlus";
import { CompactFooter } from "@/components/Footer";
import HomeRing, { type RingProject } from "@/components/HomeRing";
import SheetToggle from "@/components/SheetToggle";
import { getContact, getHome, getPageProjects, getPosts } from "@/lib/content";

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
  const { email } = getContact();
  // O anel usa as capas dos projetos com página própria, na ordem do Work.
  const projects: RingProject[] = getPageProjects()
    .filter((project) => project.capa)
    .map(({ slug, titulo, capa }) => ({ slug, titulo, capa }));
  // Os três posts mais recentes do PTMS.
  const posts = getPosts().slice(0, 3);

  return (
    // --home-footer: altura da faixa do rodapé, com a seta, que aparece no pé
    // da tela antes de a seção do PTMS subir. SheetToggle mede a altura real;
    // os valores aqui valem só até a página carregar.
    <div className="relative [--home-footer:6.75rem] sm:[--home-footer:5.5rem] lg:[--home-footer:2.5rem]">
      {/* A Home fica presa no topo e a seção do PTMS sobe por cima dela. */}
      <section className="sticky top-0 flex h-[calc(100svh-var(--home-footer))] flex-col overflow-hidden bg-black">
        {/* Nome no centro; função e cidade embaixo, presas às pontas do nome.
            Tudo em caixa alta, com o espaço entre palavras mais curto. No
            celular e no tablet o nome ocupa quase toda a largura. */}
        <div
          data-home-heading
          className="flex justify-center px-[var(--gutter)] pt-[10vh] font-display leading-[1.1] font-medium uppercase [word-spacing:-0.1em]"
        >
          <div className="w-fit">
            <h1 className="text-[8.6vw] text-white lg:text-[min(6vw,7.5rem)]">
              <SlideIn from="top">{nome}</SlideIn>
            </h1>
            <div className="mt-[0.3em] flex justify-between gap-6 text-[max(0.8125rem,2.9vw)] text-pink lg:text-[min(2vw,2.5rem)]">
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
      </section>

      {/* Seção do PTMS: sobe cobrindo o anel, ao rolar ou pela seta no topo.
          O rodapé fica preso no pé da tela até a seção terminar, então antes
          de abrir só a faixa dele aparece, com a seta. Aberta, a seção vai dos
          subtítulos até o pé da tela (--home-head vem de SheetToggle) e o
          conteúdo cabe nela, sem precisar rolar mais. */}
      <section
        data-light
        aria-labelledby="home-ptms"
        className="relative z-10 flex min-h-[calc(100lvh-var(--home-head,16rem))] flex-col bg-white text-black"
      >
        <SheetToggle />
        <div className="flex-1 px-[var(--gutter)] pt-[clamp(0.5rem,1.5vw,1.5rem)] pb-[clamp(1rem,2vw,2rem)]">
          <h2
            id="home-ptms"
            className="font-display text-[clamp(2rem,3.5vw,3.5rem)] leading-none font-medium text-pink"
          >
            PTMS,
          </h2>
          <div className="mt-[clamp(0.75rem,1.5vw,1.5rem)] flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            {/* Cards no padrão do card do anel, com a tarja embaixo da foto. A
                tarja cresce para o título caber inteiro, igual nos três. A
                foto é horizontal e limitada pela altura da tela, para a seção
                aberta caber sem rolar. */}
            <ul className="grid flex-1 gap-6 sm:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug} className="flex">
                  <Link
                    href={`/ptms/${post.slug}`}
                    data-cursor="plus"
                    className="group flex w-full flex-col border border-black"
                  >
                    <span className="relative block aspect-[4/3] max-h-[30svh] w-full">
                      {post.thumb && (
                        <Image
                          src={post.thumb}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 30vw, 100vw"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="flex flex-1 items-start justify-between gap-3 border-t border-black px-2 py-2 font-body text-sm leading-snug">
                      <span>{post.titulo}</span>
                      {/* A seta do hover vem embaixo do "Acesse", para a
                          tarja não precisar crescer para o lado. */}
                      <span className="flex shrink-0 flex-col items-end">
                        <span className="bg-pink px-1 transition-colors group-hover:bg-black group-hover:text-pink">
                          Acesse
                        </span>
                        <span
                          aria-hidden
                          className="px-1 text-pink opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          →
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/ptms"
              className="w-fit shrink-0 self-end font-body text-sm transition-colors hover:text-pink md:self-center"
            >
              veja mais →
            </Link>
          </div>
        </div>
        <CompactFooter
          email={email}
          year={new Date().getFullYear()}
          className="sticky bottom-0"
        />
      </section>

      <CursorPlus />
    </div>
  );
}
