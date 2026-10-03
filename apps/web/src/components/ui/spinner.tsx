/** Círculo girando na cor secundária da marca (acompanha a cor escolhida em Aparência). */
export function Spinner({ size = "md", label = "Carregando" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const dimensions = { sm: "h-5 w-5 border-2", md: "h-10 w-10 border-4", lg: "h-14 w-14 border-[5px]" }[size];
  return (
    <span role="status" aria-label={label} className="inline-flex">
      {/* Com "reduzir movimento" ligado no sistema, gira mais devagar em vez de parar: parado não indica que está carregando */}
      <span
        aria-hidden
        className={`${dimensions} animate-spin rounded-full border-ink/15 border-t-ink motion-reduce:[animation-duration:1.6s]`}
      />
    </span>
  );
}

/** Página inteira carregando: o círculo fica no centro exato da tela, em qualquer tamanho. */
export function PageLoader({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 grid place-items-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}

/** Só uma parte da página carregando (ex.: produtos da loja): centralizado dentro dela. */
export function SectionLoader({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="grid w-full place-items-center py-16">
      <Spinner size="lg" label={label} />
    </div>
  );
}
