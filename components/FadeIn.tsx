"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Fotos que ainda estão abaixo da tela entram com um fade simples ao chegar
// (.fade-pending em globals.css). As que já aparecem no carregamento ficam
// como estão, para não piscar.
export default function FadeIn({
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
    const pending = [...root.querySelectorAll("img")].filter(
      (img) => img.getBoundingClientRect().top > window.innerHeight,
    );
    if (pending.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-shown");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const img of pending) {
      img.classList.add("fade-pending");
      observer.observe(img);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
