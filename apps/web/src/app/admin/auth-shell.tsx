"use client";

import { BrandLogo } from "@/components/brand-logo";

/** Moldura das telas de acesso (login, esqueci a senha, nova senha): logo grande fora do card. */
export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ink px-4 py-10">
      <BrandLogo suffix="Suplementos" size="lg" />
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
