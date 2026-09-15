"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ContactPage, Rede } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";

// Links do rodapé ficam rosa e ganham seta no hover, para ficar claro que são
// clicáveis, e abrem em nova aba. E-mail e telefone abrem o app de e-mail ou
// de ligação, sem sair da página, então não precisam de aba nova.
const LINK = "hover-arrow transition-colors hover:text-pink";

function DevelopedBy() {
  return (
    <>
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

// Faixa fina da Home, numa linha só no desktop: e-mail e direitos à esquerda,
// crédito à direita e a coluna do meio livre para a seta da seção do PTMS
// (components/SheetToggle). No celular a seta ganha uma linha acima do texto.
export function CompactFooter({
  email,
  year,
  className = "",
}: {
  email: string;
  year: number;
  className?: string;
}) {
  return (
    <footer
      className={`grid gap-y-1 bg-white px-[var(--gutter)] pt-10 pb-3 font-body text-xs text-black lg:grid-cols-[1fr_4rem_1fr] lg:items-center lg:py-3 ${className}`}
    >
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        {email && (
          <a href={`mailto:${email}`} className={LINK}>
            {email}
          </a>
        )}
        <span>© {year} · todos os direitos reservados</span>
      </p>
      <span aria-hidden className="hidden lg:block" />
      <p className="lg:text-right">
        <DevelopedBy />
      </p>
    </footer>
  );
}

// Rodapé claro, na linha do site original, mais compacto: contato em
// destaque, redes e navegação em colunas, crédito no pé. Na Home o rodapé é a
// faixa fina de CompactFooter, dentro da seção do PTMS (app/page.tsx).
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

  if (pathname === "/") return null;

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
                <Link href={link.href} target="_blank" className={LINK}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-14 text-xs">
        © {year} Rachel Oliveira Vieira · todos os direitos reservados ·{" "}
        <DevelopedBy />
      </p>
    </footer>
  );
}
