"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ContactPage, Rede } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";

// Links do rodapé ficam rosa no hover para ficar claro que são clicáveis.
const LINK = "transition-colors hover:text-pink";

function Credit({ year }: { year: number }) {
  return (
    <>
      © {year} Rachel Oliveira Vieira · todos os direitos reservados ·
      desenvolvido por{" "}
      <a
        href="https://agenciamoldura.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={`underline underline-offset-2 ${LINK}`}
      >
        agência moldura
      </a>
    </>
  );
}

// Rodapé claro, na linha do site original, mais compacto: contato em
// destaque, redes e navegação em colunas, crédito no pé. Na Home vira uma
// faixa fina e escura, para não competir com o anel.
export default function Footer({
  redes,
  contato,
  year,
}: {
  redes: Rede[];
  contato: ContactPage;
  year: number;
}) {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <footer
        data-tone="dark"
        className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-gray/15 bg-black px-[var(--gutter)] py-3 font-body text-xs text-gray"
      >
        {contato.email && (
          <a href={`mailto:${contato.email}`} className={LINK}>
            {contato.email}
          </a>
        )}
        <p>
          <Credit year={year} />
        </p>
      </footer>
    );
  }

  const telefone = contato.telefone.replace(/[^\d+]/g, "");

  return (
    <footer className="bg-white px-[var(--gutter)] pt-14 pb-8 font-body text-black">
      <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div className="text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-semibold">
          {contato.email && (
            <a href={`mailto:${contato.email}`} className={`block w-fit ${LINK}`}>
              {contato.email}
            </a>
          )}
          {contato.telefone && (
            <a href={`tel:${telefone}`} className={`block w-fit ${LINK}`}>
              {contato.telefone}
            </a>
          )}
        </div>

        {redes.length > 0 && (
          <nav aria-label="Redes sociais" className="text-sm">
            <p className="text-pink">/Social</p>
            <ul className="mt-3 space-y-0.5">
              {redes.map((rede) => (
                <li key={rede.url}>
                  <a
                    href={rede.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    {rede.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav aria-label="Navegação do rodapé" className="text-sm">
          <p className="text-pink">/Nav</p>
          <ul className="mt-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={LINK}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-14 text-xs">
        <Credit year={year} />
      </p>
    </footer>
  );
}
