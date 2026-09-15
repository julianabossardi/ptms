import type { Metadata } from "next";
import CursorPlus from "@/components/CursorPlus";
import FadeIn from "@/components/FadeIn";
import PostList, { type PostRow } from "@/components/PostList";
import { formatPostDate, getPosts, getPtmsPage } from "@/lib/content";
import { withSize } from "@/lib/images";

export const metadata: Metadata = { title: "PTMS" };

// Fundo branco com o display em rosa, a pedido da cliente (o brief previa
// fundo rosa). É a única seção clara do site.
export default function Ptms() {
  const { descricao } = getPtmsPage();
  const posts: PostRow[] = getPosts().map((post) => ({
    slug: post.slug,
    titulo: post.titulo,
    data: formatPostDate(post.data),
    thumb: post.thumb ? withSize(post.thumb) : null,
  }));

  return (
    <section className="min-h-screen bg-white px-[var(--gutter)] pt-[20vh] pb-32 text-black">
      <h1 className="text-center font-display text-[19vw] leading-none font-medium text-pink">
        PTMS,
      </h1>
      {/* Descrição com destaque discreto: maior que o corpo, com um fio rosa. */}
      {descricao && (
        <p className="mt-12 max-w-[40rem] border-b border-pink pb-5 font-body text-[clamp(1.125rem,1.6vw,1.5rem)] leading-snug">
          {descricao}
        </p>
      )}
      <FadeIn className="mt-[8vw]">
        <PostList posts={posts} />
      </FadeIn>
      <CursorPlus tone="black" />
    </section>
  );
}
