import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CursorPlus from "@/components/CursorPlus";
import FadeIn from "@/components/FadeIn";
import { formatPostDate, getPost, getPosts } from "@/lib/content";
import { withSize } from "@/lib/images";
import { renderMarkdown } from "@/lib/markdown";

// Slugs que não existem em content/ptms respondem 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/ptms/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPost(slug)?.post.titulo };
}

// Tipografia do corpo aplicada ao HTML do markdown. A legenda de imagem chega
// marcada como .caption (lib/markdown.ts).
const BODY = [
  "font-body text-base leading-relaxed",
  "[&_p]:mt-6",
  "[&_h2]:mt-16 [&_h2]:text-2xl [&_h2]:leading-snug [&_h2]:font-semibold",
  "[&_blockquote]:my-12 [&_blockquote]:text-2xl [&_blockquote]:leading-snug",
  "[&_blockquote_p]:mt-4",
  "[&_img]:mt-12 [&_img]:h-auto [&_img]:w-full",
  "[&_.caption]:mt-3 [&_.caption]:text-xs [&_.caption]:text-gray",
  "[&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a:hover]:text-pink",
  "[&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-5",
  "[&_strong]:font-semibold",
].join(" ");

export default async function PostPage({ params }: PageProps<"/ptms/[slug]">) {
  const { slug } = await params;
  const entry = getPost(slug);
  if (!entry) notFound();

  const { post, next } = entry;
  // A miniatura da listagem também é a capa do post.
  const cover = post.thumb ? withSize(post.thumb) : null;

  return (
    <article className="bg-black px-[var(--gutter)] pt-[30vh] pb-24">
      <header>
        <h1 className="font-display text-[clamp(2.75rem,7vw,8rem)] leading-none font-medium">
          {post.titulo}
        </h1>
        <p className="mt-6 text-right font-body text-sm">
          {formatPostDate(post.data)}
        </p>
      </header>

      {cover && (
        <Image
          src={cover.src}
          width={cover.width}
          height={cover.height}
          alt={post.titulo}
          preload
          sizes="100vw"
          className="mt-[6vw] aspect-[2/1] w-full object-cover"
        />
      )}

      {/* O bloco de paleta extraída das imagens entra na etapa 9. */}
      <FadeIn className={`mx-auto mt-[10vw] max-w-[40rem] ${BODY}`}>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.corpo) }} />
      </FadeIn>

      <nav
        aria-label="Outros posts"
        className="mt-32 flex flex-col gap-10 border-t border-gray/30 pt-10 md:flex-row md:items-end md:justify-between"
      >
        <Link
          href="/ptms"
          className="w-fit font-body text-sm transition-colors hover:text-pink"
        >
          ← Back to PTMS
        </Link>
        {next.slug !== post.slug && (
          <Link
            href={`/ptms/${next.slug}`}
            data-cursor="plus"
            className="group self-end text-right"
          >
            <span className="block font-body text-xs text-gray">Next →</span>
            <span className="mt-2 block font-display text-3xl leading-tight font-medium transition-colors group-hover:text-pink">
              {next.titulo}
            </span>
          </Link>
        )}
      </nav>

      <CursorPlus />
    </article>
  );
}
