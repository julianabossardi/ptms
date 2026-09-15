"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import type { SizedImage } from "@/lib/images";

// Tempo até o último bloco começar a sumir; cada bloco leva 200ms
// (.photo-blocks em globals.css). Cerca de 500ms no total, como o menu.
const SPREAD_MS = 300;

// Foto que chega em blocos, como o menu. `columns` define o tamanho dos
// blocos; as linhas saem da proporção da foto, para eles ficarem quase
// quadrados. Os blocos somem a partir do canto superior direito.
export function BlockPhoto({
  image,
  alt,
  sizes,
  columns,
  className = "",
}: {
  image: SizedImage;
  alt: string;
  sizes: string;
  columns: number;
  className?: string;
}) {
  const rows = Math.max(1, Math.round((columns * image.height) / image.width));
  const lastStep = Math.max(columns - 1 + rows - 1, 1);

  return (
    <div data-blocks className={`relative ${className}`}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        sizes={sizes}
        className="h-auto w-full"
      />
      <div
        aria-hidden
        className="photo-blocks absolute inset-0"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: columns * rows }, (_, i) => {
          const step = columns - 1 - (i % columns) + Math.floor(i / columns);
          return (
            <span
              key={i}
              style={{ animationDelay: `${Math.round((step / lastStep) * SPREAD_MS)}ms` }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Fotos que ainda estão abaixo da tela ficam cobertas pelos blocos e se
// revelam quando chegam, depois de a imagem carregar. As que já aparecem no
// carregamento ficam como estão, para não piscar. Com movimento reduzido,
// nada muda.
export default function BlockReveal({
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
    const pending = [...root.querySelectorAll<HTMLElement>("[data-blocks]")].filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    if (pending.length === 0) return;

    const show = (el: HTMLElement) => el.classList.add("is-shown");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          // Os blocos não abrem para um espaço vazio: esperam a foto.
          const img = el.querySelector("img");
          if (img && !img.complete) {
            img.addEventListener("load", () => show(el), { once: true });
            img.addEventListener("error", () => show(el), { once: true });
          } else {
            show(el);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const el of pending) {
      el.classList.add("is-pending");
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
