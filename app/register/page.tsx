"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button, Field } from "@/components/ui";
import { useStore } from "@/lib/store";

const PERKS = [
  "Unlimited queue, slots and calendar",
  "Brand voice trained on your own posts",
  "Automation rules with daily caps",
  "Reply inbox with AI-drafted answers",
];

export default function RegisterPage() {
  const { register } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", workspace: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await register(form.name, form.email, form.password);
    setBusy(false);
    if (!ok) {
      setError("Fill in your name, a valid email and a 4+ character password.");
      return;
    }
    router.push("/app");
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[var(--foreground)] text-[var(--background)]">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">
              Threads<span className="text-[var(--primary)]">Pilot</span>
            </span>
          </Link>

          <h1 className="text-[26px] font-extrabold tracking-tight">Create your workspace</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Demo only — no email is sent, no card is charged.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <Field label="Your name">
              <input className="input" value={form.name} onChange={set("name")} placeholder="Aina Yusof" required />
            </Field>
            <Field label="Work email">
              <input type="email" className="input" value={form.email} onChange={set("email")} placeholder="aina@studio.my" required />
            </Field>
            <Field label="Workspace name" hint="Shown in reports and to teammates.">
              <input className="input" value={form.workspace} onChange={set("workspace")} placeholder="Studio name" />
            </Field>
            <Field
              label="Password"
              error={error ?? undefined}
              hint="At least 4 characters for this demo."
            >
              <input type="password" className="input" value={form.password} onChange={set("password")} required />
            </Field>

            <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] text-muted-foreground">
              <input type="checkbox" defaultChecked required className="mt-0.5 size-4 accent-[var(--primary)]" />
              I understand this is a product demo with sample data.
            </label>

            <Button type="submit" variant="brand" disabled={busy} className="w-full">
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {busy ? "Creating workspace…" : "Create workspace"}
              {!busy && <ArrowRight className="size-4" aria-hidden />}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <aside className="hidden flex-col justify-center gap-6 bg-[var(--foreground)] p-10 text-[var(--background)] lg:flex">
        <h2 className="text-[24px] font-extrabold leading-tight tracking-tight">
          Everything a solo operator needs, priced for one
        </h2>
        <ul className="flex flex-col gap-3 text-[14px]">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <p className="text-[13px] font-semibold">14-day trial on the Growth plan</p>
          <p className="mt-1 text-[12.5px] opacity-80">
            Then RM 99/month. Cancel from the billing page in two clicks.
          </p>
        </div>
      </aside>
    </div>
  );
}
