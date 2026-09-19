"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button, Field } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("demo@threadspilot.app");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await login(email, password);
    setBusy(false);
    if (!ok) {
      setError("Enter a valid email and a password of at least 4 characters.");
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

          <h1 className="text-[26px] font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Demo mode: any email and a 4+ character password works.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <Field label="Work email">
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@studio.com"
                required
              />
            </Field>
            <Field label="Password" error={error ?? undefined} hint="Prefilled with the demo credentials.">
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="flex items-center justify-between text-[12.5px]">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
                Keep me signed in
              </label>
              <span className="font-semibold text-[var(--primary)]">Forgot password?</span>
            </div>

            <Button type="submit" variant="brand" disabled={busy} className="w-full">
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight className="size-4" aria-hidden />}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            No account yet?{" "}
            <Link href="/register" className="font-semibold text-[var(--primary)] hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-border p-3 text-[12px] text-muted-foreground">
            <p className="font-semibold text-foreground">Demo shortcut</p>
            <p className="mt-1">
              Or skip the form:{" "}
              <button
                type="button"
                onClick={async () => {
                  setBusy(true);
                  await login("demo@threadspilot.app", "demo1234");
                  router.push("/app");
                }}
                className="cursor-pointer font-semibold text-[var(--primary)] hover:underline"
              >
                open the workspace without signing in
              </button>
              . Nothing you change leaves your browser.
            </p>
          </div>
        </div>
      </main>

      <aside className="hidden flex-col justify-between bg-[var(--foreground)] p-10 text-[var(--background)] lg:flex">
        <p className="font-serif text-[22px] italic leading-snug">
          “We stopped writing posts at 8am and started filling slots we decided last month. Same
          content, twice the consistency.”
        </p>
        <div className="mt-10">
          <p className="text-[13px] font-semibold">Nadia Kamal · Editor, Kuching Growth Studio</p>
          <ul className="mt-6 grid gap-3 text-[13px] opacity-85">
            <li>Queue-first publishing with real retries</li>
            <li>Slots that repeat weekly, timezone aware</li>
            <li>Approval chain before anything ships</li>
            <li>Reply inbox with suggested answers</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
