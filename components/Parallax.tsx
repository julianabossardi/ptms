"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Parallax do catálogo do Work (brief 5.1): cada item com data-speed se move
// na própria velocidade durante o scroll. 1 acompanha a página; abaixo de 1
// fica mais lento e lê como mais ao fundo. Só translate3d, sem opacidade: as
// imagens não somem, se deslocam. Desligado no celular e com movimento reduzido.
export default function Parallax({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const wide = window.matchMedia("(min-width: 768px)");
    const items = [...root.querySelectorAll<HTMLElement>("[data-speed]")].map(
      (el) => ({ el, speed: Number(el.dataset.speed) || 1, offset: 0 }),
    );

    let frame = 0;
    const update = () => {
      frame = 0;
      const center = window.innerHeight / 2;
      for (const item of items) {
        if (!wide.matches) {
          item.offset = 0;
          item.el.style.transform = "";
          continue;
        }
        const rect = item.el.getBoundingClientRect();
        // Distância do centro da tela sem o deslocamento atual, para o
        // cálculo não se realimentar.
        const distance = rect.top - item.offset + rect.height / 2 - center;
        item.offset = distance * (item.speed - 1);
        item.el.style.transform = `translate3d(0, ${item.offset.toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // O primeiro cálculo roda já, sem esperar quadro: a página abre na posição certa.
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
