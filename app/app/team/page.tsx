"use client";

import { useState } from "react";
import { Check, Crown, Mail, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { Avatar, Button, Card, Chip, Field, Modal, SectionHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

const ROLES: TeamMember["role"][] = ["Owner", "Editor", "Approver", "Viewer"];

const MATRIX = [
  { cap: "Write and edit drafts", Owner: true, Editor: true, Approver: false, Viewer: false },
  { cap: "Schedule and publish", Owner: true, Editor: true, Approver: true, Viewer: false },
  { cap: "Approve or reject", Owner: true, Editor: false, Approver: true, Viewer: false },
  { cap: "Manage automation rules", Owner: true, Editor: false, Approver: false, Viewer: false },
  { cap: "View analytics", Owner: true, Editor: true, Approver: true, Viewer: true },
  { cap: "Billing and plan", Owner: true, Editor: false, Approver: false, Viewer: false },
];

export default function TeamPage() {
  const { team, inviteMember, removeMember, posts, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Editor" as TeamMember["role"] });

  const pending = posts.filter((p) => p.status === "needs_approval");

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Team"
        subtitle="Who can draft, who can approve, and who can only look"
        right={
          <Button variant="brand" size="sm" icon={<UserPlus className="size-3.5" aria-hidden />} onClick={() => setOpen(true)}>
            Invite member
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { l: "Members", v: String(team.filter((t) => t.status === "active").length) },
          { l: "Pending invites", v: String(team.filter((t) => t.status === "invited").length) },
          { l: "Awaiting approval", v: String(pending.length) },
        ].map((k) => (
          <Card key={k.l} className="text-center">
            <p className="text-[22px] font-bold">{k.v}</p>
            <p className="text-[12px] text-muted-foreground">{k.l}</p>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-3">
        <SectionHeader title="Members" subtitle="The demo workspace has one owner, one editor and one approver" />
        <ul className="flex flex-col gap-2">
          {team.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
            >
              <Avatar name={m.name} hue={m.avatarHue} size={38} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold">
                  {m.name}
                  {m.role === "Owner" && <Crown className="size-3.5 text-[var(--primary)]" aria-hidden />}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">{m.email}</p>
              </div>
              <Chip tone={m.status === "invited" ? "warn" : "muted"}>
                {m.status === "invited" ? "Invite pending" : "Active"}
              </Chip>
              <select
                className="select w-auto min-w-[120px]"
                value={m.role}
                aria-label={`Role for ${m.name}`}
                onChange={(e) =>
                  toast({
                    title: "Role change blocked in demo",
                    body: `${m.name} stays ${m.role} in this sample workspace.`,
                    tone: "info",
                  })
                }
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={() => removeMember(m.id)}
                disabled={m.role === "Owner"}
                className="btn btn-ghost btn-icon text-[var(--destructive)] disabled:opacity-40"
                aria-label={`Remove ${m.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col gap-3 overflow-x-auto scroll-thin">
          <SectionHeader title="Role permissions" subtitle="Fixed matrix, no per-user overrides" />
          <table className="w-full min-w-[520px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5 pr-3 font-bold">Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="py-2.5 px-2 font-bold text-center">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row.cap} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3">{row.cap}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="py-2.5 px-2 text-center">
                      {row[r] ? (
                        <Check className="mx-auto size-4 text-[var(--success)]" aria-label="allowed" />
                      ) : (
                        <X className="mx-auto size-4 text-muted-foreground" aria-label="not allowed" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-[11.5px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Approvers can publish, but cannot rewrite your automation rules or see billing.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionHeader title="Approval queue" subtitle="Nothing ships until an approver signs off" />
          {pending.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Nothing waiting for review.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pending.map((p) => (
                <li key={p.id} className="rounded-xl border border-border p-3">
                  <p className="line-clamp-2 text-[13px]">{p.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
                    <span>by {p.author}</span>
                    <span>·</span>
                    <span>waiting since {new Date(p.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-xl border border-dashed border-border p-3">
            <p className="text-[12.5px] font-semibold">Reviewer reminders</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Approvers get an email plus an in-app badge after 4 hours of a draft sitting unreviewed.
            </p>
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a teammate"
        description="They get an email with a magic link. No passwords to manage."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              icon={<Mail className="size-4" aria-hidden />}
              onClick={() => {
                if (!form.name.trim() || !form.email.includes("@")) {
                  toast({ title: "Name and email required", tone: "warn" });
                  return;
                }
                inviteMember(form);
                setForm({ name: "", email: "", role: "Editor" });
                setOpen(false);
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nadia Kamal" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nadia@studio.my" />
          </Field>
          <Field label="Role" hint="Approvers can publish but not rewrite rules. Viewers can only look.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  aria-pressed={form.role === r}
                  className={cn(
                    "min-h-11 cursor-pointer rounded-lg border text-[12.5px] font-semibold transition-colors duration-200",
                    form.role === r
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                      : "border-border hover:border-[var(--secondary)]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
