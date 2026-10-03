"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "./button";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ações que apagam ou desfazem algo: botão vermelho e ícone de alerta */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Modal de confirmação no visual do site (substitui o confirm() do navegador). */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  // O <dialog> nativo cuida do foco, do Esc e de bloquear o resto da página
  useEffect(() => {
    if (options && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [options]);

  function close(ok: boolean) {
    resolveRef.current?.(ok);
    resolveRef.current = null;
    dialogRef.current?.close();
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        onCancel={(e) => {
          e.preventDefault();
          close(false);
        }}
        onClick={(e) => {
          // Clique no fundo escurecido (fora da caixa) cancela
          if (e.target === dialogRef.current) close(false);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-ink shadow-[0_24px_64px_rgb(2_49_75/0.25)] backdrop:bg-ink/50 motion-safe:backdrop:backdrop-blur-[2px]"
      >
        {options && (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex gap-4">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                  options.danger ? "bg-red-50 text-red-600" : "bg-paper text-ink"
                }`}
              >
                {options.danger ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
              </span>
              <div className="flex flex-col gap-1 pt-1">
                <h2 id="confirm-title" className="text-lg font-semibold leading-snug">
                  {options.title}
                </h2>
                {options.message && <p className="text-sm text-zinc-600">{options.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button variant="ghost" onClick={() => close(false)} autoFocus>
                {options.cancelLabel ?? "Voltar"}
              </Button>
              <Button variant={options.danger ? "danger" : "primary"} onClick={() => close(true)}>
                {options.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}

/** Abre o modal e devolve true se a pessoa confirmar: `if (await confirm({ title })) …` */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>");
  return confirm;
}
