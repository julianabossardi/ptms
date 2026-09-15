"use client";

import Image from "next/image";
import Link from "next/link";
import {
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

type Drag = { startX: number; startAngle: number; moved: boolean };

// Anel de projetos em 3D, como na referência: arrastando para o lado ele gira
// e, ao soltar, desliza até o projeto mais próximo da frente. O projeto da
// frente é o selecionado e aparece grande no card central. Clicar numa foto
// do anel gira até ela; as setas do teclado também giram.
export default function HomeRing({ projects }: { projects: RingProject[] }) {
  const count = projects.length;
  const step = 360 / count;
  const [angle, setAngle] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const drag = useRef<Drag | null>(null);
  // Um arraste que termina em cima do card não pode abrir o projeto.
  const suppressClick = useRef(false);

  const selected = ((Math.round(-angle / step) % count) + count) % count;
  const current = projects[selected];

  const snapTo = (value: number) => {
    setSnapping(true);
    setAngle(Math.round(value / step) * step);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressClick.current = false;
    drag.current = { startX: event.clientX, startAngle: angle, moved: false };
    setSnapping(false);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < CLICK_TOLERANCE) return;
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setAngle(state.startAngle + dx * DEGREES_PER_PX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;
    if (state.moved) {
      suppressClick.current = true;
      snapTo(angle);
      return;
    }
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-ring-index]",
    );
    if (item) {
      // Menor caminho até a foto clicada ficar na frente.
      const index = Number(item.dataset.ringIndex);
      const delta = ((((-index * step - angle) % 360) + 540) % 360) - 180;
      snapTo(angle + delta);
    }
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") snapTo(angle + step);
    if (event.key === "ArrowRight") snapTo(angle - step);
  };

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
        snapTo(angle);
      }}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
      className="ring-scene relative flex min-h-[60svh] flex-1 items-center justify-center py-[6vh] outline-none select-none"
    >
      <div
        aria-hidden
        className={`ring ${snapping ? "is-snapping" : ""}`}
        style={
          {
            "--count": count,
            transform: `rotateX(-8deg) rotateY(${angle}deg)`,
          } as CSSProperties
        }
      >
        {projects.map((project, k) => (
          <div
            key={project.slug}
            data-ring-index={k}
            className="ring-item"
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

      <Link
        href={`/projects/${current.slug}`}
        data-cursor="plus"
        draggable={false}
        className="ring-card group relative block w-[min(60vw,400px)] lg:w-[min(28vw,400px)]"
      >
        <span className="flex items-center justify-between gap-4 bg-white px-2 py-1 font-body text-sm text-black">
          <span className="truncate">{current.titulo}</span>
          <span className="shrink-0 bg-pink px-1 transition-colors group-hover:bg-black group-hover:text-pink">
            Acesse o projeto
          </span>
        </span>
        <span className="relative block aspect-[6/7] w-full">
          <Image
            key={current.slug}
            src={current.capa}
            alt={current.titulo}
            fill
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
