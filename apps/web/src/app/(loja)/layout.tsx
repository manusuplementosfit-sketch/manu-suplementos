import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CartButton } from "./cart-button";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="Manu Suplementos, página inicial">
            <BrandLogo suffix="Suplementos" />
          </Link>
          <CartButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Manu Suplementos · Entrega ou retirada · Pix e cartão
      </footer>
    </>
  );
}
