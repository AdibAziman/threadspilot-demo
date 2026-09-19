"use client";

import { useState } from "react";
import { Check, CreditCard, Download, Sparkles } from "lucide-react";
import { Button, Card, Chip, Progress, SectionHeader, Tabs } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: 49,
    blurb: "One account, honest limits",
    perks: ["1 Threads account", "100 scheduled posts / month", "Slots and calendar", "Reply inbox", "7 day analytics"],
  },
  {
    name: "Growth",
    price: 99,
    blurb: "For creators running a real cadence",
    perks: [
      "3 Threads accounts",
      "Unlimited queue",
      "Automation rules + guardrails",
      "Brand voice training",
      "CSV export, 12 month history",
      "2 teammate seats",
    ],
  },
  {
    name: "Scale",
    price: 249,
    blurb: "Agencies and client work",
    perks: [
      "10 accounts, per-client workspaces",
      "Approval chains and audit log",
      "White-label reports",
      "Unlimited seats",
      "SSO and priority support",
    ],
  },
];

const INVOICES = [
  { id: "INV-2026-09", date: "01 Sep 2026", amount: "RM 99.00", status: "Paid" },
  { id: "INV-2026-08", date: "01 Aug 2026", amount: "RM 99.00", status: "Paid" },
  { id: "INV-2026-07", date: "01 Jul 2026", amount: "RM 99.00", status: "Paid" },
  { id: "INV-2026-06", date: "01 Jun 2026", amount: "RM 49.00", status: "Paid" },
];

export default function BillingPage() {
  const { user, connection, posts, toast } = useStore();
  const [cycle, setCycle] = useState("monthly");
  const current = user?.plan ?? "Growth";

  const used = posts.length;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Plan & billing"
        subtitle="Demo workspace — no payment method is attached and nothing is charged"
        right={<Chip tone="brand">Current plan · {current}</Chip>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="flex flex-col gap-4">
          <SectionHeader title={`${current} plan`} subtitle="RM 99 per month, renews 1 October 2026" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { l: "Posts this cycle", v: `${used}`, m: 1000 },
              { l: "Accounts connected", v: "1", m: 3 },
              { l: "Seats used", v: "3", m: 5 },
            ].map((k) => (
              <div key={k.l} className="rounded-xl border border-border p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {k.l}
                </p>
                <p className="mt-1 text-[19px] font-bold">
                  {k.v}
                  <span className="text-[12px] font-medium text-muted-foreground"> / {k.m}</span>
                </p>
                <Progress value={Number(k.v)} max={k.m} className="mt-2" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="brand" onClick={() => toast({ title: "Upgrade flow", body: "Stripe checkout would open here.", tone: "info" })}>
              Upgrade to Scale
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                toast({
                  title: "Cancellation paused",
                  body: "This is a demo workspace, so there is nothing to cancel.",
                  tone: "warn",
                })
              }
            >
              Cancel plan
            </Button>
          </div>
          <p className="rounded-xl bg-muted p-3 text-[12px] text-muted-foreground">
            Threads API quota is yours, not ours: {connection.postQuotaUsed} of {connection.postQuotaTotal} posts
            used today. We never resell publishing volume.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionHeader title="Payment method" />
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <span className="grid size-10 place-items-center rounded-lg bg-muted">
              <CreditCard className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">No card on file</p>
              <p className="text-[11.5px] text-muted-foreground">Demo workspace, billing disabled</p>
            </div>
            <Button size="sm" variant="outline">
              Add card
            </Button>
          </div>
          <SectionHeader title="Invoices" />
          <ul className="flex flex-col gap-2">
            {INVOICES.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold">{inv.id}</p>
                  <p className="text-[11.5px] text-muted-foreground">{inv.date}</p>
                </div>
                <span className="text-[12.5px] font-semibold tabular-nums">{inv.amount}</span>
                <Chip tone="success">{inv.status}</Chip>
                <button
                  className="btn btn-ghost btn-icon"
                  aria-label={`Download ${inv.id}`}
                  onClick={() => toast({ title: "Invoice downloaded", body: `${inv.id}.pdf`, tone: "ok" })}
                >
                  <Download className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Compare plans" subtitle="Upgrade or downgrade at any time, prorated" />
        <Tabs
          tabs={[
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly · save 2 months" },
          ]}
          active={cycle}
          onChange={setCycle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = p.name === current;
          const price = cycle === "yearly" ? Math.round(p.price * 10) : p.price;
          return (
            <Card
              key={p.name}
              className={cn("flex flex-col gap-3", isCurrent && "border-[var(--primary)] shadow-[var(--shadow-lg)]")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 text-[15px] font-bold">
                    {p.name}
                    {p.name === "Growth" && <Sparkles className="size-3.5 text-[var(--primary)]" aria-hidden />}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{p.blurb}</p>
                </div>
                {isCurrent && <Chip tone="brand">Current</Chip>}
              </div>
              <p className="text-[26px] font-extrabold tracking-tight">
                RM {price}
                <span className="text-[12.5px] font-medium text-muted-foreground">
                  {" "}
                  /{cycle === "yearly" ? "year" : "month"}
                </span>
              </p>
              <ul className="flex flex-1 flex-col gap-2 text-[12.5px]">
                {p.perks.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "ghost" : "outline"}
                disabled={isCurrent}
                onClick={() => toast({ title: `Switch to ${p.name}`, body: "Prorated on the next invoice.", tone: "info" })}
              >
                {isCurrent ? "You are on this plan" : `Choose ${p.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
