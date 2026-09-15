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
// otimizada do Next. Com movimento reduzido, a foto aparece direto.
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

    // Reduz a foto a um pixel por bloco e amplia sem suavizar, com o mesmo
    // recorte "cover" da imagem.
    const draw = (size: number) => {
      if (!bufferContext) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      canvas.width = width;
      canvas.height = height;

      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      const cropX = (image.naturalWidth - cropWidth) / 2;
      const cropY = (image.naturalHeight - cropHeight) / 2;

      const block = Math.round(size * ratio);
      const columns = Math.ceil(width / block);
      const rows = Math.ceil(height / block);
      buffer.width = columns;
      buffer.height = rows;
      bufferContext.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, columns, rows);
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
    const begin = () => run(0);

    if (image.complete && image.naturalWidth) begin();
    else image.addEventListener("load", begin, { once: true });
    return () => {
      window.clearTimeout(timer);
      image.removeEventListener("load", begin);
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
