"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// Erros ficam mais tempo na tela: costumam pedir que a pessoa leia e corrija algo
const DURATION: Record<ToastKind, number> = { success: 4000, info: 4000, error: 6000 };

const STYLE: Record<ToastKind, { icon: React.ReactNode; accent: string }> = {
  success: { icon: <CheckCircle2 size={20} className="text-brand-dark" />, accent: "bg-brand" },
  info: { icon: <Info size={20} className="text-ink" />, accent: "bg-ink" },
  error: { icon: <AlertCircle size={20} className="text-red-600" />, accent: "bg-red-600" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      // No máximo 3 na tela: o mais antigo sai quando chega um novo
      setToasts((list) => [...list.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), DURATION[kind]);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => show("success", m),
      error: (m) => show("error", m),
      info: (m) => show("info", m),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Logo abaixo da barra do topo (64px), para não cobrir o menu nem o carrinho */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:w-96"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl bg-white py-3.5 pl-5 pr-3 text-sm text-ink shadow-[0_12px_32px_rgb(2_49_75/0.16)] ring-1 ring-zinc-200 motion-safe:animate-toast-in"
          >
            <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${STYLE[t.kind].accent}`} />
            <span className="mt-px shrink-0">{STYLE[t.kind].icon}</span>
            <p className="flex-1 font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              aria-label="Fechar mensagem"
              onClick={() => dismiss(t.id)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Mostra mensagens flutuantes: toast.success("…"), toast.error("…"), toast.info("…"). */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return api;
}
