"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Filter,
  Pencil,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
  XCircle,
} from "lucide-react";
import { Button, Card, Chip, Field, Modal, SectionHeader, StatusPill, Tabs } from "@/components/ui";
import { PostPreview } from "@/components/post-preview";
import { useStore } from "@/lib/store";
import { countdown, fmtDateTime, localInputValue } from "@/lib/utils";
import type { Post } from "@/lib/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "queued", label: "Queued" },
  { id: "needs_approval", label: "Approvals" },
  { id: "published", label: "Published" },
  { id: "failed", label: "Failed" },
  { id: "draft", label: "Drafts" },
];

export default function QueuePage() {
  const {
    posts,
    connection,
    publishNow,
    retryPost,
    deletePost,
    duplicatePost,
    setPostStatus,
    reschedule,
    savePost,
    toast,
  } = useStore();

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [rescheduling, setRescheduling] = useState<Post | null>(null);
  const [when, setWhen] = useState("");

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [f.id, f.id === "all" ? posts.length : posts.filter((p) => p.status === f.id).length])
      ) as Record<string, number>,
    [posts]
  );

  const rows = useMemo(() => {
    const base = filter === "all" ? posts : posts.filter((p) => p.status === filter);
    const q = query.trim().toLowerCase();
    const searched = q ? base.filter((p) => p.text.toLowerCase().includes(q)) : base;
    return [...searched].sort(
      (a, b) => new Date(b.scheduledAt ?? 0).getTime() - new Date(a.scheduledAt ?? 0).getTime()
    );
  }, [posts, filter, query]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Queue"
        subtitle={`${counts.scheduled + counts.queued} waiting · ${connection.postQuotaTotal - connection.postQuotaUsed} publish slots left today`}
        right={
          <>
            <Chip tone="accent">
              <Filter className="size-3" aria-hidden />
              {rows.length} shown
            </Chip>
            <Chip tone={connection.health === "healthy" ? "success" : "warn"}>
              quota {connection.postQuotaUsed}/{connection.postQuotaTotal}
            </Chip>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Tabs
            tabs={FILTERS.map((f) => ({ ...f, count: counts[f.id] }))}
            active={filter}
            onChange={(v) => {
              setFilter(v);
              setSelected([]);
            }}
          />
        </div>
        <label className="relative shrink-0 sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            className="input pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search post text…"
            aria-label="Search queue"
          />
        </label>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] p-3">
          <span className="text-[13px] font-semibold">{selected.length} selected</span>
          <Button
            size="sm"
            variant="outline"
            icon={<CheckCircle2 className="size-3.5" aria-hidden />}
            onClick={() => {
              selected.forEach((id) => setPostStatus(id, "scheduled"));
              setSelected([]);
            }}
          >
            Approve & schedule
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Play className="size-3.5" aria-hidden />}
            onClick={() => {
              selected.forEach((id) => publishNow(id));
              setSelected([]);
            }}
          >
            Publish now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="size-3.5" aria-hidden />}
            onClick={() => {
              selected.forEach((id) => deletePost(id));
              setSelected([]);
            }}
          >
            Delete
          </Button>
          <button
            onClick={() => setSelected([])}
            className="ml-auto cursor-pointer text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-[13.5px] text-muted-foreground">
            Nothing in this view. Try another filter or write something new.
          </p>
        </Card>
      ) : (
        <>
          {/* desktop table */}
          <Card className="hidden p-0 lg:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allSelected}
                      onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                      className="size-4 accent-[var(--primary)]"
                    />
                  </th>
                  <th className="px-3 py-2.5 font-bold">Post</th>
                  <th className="w-40 px-3 py-2.5 font-bold">When</th>
                  <th className="w-28 px-3 py-2.5 font-bold">Status</th>
                  <th className="w-32 px-3 py-2.5 font-bold">Author</th>
                  <th className="w-44 px-3 py-2.5 font-bold">Engagement</th>
                  <th className="w-40 px-3 py-2.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/60">
                    <td className="px-3 py-3 align-top">
                      <input
                        type="checkbox"
                        aria-label={`Select post ${p.text.slice(0, 30)}`}
                        checked={selected.includes(p.id)}
                        onChange={(e) =>
                          setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id)))
                        }
                        className="size-4 accent-[var(--primary)]"
                      />
                    </td>
                    <td className="max-w-0 px-3 py-3 align-top">
                      <p className="line-clamp-2 font-medium">{p.text}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {p.slotId && <Chip>slot</Chip>}
                        {p.thread.length > 0 && <Chip>+{p.thread.length} thread</Chip>}
                        {p.mediaUrl && <Chip>media</Chip>}
                        {p.tags.map((t) => (
                          <Chip key={t} tone="accent">#{t}</Chip>
                        ))}
                        {p.error && <Chip tone="warn">{p.error.slice(0, 38)}…</Chip>}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-mono text-[12px]">{p.scheduledAt ? fmtDateTime(p.scheduledAt) : "—"}</p>
                      <p className="text-[11.5px] text-muted-foreground">
                        {p.status === "published"
                          ? `posted ${countdown(p.publishedAt ?? p.createdAt)}`
                          : p.scheduledAt
                            ? countdown(p.scheduledAt)
                            : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-3 py-3 align-top text-[12.5px] text-muted-foreground">{p.author}</td>
                    <td className="px-3 py-3 align-top">
                      {p.metrics ? (
                        <div className="flex flex-col gap-0.5 text-[12px] text-muted-foreground">
                          <span>{p.metrics.likes.toLocaleString()} likes</span>
                          <span>{p.metrics.replies.toLocaleString()} replies · {p.metrics.views.toLocaleString()} views</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex justify-end gap-1">
                        {p.status === "failed" && (
                          <button onClick={() => retryPost(p.id)} className="btn btn-ghost btn-icon" aria-label="Retry" title="Retry">
                            <RefreshCw className="size-4" aria-hidden />
                          </button>
                        )}
                        {(p.status === "scheduled" || p.status === "queued" || p.status === "draft") && (
                          <button onClick={() => publishNow(p.id)} className="btn btn-ghost btn-icon" aria-label="Publish now" title="Publish now">
                            <Play className="size-4" aria-hidden />
                          </button>
                        )}
                        {p.status === "needs_approval" && (
                          <>
                            <button
                              onClick={() => setPostStatus(p.id, "scheduled")}
                              className="btn btn-ghost btn-icon text-[var(--success)]"
                              aria-label="Approve"
                              title="Approve"
                            >
                              <CheckCircle2 className="size-4" aria-hidden />
                            </button>
                            <button
                              onClick={() => setPostStatus(p.id, "rejected")}
                              className="btn btn-ghost btn-icon text-[var(--destructive)]"
                              aria-label="Reject"
                              title="Reject"
                            >
                              <XCircle className="size-4" aria-hidden />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditing(p);
                          }}
                          className="btn btn-ghost btn-icon"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button
                          onClick={() => {
                            setRescheduling(p);
                            setWhen(localInputValue(new Date(p.scheduledAt ?? Date.now())));
                          }}
                          className="btn btn-ghost btn-icon"
                          aria-label="Reschedule"
                          title="Reschedule"
                        >
                          <Undo2 className="size-4" aria-hidden />
                        </button>
                        <button
                          onClick={() => duplicatePost(p.id)}
                          className="btn btn-ghost btn-icon"
                          aria-label="Duplicate"
                          title="Duplicate"
                        >
                          <Copy className="size-4" aria-hidden />
                        </button>
                        <button
                          onClick={() => deletePost(p.id)}
                          className="btn btn-ghost btn-icon text-[var(--destructive)]"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* mobile cards */}
          <ul className="stagger flex flex-col gap-3 lg:hidden">
            {rows.map((p) => (
              <li key={p.id}>
                <Card className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <StatusPill status={p.status} />
                    <span className="font-mono text-[11.5px] text-muted-foreground">
                      {p.scheduledAt ? fmtDateTime(p.scheduledAt) : "no date"}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-[13.5px] leading-relaxed">{p.text}</p>
                  {p.error && (
                    <p className="text-[12px] font-medium text-[var(--destructive)]">{p.error}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {p.slotId && <Chip>slot</Chip>}
                    {p.thread.length > 0 && <Chip>+{p.thread.length} thread</Chip>}
                    {p.mediaUrl && <Chip>media</Chip>}
                  </div>
                  {p.metrics && (
                    <p className="text-[12px] text-muted-foreground">
                      {p.metrics.likes.toLocaleString()} likes · {p.metrics.replies.toLocaleString()} replies ·{" "}
                      {p.metrics.views.toLocaleString()} views
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {p.status === "failed" && (
                      <Button size="sm" variant="outline" icon={<RefreshCw className="size-3.5" aria-hidden />} onClick={() => retryPost(p.id)}>
                        Retry
                      </Button>
                    )}
                    {p.status === "needs_approval" && (
                      <Button size="sm" variant="outline" icon={<CheckCircle2 className="size-3.5" aria-hidden />} onClick={() => setPostStatus(p.id, "scheduled")}>
                        Approve
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" aria-hidden />} onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Undo2 className="size-3.5" aria-hidden />}
                      onClick={() => {
                        setRescheduling(p);
                        setWhen(localInputValue(new Date(p.scheduledAt ?? Date.now())));
                      }}
                    >
                      Move
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" aria-hidden />} onClick={() => deletePost(p.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit post"
        description="Changes are saved to the queue immediately."
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (editing) savePost(editing);
                setEditing(null);
                toast({ title: "Post updated", tone: "ok" });
              }}
            >
              Save changes
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Field label="Post text">
                <textarea
                  className="textarea min-h-[140px]"
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                />
              </Field>
              <Field label="First comment">
                <input
                  className="input"
                  value={editing.firstComment ?? ""}
                  onChange={(e) => setEditing({ ...editing, firstComment: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <select
                  className="select"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as Post["status"] })}
                >
                  {["draft", "queued", "scheduled", "needs_approval", "rejected"].map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                Preview
              </p>
              <PostPreview post={editing} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!rescheduling}
        onClose={() => setRescheduling(null)}
        title="Reschedule post"
        description="Move it to a new window. The queue re-sorts automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRescheduling(null)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (rescheduling) reschedule(rescheduling.id, new Date(when).toISOString());
                setRescheduling(null);
              }}
            >
              Move post
            </Button>
          </>
        }
      >
        <Field label="New publish time" hint="Timezone: Asia/Kuala_Lumpur">
          <input type="datetime-local" className="input" value={when} onChange={(e) => setWhen(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
