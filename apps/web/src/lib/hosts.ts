export interface SiteHosts {
  /** Endereço da loja, ex.: manu-suplementos.vercel.app */
  store?: string;
  /** Endereço do painel, ex.: manu-suplementos-painel.vercel.app */
  panel?: string;
}

const isPanelPath = (path: string) => path === "/admin" || path.startsWith("/admin/");

/**
 * Para onde redirecionar, ou null para seguir normalmente.
 * A loja e o painel são o mesmo site, cada um no seu endereço:
 * o link do painel só mostra o painel, e o link da loja só mostra a loja.
 * Sem os endereços configurados (no computador) ou em outros endereços (prévias), nada muda.
 */
export function hostRedirect(host: string, path: string, hosts: SiteHosts): string | null {
  const { store, panel } = hosts;
  if (!store || !panel) return null;

  if (host === panel) {
    if (path === "/") return `https://${panel}/admin`;
    if (!isPanelPath(path)) return `https://${store}${path}`;
    return null;
  }
  if (host === store && isPanelPath(path)) return `https://${panel}${path}`;
  return null;
}
