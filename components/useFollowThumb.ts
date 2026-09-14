"use client";

import { useEffect, useRef, type FocusEvent, type PointerEvent } from "react";

// Miniatura das listas (Work e PTMS): fica numa coluna fixa e, na vertical,
// segue o mouse com atraso leve (lerp). Entre linhas desliza; ao sair, zera.
// Touch não tem hover, então a miniatura só responde a mouse e teclado.
export function useFollowThumb(
  active: string | null,
  setActive: (slug: string | null) => void,
) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef<number | null>(null);

  useEffect(() => {
    const el = thumbRef.current;
    if (active === null || !el) {
      current.current = null;
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const tick = () => {
      const from = current.current ?? target.current;
      const next = reduce ? target.current : from + (target.current - from) * 0.18;
      current.current = next;
      el.style.transform = `translate3d(0, ${next}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const rowHandlers = (slug: string) => ({
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse") return;
      target.current = event.clientY;
      setActive(slug);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") target.current = event.clientY;
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      target.current = rect.top + rect.height / 2;
      setActive(slug);
    },
    onBlur: () => setActive(null),
  });

  return { thumbRef, rowHandlers };
}
