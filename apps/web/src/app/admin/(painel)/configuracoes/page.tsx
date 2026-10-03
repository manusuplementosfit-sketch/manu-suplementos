"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { KeyRound, Palette, QrCode, RotateCcw, Tags, Target, Truck, X } from "lucide-react";
import { useBranding } from "@/components/theme-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Field, MoneyInput, PasswordInput, TextInput } from "@/components/ui/field";
import { ImagePicker } from "@/components/ui/image-picker";
import { PageLoader } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { adminApi, setAdminToken } from "@/lib/api";
import { centsToInput, parseBRL } from "@/lib/format";
import { contrastRatio, DEFAULT_THEME, inkIsReadable, isHexColor, themeCss } from "@/lib/theme";
import { Category } from "@/lib/types";

interface Settings {
  pixKey: string;
  pixMerchantName: string;
  pixCity: string;
  deliveryFeeCents: number;
  monthlyGoalCents: number | null;
  brandColor: string;
  inkColor: string;
  logoUrl: string | null;
}

/** Uma faixa da página: título e explicação à esquerda, campos à direita. */
function Section({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="grid scroll-mt-24 gap-4 border-t border-zinc-200 pt-6 first:border-0 first:pt-0 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 lg:pt-8"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink ring-1 ring-zinc-200/80">{icon}</span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

/** Seletor de cor do sistema + campo para digitar o código #rrggbb. */
function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = isHexColor(value);
  return (
    <Field label={label} htmlFor={id} hint={valid ? hint : <span className="text-red-700">Use o formato #rrggbb, por exemplo #96c82d.</span>}>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={`${label}: escolher no seletor`}
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
        />
        <TextInput id={id} value={value} maxLength={7} spellCheck={false} className="font-mono uppercase" onChange={(e) => onChange(e.target.value.trim())} />
      </div>
    </Field>
  );
}

/** Miniatura do topo, de um botão e de selos com as cores escolhidas, antes de salvar. */
function ThemePreview({ brandColor, inkColor, logo }: { brandColor: string; inkColor: string; logo: string | null }) {
  const vars = useMemo(
    () => Object.fromEntries(themeCss({ brandColor, inkColor }).split("; ").map((r) => r.split(": "))) as React.CSSProperties,
    [brandColor, inkColor],
  );
  return (
    <div style={vars} className="overflow-hidden rounded-xl ring-1 ring-zinc-200" aria-label="Prévia das cores">
      <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-7 w-auto max-w-32 object-contain" />
        ) : (
          <span className="font-display text-lg font-extrabold uppercase">
            Manu <span className="text-brand">Suplementos</span>
          </span>
        )}
        <span className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand">Carrinho</span>
      </div>
      <div className="flex flex-col gap-3 bg-paper p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="positive">Promoção</Badge>
          <Badge tone="attention">Lançamento</Badge>
        </div>
        <p className="font-display text-2xl font-bold text-ink">R$ 149,90</p>
        <div className="flex flex-wrap gap-2">
          <span className="btn-primary h-10 text-sm">Comprar</span>
          <span className="btn-dark h-10 text-sm">Ver produtos</span>
        </div>
      </div>
    </div>
  );
}

/** Categorias são salvas na hora, sem depender do botão Salvar da página. */
function CategoriesCard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const load = () => adminApi.get<Category[]>("/categories").then(setCategories);
  useEffect(() => {
    load();
  }, []);

  // Fica dentro do formulário da página, então não pode ser um <form> próprio
  async function add() {
    if (name.trim() === "") return toast.error("Digite o nome da nova categoria");
    try {
      await adminApi.post("/admin/categories", { name });
      toast.success(`Categoria ${name.trim()} adicionada`);
      setName("");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function remove(c: Category) {
    const ok = await confirm({
      title: `Remover a categoria ${c.name}?`,
      message: "Os produtos dessa categoria ficarão sem categoria. Eles continuam na loja.",
      confirmLabel: "Remover",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.delete(`/admin/categories/${c.id}`);
      toast.success(`Categoria ${c.name} removida`);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Card>
      {categories.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma categoria ainda. Crie a primeira abaixo.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id} className="inline-flex items-center gap-1 rounded-full bg-paper py-1 pl-3 pr-1 text-sm font-medium ring-1 ring-zinc-200/80">
              {c.name}
              <button
                type="button"
                aria-label={`Remover ${c.name}`}
                className="grid h-6 w-6 place-items-center rounded-full text-zinc-500 transition hover:bg-red-50 hover:text-red-700"
                onClick={() => remove(c)}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Field label="Nova categoria" required htmlFor="new-category">
        <div className="flex gap-2">
          <TextInput
            id="new-category"
            placeholder="Ex.: Pré-treino"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" variant="dark" className="shrink-0" onClick={add}>
            Adicionar
          </Button>
        </div>
      </Field>
    </Card>
  );
}

/** Troca de senha com a senha atual; tem botão próprio, separado do Salvar da página. */
function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function change() {
    if (!current || !next) return toast.error("Preencha a senha atual e a nova senha");
    if (next.length < 8) return toast.error("A nova senha precisa ter pelo menos 8 caracteres");
    if (next !== confirmation) return toast.error("As duas senhas novas não são iguais");
    setSaving(true);
    try {
      const { token } = await adminApi.put<{ token: string }>("/auth/password", { currentPassword: current, newPassword: next });
      // As sessões antigas deixam de valer; esta continua com o token novo
      setAdminToken(token);
      setCurrent("");
      setNext("");
      setConfirmation("");
      toast.success("Senha alterada. Outros aparelhos conectados vão precisar entrar de novo.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Alterar senha">
      <Field label="Senha atual" required>
        <PasswordInput autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nova senha" required hint="Pelo menos 8 caracteres.">
          <PasswordInput autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Repita a nova senha" required>
          <PasswordInput autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
        </Field>
      </div>
      <Button type="button" variant="dark" className="w-full sm:w-fit" disabled={saving} onClick={change}>
        {saving ? "Alterando…" : "Alterar senha"}
      </Button>
    </Card>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [fee, setFee] = useState("");
  const [goal, setGoal] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { applyBranding } = useBranding();

  useEffect(() => {
    adminApi.get<Settings>("/admin/settings").then((s) => {
      setForm(s);
      setFee(centsToInput(s.deliveryFeeCents));
      setGoal(centsToInput(s.monthlyGoalCents));
    });
  }, []);

  // Prévia do logo escolhido (o endereço temporário é liberado ao trocar ou sair)
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile]);
  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  if (!form) return <PageLoader />;

  const shownLogo = logoPreview ?? (removeLogo ? null : form.logoUrl);
  const colorsValid = isHexColor(form.brandColor) && isHexColor(form.inkColor);
  const inkOk = colorsValid && inkIsReadable(form.inkColor);
  const brandOnInkLow = colorsValid && contrastRatio(form.brandColor, form.inkColor) < 2;

  /** Mostra o erro e leva a página até a seção com o problema. */
  function fail(sectionId: string, message: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    toast.error(message);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!colorsValid) return fail("aparencia", "Confira as cores: use o formato #rrggbb");
    if (!inkOk) return fail("aparencia", "A cor secundária está clara demais para textos. Escolha um tom mais escuro.");
    const deliveryFeeCents = fee.trim() === "" ? 0 : parseBRL(fee);
    if (deliveryFeeCents == null) return fail("entrega", "Taxa de entrega inválida");
    const monthlyGoalCents = goal.trim() === "" ? null : parseBRL(goal);
    if (monthlyGoalCents === null && goal.trim() !== "") return fail("meta", "Meta do mês inválida");

    setSaving(true);
    try {
      let saved = await adminApi.put<Settings>("/admin/settings", {
        pixKey: form.pixKey,
        pixMerchantName: form.pixMerchantName,
        pixCity: form.pixCity,
        brandColor: form.brandColor,
        inkColor: form.inkColor,
        deliveryFeeCents,
        monthlyGoalCents,
      });
      if (logoFile) {
        const data = new FormData();
        data.append("file", logoFile);
        saved = await adminApi.post<Settings>("/admin/settings/logo", data);
      } else if (removeLogo) {
        saved = await adminApi.delete<Settings>("/admin/settings/logo");
      }
      setForm(saved);
      setLogoFile(null);
      setRemoveLogo(false);
      applyBranding({ brandColor: saved.brandColor, inkColor: saved.inkColor, logoUrl: saved.logoUrl });
      toast.success("Configurações salvas");
      router.push("/admin");
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  }

  const saveLabel = saving ? "Salvando…" : "Salvar configurações";

  return (
    <form onSubmit={save} className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase sm:text-5xl">Configurações</h1>
          <p className="mt-1 text-zinc-500">Aparência, Pix, entrega, meta do mês e categorias da loja.</p>
        </div>
        {/* No celular o botão fica na barra fixa do rodapé */}
        <Button disabled={saving} className="hidden sm:inline-flex">
          {saveLabel}
        </Button>
      </header>

      <div className="flex flex-col gap-6 lg:gap-8">
        <Section
          id="aparencia"
          icon={<Palette size={18} />}
          title="Aparência"
          description="Logo e cores da loja e do painel. Mudam no painel ao salvar e na loja em até 1 minuto."
        >
          <Card title="Logo">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ImagePicker
                noun="logo"
                preview="logo"
                image={shownLogo}
                fileName={logoFile?.name}
                accept="image/png,image/svg+xml,image/webp,image/jpeg"
                formats="PNG ou SVG com fundo transparente fica melhor. Até 4 MB."
                compact
                onFile={(file) => {
                  setLogoFile(file);
                  setRemoveLogo(false);
                }}
              />
              {shownLogo && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setLogoFile(null);
                    setRemoveLogo(true);
                  }}
                >
                  Remover logo
                </Button>
              )}
            </div>
            <p className="text-xs text-zinc-500">Aparece no topo da loja, do painel e na tela de login. Sem logo, o nome aparece em texto.</p>
          </Card>

          <Card
            title="Cores"
            aside={
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 sm:w-auto"
                disabled={form.brandColor === DEFAULT_THEME.brandColor && form.inkColor === DEFAULT_THEME.inkColor}
                onClick={() => setForm({ ...form, ...DEFAULT_THEME })}
              >
                <RotateCcw size={16} /> Restaurar cores originais
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="brand-color"
                label="Cor principal"
                hint="Botões, destaques e promoções."
                value={form.brandColor}
                onChange={(brandColor) => setForm({ ...form, brandColor })}
              />
              <ColorField
                id="ink-color"
                label="Cor secundária"
                hint="Topo, textos e botões escuros."
                value={form.inkColor}
                onChange={(inkColor) => setForm({ ...form, inkColor })}
              />
            </div>
            {colorsValid && !inkOk && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                A cor secundária está clara demais: os textos ficariam difíceis de ler. Escolha um tom mais escuro para poder salvar.
              </p>
            )}
            {colorsValid && inkOk && brandOnInkLow && (
              <p className="rounded-lg bg-paper p-3 text-sm text-zinc-600">
                As duas cores estão parecidas: a cor principal vai aparecer pouco no topo. Dá para salvar, mas um contraste maior fica melhor.
              </p>
            )}
            {colorsValid && <ThemePreview brandColor={form.brandColor} inkColor={form.inkColor} logo={shownLogo} />}
          </Card>
        </Section>

        <Section id="pix" icon={<QrCode size={18} />} title="Pix" description="Dados usados para gerar o QR Code e o código copia e cola de cada pedido.">
          <Card>
            <Field label="Chave Pix" hint="Sem chave, a opção Pix fica indisponível na loja.">
              <TextInput
                placeholder="CPF, CNPJ, e-mail, telefone (+55...) ou chave aleatória"
                value={form.pixKey}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome do recebedor" hint="Até 25 letras, como aparece no banco.">
                <TextInput maxLength={25} value={form.pixMerchantName} onChange={(e) => setForm({ ...form, pixMerchantName: e.target.value })} />
              </Field>
              <Field label="Cidade" hint="Até 15 letras.">
                <TextInput maxLength={15} value={form.pixCity} onChange={(e) => setForm({ ...form, pixCity: e.target.value })} />
              </Field>
            </div>
          </Card>
        </Section>

        <Section id="entrega" icon={<Truck size={18} />} title="Entrega" description="Valor cobrado quando o cliente escolhe receber em casa.">
          <Card>
            <Field label="Taxa de entrega (R$)" hint="Deixe em branco ou R$ 0,00 para entrega grátis.">
              <MoneyInput value={fee} onValueChange={setFee} />
            </Field>
          </Card>
        </Section>

        <Section id="meta" icon={<Target size={18} />} title="Meta do mês" description="Quanto a loja quer faturar no mês. O progresso aparece no dashboard.">
          <Card>
            <Field label="Meta de faturamento (R$)" hint="Deixe em branco para não usar meta.">
              <MoneyInput placeholder="R$ 5.000,00" value={goal} onValueChange={setGoal} />
            </Field>
          </Card>
        </Section>

        <Section
          id="categorias"
          icon={<Tags size={18} />}
          title="Categorias"
          description="Organizam os produtos na loja. Adicionar e remover salva na hora, sem o botão Salvar."
        >
          <CategoriesCard />
        </Section>

        <Section
          id="seguranca"
          icon={<KeyRound size={18} />}
          title="Segurança"
          description="Troque a senha do painel. Ao trocar, outros aparelhos conectados precisam entrar de novo."
        >
          <ChangePasswordCard />
        </Section>
      </div>

      {/* Celular: barra fixa no rodapé, sempre à mão. Telas maiores: botão no fim da página */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6 sm:backdrop-blur-none">
        <Button disabled={saving} className="w-full sm:w-auto">
          {saveLabel}
        </Button>
      </div>
    </form>
  );
}
