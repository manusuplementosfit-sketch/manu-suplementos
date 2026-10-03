import type { Branding } from "@/components/theme-context";
import { DEFAULT_THEME, isHexColor } from "./theme";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Cores e logo da loja, lidos no servidor para o tema já vir certo no primeiro carregamento.
 * Fica em cache por 60s; se a API não responder, usa as cores originais.
 */
export async function getBranding(): Promise<Branding> {
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data: Partial<Branding> = await res.json();
    return {
      brandColor: data.brandColor && isHexColor(data.brandColor) ? data.brandColor : DEFAULT_THEME.brandColor,
      inkColor: data.inkColor && isHexColor(data.inkColor) ? data.inkColor : DEFAULT_THEME.inkColor,
      logoUrl: data.logoUrl ?? null,
    };
  } catch {
    return { ...DEFAULT_THEME, logoUrl: null };
  }
}
