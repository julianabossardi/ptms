import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // As imagens de public/uploads só são lidas no build (lib/images.ts mede as
  // dimensões); nenhuma rota precisa delas em tempo de execução. Sem esta
  // exclusão, o Next as anexa a toda função como "arquivos possivelmente
  // usados", e cada deploy guarda ~256 MB por função. Os arquivos continuam
  // sendo servidos normalmente a partir de public/.
  outputFileTracingExcludes: { "/*": ["./public/uploads/**/*"] },
  // AVIF primeiro: costuma sair bem menor que o JPG sem perda visível.
  images: { formats: ["image/avif", "image/webp"] },
  // O endereço antigo da Vercel segue respondendo com o site inteiro, uma
  // cópia do domínio principal para o Google. Redireciona (308, permanente)
  // mantendo o caminho. Só vale para esse endereço: o domínio principal e os
  // previews de branch não são afetados.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ptms-delta.vercel.app" }],
        destination: "https://racheloliveiravieira.com/:path*",
        permanent: true,
      },
    ];
  },
  // Decap CMS é servido como HTML estático em public/admin.
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
