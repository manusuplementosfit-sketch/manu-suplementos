"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { getAdminToken, setAdminToken } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-ink text-white md:w-56 md:shrink-0">
        <div className="flex items-center justify-between p-4 md:block">
          <p className="font-display text-xl font-extrabold uppercase">
            Manu <span className="text-brand">Painel</span>
          </p>
          <Link href="/" className="text-xs text-zinc-300 underline md:mt-1 md:block">
            Ver loja
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-brand text-ink" : "text-zinc-200 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setAdminToken(null);
              router.replace("/admin/login");
            }}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10 md:mt-6"
          >
            Sair
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
