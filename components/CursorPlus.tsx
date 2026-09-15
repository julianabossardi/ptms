"use client";

import { useEffect, useRef } from "react";

// Anel com "+" sobre elementos com data-cursor="plus", como na referência.
// Segue o ponteiro sem atraso e só existe com mouse. Dentro de uma superfície
// clara ([data-light], como a seção do PTMS na Home) fica preto.
export default function CursorPlus({
  tone = "white",
}: {
  // Preto nas páginas de fundo claro (PTMS).
  tone?: "white" | "black";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    let x = 0;
    let y = 0;
    // Recalcula também no scroll: o elemento sob o mouse muda sem pointermove.
    const update = () => {
      const target = document.elementFromPoint(x, y)?.closest('[data-cursor="plus"]');
      el.hidden = !target;
      el.style.color =
        tone === "black" || target?.closest("[data-light]") ? "var(--black)" : "var(--white)";
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      update();
    };
    const onLeave = () => {
      el.hidden = true;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", update, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", update);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [tone]);

  return (
    <div
      ref={ref}
      hidden
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <circle cx="24" cy="24" r="23" />
        <path d="M24 14v20M14 24h20" />
      </svg>
    </div>
  );
}
