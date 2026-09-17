"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

export type RingProject = { slug: string; titulo: string; capa: string };

// Graus de giro por pixel arrastado.
const DEGREES_PER_PX = 0.25;
// Até essa distância o gesto conta como clique, não como arraste.
const CLICK_TOLERANCE = 5;
// Giro automático lento: cerca de uma volta a cada 50 segundos.
const AUTO_DEGREES_PER_MS = 0.007;
// Depois de mexer no anel, o giro automático espera antes de voltar.
const RESUME_DELAY_MS = 3000;
const SNAP_MS = 450;
// Inclinação do anel: as fotos da frente descem e as de trás sobem.
const TILT = Math.sin((8 * Math.PI) / 180);
// Acima desse valor de profundidade a foto está na frente do card e deixa o
// clique passar para ele.
const FRONT = 0.9;

type Drag = { startX: number; startAngle: number; moved: boolean };
type Snap = { from: number; to: number; start: number };

// Posição de cada foto no anel. É calculada aqui, e não num espaço 3D do CSS:
// com fotos e card no mesmo espaço 3D, o Chrome recorta as camadas que se
// cruzam e deixa linhas finas na tela. Assim cada foto é uma camada plana,
// com escala pela profundidade e ordem pelo z-index: as da frente passam por
// cima do card (z-index 150), as de trás ficam atrás dele. As distâncias são
// frações do raio (--orbit-radius em globals.css).
function place(index: number, count: number, angle: number) {
  const degrees = (index * 360) / count + angle;
  const radians = (degrees * Math.PI) / 180;
  const depth = Math.cos(radians); // 1 na frente, -1 atrás
  // Perspectiva a dois raios do centro: na frente a foto dobra de tamanho.
  const scale = 2 / (2 - depth);
  const x = Math.sin(radians) * scale;
  const y = depth * TILT * scale;
  return {
    transform: `translate(-50%, -50%) translate(calc(${x.toFixed(4)} * var(--orbit-radius)), calc(${y.toFixed(4)} * var(--orbit-radius))) scale(${scale.toFixed(4)}) perspective(calc(2 * var(--orbit-radius))) rotateY(${degrees.toFixed(2)}deg)`,
    zIndex: (depth > 0 ? 200 : 100) + Math.round(depth * 100),
    pointerEvents: depth > FRONT ? ("none" as const) : ("auto" as const),
  };
}

// Anel de projetos, como na referência. Gira sozinho, bem devagar, e dá para
// arrastar para o lado; ao soltar, encaixa no projeto mais próximo da frente,
// que aparece grande no card central. Clicar numa foto gira até ela e as
// setas do teclado também giram. Com o mouse sobre o card o giro pausa, para
// o projeto não trocar na hora do clique.
export default function HomeRing({ projects }: { projects: RingProject[] }) {
  const count = projects.length;
  const step = 360 / count;
  const [selected, setSelected] = useState(0);
  const orbitRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const drag = useRef<Drag | null>(null);
  const snap = useRef<Snap | null>(null);
  const suppressClick = useRef(false);
  const overCard = useRef(false);
  const resumeAt = useRef(0);

  // O ângulo fica fora do estado: as fotos são atualizadas direto no DOM a
  // cada quadro e o React só renderiza de novo quando muda o projeto da frente.
  const apply = useCallback(
    (value: number) => {
      angle.current = value;
      const items = orbitRef.current?.children ?? [];
      for (let k = 0; k < items.length; k++) {
        const { transform, zIndex, pointerEvents } = place(k, count, value);
        const style = (items[k] as HTMLElement).style;
        style.transform = transform;
        style.zIndex = String(zIndex);
        style.pointerEvents = pointerEvents;
      }
      setSelected(((Math.round(-value / step) % count) + count) % count);
    },
    [count, step],
  );

  const pause = (extra = 0) => {
    resumeAt.current = performance.now() + RESUME_DELAY_MS + extra;
  };

  // Desliza até o projeto mais próximo; com movimento reduzido, pula direto.
  const snapTo = (value: number) => {
    const target = Math.round(value / step) * step;
    pause(SNAP_MS);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(target);
      return;
    }
    snap.current = { from: angle.current, to: target, start: performance.now() };
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Com a aba em segundo plano o quadro não roda; evita um salto na volta.
      const elapsed = Math.min(now - last, 50);
      last = now;
      const sliding = snap.current;
      if (sliding) {
        const t = Math.min(Math.max((now - sliding.start) / SNAP_MS, 0), 1);
        apply(sliding.from + (sliding.to - sliding.from) * (1 - (1 - t) ** 3));
        if (t === 1) snap.current = null;
      } else if (!drag.current && !overCard.current && now >= resumeAt.current) {
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
    snap.current = null;
    drag.current = {
      startX: event.clientX,
      startAngle: angle.current,
      moved: false,
    };
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
    // isolate: os z-index das fotos ficam contidos aqui e não passam por
    // cima do menu. "safe center": em tela baixa o card encosta no topo da
    // área em vez de subir para baixo do título.
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
      className="orbit-scene relative isolate flex min-h-[50svh] flex-1 justify-center pt-[max(4vh,32px)] pb-[8vh] outline-none select-none [align-items:safe_center]"
    >
      <div ref={orbitRef} aria-hidden className="absolute inset-0">
        {projects.map((project, k) => (
          <div
            key={project.slug}
            data-orbit-index={k}
            className="orbit-item group"
            style={place(k, count, 0)}
          >
            <div className="relative aspect-[5/7] w-full overflow-hidden">
              <Image
                src={project.capa}
                alt=""
                fill
                draggable={false}
                sizes="10vw"
                // Zoom suave no hover, dentro da moldura: deixa claro que a
                // foto é clicável. A da frente não recebe o mouse (fica sobre o
                // card), então só as que giram ao redor fazem zoom.
                className="object-cover transition-[transform,filter] duration-300 ease-out group-hover:scale-110 group-hover:brightness-125 motion-reduce:transition-none"
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
        className="group relative z-[150] block w-[min(60vw,400px,40svh)] lg:w-[min(28vw,400px,42svh)]"
      >
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
        {/* Tarja embaixo da foto, de ponta a ponta, com o texto no centro. */}
        <span className="block bg-pink px-2 py-1 text-center font-body text-sm font-semibold uppercase text-black transition-colors group-hover:bg-black group-hover:text-pink">
          Discover
        </span>
      </Link>

      <p className="sr-only" aria-live="polite">
        {current.titulo}
      </p>
    </div>
  );
}
