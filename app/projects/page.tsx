import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };

// Casca da rota. Lista de projetos entra na etapa 4; parallax na etapa 7.
export default function Projects() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black">
      <h1 className="font-display text-[19vw] leading-none font-medium text-white">
        Work
      </h1>
    </section>
  );
}
