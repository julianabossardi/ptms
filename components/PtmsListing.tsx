import CursorPlus from "@/components/CursorPlus";
import Pagination from "@/components/Pagination";
import PostList, { type PostRow } from "@/components/PostList";
import PtmsIntro from "@/components/PtmsIntro";
import { formatPostDate, getPostsPage, getPtmsPage } from "@/lib/content";
import { withSize } from "@/lib/images";

// Listagem do PTMS, igual em todas as páginas da paginação (/ptms e
// /ptms/pagina/2 em diante). Fundo branco com o display em rosa, a pedido da
// cliente (o brief previa fundo rosa): é a única seção clara do site.
export default function PtmsListing({ page }: { page: number }) {
  const { subtitulo, descricao } = getPtmsPage();
  const { posts, pages } = getPostsPage(page);
  const rows: PostRow[] = posts.map((post) => ({
    slug: post.slug,
    titulo: post.titulo,
    data: formatPostDate(post.data),
    thumb: post.thumb ? withSize(post.thumb) : null,
  }));

  return (
    <section className="min-h-screen bg-white px-[var(--gutter)] pt-[20vh] pb-32 text-black">
      {/* No desktop o bloco tem a largura do "PTMS,": o subtítulo e o texto
          que ele abre ficam centralizados com o header. */}
      <div className="lg:mx-auto lg:w-fit">
        <h1 className="text-center font-display text-[19vw] leading-none font-medium text-pink">
          PTMS,
        </h1>
        {subtitulo && <PtmsIntro title={subtitulo} text={descricao} />}
      </div>
      <div className="mt-[8vw]">
        <PostList posts={rows} />
      </div>
      <Pagination page={page} pages={pages} />
      <CursorPlus tone="black" />
    </section>
  );
}
