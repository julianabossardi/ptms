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

// Páginas de fundo claro pedem o botão "Menu" em preto.
const LIGHT_PAGES = new Set(["/ptms"]);

// O painel se monta em blocos do canto superior direito para o inferior
// esquerdo e se desmonta no sentido inverso, como na referência
// (animações .menu-block e .menu-block-out em globals.css).
const COLS = 8;
const ROWS = 10;
const STEP_MS = 12;
const BLOCK_MS = 120;
const LAST_STEP = COLS - 1 + ROWS - 1;
const CLOSE_MS = LAST_STEP * STEP_MS + BLOCK_MS;
const BLOCK_STEPS = Array.from(
  { length: COLS * ROWS },
  (_, i) => COLS - 1 - (i % COLS) + Math.floor(i / COLS),
);

type MenuState = { path: string; closing: boolean } | null;

export default function Menu({ redes }: { redes: Rede[] }) {
  const pathname = usePathname();
  // Guarda a rota em que o menu abriu. Navegar sem passar pelo menu (voltar
  // do navegador, por exemplo) some com o painel em corte seco.
  const [menu, setMenu] = useState<MenuState>(null);
  const closing = menu?.closing ?? false;
  const visible = menu !== null && (closing || menu.path === pathname);
  const open = visible && !closing;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const startClosing = () => {
    setMenu((current) => (current ? { ...current, closing: true } : null));
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu((current) => (current ? { ...current, closing: true } : null));
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Terminada a saída em blocos, desmonta o painel.
  useEffect(() => {
    if (!closing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setMenu(null), reduce ? 0 : CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const buttonTone = LIGHT_PAGES.has(pathname) ? "text-black" : "text-white";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenu({ path: pathname, closing: false })}
        aria-expanded={open}
        aria-controls="menu"
        className={`fixed top-[var(--gutter)] right-[var(--gutter)] z-40 font-body text-[clamp(1rem,1.4vw,1.75rem)] ${buttonTone}`}
      >
        Menu
      </button>

      {visible && (
        <nav
          id="menu"
          aria-label="Principal"
          className={`fixed top-[var(--gutter)] right-[var(--gutter)] left-[var(--gutter)] isolate z-50 px-[clamp(24px,2vw,40px)] py-[clamp(24px,2.5vw,48px)] text-black md:left-auto md:w-[min(30rem,32vw)] ${
            closing ? "pointer-events-none" : ""
          }`}
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 grid grid-cols-8 grid-rows-10"
          >
            {BLOCK_STEPS.map((step, i) => (
              <span
                key={i}
                className={closing ? "menu-block-out" : "menu-block"}
                style={{
                  animationDelay: `${(closing ? LAST_STEP - step : step) * STEP_MS}ms`,
                }}
              />
            ))}
          </div>

          {/* Na saída o texto some antes dos blocos. */}
          <div className={`flex flex-col items-end ${closing ? "invisible" : ""}`}>
            <button
              ref={closeRef}
              type="button"
              onClick={() => {
                startClosing();
                buttonRef.current?.focus();
              }}
              className="font-body text-[clamp(1rem,1.4vw,1.75rem)] text-pink"
            >
              Close
            </button>

            <ul className="mt-6 text-right">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={startClosing}
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
          </div>
        </nav>
      )}
    </>
  );
}
