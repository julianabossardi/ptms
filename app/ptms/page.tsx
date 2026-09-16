import type { Metadata } from "next";
import PtmsListing from "@/components/PtmsListing";
import { getPtmsPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  seo: getPtmsPage().seo,
  titulo: "PTMS",
  descricao: getPtmsPage().descricao,
});

export default function Ptms() {
  return <PtmsListing page={1} />;
}
