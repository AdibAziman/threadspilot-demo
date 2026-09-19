"use client";

import { useState } from "react";
import { Download, Moon, RotateCcw, Sun, Trash2, Upload } from "lucide-react";
import { Button, Card, Chip, Field, SectionHeader, Switch, Tabs } from "@/components/ui";
import { useStore } from "@/lib/store";

const ZONES = [
  "Asia/Kuala_Lumpur",
  "Asia/Singapore",
  "Asia/Jakarta",
  "Asia/Bangkok",
  "Asia/Manila",
  "Australia/Sydney",
  "Europe/London",
  "America/New_York",
];

export default function SettingsPage() {
  const { user, settings, updateSettings, setTheme, resetDemo, toast } = useStore();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    workspace: user?.workspace ?? "",
    handle: "@adib.builds",
    bio: "Builder. XAUUSD trader. Writing about systems that ship.",
  });

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Settings"
        subtitle="Workspace, notifications and guardrails"
        right={<Chip tone="accent">Demo · changes stay in your browser</Chip>}
      />

      <Tabs
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "workspace", label: "Workspace" },
          { id: "notifications", label: "Notifications" },
          { id: "guardrails", label: "Guardrails" },
          { id: "data", label: "Data & danger" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "profile" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <SectionHeader title="Your profile" subtitle="Shown to teammates and on reports" />
            <Field label="Full name">
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </Field>
            <Field label="Public handle" hint="The Threads account your queue publishes to.">
              <input className="input" value={profile.handle} onChange={(e) => setProfile({ ...profile, handle: e.target.value })} />
            </Field>
            <Field label="Bio">
              <textarea className="textarea min-h-[80px]" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </Field>
            <Button variant="brand" onClick={() => toast({ title: "Profile saved", tone: "ok" })}>
              Save profile
            </Button>
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionHeader title="Appearance" subtitle="Light by default, dark for late sessions" />
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  aria-pressed={settings.theme === t}
                  className={
                    "flex min-h-[92px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold capitalize transition-colors duration-200 " +
                    (settings.theme === t
                      ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                      : "border-border hover:border-[var(--secondary)]")
                  }
                >
                  {t === "light" ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
                  {t} mode
                </button>
              ))}
            </div>
            <p className="rounded-xl bg-muted p-3 text-[12px] text-muted-foreground">
              Contrast is checked at 4.5:1 in both themes. Reduced-motion preferences are respected on every
              animation in the app.
            </p>
          </Card>
        </div>
      )}

      {tab === "workspace" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <SectionHeader title="Workspace" />
            <Field label="Workspace name">
              <input className="input" value={profile.workspace} onChange={(e) => setProfile({ ...profile, workspace: e.target.value })} />
            </Field>
            <Field label="Timezone" hint="Every slot and scheduled post is stored in UTC and displayed in this zone.">
              <select
                className="select"
                value={settings.timezone}
                onChange={(e) => {
                  updateSettings({ timezone: e.target.value });
                  toast({ title: "Timezone updated", body: e.target.value, tone: "ok" });
                }}
              >
                {ZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </Field>
            <Field label="Week starts on">
              <select className="select" defaultValue="Monday">
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </Field>
            <Button variant="brand" onClick={() => toast({ title: "Workspace saved", tone: "ok" })}>
              Save workspace
            </Button>
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionHeader title="Publishing defaults" />
            <Field label="Default reply control" hint="Who can reply to posts from this workspace.">
              <select className="select" defaultValue="everyone">
                <option value="everyone">Everyone</option>
                <option value="accounts_you_follow">Accounts you follow</option>
                <option value="followers_only">Followers only</option>
                <option value="mentioned_only">Mentioned only</option>
              </select>
            </Field>
            <Field label="Default topic tag" hint="Attached when a post has no tag of its own.">
              <input className="input" defaultValue="buildinpublic" />
            </Field>
            <Switch
              checked={settings.guardrails.requireApproval}
              onChange={(v) => updateSettings({ guardrails: { ...settings.guardrails, requireApproval: v } })}
              label="Require approval for new drafts"
              description="Applies to every teammate except owners."
            />
          </Card>
        </div>
      )}

      {tab === "notifications" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <SectionHeader title="In-app and email" />
            <Switch
              checked={settings.notifications.publishFailed}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, publishFailed: v } })}
              label="Failed publishes"
              description="Immediate alert with the platform error and a retry button."
            />
            <Switch
              checked={settings.notifications.approvals}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, approvals: v } })}
              label="Approval requests"
              description="Pinged when a draft needs your sign off."
            />
            <Switch
              checked={settings.notifications.weeklyDigest}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, weeklyDigest: v } })}
              label="Weekly digest"
              description="Monday morning summary: what published, what performed, what is queued."
            />
            <Switch
              checked={settings.notifications.publishSuccess}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, publishSuccess: v } })}
              label="Every successful publish"
              description="Off by default. Useful for the first week, noisy after that."
            />
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionHeader title="Delivery" />
            <Field label="Alert email" hint="Where retries and failures are reported.">
              <input className="input" type="email" defaultValue={profile.email} />
            </Field>
            <Field label="Slack or Teams webhook" hint="Optional. Receives the same payloads as the API webhook.">
              <input className="input" placeholder="https://hooks.slack.com/services/…" />
            </Field>
            <Field label="Quiet period" hint="No alerts fired inside this window unless a publish failed.">
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="time" defaultValue="23:00" aria-label="Quiet period start" />
                <input className="input" type="time" defaultValue="07:00" aria-label="Quiet period end" />
              </div>
            </Field>
            <Button variant="brand" onClick={() => toast({ title: "Notification settings saved", tone: "ok" })}>
              Save notifications
            </Button>
          </Card>
        </div>
      )}

      {tab === "guardrails" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <SectionHeader title="Publishing guardrails" subtitle="Hard stops the scheduler cannot override" />
            <Switch
              checked={settings.guardrails.autoPublish}
              onChange={(v) => updateSettings({ guardrails: { ...settings.guardrails, autoPublish: v } })}
              label="Auto-publish"
              description="When off, the queue only prepares posts and waits for you."
            />
            <Field label="Daily post cap" hint="Deliberately below the Threads limit of 250 per 24 hours.">
              <input
                type="number"
                className="input"
                value={settings.guardrails.dailyPostCap}
                onChange={(e) => updateSettings({ guardrails: { ...settings.guardrails, dailyPostCap: Number(e.target.value) } })}
              />
            </Field>
            <Field label="Minimum gap between posts" hint="Minutes. Prevents burst posting if slots overlap.">
              <input
                type="number"
                className="input"
                value={settings.guardrails.minGapMinutes}
                onChange={(e) => updateSettings({ guardrails: { ...settings.guardrails, minGapMinutes: Number(e.target.value) } })}
              />
            </Field>
            <Switch
              checked={settings.guardrails.respectQuietHours}
              onChange={(v) => updateSettings({ guardrails: { ...settings.guardrails, respectQuietHours: v } })}
              label="Quiet hours"
              description="Blocks automated interactions overnight. Scheduled posts still publish."
            />
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="What the scheduler refuses to do" />
            <ul className="flex flex-col gap-2 text-[12.5px]">
              {[
                "Publish identical text twice, even across slots",
                "Exceed 250 posts or 1,000 replies per rolling 24 hours",
                "Publish media from a URL that is not publicly reachable",
                "Retry more than three times without escalating to you",
                "Automate engagement on political, religious or rage-bait topics",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2 rounded-xl border border-border p-3">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--destructive)]" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "data" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <SectionHeader title="Your data" subtitle="Export everything, or start clean" />
            <Button
              variant="outline"
              icon={<Download className="size-4" aria-hidden />}
              onClick={() => {
                const blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem("threadspilot.demo.v1") ?? "{}"), null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "threadspilot-workspace.json";
                a.click();
                URL.revokeObjectURL(url);
                toast({ title: "Workspace exported", body: "JSON file downloaded.", tone: "ok" });
              }}
            >
              Export workspace as JSON
            </Button>
            <Button
              variant="outline"
              icon={<Upload className="size-4" aria-hidden />}
              onClick={() => toast({ title: "Import is disabled in the demo", tone: "info" })}
            >
              Import from another tool
            </Button>
            <Button
              variant="outline"
              icon={<RotateCcw className="size-4" aria-hidden />}
              onClick={resetDemo}
            >
              Reset demo data to defaults
            </Button>
          </Card>

          <Card className="flex flex-col gap-4 border-[color-mix(in_srgb,var(--destructive)_30%,transparent)]">
            <SectionHeader title="Danger zone" subtitle="These actions are real, even in the demo" />
            <div className="rounded-xl border border-border p-3">
              <p className="text-[13px] font-semibold">Disconnect and erase workspace</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Revokes the Threads token, deletes queued posts and clears stored drafts. Cannot be undone.
              </p>
              <Button
                variant="ghost"
                className="mt-3 text-[var(--destructive)]"
                icon={<Trash2 className="size-4" aria-hidden />}
                onClick={() => {
                  resetDemo();
                  toast({
                    title: "Workspace cleared",
                    body: "Sample data restored. A production build would revoke the token too.",
                    tone: "warn",
                  });
                }}
              >
                Erase everything
              </Button>
            </div>
            <p className="text-[11.5px] text-muted-foreground">
              In production every destructive action requires typed confirmation plus a second approver.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
