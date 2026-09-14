"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Rede } from "@/lib/content";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/ptms", label: "PTMS" },
  { href: "/contact", label: "Contact" },
];

export default function Menu({ redes }: { redes: Rede[] }) {
  const pathname = usePathname();
  // Guarda a rota em que o menu foi aberto: ao navegar, ele fecha sozinho.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenOn(pathname)}
        aria-expanded={open}
        aria-controls="menu"
        className="fixed top-[var(--gutter)] right-[var(--gutter)] z-40 font-body text-[clamp(1rem,1.4vw,1.75rem)] text-white"
      >
        Menu
      </button>

      {/* Abre e fecha em corte seco, sem transição. */}
      {open && (
        <nav
          id="menu"
          aria-label="Principal"
          className="fixed top-[var(--gutter)] right-[var(--gutter)] left-[var(--gutter)] z-50 flex flex-col items-end bg-white px-[clamp(24px,2vw,40px)] py-[clamp(24px,2.5vw,48px)] text-black md:left-auto md:w-[min(30rem,32vw)]"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpenOn(null)}
            className="font-body text-[clamp(1rem,1.4vw,1.75rem)] text-pink"
          >
            Close
          </button>

          <ul className="mt-6 text-right">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpenOn(null)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="font-body text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.1] font-semibold tracking-[-0.03em]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {redes.length > 0 && (
            <ul className="mt-14 flex gap-6 font-body text-[clamp(0.875rem,1.1vw,1.25rem)]">
              {redes.map((rede) => (
                <li key={rede.url}>
                  <a href={rede.url} target="_blank" rel="noopener noreferrer">
                    {rede.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>
      )}
    </>
  );
}
