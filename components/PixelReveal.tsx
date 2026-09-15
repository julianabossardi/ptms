"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Tamanho dos blocos a cada passo, em pixels de tela. Depois do último passo
// o canvas some e fica a foto nítida.
const STEPS = [96, 48, 24, 12, 6];
const STEP_MS = 180;

// Foto do topo do About, como na referência: assim que carrega, aparece em
// blocos grandes que diminuem em poucos passos até ficar nítida (brief 5.4).
// O canvas cobre a foto só durante a animação; a foto em si é a imagem
// otimizada do Next. Os blocos saem de uma cópia pequena e de tamanho fixo:
// a imagem exibida vem de um srcset, e o navegador informa o tamanho dela
// corrigido pela densidade, o que fazia o recorte mostrar só um canto
// ampliado. Com movimento reduzido, a foto aparece direto.
export default function PixelReveal({ src }: { src: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!image || !canvas || !context) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.hidden = true;
      return;
    }

    const buffer = document.createElement("canvas");
    const bufferContext = buffer.getContext("2d");
    const source = new window.Image();
    source.src = `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;

    // Reduz a foto a um pixel por bloco e amplia sem suavizar, com o mesmo
    // recorte "cover" da imagem.
    const draw = (size: number) => {
      if (!bufferContext) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      canvas.width = width;
      canvas.height = height;

      const scale = Math.max(width / source.naturalWidth, height / source.naturalHeight);
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      const cropX = (source.naturalWidth - cropWidth) / 2;
      const cropY = (source.naturalHeight - cropHeight) / 2;

      const block = Math.round(size * ratio);
      const columns = Math.ceil(width / block);
      const rows = Math.ceil(height / block);
      buffer.width = columns;
      buffer.height = rows;
      bufferContext.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, columns, rows);
      context.imageSmoothingEnabled = false;
      context.drawImage(buffer, 0, 0, columns, rows, 0, 0, columns * block, rows * block);
    };

    // Um passo a cada STEP_MS, com timer e não por quadro: são só cinco
    // desenhos. No fim o canvas sai e fica a foto.
    let timer = 0;
    const run = (step: number) => {
      if (step >= STEPS.length) {
        canvas.hidden = true;
        return;
      }
      draw(STEPS[step]);
      timer = window.setTimeout(() => run(step + 1), STEP_MS);
    };
    // Começa quando a foto exibida e a cópia pequena terminam de carregar.
    const loaded = (img: HTMLImageElement) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
    let cancelled = false;
    Promise.all([loaded(image), loaded(source)]).then(() => {
      if (cancelled) return;
      if (source.naturalWidth) run(0);
      else canvas.hidden = true;
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [src]);

  return (
    <div aria-hidden className="absolute inset-0">
      <Image
        ref={imageRef}
        src={src}
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      {/* Preto até a foto carregar, para ela não aparecer nítida antes. */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-black" />
    </div>
  );
}
