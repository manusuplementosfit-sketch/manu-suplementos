/**
 * Links entre a loja e o painel, que na Vercel ficam em endereços diferentes.
 * No computador as variáveis não existem e tudo fica no mesmo endereço (localhost:3000).
 */
const STORE_URL = (process.env.NEXT_PUBLIC_STORE_URL ?? "").replace(/\/$/, "");

/** Marca no endereço da loja que indica que ela foi aberta pelo painel. */
export const FROM_PANEL_PARAM = "painel";

/** "Ver loja" do painel: abre a loja com a marca, para ela mostrar o "Voltar ao painel". */
export const STORE_FROM_PANEL_URL = `${STORE_URL}/?${FROM_PANEL_PARAM}=1`;

/** Destino do "Voltar ao painel". */
export const PANEL_URL = process.env.NEXT_PUBLIC_PANEL_URL ?? "/admin";
