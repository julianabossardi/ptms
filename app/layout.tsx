import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";
import { getGlobal } from "@/lib/content";
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

export const metadata: Metadata = {
  title: {
    default: "Rachel Oliveira Vieira",
    template: "%s · Rachel Oliveira Vieira",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { redes } = getGlobal();

  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Menu redes={redes} />
        <main className="flex-1">{children}</main>
        <Footer redes={redes} />
      </body>
    </html>
  );
}
