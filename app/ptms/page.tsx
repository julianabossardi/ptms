import type { Metadata } from "next";
import PtmsListing from "@/components/PtmsListing";

export const metadata: Metadata = { title: "PTMS" };

export default function Ptms() {
  return <PtmsListing page={1} />;
}
