"use client";

import { CartProvider } from "./cart-context";
import { Branding, ThemeProvider } from "./theme-context";
import { ConfirmProvider } from "./ui/confirm-dialog";
import { ToastProvider } from "./ui/toast";

/** Tudo que a loja e o painel compartilham: aparência, carrinho, mensagens e confirmações. */
export function Providers({ branding, children }: { branding: Branding; children: React.ReactNode }) {
  return (
    <ThemeProvider initial={branding}>
      <ToastProvider>
        <ConfirmProvider>
          <CartProvider>{children}</CartProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
