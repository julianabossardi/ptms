"use client";

import { useState } from "react";

const LINK = "hover-arrow transition-colors hover:text-pink";

// Compartilhar o post: um botão que abre o menu do sistema (celular) ou copia
// o endereço, e links diretos para as redes. O endereço vem do servidor, já
// com o domínio do site.
export default function SharePost({ url, title }: { url: string; title: string }) {
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
      // Sem permissão para a área de transferência; os links ao lado servem.
    }
  };

  const text = `${title} ${url}`;
  const redes = [
    { rotulo: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}` },
    {
      rotulo: "X",
      href: `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      rotulo: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      rotulo: "e-mail",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
    },
  ];

  return (
    <div className="mt-16 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-gray/30 pt-6 font-body text-sm">
      <span className="text-gray">compartilhar</span>
      <button type="button" onClick={share} className="transition-colors hover:text-pink">
        {copied ? "link copiado" : "enviar link"}
      </button>
      {redes.map((rede) => (
        <a
          key={rede.rotulo}
          href={rede.href}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK}
        >
          {rede.rotulo}
        </a>
      ))}
    </div>
  );
}
