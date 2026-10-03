"use client";

import { useBranding } from "./theme-context";

const SIZES = {
  /** Barra do topo (64px de altura) */
  md: { image: "h-10 max-w-52 sm:h-11 sm:max-w-60", text: "text-2xl" },
  /** Destaque, como na tela de login */
  lg: { image: "h-16 max-w-72 sm:h-20 sm:max-w-80", text: "text-4xl sm:text-5xl" },
};

/**
 * Logo da loja; sem logo cadastrado, mostra o nome em texto.
 * `suffix` é a segunda palavra do nome em texto ("Suplementos", "Painel").
 * `onDark` indica que o fundo é a cor secundária (topo), para escolher as cores do texto.
 */
export function BrandLogo({
  suffix,
  onDark = true,
  size = "md",
}: {
  suffix: string;
  onDark?: boolean;
  size?: keyof typeof SIZES;
}) {
  const { branding } = useBranding();

  if (branding.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={branding.logoUrl} alt={`Manu ${suffix}`} className={`w-auto object-contain ${SIZES[size].image}`} />
    );
  }
  return (
    <span className={`font-display font-extrabold uppercase tracking-wide ${SIZES[size].text} ${onDark ? "text-white" : ""}`}>
      Manu <span className={onDark ? "text-brand" : "text-brand-dark"}>{suffix}</span>
    </span>
  );
}
