"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { maskMoney, maskPhone } from "@/lib/masks";

/**
 * Rótulo + campo + texto de ajuda opcional, no padrão dos formulários do painel.
 * Com `htmlFor`, o rótulo fica separado do campo (necessário para campos com lista
 * própria, como o Select, que não podem ficar dentro de um <label>).
 */
export function Field({
  label,
  hint,
  htmlFor,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  /** Mostra o * vermelho de campo obrigatório (o campo em si continua usando `required`) */
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const text = (
    <span>
      {label}
      {required && <RequiredMark />}
    </span>
  );
  const hintText = hint && <span className="font-normal text-zinc-500">{hint}</span>;
  if (htmlFor) {
    return (
      <div className={`flex flex-col gap-1 text-sm font-medium ${className}`}>
        <label htmlFor={htmlFor}>{text}</label>
        {children}
        {hintText}
      </div>
    );
  }
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium ${className}`}>
      {text}
      {children}
      {hintText}
    </label>
  );
}

/** Asterisco vermelho; leitores de tela ouvem "obrigatório". */
export function RequiredMark() {
  return (
    <>
      <span aria-hidden className="ml-0.5 text-red-600">
        *
      </span>
      <span className="sr-only"> (obrigatório)</span>
    </>
  );
}

/** Legenda do asterisco, no fim dos formulários. */
export function RequiredNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-zinc-500 ${className}`}>
      <span className="text-red-600">*</span> Campos obrigatórios
    </p>
  );
}

/** Campo de texto com o estilo `.input` do site. */
export function TextInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...props} />;
}

type MaskedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  /** Recebe o texto já com a máscara aplicada */
  onValueChange: (value: string) => void;
};

/** Campo de valor em reais com máscara (R$ 1.234,56), preenchido da direita como em app de banco. */
export function MoneyInput({ className = "w-44", value, onValueChange, ...props }: MaskedInputProps) {
  return (
    <input
      className={`input tabular-nums ${className}`}
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={maskMoney(value)}
      onChange={(e) => onValueChange(maskMoney(e.target.value))}
      {...props}
    />
  );
}

/** Campo de telefone com DDD e máscara: (88) 99999-9999. */
export function PhoneInput({ className = "", value, onValueChange, ...props }: MaskedInputProps) {
  return (
    <input
      className={`input tabular-nums ${className}`}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="(88) 99999-9999"
      value={maskPhone(value)}
      onChange={(e) => onValueChange(maskPhone(e.target.value))}
      {...props}
    />
  );
}

/** Campo de senha com botão de olho para mostrar ou esconder o que foi digitado. */
export function PasswordInput({ className = "", ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input className={`input pr-12 ${className}`} type={visible ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        aria-pressed={visible}
        title={visible ? "Esconder senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-zinc-500 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
