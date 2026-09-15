"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// Texto que acende letra a letra conforme atravessa a tela (bio do About).
// O componente só atualiza o progresso (--p); a opacidade de cada letra sai
// do CSS (.reveal-char). Leitores de tela recebem o texto inteiro.
export default function RevealText({
  paragraphs,
  lang,
  className,
}: {
  paragraphs: string[];
  lang?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chars = paragraphs.map((text) => [...text]);
  const offsets = chars.map((_, p) =>
    chars.slice(0, p).reduce((total, list) => total + list.length, 0),
  );
  const total = chars.reduce((sum, list) => sum + list.length, 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Começa quando o topo entra por baixo da tela e termina quando o fim
      // do texto chega a 40% da altura: leitura longa, sem pressa.
      const progress = (viewport - rect.top) / (rect.height + viewport * 0.6);
      el.style.setProperty("--p", String(Math.min(Math.max(progress, 0), 1)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      lang={lang}
      className={className}
      style={{ "--n": total } as CSSProperties}
    >
      {chars.map((list, p) => (
        <p key={p}>
          <span className="sr-only">{paragraphs[p]}</span>
          <span aria-hidden>
            {list.map((char, c) => (
              <span
                key={c}
                className="reveal-char"
                style={{ "--i": offsets[p] + c } as CSSProperties}
              >
                {char}
              </span>
            ))}
          </span>
        </p>
      ))}
    </div>
  );
}
