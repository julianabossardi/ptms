"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

export type RingProject = { slug: string; titulo: string; capa: string };

// Graus de giro por pixel arrastado.
const DEGREES_PER_PX = 0.25;
// Até essa distância o gesto conta como clique, não como arraste.
const CLICK_TOLERANCE = 5;
// Giro automático bem lento: cerca de uma volta a cada 90 segundos.
const AUTO_DEGREES_PER_MS = 0.004;
// Depois de mexer no anel, o giro automático espera antes de voltar.
const RESUME_DELAY_MS = 3000;
const SNAP_MS = 450;

type Drag = { startX: number; startAngle: number; moved: boolean };

// Anel de projetos em 3D, como na referência. Gira sozinho, bem devagar, e dá
// para arrastar para o lado; ao soltar, encaixa no projeto mais próximo da
// frente, que aparece grande no card central. Clicar numa foto gira até ela e
// as setas do teclado também giram. Com o mouse sobre o card o giro pausa,
// para o projeto não trocar na hora do clique.
export default function HomeRing({ projects }: { projects: RingProject[] }) {
  const count = projects.length;
  const step = 360 / count;
  const [selected, setSelected] = useState(0);
  const orbitRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const overCard = useRef(false);
  const resumeAt = useRef(0);

  // O ângulo fica fora do estado: o anel é atualizado direto no DOM a cada
  // quadro e o React só renderiza de novo quando muda o projeto da frente.
  const apply = useCallback(
    (value: number, snap = false) => {
      angle.current = value;
      const orbit = orbitRef.current;
      if (orbit) {
        orbit.classList.toggle("is-snapping", snap);
        orbit.style.transform = `rotateX(-8deg) rotateY(${value}deg)`;
      }
      setSelected(((Math.round(-value / step) % count) + count) % count);
    },
    [count, step],
  );

  const pause = (extra = 0) => {
    resumeAt.current = performance.now() + RESUME_DELAY_MS + extra;
  };

  const snapTo = (value: number) => {
    apply(Math.round(value / step) * step, true);
    pause(SNAP_MS);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Com a aba em segundo plano o quadro não roda; evita um salto na volta.
      const elapsed = Math.min(now - last, 50);
      last = now;
      if (!drag.current && !overCard.current && now >= resumeAt.current) {
        apply(angle.current - AUTO_DEGREES_PER_MS * elapsed);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [apply]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressClick.current = false;
    drag.current = {
      startX: event.clientX,
      startAngle: angle.current,
      moved: false,
    };
    orbitRef.current?.classList.remove("is-snapping");
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < CLICK_TOLERANCE) return;
      state.moved = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // O ponteiro pode já ter sido liberado; o arraste segue sem captura.
      }
    }
    apply(state.startAngle + dx * DEGREES_PER_PX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;
    if (state.moved) {
      suppressClick.current = true;
      snapTo(angle.current);
      return;
    }
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-orbit-index]",
    );
    if (!item) {
      pause();
      return;
    }
    // Menor caminho até a foto clicada ficar na frente.
    const index = Number(item.dataset.orbitIndex);
    const delta = ((((-index * step - angle.current) % 360) + 540) % 360) - 180;
    snapTo(angle.current + delta);
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    // Um arraste que termina em cima do card não abre o projeto.
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") snapTo(angle.current + step);
    if (event.key === "ArrowRight") snapTo(angle.current - step);
  };

  const current = projects[selected];

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Projetos. Arraste para o lado ou use as setas do teclado."
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        snapTo(angle.current);
      }}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
      className="orbit-scene relative flex min-h-[50svh] flex-1 items-center justify-center py-[2vh] outline-none select-none"
    >
      <div
        ref={orbitRef}
        aria-hidden
        className="orbit"
        style={
          {
            "--count": count,
            transform: "rotateX(-8deg) rotateY(0deg)",
          } as CSSProperties
        }
      >
        {projects.map((project, k) => (
          <div
            key={project.slug}
            data-orbit-index={k}
            className="orbit-item"
            style={{ "--k": k } as CSSProperties}
          >
            <div className="relative aspect-[5/7] w-full">
              <Image
                src={project.capa}
                alt=""
                fill
                draggable={false}
                sizes="10vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* A largura também respeita a altura da tela, para o card caber junto
          com os rótulos e o rodapé. */}
      <Link
        href={`/projects/${current.slug}`}
        data-cursor="plus"
        draggable={false}
        onPointerEnter={() => {
          overCard.current = true;
        }}
        onPointerLeave={() => {
          overCard.current = false;
        }}
        className="orbit-card group relative block w-[min(60vw,400px,40svh)] lg:w-[min(28vw,400px,42svh)]"
      >
        <span className="flex items-center justify-between gap-4 bg-white px-2 py-1 font-body text-sm text-black">
          <span className="truncate">{current.titulo}</span>
          <span className="shrink-0 bg-pink px-1 transition-colors group-hover:bg-black group-hover:text-pink">
            Acesse o projeto
          </span>
        </span>
        <span className="relative block aspect-[6/7] w-full">
          {/* Maior imagem acima da dobra: carrega sem esperar o scroll. */}
          <Image
            key={current.slug}
            src={current.capa}
            alt={current.titulo}
            fill
            loading="eager"
            draggable={false}
            sizes="(min-width: 1024px) 28vw, 60vw"
            className="object-cover"
          />
        </span>
      </Link>

      <p className="sr-only" aria-live="polite">
        {current.titulo}
      </p>
    </div>
  );
}
