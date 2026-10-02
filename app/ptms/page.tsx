import type { Metadata } from "next";
import PtmsListing from "@/components/PtmsListing";
import { getPosts, getPtmsPage } from "@/lib/content";
import { excerpt, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  seo: getPtmsPage().seo,
  titulo: "PTMS",
  descricao: excerpt(getPtmsPage().descricao) || getPtmsPage().subtitulo,
  imagem: getPosts()[0]?.thumb,
  path: "/ptms",
});

export default function Ptms() {
  return <PtmsListing page={1} />;
}
