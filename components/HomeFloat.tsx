"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FloatImage } from "@/lib/home-float";

type Kind = "large" | "small";

// Imagens ao mesmo tempo na tela, e quantas delas podem ser grandes.
const LIMITS = {
  desktop: { max: 24, large: 4 },
  mobile: { max: 9, large: 1 },
};
const MOBILE_QUERY = "(max-width: 767px)";
// Intervalo, em ms, até entrar a próxima imagem (sorteado a cada vez).
const SPAWN_MIN_MS = 250;
const SPAWN_MAX_MS = 1200;
// Candidatas sorteadas por imagem nova; entra a que fica mais longe das outras.
const CANDIDATES = 12;
// Passo e limite, em segundos, da previsão de trajetória.
const STEP_S = 1.5;
const HORIZON_S = 60;

// Estado renderizado: só muda quando uma imagem entra ou sai.
type Item = {
  image: FloatImage;
  kind: Kind;
  w: number;
  h: number;
  rot: number;
  x0: number;
  y0: number;
};

// Movimento: fica fora do React e é aplicado direto no DOM a cada quadro.
// x e y são o centro da imagem, em px da cena.
// vx/vy é a velocidade de agora; bvx/bvy, a de cruzeiro, para onde ela volta
// depois de um arremesso. dragging: o mouse está segurando a imagem.
type Motion = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bvx: number;
  bvy: number;
  entered: boolean;
  age: number;
  hovered: boolean;
  dragging: boolean;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function shuffled(count: number) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Arraste: até essa distância o gesto ainda é clique (vai ao projeto).
const CLICK_TOLERANCE = 5;
// Maior velocidade de arremesso, em px/s, e quanto tempo o arremesso leva
// para voltar à velocidade de cruzeiro (constante de decaimento, em 1/s).
const MAX_THROW = 1800;
const THROW_DECAY = 1.5;
// Folga, em px, que uma imagem em movimento abre ao empurrar as vizinhas.
const PUSH_GAP = 12;

const place = (x: number, y: number, w: number, h: number, rot: number) =>
  `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0) rotate(${rot}deg)`;

// Imagens que cruzam a tela por trás do título. Cada imagem entra por uma
// borda sorteada, rumo a um ponto sorteado da tela, com velocidade própria;
// ao sair, o mesmo elemento volta com outra imagem. As grandes são as capas
// dos projetos em destaque, as pequenas vêm do resto do catálogo. O sorteio
// roda só depois de montar, no cliente: o servidor entrega a cena vazia.
export default function HomeFloat({
  large,
  small,
}: {
  large: FloatImage[];
  small: FloatImage[];
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const elements = useRef<(HTMLAnchorElement | null)[]>([]);
  const [slots, setSlots] = useState<(Item | null)[]>([]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia(MOBILE_QUERY);

    const items: (Item | null)[] = Array.from({ length: LIMITS.desktop.max }, () => null);
    const motion: (Motion | null)[] = items.map(() => null);
    const bags: Record<Kind, number[]> = { large: [], small: [] };
    const pools: Record<Kind, FloatImage[]> = { large, small };
    let W = 0;
    let H = 0;
    let frame = 0;
    let nextSpawn = 0;

    const limits = () => (mobileQuery.matches ? LIMITS.mobile : LIMITS.desktop);
    const publish = () => setSlots([...items]);

    // Sem repetir uma imagem que já está na tela, e sem ordem previsível: cada
    // "saco" é embaralhado e esvaziado antes de embaralhar de novo.
    const nextImage = (kind: Kind): FloatImage | null => {
      const pool = pools[kind];
      if (pool.length === 0) return null;
      const onScreen = new Set(items.flatMap((item) => (item ? [item.image.src] : [])));
      for (let attempt = 0; attempt < 2; attempt++) {
        if (bags[kind].length === 0) bags[kind] = shuffled(pool.length);
        const skipped: number[] = [];
        while (bags[kind].length > 0) {
          const index = bags[kind].pop()!;
          if (!onScreen.has(pool[index].src)) {
            bags[kind].unshift(...skipped);
            return pool[index];
          }
          skipped.push(index);
        }
        bags[kind] = skipped;
      }
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const sizeFor = (kind: Kind, image: FloatImage) => {
      const mobile = mobileQuery.matches;
      const share =
        kind === "large"
          ? mobile ? rand(0.36, 0.44) : rand(0.16, 0.21)
          : mobile ? rand(0.17, 0.27) : rand(0.06, 0.12);
      let w = W * share;
      let h = (w * image.height) / image.width;
      const maxH = H * (kind === "large" ? 0.5 : 0.3);
      if (h > maxH) {
        w *= maxH / h;
        h = maxH;
      }
      return { w: Math.round(w), h: Math.round(h) };
    };

    const isInside = (x: number, y: number, w: number, h: number) =>
      x + w / 2 > 0 && x - w / 2 < W && y + h / 2 > 0 && y - h / 2 < H;

    // Posição, direção e velocidade de uma candidata. "edge": nasce fora de
    // uma borda sorteada e mira um ponto sorteado da tela. "inside": já
    // começa dentro (composição inicial). "static": parada (movimento reduzido).
    const candidate = (
      mode: "edge" | "inside" | "static",
      kind: Kind,
      w: number,
      h: number,
    ): Motion => {
      const scale = (mobileQuery.matches ? 0.6 : 1) * Math.max(W / 1440, 0.6);
      const speed = (kind === "large" ? rand(35, 55) : rand(40, 60)) * scale;
      const aim = () => {
        const tx = rand(0.15 * W, 0.85 * W);
        const ty = rand(0.15 * H, 0.85 * H);
        return { tx, ty };
      };
      let x: number;
      let y: number;
      if (mode === "edge") {
        const edge = Math.floor(Math.random() * 4);
        const along = rand(0.05, 0.95);
        if (edge === 0) [x, y] = [along * W, -h / 2 - 2];
        else if (edge === 1) [x, y] = [W + w / 2 + 2, along * H];
        else if (edge === 2) [x, y] = [along * W, H + h / 2 + 2];
        else [x, y] = [-w / 2 - 2, along * H];
      } else {
        x = rand(w / 2, Math.max(w / 2, W - w / 2));
        y = rand(h / 2, Math.max(h / 2, H - h / 2));
      }
      if (mode === "static") {
        return { x, y, vx: 0, vy: 0, bvx: 0, bvy: 0, entered: true, age: 0, hovered: false, dragging: false };
      }
      const { tx, ty } = aim();
      const angle = mode === "edge" ? Math.atan2(ty - y, tx - x) : rand(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      return {
        x,
        y,
        vx,
        vy,
        bvx: vx,
        bvy: vy,
        entered: mode !== "edge",
        age: 0,
        hovered: false,
        dragging: false,
      };
    };

    // Segundos até a candidata sair de vez da tela (no máximo o horizonte).
    const lifetime = (m: Motion, w: number, h: number) => {
      let entered = m.entered;
      for (let t = 0; t < HORIZON_S; t += STEP_S) {
        if (isInside(m.x + m.vx * t, m.y + m.vy * t, w, h)) entered = true;
        else if (entered) return t;
      }
      return HORIZON_S;
    };

    // Avalia a candidata contra o que já está na tela, ao longo da trajetória.
    // score: menor distância entre centros, na escala do tamanho das duas
    // (quanto maior, menos amontoado). overlap: sobreposição de duas grandes.
    const evaluate = (m: Motion, kind: Kind, w: number, h: number, moving: boolean) => {
      const horizon = moving ? lifetime(m, w, h) : 0;
      let score = Infinity;
      let overlap = false;
      for (let i = 0; i < items.length; i++) {
        const other = items[i];
        const om = motion[i];
        if (!other || !om) continue;
        for (let t = 0; t <= horizon; t += STEP_S) {
          const ax = m.x + m.vx * t;
          const ay = m.y + m.vy * t;
          const bx = om.x + om.vx * t;
          const by = om.y + om.vy * t;
          if (!isInside(ax, ay, w, h) || !isInside(bx, by, other.w, other.h)) continue;
          const dx = Math.abs(ax - bx);
          const dy = Math.abs(ay - by);
          if (kind === "large" && other.kind === "large") {
            if (dx < (w + other.w) / 2 && dy < (h + other.h) / 2) overlap = true;
          }
          score = Math.min(score, Math.hypot(dx, dy) / ((w + other.w) / 2 + (h + other.h) / 2));
        }
      }
      return { score, overlap };
    };

    const spawn = (slot: number, kind: Kind, mode: "edge" | "inside" | "static") => {
      const image = nextImage(kind);
      if (!image) return false;
      const { w, h } = sizeFor(kind, image);
      let best: { m: Motion; score: number } | null = null;
      for (let c = 0; c < CANDIDATES; c++) {
        const m = candidate(mode, kind, w, h);
        const { score, overlap } = evaluate(m, kind, w, h, mode !== "static");
        if (overlap) continue;
        if (!best || score > best.score) best = { m, score };
      }
      if (!best) return false;
      const rot = 0;
      items[slot] = { image, kind, w, h, rot, x0: best.m.x, y0: best.m.y };
      motion[slot] = best.m;
      return true;
    };

    // Grande só até o limite e com chance própria; sem grande disponível, pequena.
    const pickKind = (): Kind => {
      const largeCount = items.filter((item) => item?.kind === "large").length;
      if (large.length > 0 && largeCount < limits().large && (small.length === 0 || Math.random() < 0.3)) {
        return "large";
      }
      return "small";
    };

    const fill = (mode: "inside" | "static", count: number) => {
      for (let slot = 0; slot < count; slot++) {
        const kind = pickKind();
        if (!spawn(slot, kind, mode) && kind === "large") spawn(slot, "small", mode);
      }
      publish();
    };

    const tick = (now: number, last: number) => {
      // Aba em segundo plano não gera quadros; limitar evita um salto na volta.
      const dt = Math.min(now - last, 50) / 1000;
      let changed = false;
      const max = limits().max;
      let active = 0;
      // Depois de um arremesso a velocidade volta aos poucos à de cruzeiro.
      const relax = 1 - Math.exp(-THROW_DECAY * dt);
      const settle = 1 - Math.exp(-12 * dt);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const m = motion[i];
        if (!item || !m) continue;
        if (!m.hovered && !m.dragging) {
          m.vx += (m.bvx - m.vx) * relax;
          m.vy += (m.bvy - m.vy) * relax;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.age += dt;
        }
        // Imagem segurada ou ainda arremessada abre espaço: empurra para o
        // lado as que ela encosta, sem parar nem trocar a trajetória delas.
        if (m.dragging || Math.hypot(m.vx - m.bvx, m.vy - m.bvy) > 80) {
          for (let j = 0; j < items.length; j++) {
            const other = items[j];
            const om = motion[j];
            if (j === i || !other || !om || om.dragging) continue;
            const dx = om.x - m.x;
            const dy = om.y - m.y;
            const ox = (item.w + other.w) / 2 + PUSH_GAP - Math.abs(dx);
            const oy = (item.h + other.h) / 2 + PUSH_GAP - Math.abs(dy);
            if (ox <= 0 || oy <= 0) continue;
            if (ox < oy) om.x += Math.sign(dx || 1) * ox * settle;
            else om.y += Math.sign(dy || 1) * oy * settle;
          }
        }
        elements.current[i]?.style.setProperty("transform", place(m.x, m.y, item.w, item.h, item.rot));
        if (isInside(m.x, m.y, item.w, item.h)) m.entered = true;
        // Saiu depois de ter entrado (ou nunca entrou em 4 minutos): libera o elemento.
        if (!m.hovered && !m.dragging && ((m.entered && !isInside(m.x, m.y, item.w, item.h)) || m.age > 240)) {
          items[i] = null;
          motion[i] = null;
          changed = true;
        } else {
          active++;
        }
      }
      if (active < max && now >= nextSpawn) {
        const slot = items.findIndex((item, i) => !item && i < max);
        if (slot !== -1) {
          const kind = pickKind();
          if (spawn(slot, kind, "edge") || (kind === "large" && spawn(slot, "small", "edge"))) {
            changed = true;
          }
        }
        nextSpawn = now + rand(SPAWN_MIN_MS, SPAWN_MAX_MS);
      }
      if (changed) publish();
    };

    const start = () => {
      const { max } = limits();
      if (reduced) {
        items.fill(null);
        motion.fill(null);
        fill("static", Math.min(max, 8));
        return;
      }
      if (!items.some(Boolean)) fill("inside", Math.round(max * 0.8));
      if (!frame) {
        let last = performance.now();
        const loop = (now: number) => {
          tick(now, last);
          last = now;
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      }
    };

    let lastWidth = 0;
    const observer = new ResizeObserver(() => {
      const rect = scene.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W === 0 || H === 0) return;
      // Movimento reduzido: a composição estática é refeita quando a largura muda.
      if (reduced && W === lastWidth) return;
      lastWidth = W;
      start();
    });
    observer.observe(scene);

    // Com o mouse, a imagem sob o cursor para, para ficar fácil de clicar. No
    // toque não há pausa: o toque leva direto ao projeto.
    const setHovered = (event: PointerEvent, on: boolean) => {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-slot]");
      if (!target) return;
      const inside = (event.relatedTarget as HTMLElement | null)?.closest("[data-slot]");
      if (!on && inside === target) return;
      const m = motion[Number(target.dataset.slot)];
      if (m) m.hovered = on;
    };
    const onOver = (event: PointerEvent) => setHovered(event, true);
    const onOut = (event: PointerEvent) => setHovered(event, false);
    scene.addEventListener("pointerover", onOver);
    scene.addEventListener("pointerout", onOut);

    // Arrastar e arremessar, só com o mouse e com movimento. Até
    // CLICK_TOLERANCE px o gesto é um clique e vai ao projeto; além disso a
    // imagem segue o mouse e, ao soltar, sai com a velocidade do gesto (o
    // clique que o navegador dispara depois do arraste é engolido).
    type Drag = {
      slot: number;
      startX: number;
      startY: number;
      offX: number;
      offY: number;
      lastX: number;
      lastY: number;
      lastT: number;
      vx: number;
      vy: number;
      moved: boolean;
    };
    let drag: Drag | null = null;
    let swallowClick = false;

    const onDown = (event: PointerEvent) => {
      if (reduced || event.pointerType !== "mouse" || event.button !== 0) return;
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-slot]");
      if (!target) return;
      const slot = Number(target.dataset.slot);
      const m = motion[slot];
      if (!m) return;
      const rect = scene.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      drag = {
        slot,
        startX: event.clientX,
        startY: event.clientY,
        offX: m.x - px,
        offY: m.y - py,
        lastX: px,
        lastY: py,
        lastT: performance.now(),
        vx: 0,
        vy: 0,
        moved: false,
      };
    };

    const onMove = (event: PointerEvent) => {
      if (!drag) return;
      const m = motion[drag.slot];
      if (!m) {
        drag = null;
        return;
      }
      if (!drag.moved) {
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < CLICK_TOLERANCE) {
          return;
        }
        drag.moved = true;
        m.dragging = true;
        const el = elements.current[drag.slot];
        if (el) el.style.zIndex = "5";
      }
      const rect = scene.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const now = performance.now();
      const seconds = (now - drag.lastT) / 1000;
      if (seconds > 0) {
        // Média móvel: um solavanco só não vira o arremesso inteiro.
        drag.vx = 0.6 * ((px - drag.lastX) / seconds) + 0.4 * drag.vx;
        drag.vy = 0.6 * ((py - drag.lastY) / seconds) + 0.4 * drag.vy;
      }
      drag.lastX = px;
      drag.lastY = py;
      drag.lastT = now;
      m.x = px + drag.offX;
      m.y = py + drag.offY;
    };

    const onUp = () => {
      if (!drag) return;
      const state = drag;
      drag = null;
      if (!state.moved) return;
      swallowClick = true;
      // O navegador dispara o clique logo depois do pointerup.
      setTimeout(() => (swallowClick = false), 0);
      const el = elements.current[state.slot];
      if (el) el.style.zIndex = "";
      const m = motion[state.slot];
      if (!m) return;
      m.dragging = false;
      // Solto: fica livre mesmo com o mouse ainda em cima; a pausa do hover só
      // volta quando o mouse sair e entrar de novo.
      m.hovered = false;
      // Parou de mexer antes de soltar: sem arremesso.
      const still = performance.now() - state.lastT > 80;
      const speed = Math.hypot(state.vx, state.vy);
      const k = still ? 0 : Math.min(1, MAX_THROW / (speed || 1));
      m.vx = state.vx * k;
      m.vy = state.vy * k;
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!swallowClick) return;
      event.preventDefault();
      event.stopPropagation();
      swallowClick = false;
    };
    scene.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    scene.addEventListener("click", onClickCapture, true);

    return () => {
      scene.removeEventListener("pointerover", onOver);
      scene.removeEventListener("pointerout", onOut);
      scene.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      scene.removeEventListener("click", onClickCapture, true);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // As listas vêm do servidor e não mudam durante a visita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={sceneRef}
      role="group"
      aria-label="Projetos"
      className="absolute inset-0 z-0 isolate overflow-hidden select-none"
    >
      {slots.map((item, index) =>
        item ? (
          <Link
            key={index}
            ref={(el) => {
              elements.current[index] = el;
            }}
            href={`/projects/${item.image.slug}`}
            data-cursor="plus"
            data-slot={index}
            tabIndex={-1}
            aria-label={item.image.titulo}
            draggable={false}
            className="group absolute top-0 left-0 block will-change-transform"
            style={{
              width: item.w,
              height: item.h,
              transform: place(item.x0, item.y0, item.w, item.h, item.rot),
            }}
          >
            <Image
              src={item.image.src}
              alt=""
              width={item.w}
              height={item.h}
              sizes={`${item.w}px`}
              draggable={false}
              className="h-full w-full object-cover"
            />
            {/* Camada branca translúcida: indica que a imagem é clicável. */}
            <span
              aria-hidden
              className="absolute inset-0 bg-white/30 opacity-0 hover-mouse:group-hover:opacity-100"
            />
          </Link>
        ) : null,
      )}
    </div>
  );
}
