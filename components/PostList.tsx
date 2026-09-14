"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { SizedImage } from "@/lib/images";
import { useFollowThumb } from "./useFollowThumb";

export type PostRow = {
  slug: string;
  titulo: string;
  data: string;
  thumb: SizedImage | null;
};

// Lista do PTMS sobre o branco: mesmo padrão de hover do Work, invertido
// (ativa em preto, demais em cinza).
export default function PostList({ posts }: { posts: PostRow[] }) {
  const [active, setActive] = useState<string | null>(null);
  const { thumbRef, rowHandlers } = useFollowThumb(active, setActive);

  return (
    <>
      <ul onPointerLeave={() => setActive(null)}>
        {posts.map((post) => {
          const tone =
            active === null || active === post.slug ? "text-black" : "text-gray";
          const line = active === post.slug ? "border-black" : "border-black/15";
          return (
            <li key={post.slug}>
              <Link
                href={`/ptms/${post.slug}`}
                data-cursor="plus"
                {...rowHandlers(post.slug)}
                className={`grid gap-y-2 border-b py-6 transition-colors md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:items-baseline md:gap-x-6 ${tone} ${line}`}
              >
                <span className="font-body text-sm">{post.data}</span>
                <span className="font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.05] font-medium">
                  {post.titulo}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        ref={thumbRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-[64vw] z-20 hidden md:block"
      >
        {posts.map(
          (post) =>
            post.thumb && (
              <Image
                key={post.slug}
                src={post.thumb.src}
                width={post.thumb.width}
                height={post.thumb.height}
                alt=""
                loading="eager"
                sizes="24vw"
                className={`absolute top-0 left-0 h-auto w-[24vw] -translate-y-1/2 ${
                  active === post.slug ? "" : "invisible"
                }`}
              />
            ),
        )}
      </div>
    </>
  );
}
