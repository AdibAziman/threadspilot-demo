"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Quote,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Zap,
} from "lucide-react";
import { Button, Card, Chip, Field, Modal, Progress, SectionHeader, Switch } from "@/components/ui";
import { useStore } from "@/lib/store";
import { relTime } from "@/lib/utils";
import type { AutomationRule } from "@/lib/types";

const ACTION_META = {
  like: { label: "Like", icon: Heart },
  reply: { label: "Reply", icon: MessageCircle },
  quote: { label: "Quote", icon: Quote },
  repost: { label: "Repost", icon: Repeat2 },
  follow: { label: "Follow", icon: UserPlus },
};

export default function AutomationPage() {
  const { rules, toggleRule, deleteRule, addRule, activity, settings, updateSettings, toast, connection } =
    useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<AutomationRule, "id" | "usedToday">>({
    name: "",
    trigger: "keyword",
    target: "",
    actions: ["like"],
    dailyCap: 20,
    enabled: true,
    quietHours: "23:00–07:00",
  });

  const totalToday = rules.reduce((a, r) => a + (r.enabled ? r.usedToday : 0), 0);
  const totalCap = rules.reduce((a, r) => a + (r.enabled ? r.dailyCap : 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Automation"
        subtitle="Engagement rules that run inside your guardrails, never outside them"
        right={
          <>
            <Chip tone={settings.guardrails.respectQuietHours ? "success" : "warn"}>
              <ShieldCheck className="size-3" aria-hidden />
              quiet hours {settings.guardrails.respectQuietHours ? "on" : "off"}
            </Chip>
            <Button variant="brand" size="sm" icon={<Plus className="size-3.5" aria-hidden />} onClick={() => setOpen(true)}>
              New rule
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex items-center gap-4 lg:col-span-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
            <Zap className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">
              {totalToday} actions today across {rules.filter((r) => r.enabled).length} live rules
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Hard ceiling {totalCap} interactions per day, spread across your active hours
            </p>
            <Progress value={totalToday} max={Math.max(1, totalCap)} className="mt-2" />
          </div>
        </Card>
        <Card className="flex flex-col justify-center gap-2">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Reply quota
          </p>
          <p className="text-[22px] font-bold tabular-nums">
            {connection.replyQuotaUsed}
            <span className="text-[13px] font-medium text-muted-foreground">
              {" "}
              / {connection.replyQuotaTotal.toLocaleString()}
            </span>
          </p>
          <Progress value={connection.replyQuotaUsed} max={connection.replyQuotaTotal} tone="accent" />
        </Card>
      </div>

      <div className="stagger grid gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <Card key={r.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-bold">{r.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Trigger · <span className="font-medium">{r.trigger}</span> · {r.target}
                </p>
              </div>
              <Switch checked={r.enabled} onChange={() => toggleRule(r.id)} label={r.enabled ? "Live" : "Paused"} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {r.actions.map((a) => {
                const meta = ACTION_META[a];
                return (
                  <Chip key={a} tone="accent">
                    <meta.icon className="size-3" aria-hidden />
                    {meta.label}
                  </Chip>
                );
              })}
              <Chip>quiet {r.quietHours}</Chip>
            </div>

            <div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Used today</span>
                <span className="font-semibold tabular-nums">
                  {r.usedToday} / {r.dailyCap}
                </span>
              </div>
              <Progress
                value={r.usedToday}
                max={r.dailyCap}
                tone={r.usedToday / r.dailyCap > 0.85 ? "warn" : "brand"}
                className="mt-1.5"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={r.enabled ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
                onClick={() => toggleRule(r.id)}
              >
                {r.enabled ? "Pause" : "Resume"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<Sparkles className="size-3.5" aria-hidden />}
                onClick={() =>
                  toast({
                    title: "Dry run complete",
                    body: `Matched ${3 + r.actions.length} posts in the last hour. Nothing was sent.`,
                    tone: "info",
                  })
                }
              >
                Dry run
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-[var(--destructive)]"
                icon={<Trash2 className="size-3.5" aria-hidden />}
                onClick={() => deleteRule(r.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <SectionHeader title="Guardrails" subtitle="Applies to every rule, on top of per-rule caps" />
          <Switch
            checked={settings.guardrails.respectQuietHours}
            onChange={(v) => updateSettings({ guardrails: { ...settings.guardrails, respectQuietHours: v } })}
            label="Respect quiet hours"
            description="No automated likes or replies between 23:00 and 07:00 local time."
          />
          <Switch
            checked={settings.guardrails.autoPublish}
            onChange={(v) => updateSettings({ guardrails: { ...settings.guardrails, autoPublish: v } })}
            label="Auto-publish scheduled posts"
            description="When off, everything waits for a manual push."
          />
          <Switch
            checked={settings.guardrails.requireApproval}
            onChange={(v) => updateSettings({ guardrails: { ...settings.guardrails, requireApproval: v } })}
            label="Require approval before publishing"
            description="New drafts enter the approval queue instead of going straight out."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Daily interaction cap" hint="Across all rules combined.">
              <input
                type="number"
                className="input"
                value={settings.guardrails.dailyPostCap}
                onChange={(e) =>
                  updateSettings({
                    guardrails: { ...settings.guardrails, dailyPostCap: Number(e.target.value) },
                  })
                }
              />
            </Field>
            <Field label="Minimum gap between actions" hint="Minutes, prevents burst patterns.">
              <input
                type="number"
                className="input"
                value={settings.guardrails.minGapMinutes}
                onChange={(e) =>
                  updateSettings({
                    guardrails: { ...settings.guardrails, minGapMinutes: Number(e.target.value) },
                  })
                }
              />
            </Field>
          </div>
          <p className="rounded-xl bg-muted p-3 text-[12px] text-muted-foreground">
            Skipped automatically: politics, religion, rage bait, sensitive current events and anything the
            topic filter scores below 0.4.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionHeader title="Engagement log" subtitle="What the rules actually did" />
          <ul className="flex max-h-[420px] flex-col gap-2.5 overflow-y-auto scroll-thin pr-1">
            {activity
              .filter((a) => a.actor === "Automation" || a.actor === "Scheduler")
              .map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{
                      background:
                        a.status === "ok" ? "var(--success)" : a.status === "warn" ? "var(--warn)" : "var(--destructive)",
                    }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug">
                      <span className="font-semibold">{a.actor}</span> {a.action}{" "}
                      <span className="text-muted-foreground">{a.target}</span>
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">{relTime(a.at)}</p>
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New automation rule"
        description="Rules only act on posts that match every condition you set here."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (!form.name.trim() || !form.target.trim()) {
                  toast({ title: "Name and target are required", tone: "warn" });
                  return;
                }
                addRule(form);
                setOpen(false);
                setForm({ ...form, name: "", target: "", actions: ["like"] });
              }}
            >
              Create rule
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Rule name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Support indie builders"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Trigger">
              <select
                className="select"
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value as AutomationRule["trigger"] })}
              >
                <option value="keyword">Keyword match</option>
                <option value="topic">Topic</option>
                <option value="account">Specific accounts</option>
                <option value="schedule">Schedule only</option>
              </select>
            </Field>
            <Field label="Daily cap">
              <input
                type="number"
                className="input"
                value={form.dailyCap}
                onChange={(e) => setForm({ ...form, dailyCap: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Target" hint="Comma separated keywords, accounts or topics.">
            <input
              className="input"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              placeholder="build in public, indie founder"
            />
          </Field>
          <Field label="Actions" hint="Like plus one of reply/quote reads most natural.">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ACTION_META) as (keyof typeof ACTION_META)[]).map((a) => {
                const meta = ACTION_META[a];
                const on = form.actions.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        actions: on ? f.actions.filter((x) => x !== a) : [...f.actions, a],
                      }))
                    }
                    aria-pressed={on}
                    className={
                      "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-semibold transition-colors duration-200 " +
                      (on
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                        : "border-border hover:border-[var(--secondary)]")
                    }
                  >
                    <meta.icon className="size-3.5" aria-hidden />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Quiet hours">
            <input
              className="input"
              value={form.quietHours}
              onChange={(e) => setForm({ ...form, quietHours: e.target.value })}
              placeholder="23:00–07:00"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
