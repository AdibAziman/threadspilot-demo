"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { Button, Card, Chip, Field, Modal, SectionHeader, StatusPill, Switch, Tabs } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, DAY_LABELS, DAY_SHORT, fmtTime, nextDateAtTime } from "@/lib/utils";
import type { Post, Slot } from "@/lib/types";

const CATEGORIES = ["Build log", "Trading", "Client work", "Opinion", "Lesson", "Announcement"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export default function CalendarPage() {
  const { posts, slots, reschedule, toggleSlot, deleteSlot, addSlot, toast } = useStore();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [slotModal, setSlotModal] = useState(false);
  const [draft, setDraft] = useState({ label: "", time: "18:00", days: [1, 3, 5] as number[], category: CATEGORIES[0] });

  const byDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    posts.forEach((p) => {
      if (!p.scheduledAt) return;
      const k = new Date(p.scheduledAt).toDateString();
      map.set(k, [...(map.get(k) ?? []), p]);
    });
    map.forEach((v) => v.sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()));
    return map;
  }, [posts]);

  const monthDays = useMemo(() => {
    const first = startOfMonth(cursor);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [cursor]);

  const weekDays = useMemo(() => {
    const s = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [cursor]);

  function moveTo(day: Date, post: Post) {
    const old = new Date(post.scheduledAt ?? Date.now());
    const next = new Date(day);
    next.setHours(old.getHours(), old.getMinutes(), 0, 0);
    reschedule(post.id, next.toISOString());
  }

  function onDrop(day: Date) {
    const post = posts.find((p) => p.id === dragId);
    setDragOver(null);
    setDragId(null);
    if (!post) return;
    moveTo(day, post);
  }

  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Calendar"
        subtitle="Drag any post to another day to reschedule it"
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="size-4" aria-hidden />} onClick={() => shift(-1)}>
              <span className="sr-only sm:not-sr-only">Prev</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="sm" icon={<ChevronRight className="size-4" aria-hidden />} onClick={() => shift(1)}>
              <span className="sr-only sm:not-sr-only">Next</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: "month", label: "Month" },
            { id: "week", label: "Week" },
            { id: "list", label: "List" },
          ]}
          active={view}
          onChange={setView}
        />
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold">{monthLabel}</span>
          <Chip tone="accent">{posts.filter((p) => p.scheduledAt).length} scheduled</Chip>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {view === "month" && (
            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-7 border-b border-border bg-muted/60">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="px-1.5 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    <span className="hidden sm:inline">{d}</span>
                    <span className="sm:hidden">{d.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((d, i) => {
                  const key = d.toDateString();
                  const items = byDay.get(key) ?? [];
                  const isMonth = d.getMonth() === cursor.getMonth();
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={i}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(key);
                      }}
                      onDragLeave={() => setDragOver((x) => (x === key ? null : x))}
                      onDrop={() => onDrop(d)}
                      className={cn(
                        "min-h-[92px] border-b border-r border-border p-1.5 transition-colors duration-150 sm:min-h-[118px]",
                        !isMonth && "bg-muted/40",
                        dragOver === key && "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-full text-[11.5px] font-bold",
                            isToday && "bg-[var(--primary)] text-[var(--on-primary)]",
                            !isMonth && "text-muted-foreground"
                          )}
                        >
                          {d.getDate()}
                        </span>
                        {items.length > 2 && (
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            +{items.length - 2}
                          </span>
                        )}
                      </div>
                      <ul className="flex flex-col gap-1">
                        {items.slice(0, 2).map((p) => (
                          <li key={p.id}>
                            <button
                              draggable
                              onDragStart={() => setDragId(p.id)}
                              onDragEnd={() => setDragId(null)}
                              className={cn(
                                "w-full cursor-grab rounded-md border-l-[3px] px-1.5 py-1 text-left text-[10.5px] leading-tight transition-opacity duration-150 active:cursor-grabbing",
                                dragId === p.id && "opacity-50",
                                p.status === "published"
                                  ? "border-l-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)]"
                                  : p.status === "failed"
                                    ? "border-l-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)]"
                                    : p.status === "needs_approval"
                                      ? "border-l-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)]"
                                      : "border-l-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                              )}
                              title={`${fmtTime(p.scheduledAt!)} · ${p.text.slice(0, 60)}`}
                            >
                              <span className="font-mono font-bold">{fmtTime(p.scheduledAt!)}</span>{" "}
                              <span className="line-clamp-2">{p.text.slice(0, 46)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {view === "week" && (
            <Card className="p-0">
              <div className="grid grid-cols-7 border-b border-border bg-muted/60">
                {weekDays.map((d) => (
                  <div key={d.toISOString()} className="px-1.5 py-2 text-center">
                    <p className="text-[10.5px] font-bold uppercase text-muted-foreground">
                      {DAY_LABELS[d.getDay()]}
                    </p>
                    <p className="text-[13px] font-bold">{d.getDate()}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {weekDays.map((d) => {
                  const key = d.toDateString();
                  const items = byDay.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(key);
                      }}
                      onDrop={() => onDrop(d)}
                      className={cn(
                        "min-h-[240px] border-r border-border p-1.5 last:border-r-0",
                        dragOver === key && "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                      )}
                    >
                      <ul className="flex flex-col gap-1.5">
                        {items.map((p) => (
                          <li key={p.id}>
                            <button
                              draggable
                              onDragStart={() => setDragId(p.id)}
                              className="w-full cursor-grab rounded-lg border border-border bg-background p-1.5 text-left text-[11px] leading-tight active:cursor-grabbing"
                            >
                              <span className="font-mono font-bold text-[var(--accent)]">
                                {fmtTime(p.scheduledAt!)}
                              </span>
                              <p className="mt-0.5 line-clamp-3">{p.text.slice(0, 70)}</p>
                            </button>
                          </li>
                        ))}
                        {items.length === 0 && (
                          <li className="rounded-lg border border-dashed border-border p-3 text-center text-[10.5px] text-muted-foreground">
                            Drop a post here
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {view === "list" && (
            <Card className="flex flex-col gap-2">
              {[...posts]
                .filter((p) => p.scheduledAt)
                .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className="w-16 shrink-0 font-mono text-[12px] font-bold text-[var(--accent)]">
                      {new Date(p.scheduledAt!).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        timeZone: "Asia/Kuala_Lumpur",
                      })}
                    </span>
                    <span className="hidden w-12 shrink-0 font-mono text-[12px] sm:block">
                      {fmtTime(p.scheduledAt!)}
                    </span>
                    <p className="min-w-0 flex-1 line-clamp-1 text-[13px]">{p.text}</p>
                    <StatusPill status={p.status} />
                  </div>
                ))}
            </Card>
          )}
        </div>

        {/* slots rail */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <SectionHeader
              title="Posting slots"
              subtitle="Recurring windows, weekly"
              right={
                <Button size="sm" variant="outline" icon={<Plus className="size-3.5" aria-hidden />} onClick={() => setSlotModal(true)}>
                  Add
                </Button>
              }
            />
            <ul className="flex flex-col gap-3">
              {slots.map((s) => (
                <li key={s.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{s.label}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11.5px] text-muted-foreground">
                        <Clock className="size-3" aria-hidden />
                        {s.time} · {s.category}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSlot(s.id)}
                      className="btn btn-ghost btn-icon text-[var(--destructive)]"
                      aria-label={`Delete slot ${s.label}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {DAY_SHORT.map((d, i) => (
                      <span
                        key={i}
                        className={cn(
                          "grid size-5 place-items-center rounded text-[10px] font-bold",
                          s.days.includes(i) ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Chip tone={s.source === "auto" ? "accent" : "muted"}>
                      {s.source === "auto" ? "auto-filled" : "manual"}
                    </Chip>
                    <Switch checked={s.enabled} onChange={() => toggleSlot(s.id)} label="Active" />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Next run {nextDateAtTime(s.time, s.days).toLocaleString("en-GB", {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kuala_Lumpur",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="Legend" />
            <ul className="flex flex-col gap-2 text-[12.5px]">
              {[
                { c: "var(--success)", l: "Published" },
                { c: "var(--accent)", l: "Scheduled / queued" },
                { c: "var(--warn)", l: "Awaiting approval" },
                { c: "var(--destructive)", l: "Failed, needs retry" },
              ].map((x) => (
                <li key={x.l} className="flex items-center gap-2">
                  <span className="size-3 rounded" style={{ background: x.c }} aria-hidden />
                  {x.l}
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-[11.5px] text-muted-foreground">
              <CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Dragging keeps the original time of day and only changes the date.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={slotModal}
        onClose={() => setSlotModal(false)}
        title="New posting slot"
        description="Slots repeat weekly. The scheduler fills them from your content pool."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSlotModal(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (!draft.label.trim()) {
                  toast({ title: "Name the slot", tone: "warn" });
                  return;
                }
                const slot: Omit<Slot, "id"> = {
                  label: draft.label,
                  time: draft.time,
                  days: draft.days.length ? draft.days : [1],
                  category: draft.category,
                  enabled: true,
                  source: "manual",
                };
                addSlot(slot);
                toast({ title: "Slot created", body: `${draft.label} at ${draft.time}`, tone: "ok" });
                setSlotModal(false);
                setDraft({ label: "", time: "18:00", days: [1, 3, 5], category: CATEGORIES[0] });
              }}
            >
              Create slot
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Slot name">
            <input
              className="input"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="Evening opinion"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Time">
              <input type="time" className="input" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className="select" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Repeat on" hint="Pick at least one day.">
            <div className="flex gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  onClick={() =>
                    setDraft((s) => ({
                      ...s,
                      days: s.days.includes(i) ? s.days.filter((x) => x !== i) : [...s.days, i].sort(),
                    }))
                  }
                  aria-pressed={draft.days.includes(i)}
                  className={cn(
                    "h-11 flex-1 cursor-pointer rounded-lg border text-[12px] font-bold transition-colors duration-200",
                    draft.days.includes(i)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                      : "border-border hover:border-[var(--secondary)]"
                  )}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </div>
  );

  function shift(dir: number) {
    const d = new Date(cursor);
    if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCursor(d);
  }
}
