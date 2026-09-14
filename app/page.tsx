import { getHome } from "@/lib/content";

// Home sem o collage por enquanto (entra na etapa 7 do brief).
export default function Home() {
  const { nome, funcao, local } = getHome();

  return (
    <section className="relative min-h-screen bg-black">
      <div className="px-[var(--gutter)] pt-[20vh] font-body text-[clamp(1.75rem,2.4vw,3rem)] leading-none font-semibold tracking-[-0.03em] text-pink lg:p-0">
        <h1 className="lg:absolute lg:top-[15vh] lg:left-[10%]">{nome}</h1>
        <p className="mt-3 lg:absolute lg:top-[20vh] lg:left-[46%] lg:mt-0">
          {funcao}
        </p>
        <p className="mt-3 lg:absolute lg:top-[25vh] lg:left-[77%] lg:mt-0">
          {local}
        </p>
      </div>
    </section>
  );
}
