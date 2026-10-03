"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

/**
 * Área para escolher uma imagem: clicar abre o seletor de arquivos, e também dá para
 * arrastar e soltar. Usada na foto do produto e no logo da loja.
 */
export function ImagePicker({
  noun,
  image,
  fileName,
  accept,
  formats,
  onFile,
  compact = false,
  preview = "photo",
}: {
  /** "foto" ou "logo": vira "Escolher foto", "Trocar logo"… */
  noun: string;
  /** Endereço da imagem atual ou da prévia do arquivo escolhido */
  image: string | null;
  fileName?: string;
  accept: string;
  /** Texto dos formatos aceitos, ex.: "JPG, PNG ou WEBP, até 4 MB." */
  formats: string;
  onFile: (file: File) => void;
  /** Versão baixa, com a imagem ao lado do texto */
  compact?: boolean;
  /** "photo": quadrada, preenchendo; "logo": retangular, sobre a cor do topo, sem cortar */
  preview?: "photo" | "logo";
}) {
  const [dragging, setDragging] = useState(false);
  const isLogo = preview === "logo";

  // No celular sempre empilha (imagem em cima, texto embaixo): ao lado, o texto fica espremido
  const box = isLogo
    ? `${compact ? "h-20 w-40 sm:h-14 sm:w-28" : "h-20 w-40"} rounded-lg bg-ink p-2`
    : `${compact ? "h-24 w-24 rounded-xl sm:h-16 sm:w-16 sm:rounded-lg" : "h-24 w-24 rounded-xl"} bg-paper ring-1 ring-zinc-200/80`;

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={`flex flex-1 cursor-pointer items-center rounded-xl border-2 border-dashed transition focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-brand ${
        dragging ? "border-brand bg-brand/10" : "border-zinc-200 hover:border-ink/30 hover:bg-paper"
      } ${
        compact
          ? "flex-col justify-center gap-3 p-4 text-center sm:flex-row sm:justify-start sm:p-3 sm:text-left"
          : "flex-col justify-center gap-3 p-4 text-center"
      }`}
    >
      <div
        className={`grid shrink-0 place-items-center overflow-hidden transition-all duration-300 motion-reduce:transition-none ${box}`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={isLogo ? "max-h-full max-w-full object-contain" : "h-full w-full object-cover"} />
        ) : (
          <ImagePlus size={compact ? 22 : 28} className={isLogo ? "text-white/60" : "text-zinc-400"} />
        )}
      </div>
      <div className="min-w-0 max-w-full text-sm">
        <p className="font-semibold">
          {dragging ? `Solte para usar como ${noun}` : image ? `Trocar ${noun}` : `Escolher ${noun}`}
        </p>
        {/* Nome de arquivo longo é cortado; a explicação quebra linha */}
        <p className={`text-zinc-500 ${fileName ? "truncate" : ""}`}>{fileName ?? `${formats} Clique ou arraste o arquivo aqui.`}</p>
      </div>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
