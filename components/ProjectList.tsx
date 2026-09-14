"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SizedImage } from "@/lib/images";

export type ProjectRow = {
  slug: string;
  titulo: string;
  cliente: string;
  periodo: string;
  thumb: SizedImage | null;
};

const ROW =
  "grid grid-cols-2 items-baseline gap-x-6 border-b py-4 transition-colors md:grid-cols-[1fr_1fr_auto]";

function Cells({ row }: { row: ProjectRow }) {
  return (
    <>
      <span className="font-display text-2xl leading-tight font-medium">
        {row.titulo}
      </span>
      <span className="font-body text-base">{row.cliente}</span>
      {/* No celular a referência mostra só título e cliente. */}
      <span className="hidden font-body text-base md:block md:text-right">
        {row.periodo}
      </span>
    </>
  );
}

export default function ProjectList({
  withPage,
  cited,
}: {
  withPage: ProjectRow[];
  cited: ProjectRow[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef<number | null>(null);

  // A miniatura fica numa coluna fixa à direita e, na vertical, segue o mouse
  // com atraso leve (lerp). Entre linhas ela desliza; ao sair da lista, zera.
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

  return (
    <>
      <ul onPointerLeave={() => setActive(null)}>
        {withPage.map((row) => {
          const tone =
            active === null || active === row.slug ? "text-white" : "text-gray";
          const line = active === row.slug ? "border-white" : "border-gray/30";
          return (
            <li key={row.slug}>
              <Link
                href={`/projects/${row.slug}`}
                data-cursor="plus"
                // Touch não tem hover: a miniatura só existe com mouse.
                onPointerEnter={(event) => {
                  if (event.pointerType !== "mouse") return;
                  target.current = event.clientY;
                  setActive(row.slug);
                }}
                onPointerMove={(event) => {
                  if (event.pointerType === "mouse") target.current = event.clientY;
                }}
                onFocus={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  target.current = rect.top + rect.height / 2;
                  setActive(row.slug);
                }}
                onBlur={() => setActive(null)}
                className={`${ROW} ${tone} ${line}`}
              >
                <Cells row={row} />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Sem página: sempre em cinza, sem hover, miniatura ou cursor "+". */}
      {cited.length > 0 && (
        <>
          <p className="mt-24 mb-2 font-body text-xs text-gray">Archive</p>
          <ul>
            {cited.map((row) => (
              <li key={row.slug} className={`${ROW} border-gray/30 text-gray`}>
                <Cells row={row} />
              </li>
            ))}
          </ul>
        </>
      )}

      <div
        ref={thumbRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-[64vw] z-20 hidden md:block"
      >
        {withPage.map(
          (row) =>
            row.thumb && (
              <Image
                key={row.slug}
                src={row.thumb.src}
                width={row.thumb.width}
                height={row.thumb.height}
                alt=""
                loading="eager"
                sizes="24vw"
                className={`absolute top-0 left-0 h-auto w-[24vw] -translate-y-1/2 ${
                  active === row.slug ? "" : "invisible"
                }`}
              />
            ),
        )}
      </div>
    </>
  );
}
