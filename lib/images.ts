import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

export type SizedImage = { src: string; width: number; height: number };

// O CMS guarda só o caminho; as dimensões são lidas do arquivo no build.
export function withSize(src: string): SizedImage {
  const file = path.join(process.cwd(), "public", src);
  const { width, height } = imageSize(fs.readFileSync(file));
  return { src, width, height };
}
