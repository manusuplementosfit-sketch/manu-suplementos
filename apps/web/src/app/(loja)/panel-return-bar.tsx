"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { FROM_PANEL_PARAM, PANEL_URL } from "@/lib/site-links";

const STORAGE_KEY = "ms_from_panel";

/**
 * Faixa "Voltar ao painel": só aparece quando a loja é aberta pelo botão "Ver loja" do painel
 * (que adiciona ?painel=1 ao endereço). A marca fica guardada nesta aba enquanto se navega pela loja.
 * Clientes que entram pelo link normal nunca veem a faixa.
 */
export function PanelReturnBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get(FROM_PANEL_PARAM) === "1") {
        sessionStorage.setItem(STORAGE_KEY, "1");
        // Tira a marca do endereço, para não aparecer se o link for copiado e enviado a um cliente
        url.searchParams.delete(FROM_PANEL_PARAM);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
      // Só dá para saber no navegador (sessionStorage): por isso o estado é ligado depois de montar
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  if (!visible) return null;
  return (
    <div className="bg-ink-dark text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <span className="flex min-w-0 items-center gap-2 text-white/70">
          <Eye size={16} className="shrink-0" />
          <span className="truncate">Você está vendo a loja como cliente</span>
        </span>
        <a
          href={PANEL_URL}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 py-1 font-semibold text-on-brand transition hover:bg-brand-dark hover:text-white"
        >
          <ArrowLeft size={16} /> Voltar ao painel
        </a>
      </div>
    </div>
  );
}
