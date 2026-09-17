// Ícones de linha, todos no mesmo traço e na cor do texto (currentColor):
// redes sociais no menu e compartilhamento nos posts. Desenhados aqui para
// não carregar biblioteca nem depender de imagem externa.
export type IconName =
  | "instagram"
  | "substack"
  | "whatsapp"
  | "x"
  | "facebook"
  | "email"
  | "link";

const PATHS: Record<IconName, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  substack: (
    <>
      <path d="M4 5h16" />
      <path d="M4 10h16" />
      <path d="M4 15v5l8-3.6 8 3.6v-5" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4.3 19.7 5.6 16A7.5 7.5 0 1 1 8 18.4l-3.7 1.3Z" />
      <path d="M9.2 9c.3 1 .8 1.9 1.5 2.6.7.7 1.5 1.2 2.4 1.5l1-1.2 1.9.9-.4 1.6c-1.7.3-3.5-.4-4.9-1.8-1.4-1.4-2.1-3.2-1.8-4.9l1.6-.4.9 1.9L9.2 9Z" />
    </>
  ),
  x: (
    <>
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </>
  ),
  facebook: (
    <>
      <path d="M14.5 21v-8h2.3l.4-3h-2.7V8.3c0-.9.3-1.4 1.5-1.4h1.3V4.2c-.6-.1-1.4-.2-2.2-.2-2.3 0-3.7 1.3-3.7 3.9V10H9v3h2.4v8" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1.4 1.4" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.4-1.4" />
    </>
  ),
};

export default function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-[1.1em] w-[1.1em] shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}

// Rede social pela URL: define o ícone mostrado ao lado do @ no menu.
export function iconForUrl(url: string): IconName | null {
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/substack\.com/i.test(url)) return "substack";
  if (/(^|\.)x\.com|twitter\.com/i.test(url)) return "x";
  if (/facebook\.com/i.test(url)) return "facebook";
  return null;
}
