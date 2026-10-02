// Dados estruturados da página (lib/jsonld.ts). O "<" sai escapado para o
// conteúdo do CMS nunca fechar a tag <script> antes da hora.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
