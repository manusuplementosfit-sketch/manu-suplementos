/** Superfície branca padrão do painel, com título opcional e algo à direita (link, total…). */
export function Card({
  title,
  aside,
  className = "",
  children,
}: {
  title?: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex h-full min-w-0 flex-col gap-5 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(2_49_75/0.04)] ring-1 ring-zinc-200/80 sm:p-6 ${className}`}
    >
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="whitespace-nowrap font-semibold">{title}</h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

/** Ícone dentro de um círculo; "dark" para usar sobre fundo azul-marinho. */
export function IconBubble({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
        tone === "dark" ? "bg-white/10 text-brand" : "bg-paper text-ink"
      }`}
    >
      {children}
    </span>
  );
}
