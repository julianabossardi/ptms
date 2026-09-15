// Extrai as cores dominantes das imagens de cada post do PTMS (brief 5.3) e
// grava em content/ptms/palettes.json. Não é campo do CMS: roda antes de todo
// build (script "prebuild"), então sempre reflete o conteúdo atual.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/ptms");
const OUTPUT = path.join(POSTS_DIR, "palettes.json");
// Cores por post e lado da amostra (em pixels) de cada imagem.
const COLORS = 8;
const SAMPLE = 48;

// Capa e imagens do corpo que estão no próprio site.
function imagesOf(data) {
  const body = String(data.corpo ?? "");
  const inBody = [...body.matchAll(/!\[[^\]]*\]\((\/uploads\/[^)\s]+)\)/g)].map(
    (match) => match[1],
  );
  return [data.thumb, ...inBody].filter(
    (src) => typeof src === "string" && src.startsWith("/uploads/"),
  );
}

async function pixelsOf(src) {
  const file = path.join(ROOT, "public", src);
  if (!fs.existsSync(file)) return [];
  const data = await sharp(file)
    .resize(SAMPLE, SAMPLE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const pixels = [];
  for (let i = 0; i < data.length; i += 3) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

// k-means simples e determinístico: parte de pixels espaçados por
// luminosidade, então o mesmo conteúdo gera sempre a mesma paleta. As cores
// saem como estão nas fotos, sem correção nem saturação.
function dominantColors(pixels, k) {
  if (pixels.length === 0) return [];
  const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const sorted = [...pixels].sort((a, b) => luminance(a) - luminance(b));
  let centers = Array.from(
    { length: k },
    (_, i) => sorted[Math.floor(((i + 0.5) * sorted.length) / k)],
  );
  let counts = [];

  for (let iteration = 0; iteration < 12; iteration++) {
    const sums = centers.map(() => [0, 0, 0]);
    counts = centers.map(() => 0);
    for (const pixel of pixels) {
      let best = 0;
      let bestDistance = Infinity;
      centers.forEach((center, index) => {
        const distance =
          (pixel[0] - center[0]) ** 2 +
          (pixel[1] - center[1]) ** 2 +
          (pixel[2] - center[2]) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      sums[best][0] += pixel[0];
      sums[best][1] += pixel[1];
      sums[best][2] += pixel[2];
      counts[best] += 1;
    }
    centers = centers.map((center, index) =>
      counts[index] ? sums[index].map((value) => value / counts[index]) : center,
    );
  }

  // Da cor mais presente para a menos presente.
  return centers
    .map((center, index) => ({ center, count: counts[index] }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .map(
      ({ center }) =>
        "#" +
        center.map((value) => Math.round(value).toString(16).padStart(2, "0")).join(""),
    );
}

const palettes = {};
const files = fs
  .readdirSync(POSTS_DIR)
  .filter((file) => file.endsWith(".md"))
  .sort();

for (const file of files) {
  const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
  const pixels = (await Promise.all(imagesOf(data).map(pixelsOf))).flat();
  const colors = dominantColors(pixels, COLORS);
  // Sem imagem, sem paleta: o bloco não aparece no post.
  if (colors.length > 0) palettes[file.replace(/\.md$/, "")] = colors;
}

fs.writeFileSync(OUTPUT, `${JSON.stringify(palettes, null, 2)}\n`);
console.log(`Paletas extraídas: ${Object.keys(palettes).length} de ${files.length} posts`);
