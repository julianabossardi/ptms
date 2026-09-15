"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { SizedImage } from "@/lib/images";
import { useFollowThumb } from "./useFollowThumb";

export type ProjectRow = {
  slug: string;
  titulo: string;
  cliente: string;
  periodo: string;
  thumb: SizedImage | null;
};

// Colunas de largura fixa: com "auto", um período mais longo ("2025 - hoje")
// empurrava título e cliente só naquela linha.
const ROW =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-x-6 border-b py-4 transition-colors md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem]";

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
  const { thumbRef, rowHandlers } = useFollowThumb(active, setActive);

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
                {...rowHandlers(row.slug)}
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

      {/* A caixa precisa ter a largura da miniatura: o reset do Tailwind limita
          imagens a 100% do contêiner, e uma caixa sem largura as zera. */}
      <div
        ref={thumbRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-[66vw] z-20 hidden w-[14vw] hover-mouse:block"
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
                sizes="14vw"
                className={`absolute top-0 left-0 h-auto w-full -translate-y-1/2 ${
                  active === row.slug ? "" : "invisible"
                }`}
              />
            ),
        )}
      </div>
    </>
  );
}
