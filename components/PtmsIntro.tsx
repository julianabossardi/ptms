"use client";

import { useId, useState } from "react";

const TITLE = "font-body text-[clamp(1.125rem,2.2vw,2.25rem)] leading-tight";
// Subtítulo e texto centralizados com o header.
const ALIGN = "mt-[clamp(0.75rem,1.5vw,1.5rem)] text-center";

// Subtítulo do PTMS com uma seta. Clicar abre um parágrafo curto sobre o
// PTMS, alinhado ao subtítulo, e clicar de novo fecha. A altura cresce em
// 200ms (brief: estado de UI até 200ms). Sem texto, fica só o subtítulo.
export default function PtmsIntro({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  if (!text) {
    return <p className={`${ALIGN} ${TITLE}`}>{title}</p>;
  }

  return (
    <div className={ALIGN}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className={`mx-auto flex w-fit items-center gap-[0.35em] transition-colors hover:text-pink ${TITLE}`}
      >
        {title}
        <svg
          aria-hidden
          viewBox="0 0 16 10"
          className={`h-[0.4em] w-[0.64em] shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1.5 1.5 8 8l6.5-6.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      </button>
      {/* w-0 min-w-full: o texto usa a largura do bloco (a do "PTMS,") sem
          alargá-lo. A grade de 0fr a 1fr anima a altura. */}
      <div
        id={id}
        inert={!open}
        className={`grid w-0 min-w-full transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="pt-[0.6em] font-body text-[clamp(0.9375rem,1.3vw,1.25rem)] leading-snug">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
