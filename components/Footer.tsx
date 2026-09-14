import type { Rede } from "@/lib/content";

// Mínimo por decisão do brief: links sociais e crédito. Sem newsletter, sem CTA.
export default function Footer({ redes }: { redes: Rede[] }) {
  return (
    <footer className="flex flex-wrap items-baseline justify-between gap-4 bg-black px-[var(--gutter)] py-10 font-body text-sm text-white">
      <ul className="flex gap-6">
        {redes.map((rede) => (
          <li key={rede.url}>
            <a href={rede.url} target="_blank" rel="noopener noreferrer">
              {rede.rotulo}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-gray">
        © {new Date().getFullYear()} Rachel Oliveira Vieira
      </p>
    </footer>
  );
}
