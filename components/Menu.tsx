"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Rede } from "@/lib/content";
import Icon, { iconForUrl } from "@/components/Icon";
import { NAV_LINKS } from "@/lib/nav";

// Páginas de fundo claro, a listagem do PTMS e as páginas seguintes dela:
// botão "Menu" e painel em preto.
const isLightPage = (path: string) =>
  path === "/ptms" || path.startsWith("/ptms/pagina/");
// Faixa do topo ocupada pelo botão: quando o rodapé branco chega nela, o botão
// também passa a preto.
const BUTTON_ZONE = 72;

// O painel se monta em blocos do canto superior direito para o inferior
// esquerdo e se desmonta no sentido inverso, como na referência
// (animações .menu-block e .menu-block-out em globals.css). ~500ms.
const COLS = 8;
const ROWS = 10;
const STEP_MS = 19;
const BLOCK_MS = 200;
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
  const [overFooter, setOverFooter] = useState(false);
  const closing = menu?.closing ?? false;
  const visible = menu !== null && (closing || menu.path === pathname);
  const open = visible && !closing;
  // A cor do painel vem da página em que ele abriu, para não trocar no meio
  // da saída quando a navegação acontece.
  const darkPanel = menu !== null && isLightPage(menu.path);
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

  useEffect(() => {
    // A primeira superfície clara da página: a seção do PTMS na Home, que
    // tem o rodapé dentro, ou o rodapé branco nas demais.
    const surface = document.querySelector("[data-light], footer");
    if (!surface) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setOverFooter(surface.getBoundingClientRect().top <= BUTTON_ZONE);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  const buttonTone =
    isLightPage(pathname) || overFooter ? "text-black" : "text-white";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenu({ path: pathname, closing: false })}
        aria-expanded={open}
        aria-controls="menu"
        className={`fixed top-[var(--edge)] right-[var(--edge)] z-40 font-body text-[clamp(1rem,1.4vw,1.75rem)] transition-colors hover:text-pink ${buttonTone}`}
      >
        Menu
      </button>

      {visible && (
        <nav
          id="menu"
          aria-label="Principal"
          style={
            {
              "--menu-surface": darkPanel ? "var(--black)" : "var(--white)",
            } as CSSProperties
          }
          className={`fixed top-[var(--edge)] right-[var(--edge)] left-[var(--edge)] isolate z-50 px-[clamp(24px,2vw,40px)] py-[clamp(24px,2.5vw,48px)] md:left-auto md:w-[min(30rem,32vw)] ${
            darkPanel ? "text-white" : "text-black"
          } ${closing ? "pointer-events-none" : ""}`}
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
                  animationDuration: `${BLOCK_MS}ms`,
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
              className={`font-body text-[clamp(1rem,1.4vw,1.75rem)] text-pink transition-colors ${
                darkPanel ? "hover:text-white" : "hover:text-black"
              }`}
            >
              Close
            </button>

            <ul className="mt-6 text-right">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={startClosing}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-[1.02] font-medium transition-colors hover:text-pink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {redes.length > 0 && (
              <ul className="mt-14 flex flex-wrap justify-end gap-x-6 gap-y-1 font-body text-[clamp(0.875rem,1.1vw,1.25rem)]">
                {redes.map((rede) => {
                  const icone = iconForUrl(rede.url);
                  return (
                    <li key={rede.url}>
                      <a
                        href={rede.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 transition-colors hover:text-pink"
                      >
                        {icone && <Icon name={icone} />}
                        {rede.rotulo}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
