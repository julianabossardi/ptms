"use client";

import { useEffect, useRef, useState } from "react";

// Espaço entre os subtítulos da Home e a seção do PTMS aberta.
const GAP = 20;

// Seta no topo da seção do PTMS na Home, na mesma faixa branca do rodapé. A
// seção sobe por cima do anel rolando a página; a seta faz o mesmo movimento
// com um clique, até o topo da seção parar logo abaixo dos subtítulos, e desce
// de volta. Também informa a altura do título (--home-head), para a seção
// aberta ir dele até o pé da tela.
export default function SheetToggle() {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const measure = () => {
    const sheet = ref.current?.closest("section");
    const heading = document.querySelector("[data-home-heading]");
    if (!sheet || !heading) return null;
    // A Home fica presa no topo, então o título está sempre na mesma altura.
    const head = heading.getBoundingClientRect().bottom + GAP;
    const top = sheet.getBoundingClientRect().top + window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return { sheet, head, openAt: Math.max(0, Math.min(top - head, max)) };
  };

  useEffect(() => {
    let frame = 0;
    const setHead = () => {
      const m = measure();
      m?.sheet.parentElement?.style.setProperty("--home-head", `${Math.round(m.head)}px`);
    };
    const check = () => {
      frame = 0;
      const m = measure();
      if (m) setOpen(window.scrollY > m.openAt / 2);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const onResize = () => {
      setHead();
      schedule();
    };
    setHead();
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const toggle = () => {
    const m = measure();
    if (!m) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: open ? 0 : m.openAt, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="flex h-7 shrink-0 justify-center">
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-label={open ? "Fechar PTMS" : "Abrir PTMS"}
        className="flex w-20 items-end justify-center pb-1 text-black transition-colors hover:text-pink"
      >
        <svg
          aria-hidden
          width="28"
          height="10"
          viewBox="0 0 28 10"
          className={open ? "rotate-180" : ""}
        >
          <path d="M1 9 14 1l13 8" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}
