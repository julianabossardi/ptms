"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ContactPage, Rede } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";

// Links do rodapé ficam rosa e ganham seta no hover, para ficar claro que são
// clicáveis, e abrem em nova aba. E-mail e telefone abrem o app de e-mail ou
// de ligação, sem sair da página, então não precisam de aba nova.
const LINK = "hover-arrow transition-colors hover:text-pink";
// Rodapé da Home: fechado, fica sobre a faixa rosa do PTMS (texto preto, hover
// branco); com o PTMS aberto (data-open no wrapper da Home, posto por
// SheetToggle), fica sobre o fundo preto (texto branco, hover rosa).
const LINK_ON_PINK =
  "hover-arrow transition-colors hover:text-white group-data-[open]/home:hover:text-pink";

function Credit({ year, link = LINK }: { year: number; link?: string }) {
  return (
    <>
      © {year} WEBSITE BY{" "}
      <a
        href="https://agenciamoldura.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={`underline underline-offset-2 ${link}`}
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
      className={`grid gap-y-0.5 px-[var(--gutter)] pt-8 pb-2 font-body text-xs leading-[1.2] text-black transition-colors duration-200 ease-out group-data-[open]/home:text-white motion-reduce:transition-none lg:grid-cols-[1fr_4rem_1fr] lg:items-center lg:py-3 ${className}`}
    >
      <p className="flex flex-wrap gap-x-4 gap-y-0.5">
        {email && (
          <a href={`mailto:${email}`} className={`font-medium ${LINK_ON_PINK}`}>
            contact
          </a>
        )}
      </p>
      <span aria-hidden className="hidden lg:block" />
      <p className="lg:text-right">
        <Credit year={year} link={LINK_ON_PINK} />
      </p>
    </footer>
  );
}

// Rodapé claro, na linha do site original, mais compacto: contato em
// destaque, redes e navegação em colunas, crédito no pé. Contato, redes e
// navegação têm um peso a mais que o crédito. Na Home o rodapé é a faixa fina
// de CompactFooter, dentro da seção do PTMS (app/page.tsx).
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
    <footer className="bg-white px-[var(--gutter)] pt-10 pb-6 font-body text-black md:pt-14 md:pb-8">
      {/* No celular e no tablet, redes e navegação lado a lado, abaixo do contato. */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[2fr_1fr_1fr] md:gap-10">
        <div className="col-span-2 text-[clamp(1.125rem,2vw,1.75rem)] leading-tight font-bold md:col-span-1">
          {contato.email && (
            <a href={`mailto:${contato.email}`} className={`block w-fit ${LINK}`}>
              contact
            </a>
          )}
          {contato.telefone && (
            <a href={`tel:${telefone}`} className={`block w-fit ${LINK}`}>
              {contato.telefone}
            </a>
          )}
        </div>

        {redes.length > 0 && (
          <nav aria-label="Redes sociais" className="text-sm font-medium">
            <p className="text-pink">/Social</p>
            <ul className="mt-2 space-y-0.5 md:mt-3">
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

        <nav aria-label="Navegação do rodapé" className="text-sm font-medium">
          <p className="text-pink">/Nav</p>
          <ul className="mt-2 space-y-0.5 md:mt-3">
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

      <p className="mt-8 text-xs md:mt-14">
        <Credit year={year} />
      </p>
    </footer>
  );
}
