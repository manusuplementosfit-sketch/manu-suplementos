import Link from "next/link";

export type ButtonVariant = "primary" | "dark" | "ghost" | "danger";

// Reaproveita as cores das classes de botão do globals.css, que o resto do site já usa
const VARIANT: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  dark: "btn-dark",
  ghost: "btn-ghost",
  // Só para confirmar ações que apagam ou desfazem algo
  danger: "btn-danger",
};

// Mesma altura, espaçamento e fonte em todas as variantes: só a cor muda
const SIZE = "h-11 px-5 text-base font-semibold";

function classes(variant: ButtonVariant, block: boolean | undefined, className = "") {
  return `${VARIANT[variant]} ${SIZE} whitespace-nowrap ${block ? "w-full" : ""} ${className}`;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; block?: boolean };

export function Button({ variant = "primary", block, className, ...props }: ButtonProps) {
  return <button className={classes(variant, block, className)} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: ButtonVariant; block?: boolean };

/** Link com cara de botão, para ações que levam a outra página. */
export function ButtonLink({ variant = "primary", block, className, ...props }: ButtonLinkProps) {
  return <Link className={classes(variant, block, className)} {...props} />;
}

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Nome da ação, lido por leitores de tela e mostrado ao passar o mouse */
  label: string;
  danger?: boolean;
};

/** Botão quadrado só com ícone, para ações repetidas em listas (editar, excluir…). */
export function IconButton({ label, danger, className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-300 bg-white transition disabled:opacity-50 ${
        danger ? "text-red-700 hover:bg-red-50" : "text-ink hover:bg-zinc-100"
      } ${className}`}
      {...props}
    />
  );
}
