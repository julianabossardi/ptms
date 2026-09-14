import type { Metadata } from "next";
import { getContact } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  const { titulo, corpo, email } = getContact();

  return (
    <section className="min-h-screen bg-black px-[var(--gutter)] pt-[30vh] pb-24">
      <h1 className="font-display text-[clamp(4rem,14vw,16rem)] leading-none font-medium">
        {titulo}
      </h1>
      {corpo && (
        <div
          className="mt-12 max-w-[36ch] font-body text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(corpo) }}
        />
      )}
      {email && (
        <a href={`mailto:${email}`} className="mt-8 block font-body text-sm">
          {email}
        </a>
      )}
    </section>
  );
}
