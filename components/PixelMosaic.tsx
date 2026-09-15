"use client";

import { useEffect, useRef } from "react";

// Maior bloco do mosaico, em pixels de tela, no começo da seção.
const MAX_BLOCK = 120;

// Mosaico do About (brief 5.4): a imagem aparece atrás do "Rachel" em blocos
// quadrados grandes que diminuem conforme o scroll atravessa a seção, até
// ficar nítida. Desenho em canvas a partir de uma versão reduzida da imagem.
// Com movimento reduzido, a imagem aparece nítida direto.
export default function PixelMosaic({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    const context = canvas?.getContext("2d");
    if (!canvas || !section || !context) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const buffer = document.createElement("canvas");
    const bufferContext = buffer.getContext("2d");
    const image = new window.Image();
    // Versão otimizada pelo Next: mesma origem, então o canvas pode desenhá-la.
    image.src = `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;

    let frame = 0;
    const draw = () => {
      frame = 0;
      if (!bufferContext || !image.complete || !image.naturalWidth) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Progresso dentro da seção: 0 no topo, 1 quando o sticky termina.
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = reduce ? 1 : Math.min(Math.max(-rect.top / travel, 0), 1);
      // Os blocos encolhem rápido no começo e devagar no fim.
      const eased = 1 - (1 - progress) ** 3;
      const block = Math.max(1, Math.round(MAX_BLOCK * ratio * (1 - eased)));

      // Recorte "cover" da imagem para a proporção do canvas.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      const cropX = (image.naturalWidth - cropWidth) / 2;
      const cropY = (image.naturalHeight - cropHeight) / 2;

      context.clearRect(0, 0, width, height);
      if (block <= 1) {
        context.imageSmoothingEnabled = true;
        context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
        return;
      }

      // Reduz a imagem a um pixel por bloco e amplia sem suavizar.
      const columns = Math.ceil(width / block);
      const rows = Math.ceil(height / block);
      buffer.width = columns;
      buffer.height = rows;
      bufferContext.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, columns, rows);
      context.imageSmoothingEnabled = false;
      context.drawImage(buffer, 0, 0, columns, rows, 0, 0, columns * block, rows * block);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    image.addEventListener("load", draw);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      image.removeEventListener("load", draw);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [src]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
