"use client";

import { useEffect, useRef, useState } from "react";

// Espaço entre o título da Home e a seção do PTMS quando ela está aberta.
const GAP = 40;

// Aba no topo da seção do PTMS na Home. A seção sobe por cima do anel
// rolando a página; a aba faz o mesmo movimento com um clique, até o topo da
// seção parar logo abaixo do título, e desce de volta. A seta vira conforme
// a posição.
export default function SheetToggle() {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // Rolagem em que a seção fica aberta, limitada ao fim da página.
  const openAt = () => {
    const sheet = ref.current?.parentElement;
    const heading = document.querySelector("[data-home-heading]");
    if (!sheet || !heading) return 0;
    const top = sheet.getBoundingClientRect().top + window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(top - heading.getBoundingClientRect().bottom - GAP, max));
  };

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setOpen(window.scrollY > openAt() / 2);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const toggle = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: open ? 0 : openAt(), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={open ? "Fechar PTMS" : "Abrir PTMS"}
      className="absolute bottom-full left-1/2 -translate-x-1/2 bg-white px-5 pt-2 pb-1 text-black transition-colors hover:text-pink"
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
  );
}
