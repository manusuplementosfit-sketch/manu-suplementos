"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { api, setAdminToken } from "@/lib/api";
import { AuthShell } from "../auth-shell";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const { token } = await api.post<{ token: string }>("/auth/login", { email, password });
      setAdminToken(token);
      router.replace("/admin");
    } catch (err) {
      toast.error((err as Error).message);
      setSending(false);
    }
  }

  return (
    <AuthShell title="Painel do vendedor" description="Entre para gerenciar a loja.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="E-mail" required>
          <TextInput type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" required>
          <PasswordInput autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button variant="dark" disabled={sending}>
          {sending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
