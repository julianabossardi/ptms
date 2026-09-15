"use client";

import { useEffect, useRef, useState } from "react";

// Espaço entre os subtítulos da Home e a seção do PTMS aberta.
const GAP = 20;

// Seta da seção do PTMS na Home. Fica no topo da seção: fechada, isso é a
// própria faixa do rodapé (no desktop, na coluna do meio; no celular, numa
// linha acima do texto). A seção sobe por cima do anel rolando a página; a
// seta faz o mesmo movimento com um clique, até o topo da seção parar logo
// abaixo dos subtítulos, e desce de volta. Também mede o título e o rodapé
// (--home-head e --home-footer), para a Home e a seção terem a altura exata.
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
    const setSizes = () => {
      const m = measure();
      const wrapper = m?.sheet.parentElement;
      const footer = m?.sheet.querySelector("footer");
      if (!m || !wrapper || !footer) return;
      wrapper.style.setProperty("--home-head", `${Math.round(m.head)}px`);
      wrapper.style.setProperty("--home-footer", `${footer.offsetHeight}px`);
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
      setSizes();
      schedule();
    };
    setSizes();
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
    // Por cima do rodapé, que é sticky e viria depois na pintura.
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-6 justify-center lg:h-[var(--home-footer)]">
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-label={open ? "Fechar PTMS" : "Abrir PTMS"}
        className="pointer-events-auto flex w-20 items-end justify-center pb-1 text-black transition-colors hover:text-pink lg:items-center lg:pb-0"
      >
        <svg
          aria-hidden
          width="28"
          height="11"
          viewBox="0 0 28 11"
          className={open ? "rotate-180" : ""}
        >
          <path d="M2 9.5 14 2.5l12 7" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </button>
    </div>
  );
}
