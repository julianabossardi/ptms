import type { ReactNode } from "react";

// Etiqueta de idioma acima dos textos bilíngues (About e páginas de projeto),
// no padrão da etiqueta "Acessar" dos cards da Home: caixa rosa, texto preto.
export default function LangTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-pink px-1 font-body text-sm leading-snug font-semibold text-black">
      {children}
    </span>
  );
}
