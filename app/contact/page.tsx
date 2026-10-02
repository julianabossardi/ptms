import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getContact, getHome } from "@/lib/content";
import { contactNode, graph, personNode } from "@/lib/jsonld";
import { renderMarkdown } from "@/lib/markdown";
import { excerpt, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  seo: getContact().seo,
  titulo: "Contact",
  descricao:
    excerpt(getContact().corpo) ||
    `Contato de ${getHome().nome} (${getHome().cargos.join(", ")}): ${getContact().email}.`,
  path: "/contact",
});

const LINK = "hover-arrow block w-fit transition-colors hover:text-pink";

export default function Contact() {
  const { titulo, corpo, email, telefone } = getContact();

  return (
    <section className="min-h-screen bg-black px-[var(--gutter)] pt-[30vh] pb-24">
      <JsonLd data={graph(contactNode(), personNode())} />
      <h1 className="font-display text-[clamp(4rem,14vw,16rem)] leading-none font-medium">
        {titulo}
      </h1>
      {corpo && (
        <div
          className="mt-12 max-w-[36ch] font-body text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(corpo) }}
        />
      )}
      <div className="mt-12 font-body text-[clamp(1.25rem,2.4vw,2.25rem)] leading-tight">
        {email && (
          <a href={`mailto:${email}`} className={LINK}>
            {email}
          </a>
        )}
        {telefone && (
          <a href={`tel:${telefone.replace(/[^\d+]/g, "")}`} className={LINK}>
            {telefone}
          </a>
        )}
      </div>
    </section>
  );
}
