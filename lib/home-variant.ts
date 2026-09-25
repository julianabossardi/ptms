// Versão da Home. "ring": anel 3D de capas (components/HomeRing). "float":
// imagens flutuando pela tela (components/HomeFloat). Para trocar, edite o
// valor abaixo ou defina HOME_VARIANT no ambiente (.env.local ou Vercel).
export type HomeVariant = "ring" | "float";

const DEFAULT_HOME_VARIANT: HomeVariant = "float";

export const HOME_VARIANT: HomeVariant =
  process.env.HOME_VARIANT === "ring" || process.env.HOME_VARIANT === "float"
    ? process.env.HOME_VARIANT
    : DEFAULT_HOME_VARIANT;

// Área escura atrás do nome e dos cargos na versão "float".
// "solid": retângulo preto com margem interna, de corte seco.
// "gradient": preto no centro, esmaecendo até transparente nas bordas.
// "none": sem área escura; as imagens passam direto atrás do texto.
export type TitleBackdrop = "solid" | "gradient" | "none";

export const TITLE_BACKDROP: TitleBackdrop = "none";
