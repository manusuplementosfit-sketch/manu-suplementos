import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hostRedirect } from "@/lib/hosts";

/** Separa os endereços da loja e do painel (veja hostRedirect). */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const target = hostRedirect(request.headers.get("host") ?? "", pathname, {
    store: process.env.STORE_HOST,
    panel: process.env.PANEL_HOST,
  });
  return target ? NextResponse.redirect(target + search) : NextResponse.next();
}

export const config = {
  // Arquivos internos do Next e imagens não passam pela regra
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
