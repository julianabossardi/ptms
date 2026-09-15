import type { Metadata } from "next";
import Image from "next/image";
import CursorPlus from "@/components/CursorPlus";
import FadeIn from "@/components/FadeIn";
import PixelReveal from "@/components/PixelReveal";
import RevealText from "@/components/RevealText";
import { getAbout, type Reportagem } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

// A bio chega em markdown; o efeito de letras trabalha com texto puro.
function toParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((text) => text.replace(/[*_]/g, "").trim())
    .filter(Boolean);
}

// Bio em PT em três blocos (um parágrafo cada no CMS): o primeiro no tamanho
// da bio, o segundo em negrito e rosa, o terceiro um pouco menor.
const BIO_PT = [
  "max-w-[46rem] font-body text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.15]",
  "[&_p+p]:mt-8",
  "[&_p:nth-child(2)]:font-semibold [&_p:nth-child(2)]:text-pink",
  "[&_p:nth-child(3)]:text-[clamp(1.25rem,2.2vw,1.875rem)]",
].join(" ");
const BIO_EN =
  "max-w-[40rem] font-body text-[clamp(1rem,1.5vw,1.375rem)] leading-snug [&_p+p]:mt-4";

const WORDMARK = "relative font-display text-[19vw] leading-none font-medium";

function PressCard({ item }: { item: Reportagem }) {
  const content = (
    <>
      {item.imagem ? (
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={item.imagem}
            alt={item.titulo}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        // Espaço reservado até a imagem da matéria chegar.
        <div className="aspect-[4/5] w-full border border-gray/20 bg-black-off" />
      )}
      <p
        className={`mt-3 font-body text-base leading-snug ${
          item.link ? "transition-colors group-hover:text-pink" : ""
        }`}
      >
        {item.titulo}
      </p>
      {item.subtitulo && (
        <p className="mt-1 font-body text-sm text-gray">{item.subtitulo}</p>
      )}
    </>
  );

  // Sem link, o card não é clicável e não ganha hover nem cursor "+".
  return item.link ? (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="plus"
      className="group block"
    >
      {content}
    </a>
  ) : (
    content
  );
}

export default function About() {
  const { texto_pt, texto_en, imagens, reportagens } = getAbout();
  // A foto do topo é a primeira imagem da lista do CMS.
  const [foto] = imagens;

  return (
    <>
      {/* Topo como na referência: a foto aparece em blocos que viram nítidos
          e "Rachel", cinza em modo difference, inverte as cores dela. */}
      <section className="relative isolate flex h-svh items-center justify-center overflow-hidden bg-black">
        {foto && <PixelReveal src={foto} />}
        <h1 className={`${WORDMARK} ${foto ? "text-gray mix-blend-difference" : "text-white"}`}>
          Rachel
        </h1>
      </section>

      {/* PT e EN empilhados; as letras acendem conforme a leitura avança. */}
      <section className="space-y-16 bg-black px-[var(--gutter)] pt-[20vh] pb-40 md:pl-[19vw]">
        {texto_pt && (
          <RevealText paragraphs={toParagraphs(texto_pt)} className={BIO_PT} />
        )}
        {texto_en && (
          <RevealText
            lang="en"
            paragraphs={toParagraphs(texto_en)}
            className={BIO_EN}
          />
        )}
      </section>

      {reportagens.length > 0 && (
        <section className="bg-black px-[var(--gutter)] pb-32">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none font-medium">
            Press
          </h2>
          <FadeIn className="mt-12">
            <ul className="grid gap-x-[var(--gutter)] gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {reportagens.map((item) => (
                <li key={`${item.titulo}-${item.subtitulo}`}>
                  <PressCard item={item} />
                </li>
              ))}
            </ul>
          </FadeIn>
        </section>
      )}

      <CursorPlus />
    </>
  );
}
