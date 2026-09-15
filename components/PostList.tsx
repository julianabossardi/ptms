import Image from "next/image";
import Link from "next/link";
import type { SizedImage } from "@/lib/images";

export type PostRow = {
  slug: string;
  titulo: string;
  data: string;
  thumb: SizedImage | null;
};

// Lista do PTMS: data, título e miniatura fixa em cada linha, como na
// referência. No hover a linha ativa segue em preto e as demais vão a cinza.
export default function PostList({ posts }: { posts: PostRow[] }) {
  return (
    <ul className="group/list">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/ptms/${post.slug}`}
            data-cursor="plus"
            className="grid gap-4 border-b border-black/15 py-8 text-black transition-colors group-hover/list:[&:not(:hover)]:text-gray md:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,2.5fr)] md:items-start md:gap-x-6"
          >
            <span className="font-body text-sm">{post.data}</span>
            <span className="font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.05] font-medium">
              {post.titulo}
            </span>
            {post.thumb && (
              <Image
                src={post.thumb.src}
                width={post.thumb.width}
                height={post.thumb.height}
                alt=""
                sizes="(min-width: 768px) 36vw, 100vw"
                className="aspect-[3/2] w-full object-cover"
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
