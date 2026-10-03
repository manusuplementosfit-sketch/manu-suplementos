"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setAdminToken } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const { token } = await api.post<{ token: string }>("/auth/login", { email, password });
      setAdminToken(token);
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
      setSending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8">
        <div>
          <p className="font-display text-2xl font-extrabold uppercase">
            Manu <span className="text-brand-dark">Suplementos</span>
          </p>
          <p className="text-sm text-zinc-500">Painel do vendedor</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          E-mail
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Senha
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn-dark" disabled={sending}>
          {sending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
