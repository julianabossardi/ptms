import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PtmsListing from "@/components/PtmsListing";
import { getPostsPage } from "@/lib/content";

// Páginas 2 em diante da listagem do PTMS; a primeira fica em /ptms. Só as
// páginas que existem viram rota; qualquer outro número responde 404.
export const dynamicParams = false;

export function generateStaticParams() {
  const { pages } = getPostsPage(1);
  return Array.from({ length: Math.max(pages - 1, 0) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/ptms/pagina/[n]">): Promise<Metadata> {
  const { n } = await params;
  return { title: `PTMS · página ${n}` };
}

export default async function PtmsPage({ params }: PageProps<"/ptms/pagina/[n]">) {
  const { n } = await params;
  const page = Number(n);
  const { pages } = getPostsPage(1);
  if (!Number.isInteger(page) || page < 2 || page > pages) notFound();
  return <PtmsListing page={page} />;
}
