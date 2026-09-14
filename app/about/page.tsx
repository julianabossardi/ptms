import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

// Casca da rota. Bio entra na etapa 6; mosaico pixelado na etapa 10.
export default function About() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black">
      <h1 className="font-display text-[19vw] leading-none font-medium text-white">
        Rachel
      </h1>
    </section>
  );
}
