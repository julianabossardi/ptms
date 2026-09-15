import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans,
  Noto_Sans_Bamum,
  Noto_Sans_Cham,
  Noto_Sans_Symbols_2,
  Oswald,
} from "next/font/google";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";
import { getContact, getGlobal } from "@/lib/content";
import "./globals.css";

// Display: wordmarks, títulos, nomes na lista de projetos.
const oswald = Oswald({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-oswald",
});

// Corpo: parágrafos, legendas, créditos, navegação, metadados.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-inter",
});

// Símbolos decorativos dos títulos do PTMS (˳ ⋅ 𖤐 ꩜) que Oswald e Inter não
// têm. Cada fonte cobre só o próprio intervalo de caracteres e não é pré-carregada.
const noto = Noto_Sans({
  subsets: ["latin-ext"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-noto",
});
const symbols = Noto_Sans_Symbols_2({
  subsets: ["math", "symbols"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-symbols",
});
const bamum = Noto_Sans_Bamum({
  subsets: ["bamum"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-bamum",
});
const cham = Noto_Sans_Cham({
  subsets: ["cham"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-cham",
});

const fontVariables = [oswald, inter, noto, symbols, bamum, cham]
  .map((font) => font.variable)
  .join(" ");

export const metadata: Metadata = {
  title: {
    default: "Rachel Oliveira Vieira",
    template: "%s · Rachel Oliveira Vieira",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { redes } = getGlobal();
  const contato = getContact();

  return (
    <html lang="pt-BR" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Menu redes={redes} />
        <main className="flex-1">{children}</main>
        <Footer redes={redes} contato={contato} year={new Date().getFullYear()} />
      </body>
    </html>
  );
}
