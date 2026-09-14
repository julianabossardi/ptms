import type { Metadata } from "next";

export const metadata: Metadata = { title: "PTMS" };

// Única seção com a paleta invertida (fundo rosa). Lista de posts na etapa 5.
export default function Ptms() {
  return (
    <section className="min-h-screen bg-pink text-black">
      <h1 className="sr-only">PTMS</h1>
    </section>
  );
}
