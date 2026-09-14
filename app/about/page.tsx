import type { Metadata } from "next";
import { getAbout } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "About" };

const BIO = "max-w-[30rem] font-body text-sm leading-relaxed [&_p+p]:mt-4";

// O mosaico pixelado atrás do "Rachel" entra na etapa 10.
export default function About() {
  const { texto_pt, texto_en } = getAbout();

  return (
    <>
      <section className="flex min-h-screen items-center justify-center bg-black">
        <h1 className="font-display text-[19vw] leading-none font-medium text-white">
          Rachel
        </h1>
      </section>

      {/* PT e EN empilhados numa coluna estreita, como nas descrições de projeto. */}
      <section className="space-y-8 bg-black px-[var(--gutter)] pb-32 md:pl-[20vw]">
        {texto_pt && (
          <div
            className={BIO}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(texto_pt) }}
          />
        )}
        {texto_en && (
          <div
            lang="en"
            className={BIO}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(texto_en) }}
          />
        )}
      </section>
    </>
  );
}
