// Endereço público do site, base dos metadados (links de compartilhamento e
// imagem que aparece ao compartilhar). Em produção é o domínio próprio; nos
// previews da Vercel vale o endereço do próprio deploy e, no computador,
// localhost. NEXT_PUBLIC_SITE_URL, se definida, vence todos.
const PRODUCTION_URL = "https://racheloliveiravieira.com";

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = new URL(siteUrl());

export const SITE_NAME = "Rachel Oliveira Vieira";

// Google Analytics 4 (ID de métrica). Só conta visitas do site em produção:
// previews e testes locais ficam de fora.
export const GA_ID = "G-MTM6LDTXVZ";
export const ANALYTICS_ENABLED = process.env.VERCEL_ENV === "production";
