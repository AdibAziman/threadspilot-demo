"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Link2,
  Loader2,
  RefreshCw,
  Shield,
  Unplug,
  Webhook,
} from "lucide-react";
import { Button, Card, Chip, Field, Progress, SectionHeader, Switch } from "@/components/ui";
import { Gauge } from "@/components/charts";
import { useStore } from "@/lib/store";
import { fmtDateTime, relTime } from "@/lib/utils";

const SCOPES = [
  { id: "threads_basic", label: "threads_basic", use: "Read your profile and handle" },
  { id: "threads_content_publish", label: "threads_content_publish", use: "Create and publish posts" },
  { id: "threads_manage_replies", label: "threads_manage_replies", use: "Reply, hide and approve replies" },
  { id: "threads_read_replies", label: "threads_read_replies", use: "Read replies for the inbox" },
  { id: "threads_manage_insights", label: "threads_manage_insights", use: "Pull analytics" },
];

const ROADMAP = [
  { name: "X / Twitter", state: "Available" },
  { name: "Instagram", state: "Available" },
  { name: "LinkedIn", state: "Available" },
  { name: "Bluesky", state: "Beta" },
  { name: "Mastodon", state: "Beta" },
  { name: "Pinterest", state: "Planned" },
];

export default function ConnectionsPage() {
  const { connection, connectThreads, refreshToken, toast, settings, updateSettings } = useStore();
  const [connecting, setConnecting] = useState(false);

  const daysLeft = Math.max(
    0,
    Math.round((new Date(connection.tokenExpiresAt).getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Connections"
        subtitle="One OAuth handshake per account. Tokens are encrypted at rest and refreshed before expiry."
        right={
          <Chip tone={connection.health === "healthy" ? "success" : "warn"}>
            {connection.health === "healthy" ? "Healthy" : "Needs attention"}
          </Chip>
        }
      />

      {daysLeft < 7 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--warn)_35%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-3.5">
          <AlertTriangle className="size-5 shrink-0 text-[var(--warn)]" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px]">
            Token expires in {daysLeft} days. Refresh now to extend it to another 60 days.
          </p>
          <Button size="sm" variant="outline" onClick={refreshToken}>
            Refresh token
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col gap-4">
          <SectionHeader
            title="Threads account"
            right={
              connection.connected ? (
                <Chip tone="success">
                  <CheckCircle2 className="size-3" aria-hidden />
                  Connected
                </Chip>
              ) : (
                <Chip tone="warn">Not connected</Chip>
              )
            }
          />

          <div className="flex items-center gap-3">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-full text-[17px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, hsl(344 72% 52%), hsl(24 68% 40%))" }}
              aria-hidden
            >
              A
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-bold">{connection.displayName}</p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {connection.handle} · {connection.followers.toLocaleString()} followers
              </p>
            </div>
          </div>

          <dl className="grid gap-3 text-[12.5px] sm:grid-cols-2">
            {[
              { k: "Token expires", v: `${fmtDateTime(connection.tokenExpiresAt)} (${relTime(connection.tokenExpiresAt)})` },
              { k: "Auto-refresh", v: "7 days before expiry" },
              { k: "App ID", v: "thr_demo_1047183" },
              { k: "Granted scopes", v: `${connection.scopes.length} of 5` },
            ].map((row) => (
              <div key={row.k} className="rounded-xl border border-border p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {row.k}
                </dt>
                <dd className="mt-1 font-medium">{row.v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            {!connection.connected ? (
              <Button
                variant="brand"
                disabled={connecting}
                onClick={async () => {
                  setConnecting(true);
                  await connectThreads();
                  setConnecting(false);
                }}
                icon={connecting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
              >
                {connecting ? "Authorising…" : "Connect Threads"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  icon={<RefreshCw className="size-4" aria-hidden />}
                  onClick={refreshToken}
                >
                  Refresh token
                </Button>
                <Button
                  variant="ghost"
                  className="text-[var(--destructive)]"
                  icon={<Unplug className="size-4" aria-hidden />}
                  onClick={() =>
                    toast({
                      title: "Disconnect blocked in demo",
                      body: "A real workspace would revoke the token here.",
                      tone: "warn",
                    })
                  }
                >
                  Disconnect
                </Button>
              </>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 text-[12px] text-muted-foreground">
            <p className="font-semibold text-foreground">OAuth redirect URI</p>
            <code className="mt-1 block break-all rounded bg-muted p-2 font-mono text-[11.5px]">
              https://app.threadspilot.demo/api/auth/threads/callback
            </code>
            <p className="mt-2">
              Must be HTTPS and registered in your Meta app exactly as written. Threads testers can grant all
              five permissions without App Review.
            </p>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-1">
            <SectionHeader title="Daily quota" subtitle="Read live before every publish" />
            <div className="flex flex-wrap items-center justify-around gap-2">
              <Gauge
                value={connection.postQuotaUsed}
                max={connection.postQuotaTotal}
                label="Posts / 24h"
                sublabel={`${connection.postQuotaTotal - connection.postQuotaUsed} left`}
              />
              <Gauge
                value={connection.replyQuotaUsed}
                max={connection.replyQuotaTotal}
                label="Replies / 24h"
                sublabel={`${connection.replyQuotaTotal - connection.replyQuotaUsed} left`}
                tone="var(--accent)"
              />
            </div>
            <p className="mt-2 rounded-xl bg-muted p-3 text-[11.5px] text-muted-foreground">
              Published by the Threads API. Deletions are limited to 100 per day; the queue checks all three
              counters before firing.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="Permissions" subtitle="Least privilege, nothing extra" />
            <ul className="flex flex-col gap-2">
              {SCOPES.map((s) => {
                const granted = connection.scopes.includes(s.id);
                return (
                  <li key={s.id} className="flex items-start gap-2.5 rounded-xl border border-border p-3">
                    <span
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                      style={{
                        background: granted
                          ? "color-mix(in srgb, var(--success) 16%, transparent)"
                          : "var(--muted)",
                        color: granted ? "var(--success)" : "var(--muted-foreground)",
                      }}
                    >
                      <Shield className="size-3" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <code className="text-[12px] font-semibold">{s.label}</code>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{s.use}</p>
                    </div>
                    <Chip className="ml-auto shrink-0" tone={granted ? "success" : "muted"}>
                      {granted ? "Granted" : "Missing"}
                    </Chip>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="Webhooks & keys" subtitle="For your own integrations" />
            <Field label="Webhook endpoint" hint="Post-published and post-failed events.">
              <div className="flex items-center gap-2">
                <Webhook className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <input className="input" defaultValue="https://hooks.your-studio.my/threadspilot" />
              </div>
            </Field>
            <Field label="API key" hint="Rotate anytime. Old keys stop working immediately.">
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-2">
                  <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <input className="input font-mono" readOnly value="tp_live_••••••••••••4f21" />
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Key rotated", body: "New key copied to clipboard.", tone: "ok" })}>
                  Rotate
                </Button>
              </div>
            </Field>
            <Switch
              checked={settings.notifications.publishFailed}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, publishFailed: v } })}
              label="Alert on failed publishes"
              description="Sends a webhook plus an in-app banner within seconds."
            />
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3">
        <SectionHeader title="Other platforms" subtitle="Same queue, same slots, one calendar" />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ROADMAP.map((p) => (
            <div key={p.name} className="rounded-xl border border-border p-3 text-center">
              <p className="text-[13px] font-semibold">{p.name}</p>
              <Chip
                className="mt-2"
                tone={p.state === "Available" ? "success" : p.state === "Beta" ? "accent" : "muted"}
              >
                {p.state}
              </Chip>
            </div>
          ))}
        </div>
        <Progress value={1} max={1} className="opacity-0" />
      </Card>
    </div>
  );
}
