"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { LogOut, Settings, Store } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getAdminToken, setAdminToken } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
];

const SETTINGS_HREF = "/admin/configuracoes";

// Na Vercel aponta para o link da loja; no computador, sem a variável, é a própria raiz
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "/";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // null no servidor; no navegador, se existe login salvo
  const loggedIn = useSyncExternalStore(
    () => () => {},
    () => getAdminToken() !== null,
    () => null,
  );

  useEffect(() => {
    if (loggedIn === false) router.replace("/admin/login");
  }, [loggedIn, router]);

  if (!loggedIn) return null;

  const nav = NAV.map((item) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
          active ? "bg-brand text-on-brand" : "text-zinc-200 hover:bg-white/10"
        }`}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-ink text-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 md:px-8">
          <Link href="/admin" className="shrink-0" aria-label="Painel, ir para o dashboard">
            <BrandLogo suffix="Painel" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">{nav}</nav>
          <div className="ml-auto flex items-center gap-1">
            {/* Endereço completo da loja: no link do painel, "/" voltaria para o dashboard */}
            <a
              href={STORE_URL}
              aria-label="Ver loja"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <Store size={16} />
              <span className="hidden sm:inline">Ver loja</span>
            </a>
            <Link
              href={SETTINGS_HREF}
              aria-label="Configurações"
              title="Configurações"
              aria-current={pathname.startsWith(SETTINGS_HREF) ? "page" : undefined}
              className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                pathname.startsWith(SETTINGS_HREF) ? "bg-brand text-on-brand" : "text-zinc-200 hover:bg-white/10"
              }`}
            >
              <Settings size={18} />
            </Link>
            <button
              aria-label="Sair"
              onClick={() => {
                setAdminToken(null);
                router.replace("/admin/login");
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        {/* No celular os links descem para uma segunda linha, com rolagem lateral */}
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">{nav}</nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
