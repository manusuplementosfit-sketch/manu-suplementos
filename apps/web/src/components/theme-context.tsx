"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_THEME, Theme, themeCss } from "@/lib/theme";

export interface Branding extends Theme {
  logoUrl: string | null;
}

interface ThemeApi {
  branding: Branding;
  /** Aplica na hora (sem recarregar), depois que a Manu salva a aparência */
  applyBranding: (branding: Branding) => void;
}

const ThemeContext = createContext<ThemeApi>({
  branding: { ...DEFAULT_THEME, logoUrl: null },
  applyBranding: () => {},
});

export function ThemeProvider({ initial, children }: { initial: Branding; children: React.ReactNode }) {
  const [branding, setBranding] = useState(initial);

  const applyBranding = useCallback((next: Branding) => {
    // Estilo inline no <html> vence o <style> do servidor, que só atualiza no próximo carregamento
    for (const rule of themeCss(next).split("; ")) {
      const [name, value] = rule.split(": ");
      document.documentElement.style.setProperty(name, value);
    }
    setBranding(next);
  }, []);

  const api = useMemo(() => ({ branding, applyBranding }), [branding, applyBranding]);
  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useBranding(): ThemeApi {
  return useContext(ThemeContext);
}
