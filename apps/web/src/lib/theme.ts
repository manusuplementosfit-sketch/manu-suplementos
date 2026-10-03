export interface Theme {
  brandColor: string;
  inkColor: string;
}

/** Cores originais da Manu Suplementos (as mesmas do globals.css). */
export const DEFAULT_THEME: Theme = { brandColor: "#96c82d", inkColor: "#02314b" };

const WHITE = "#ffffff";

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

/** Luminância relativa do WCAG 2. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste entre duas cores, de 1 (nenhum) a 21 (preto no branco). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** A secundária vira cor de texto sobre fundo claro e fundo de texto branco: precisa de contraste 4,5. */
export function inkIsReadable(inkColor: string): boolean {
  return contrastRatio(inkColor, WHITE) >= 4.5;
}

/** Texto em cima da cor principal: a secundária se der contraste, senão branco. */
function textOn(brandColor: string, inkColor: string): string {
  return contrastRatio(brandColor, inkColor) >= contrastRatio(brandColor, WHITE) ? inkColor : WHITE;
}

/**
 * Variáveis CSS do tema. Os utilitários do Tailwind (bg-brand, text-ink, bg-brand/20…)
 * leem essas variáveis, então trocá-las muda a loja e o painel inteiros.
 */
export function themeCss(theme: Partial<Theme>): string {
  const brand = theme.brandColor && isHexColor(theme.brandColor) ? theme.brandColor.toLowerCase() : DEFAULT_THEME.brandColor;
  const ink = theme.inkColor && isHexColor(theme.inkColor) ? theme.inkColor.toLowerCase() : DEFAULT_THEME.inkColor;
  return [
    `--color-brand: ${brand}`,
    `--color-brand-dark: color-mix(in oklab, ${brand} 62%, black)`,
    `--color-on-brand: ${textOn(brand, ink)}`,
    `--color-ink: ${ink}`,
    `--color-ink-dark: color-mix(in oklab, ${ink} 78%, black)`,
  ].join("; ");
}
