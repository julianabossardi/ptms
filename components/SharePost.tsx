"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

// Compartilhar o post em ícones: redes com o link pronto e um botão que abre
// o menu do sistema (celular) ou copia o endereço. Aparece duas vezes na
// página, ao lado da data e no fim do texto.
export default function SharePost({
  url,
  title,
  label = false,
  className = "",
}: {
  url: string;
  title: string;
  label?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelado ou indisponível: segue para copiar o link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão para a área de transferência; as redes ao lado servem.
    }
  };

  const text = `${title} ${url}`;
  const redes = [
    {
      nome: "WhatsApp",
      icone: "whatsapp" as const,
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
      nome: "X",
      icone: "x" as const,
      href: `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      nome: "Facebook",
      icone: "facebook" as const,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      nome: "e-mail",
      icone: "email" as const,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 font-body ${className}`}>
      {label && <span className="text-sm text-gray">compartilhar</span>}
      <div className="flex items-center gap-4 text-xl">
        {redes.map((rede) => (
          <a
            key={rede.nome}
            href={rede.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Compartilhar no ${rede.nome}`}
            aria-label={`Compartilhar no ${rede.nome}`}
            className="transition-colors hover:text-pink"
          >
            <Icon name={rede.icone} />
          </a>
        ))}
        <button
          type="button"
          onClick={share}
          title="Enviar ou copiar o link"
          aria-label="Enviar ou copiar o link"
          className="transition-colors hover:text-pink"
        >
          <Icon name="link" />
        </button>
      </div>
      {copied && <span className="text-xs text-gray">link copiado</span>}
    </div>
  );
}
