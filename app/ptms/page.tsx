import type { Metadata } from "next";
import CursorPlus from "@/components/CursorPlus";
import PostList, { type PostRow } from "@/components/PostList";
import PtmsIntro from "@/components/PtmsIntro";
import { formatPostDate, getPosts, getPtmsPage } from "@/lib/content";
import { withSize } from "@/lib/images";

export const metadata: Metadata = { title: "PTMS" };

// Fundo branco com o display em rosa, a pedido da cliente (o brief previa
// fundo rosa). É a única seção clara do site.
export default function Ptms() {
  const { subtitulo, descricao } = getPtmsPage();
  const posts: PostRow[] = getPosts().map((post) => ({
    slug: post.slug,
    titulo: post.titulo,
    data: formatPostDate(post.data),
    thumb: post.thumb ? withSize(post.thumb) : null,
  }));

  return (
    <section className="min-h-screen bg-white px-[var(--gutter)] pt-[20vh] pb-32 text-black">
      {/* No desktop o bloco tem a largura do "PTMS,": o subtítulo e o texto
          que ele abre ficam alinhados ao header. */}
      <div className="lg:mx-auto lg:w-fit">
        <h1 className="text-center font-display text-[19vw] leading-none font-medium text-pink">
          PTMS,
        </h1>
        {subtitulo && <PtmsIntro title={subtitulo} text={descricao} />}
      </div>
      <div className="mt-[8vw]">
        <PostList posts={posts} />
      </div>
      <CursorPlus tone="black" />
    </section>
  );
}
