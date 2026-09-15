"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// De onde vem a linha que chega a um parágrafo: "right" entra pela borda
// direita da tela e para no fim do texto; "left" entra pela esquerda e corre
// por baixo da última linha até o fim do texto.
export type LineFrom = "right" | "left";

// Texto que acende letra a letra conforme atravessa a tela (bio do About).
// O componente só atualiza o progresso (--p); a opacidade de cada letra sai
// do CSS (.reveal-char). Leitores de tela recebem o texto inteiro.
// Com `lines`, alguns parágrafos ganham uma linha fina que cresce logo depois
// de o parágrafo acender (.reveal-line); a posição é medida aqui.
export default function RevealText({
  paragraphs,
  lang,
  className = "",
  lines = {},
}: {
  paragraphs: string[];
  lang?: string;
  className?: string;
  lines?: Record<number, LineFrom>;
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
    // Cada linha vai da borda da tela até o fim do parágrafo, rente à última
    // linha de texto. Refeito quando a largura muda ou as fontes carregam.
    const place = () => {
      const root = el.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      for (const line of el.querySelectorAll<HTMLElement>("[data-line]")) {
        const end = el.querySelector(`[data-line-end="${line.dataset.line}"]`);
        if (!end) continue;
        const anchor = end.getBoundingClientRect();
        line.style.top = `${anchor.bottom - root.top}px`;
        if (line.dataset.from === "right") {
          const left = anchor.right - root.left + 12;
          line.style.left = `${left}px`;
          line.style.width = `${Math.max(viewportWidth - root.left - left, 0)}px`;
        } else {
          line.style.left = `${-root.left}px`;
          line.style.width = `${Math.max(anchor.left, 0)}px`;
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      place();
      schedule();
    };
    // O primeiro cálculo roda já, sem esperar quadro: a página abre na posição certa.
    update();
    place();
    document.fonts.ready.then(place);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={ref}
      lang={lang}
      className={`relative ${className}`}
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
            {lines[p] && <span data-line-end={p} />}
          </span>
        </p>
      ))}
      {Object.entries(lines).map(([p, from]) => (
        <span
          key={p}
          aria-hidden
          data-line={p}
          data-from={from}
          className="reveal-line"
          // A linha começa a crescer quando a última letra do parágrafo acende.
          style={
            {
              "--start": offsets[Number(p)] + chars[Number(p)].length - 1 + 60,
              transformOrigin: from,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
