import assert from "node:assert/strict";
import { test } from "node:test";
import { hostRedirect } from "./hosts";

const hosts = { store: "manu-suplementos.vercel.app", panel: "manu-suplementos-painel.vercel.app" };

test("link do painel abre direto no painel", () => {
  assert.equal(hostRedirect("manu-suplementos-painel.vercel.app", "/", hosts), "https://manu-suplementos-painel.vercel.app/admin");
});

test("páginas do painel funcionam no link do painel", () => {
  assert.equal(hostRedirect("manu-suplementos-painel.vercel.app", "/admin", hosts), null);
  assert.equal(hostRedirect("manu-suplementos-painel.vercel.app", "/admin/pedidos", hosts), null);
  assert.equal(hostRedirect("manu-suplementos-painel.vercel.app", "/admin/login", hosts), null);
});

test("páginas da loja abertas no link do painel vão para o link da loja", () => {
  assert.equal(hostRedirect("manu-suplementos-painel.vercel.app", "/carrinho", hosts), "https://manu-suplementos.vercel.app/carrinho");
  assert.equal(hostRedirect("manu-suplementos-painel.vercel.app", "/pedido/MS-ABCDE", hosts), "https://manu-suplementos.vercel.app/pedido/MS-ABCDE");
});

test("painel aberto pelo link da loja vai para o link do painel", () => {
  assert.equal(hostRedirect("manu-suplementos.vercel.app", "/admin", hosts), "https://manu-suplementos-painel.vercel.app/admin");
  assert.equal(hostRedirect("manu-suplementos.vercel.app", "/admin/produtos", hosts), "https://manu-suplementos-painel.vercel.app/admin/produtos");
});

test("a loja continua normal no link da loja", () => {
  assert.equal(hostRedirect("manu-suplementos.vercel.app", "/", hosts), null);
  assert.equal(hostRedirect("manu-suplementos.vercel.app", "/checkout", hosts), null);
});

test("não confunde páginas que só começam com 'admin' no nome", () => {
  assert.equal(hostRedirect("manu-suplementos.vercel.app", "/administrativo", hosts), null);
});

test("sem endereços configurados (no computador) ou em outros endereços, nada muda", () => {
  assert.equal(hostRedirect("localhost:3000", "/admin", { store: undefined, panel: undefined }), null);
  assert.equal(hostRedirect("localhost:3000", "/admin", hosts), null);
  assert.equal(hostRedirect("manu-suplementos-git-main.vercel.app", "/admin", hosts), null);
});
