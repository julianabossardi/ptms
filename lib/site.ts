// Endereço público do site, base dos metadados (links de compartilhamento e
// imagem que aparece ao compartilhar). Na Vercel vem da própria plataforma;
// com domínio próprio, basta definir NEXT_PUBLIC_SITE_URL nas variáveis de
// ambiente.
const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (production ? `https://${production}` : "http://localhost:3000"),
);

export const SITE_NAME = "Rachel Oliveira Vieira";
