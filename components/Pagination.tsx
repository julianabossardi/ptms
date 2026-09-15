import Link from "next/link";

const LINK = "transition-colors hover:text-pink";

const href = (n: number) => (n === 1 ? "/ptms" : `/ptms/pagina/${n}`);

// Números mostrados: todos até 7 páginas; acima disso, a primeira, a última e
// as vizinhas da atual, com reticências nos saltos.
function pageList(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const shown = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  return shown.flatMap((n, i) => (i > 0 && n - shown[i - 1] > 1 ? ["gap" as const, n] : [n]));
}

// Navegação entre as páginas da listagem do PTMS: anterior, números e
// próxima. A página atual fica na caixa rosa, como as etiquetas do site. Com
// uma página só, não aparece.
export default function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;

  return (
    <nav
      aria-label="Páginas do PTMS"
      className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-6 font-body text-sm"
    >
      <span>
        {page > 1 && (
          <Link href={href(page - 1)} className={LINK}>
            ← anterior
          </Link>
        )}
      </span>
      <ol className="flex items-center gap-2">
        {pageList(page, pages).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden>
              …
            </li>
          ) : (
            <li key={n}>
              {n === page ? (
                <span aria-current="page" className="block bg-pink px-1.5 font-semibold">
                  {n}
                </span>
              ) : (
                <Link href={href(n)} className={`block px-1.5 ${LINK}`}>
                  {n}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>
      <span className="text-right">
        {page < pages && (
          <Link href={href(page + 1)} className={LINK}>
            próxima →
          </Link>
        )}
      </span>
    </nav>
  );
}
