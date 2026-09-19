import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  ListOrdered,
  Lock,
  PenSquare,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: PenSquare,
    title: "Queue-first composer",
    body: "Write, preview inside a real Threads frame, and push it into the queue. Threads, quote posts, first comments and link previews in one draft.",
  },
  {
    icon: CalendarDays,
    title: "Calendar with slots",
    body: "Set recurring posting times once. The calendar fills itself and shows gaps, clashes and per-category mix at a glance.",
  },
  {
    icon: ListOrdered,
    title: "Queue you can trust",
    body: "Every publish writes a receipt, then confirms. Failures retry with backoff instead of silently disappearing.",
  },
  {
    icon: Sparkles,
    title: "Brand voice, not generic AI",
    body: "Tone sliders, banned words and your own sample posts shape every draft. You review before anything goes live.",
  },
  {
    icon: Workflow,
    title: "Automation with guardrails",
    body: "Auto-like, reply and quote inside keyword rules, with daily caps, quiet hours and a sensitive-topic filter.",
  },
  {
    icon: BarChart3,
    title: "Numbers that decide",
    body: "Best hours heatmap, engagement by format, and exportable reports so next month is planned with evidence.",
  },
];

const STEPS = [
  { n: "01", t: "Connect Threads", d: "One OAuth handshake. We handle the 60-day token refresh quietly in the background." },
  { n: "02", t: "Set your slots", d: "Pick posting windows that match when your audience is awake. Slots repeat weekly." },
  { n: "03", t: "Fill and approve", d: "Drop content into slots, review drafts, then let the scheduler publish on time." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[var(--foreground)] text-[var(--background)]">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">
              Threads<span className="text-[var(--primary)]">Pilot</span>
            </span>
          </span>
          <nav aria-label="Sections" className="ml-6 hidden items-center gap-5 text-[13px] font-semibold text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/login" className="btn btn-brand btn-sm">
              Open live demo
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="stagger">
            <span className="chip border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
              <Zap className="size-3.5" aria-hidden />
              Interactive demo · sample data
            </span>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-tight sm:text-[46px]">
              Plan Threads content once.
              <br />
              Let the queue <span className="font-serif italic text-[var(--primary)]">publish</span> it.
            </h1>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted-foreground">
              ThreadsPilot is a scheduling workspace for people who post for a living. Fill recurring
              slots, review drafts, and let the scheduler ship on time — with retries, rate-limit
              safeguards and a reply inbox that stays on top of the conversation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-brand">
                Explore the demo workspace
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/register" className="btn btn-outline">
                Create an account
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
              {["No credit card", "60-day token auto-refresh", "Runs on your guardrails"].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-[var(--success)]" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <ProductMock />
        </div>
      </section>

      {/* stats strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-7 sm:grid-cols-4">
          {[
            { k: "250", l: "posts per day, capped before the API does it" },
            { k: "12 min", l: "average weekly scheduling time, down from 90" },
            { k: "3 retries", l: "with backoff before a post is marked failed" },
            { k: "1 inbox", l: "for replies, mentions and AI-drafted answers" },
          ].map((s) => (
            <div key={s.k}>
              <p className="font-serif text-[26px] font-bold italic leading-none text-[var(--primary)]">
                {s.k}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <span className="chip border-border bg-muted text-muted-foreground">Features</span>
          <h2 className="mt-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
            Everything between an idea and a published post
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Six core surfaces. No dashboard sprawl, no per-seat surprises.
          </p>
        </div>
        <div className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="card card-interactive p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3.5 text-[15.5px] font-bold">{f.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="chip border-border bg-muted text-muted-foreground">How it works</span>
              <h2 className="mt-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
                Live in about twenty minutes
              </h2>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Most of the setup is deciding what you actually want to say. The wiring is three
                steps.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="size-4 text-[var(--success)]" aria-hidden />
                  Tokens stay encrypted at rest, refreshed before expiry
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-4 text-[var(--success)]" aria-hidden />
                  Timezone-aware queue, so 09:00 means your 09:00
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="size-4 text-[var(--success)]" aria-hidden />
                  Draft → review → approve → publish, in that order
                </li>
              </ul>
              <Link href="/login" className="btn btn-brand mt-6">
                Skip setup, open the demo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ol className="stagger flex flex-col gap-3">
              {STEPS.map((s) => (
                <li key={s.n} className="card flex gap-4 p-5">
                  <span className="font-serif text-[24px] font-bold italic leading-none text-[var(--primary)]">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold">{s.t}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <span className="chip border-border bg-muted text-muted-foreground">Pricing</span>
          <h2 className="mt-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
            Flat pricing. No per-seat maths.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: "Starter", price: "RM 49", tag: "Solo creators", perks: ["1 Threads account", "100 scheduled posts", "Slots + calendar", "Reply inbox"] },
            { name: "Growth", price: "RM 99", tag: "Most popular", perks: ["3 accounts", "Unlimited queue", "Automation rules", "Brand voice training", "Analytics export"], highlight: true },
            { name: "Scale", price: "RM 249", tag: "Agencies", perks: ["10 accounts", "Client workspaces", "Approval chains", "White-label reports", "Priority support"] },
          ].map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? "card relative border-[var(--primary)] p-6 shadow-[var(--shadow-lg)]"
                  : "card p-6"
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 chip border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]">
                  {p.tag}
                </span>
              )}
              <h3 className="text-[15px] font-bold">{p.name}</h3>
              {!p.highlight && <p className="text-[12px] text-muted-foreground">{p.tag}</p>}
              <p className="mt-3 text-[30px] font-extrabold tracking-tight">
                {p.price}
                <span className="text-[13px] font-medium text-muted-foreground"> /month</span>
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-[13px]">
                {p.perks.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <Link
                href={p.highlight ? "/register" : "/app"}
                className={p.highlight ? "btn btn-brand mt-5 w-full" : "btn btn-outline mt-5 w-full"}
              >
                {p.highlight ? "Start free trial" : "Open demo"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="card overflow-hidden border-0 bg-[var(--foreground)] p-8 text-[var(--background)] sm:p-12">
          <div className="max-w-2xl">
            <h2 className="text-[26px] font-extrabold tracking-tight sm:text-[32px]">
              See the whole workspace with sample data
            </h2>
            <p className="mt-3 text-[14.5px] opacity-85">
              The demo is fully interactive: write a post, drag it into a slot, approve it, then watch
              the queue publish. Nothing leaves the browser.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-brand">
                Open demo workspace
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="btn border-white/30 bg-transparent text-[var(--background)] hover:bg-white/10"
              >
                Sign in as demo user
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-6 text-[12.5px] text-muted-foreground">
          <span className="font-semibold">ThreadsPilot</span>
          <span>·</span>
          <span>Product demo, sample data only</span>
          <span className="ml-auto">Built to show the workflow, not to post for real</span>
        </div>
      </footer>
    </div>
  );
}

function ProductMock() {
  return (
    <div className="card overflow-hidden p-0 shadow-[var(--shadow-xl)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-[var(--destructive)]" aria-hidden />
        <span className="size-2.5 rounded-full bg-[var(--warn)]" aria-hidden />
        <span className="size-2.5 rounded-full bg-[var(--success)]" aria-hidden />
        <span className="ml-2 truncate rounded bg-card px-2 py-0.5 text-[10.5px] text-muted-foreground">
          threadspilot.app/app/queue
        </span>
      </div>
      <div className="bg-background p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[12.5px] font-bold">Queue · next 7 days</span>
          <span className="chip border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
            auto-publish on
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            { t: "Why we cap automation at 250 posts a day", w: "09:00", s: "slot 1", tone: "var(--primary)" },
            { t: "Three reasons a post fails silently", w: "13:00", s: "slot 2", tone: "var(--accent)" },
            { t: "The 500 character ceiling is a feature", w: "20:00", s: "slot 3", tone: "var(--primary)" },
            { t: "Client case study: 3 posts a week, +42% replies", w: "09:00", s: "review", tone: "var(--warn)" },
          ].map((r) => (
            <li key={r.t} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
              <span className="w-11 shrink-0 font-mono text-[11.5px] font-bold" style={{ color: r.tone }}>
                {r.w}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px]">{r.t}</span>
              <span className="chip hidden border-border bg-muted text-muted-foreground sm:inline-flex">
                {r.s}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: "Published", v: "12" },
            { l: "Queued", v: "9" },
            { l: "Failed", v: "1" },
          ].map((k) => (
            <div key={k.l} className="rounded-xl border border-border bg-card p-2.5 text-center">
              <p className="text-[17px] font-bold">{k.v}</p>
              <p className="text-[10.5px] text-muted-foreground">{k.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
