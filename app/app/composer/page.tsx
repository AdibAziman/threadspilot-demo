"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Clock,
  Hash,
  Image as ImageIcon,
  Link2,
  Loader2,
  MessageSquarePlus,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { Button, Card, Chip, Field, SectionHeader, Tabs } from "@/components/ui";
import { PostPreview } from "@/components/post-preview";
import { useStore } from "@/lib/store";
import { charBudget, localInputValue, nextDateAtTime, uid } from "@/lib/utils";
import type { Post } from "@/lib/types";

export default function ComposerPage() {
  const { slots, user, savePost, toast, generateDrafts, pool } = useStore();
  const router = useRouter();

  const [mode, setMode] = useState("write");
  const [text, setText] = useState("");
  const [thread, setThread] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [link, setLink] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string>(slots[0]?.id ?? "");
  const [when, setWhen] = useState(localInputValue(nextDateAtTime("09:00", [1, 2, 3, 4, 5])));
  const [timing, setTiming] = useState<"slot" | "custom" | "next">("slot");
  const [drafts, setDrafts] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);

  const budget = charBudget(text);
  const activeSlot = slots.find((s) => s.id === slotId);

  const resolvedTime = useMemo(() => {
    if (timing === "slot" && activeSlot) return nextDateAtTime(activeSlot.time, activeSlot.days).toISOString();
    if (timing === "next") return new Date(Date.now() + 15 * 60000).toISOString();
    return new Date(when).toISOString();
  }, [timing, activeSlot, when]);

  function buildPost(status: Post["status"]): Post {
    return {
      id: `p_${uid()}`,
      text,
      thread,
      tags,
      mediaUrl: media,
      linkUrl: link || null,
      firstComment: firstComment || null,
      scheduledAt: resolvedTime,
      status,
      slotId: timing === "slot" ? slotId : null,
      author: user?.name ?? "Adib Aziman",
      createdAt: new Date().toISOString(),
      publishedAt: null,
    };
  }

  function save(status: Post["status"]) {
    if (!text.trim()) {
      toast({ title: "Nothing to save", body: "Write the post text first.", tone: "warn" });
      return;
    }
    if (budget.over) {
      toast({ title: "Over the limit", body: "Threads caps a post at 500 characters.", tone: "error" });
      return;
    }
    savePost(buildPost(status));
    toast({
      title:
        status === "scheduled"
          ? "Scheduled"
          : status === "needs_approval"
            ? "Sent for approval"
            : status === "queued"
              ? "Added to queue"
              : "Draft saved",
      body:
        status === "needs_approval"
          ? "Your approver will get a notification."
          : `Fires ${new Date(resolvedTime).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur" })}`,
      tone: "ok",
    });
    setText("");
    setThread([]);
    setTags([]);
    setLink("");
    setFirstComment("");
    setMedia(null);
  }

  async function askAi() {
    setThinking(true);
    const out = await generateDrafts(3);
    setThinking(false);
    setDrafts(out);
    setMode("write");
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Composer"
        subtitle="Write it here, see it in a Threads frame, then park it in a slot"
        right={
          <Button variant="outline" size="sm" onClick={askAi} disabled={thinking}>
            {thinking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            {thinking ? "Drafting…" : "AI draft"}
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          {drafts.length > 0 && (
            <Card className="flex flex-col gap-2.5 border-[color-mix(in_srgb,var(--primary)_30%,transparent)]">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[13px] font-bold">
                  <Wand2 className="size-4 text-[var(--primary)]" aria-hidden />
                  Drafts in your brand voice
                </p>
                <button
                  onClick={() => setDrafts([])}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Dismiss drafts"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {drafts.map((d, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center"
                  >
                    <p className="min-w-0 flex-1 whitespace-pre-wrap text-[12.5px] leading-relaxed">{d}</p>
                    <Button size="sm" variant="outline" onClick={() => setText(d)} className="shrink-0">
                      Use this
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="text-[11.5px] text-muted-foreground">
                Generated from your tone sliders, banned words and sample posts. Nothing publishes until you schedule it.
              </p>
            </Card>
          )}

          <Card className="flex flex-col gap-4">
            <Tabs
              tabs={[
                { id: "write", label: "Write" },
                { id: "thread", label: "Thread", count: thread.length },
                { id: "extras", label: "Link & first comment" },
              ]}
              active={mode}
              onChange={setMode}
            />

            {mode === "write" && (
              <div>
                <label htmlFor="post-text" className="mb-1.5 block text-[13px] font-semibold">
                  Post text
                </label>
                <textarea
                  id="post-text"
                  className="textarea min-h-[200px] font-[450]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Say the useful thing first. Numbers over adjectives."
                  aria-describedby="char-counter"
                />
                <div className="mt-1.5 flex items-center justify-between text-[12px]">
                  <span id="char-counter" className={budget.over ? "font-bold text-[var(--destructive)]" : "text-muted-foreground"}>
                    {budget.used} / {budget.limit} characters
                  </span>
                  <span className={budget.over ? "font-bold text-[var(--destructive)]" : "text-muted-foreground"}>
                    {budget.over ? `${-budget.left} over Threads' limit` : `${budget.left} remaining`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.min(100, (budget.used / budget.limit) * 100)}%`,
                      background: budget.over ? "var(--destructive)" : "var(--primary)",
                    }}
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Topic tags" hint="One tag per post, up to 50 characters.">
                    <div className="flex gap-2">
                      <input
                        className="input"
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        placeholder="buildinpublic"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tagDraft.trim()) {
                            e.preventDefault();
                            setTags((t) => [...new Set([...t, tagDraft.trim().replace(/^#/, "")])]);
                            setTagDraft("");
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        icon={<Hash className="size-4" aria-hidden />}
                        onClick={() => {
                          if (!tagDraft.trim()) return;
                          setTags((t) => [...new Set([...t, tagDraft.trim().replace(/^#/, "")])]);
                          setTagDraft("");
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </Field>
                  <Field label="Media" hint="Hosted publicly at publish time; Threads fetches the URL.">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        icon={<ImageIcon className="size-4" aria-hidden />}
                        onClick={() => setMedia(media ? null : "queue-dashboard.png")}
                      >
                        {media ? "Remove image" : "Attach image"}
                      </Button>
                    </div>
                  </Field>
                </div>

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTags((x) => x.filter((y) => y !== t))}
                        className="chip cursor-pointer border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"
                      >
                        #{t}
                        <X className="size-3" aria-hidden />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === "thread" && (
              <div className="flex flex-col gap-3">
                <p className="text-[12.5px] text-muted-foreground">
                  Chained replies publish seconds apart, so the thread reads as one idea.
                </p>
                <ul className="flex flex-col gap-2">
                  {thread.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">
                        {i + 2}
                      </span>
                      <textarea
                        className="textarea min-h-[76px]"
                        value={t}
                        aria-label={`Thread part ${i + 2}`}
                        onChange={(e) =>
                          setThread((arr) => arr.map((v, idx) => (idx === i ? e.target.value : v)))
                        }
                      />
                      <button
                        onClick={() => setThread((arr) => arr.filter((_, idx) => idx !== i))}
                        className="btn btn-ghost btn-icon shrink-0"
                        aria-label={`Remove thread part ${i + 2}`}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  icon={<Plus className="size-4" aria-hidden />}
                  onClick={() => setThread((t) => [...t, ""])}
                >
                  Add thread part
                </Button>
              </div>
            )}

            {mode === "extras" && (
              <div className="flex flex-col gap-4">
                <Field label="Link attachment" hint="First URL in the text becomes the preview.">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <input
                      className="input"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://your-site.com/post"
                    />
                  </div>
                </Field>
                <Field label="First comment" hint="Posted as a threaded reply right after the post.">
                  <textarea
                    className="textarea min-h-[90px]"
                    value={firstComment}
                    onChange={(e) => setFirstComment(e.target.value)}
                    placeholder="Context, links or the CTA that would have cluttered the post."
                  />
                </Field>
                <div className="rounded-xl border border-dashed border-border p-3">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold">
                    <MessageSquarePlus className="size-4 text-[var(--primary)]" aria-hidden />
                    Pull from content pool
                  </p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {pool.filter((p) => !p.used).slice(0, 3).map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => setText(p.text)}
                          className="w-full cursor-pointer rounded-lg border border-border px-3 py-2 text-left text-[12.5px] transition-colors hover:border-[var(--primary)]"
                        >
                          <span className="line-clamp-1">{p.text}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionHeader title="Scheduling" subtitle="Slot, exact time, or straight to the queue" />
            <Tabs
              tabs={[
                { id: "slot", label: "Use a slot" },
                { id: "custom", label: "Pick date & time" },
                { id: "next", label: "Queue next" },
              ]}
              active={timing}
              onChange={(v) => setTiming(v as typeof timing)}
            />

            {timing === "slot" && (
              <ul className="flex flex-col gap-2">
                {slots.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSlotId(s.id)}
                      aria-pressed={slotId === s.id}
                      className={
                        "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-200 " +
                        (slotId === s.id
                          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                          : "border-border hover:border-[var(--secondary)]")
                      }
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted font-mono text-[11.5px] font-bold">
                        {s.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{s.label}</p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {s.days.length} days a week · {s.category}
                          {!s.enabled && " · paused"}
                        </p>
                      </div>
                      {slotId === s.id && <Check className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {timing === "custom" && (
              <Field label="Publish at" hint="Times are shown in Asia/Kuala_Lumpur.">
                <input
                  type="datetime-local"
                  className="input"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </Field>
            )}

            {timing === "next" && (
              <p className="rounded-xl border border-dashed border-border p-3 text-[12.5px] text-muted-foreground">
                Lands at the front of the queue and fires in about 15 minutes, after any post already due.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted p-3 text-[12.5px]">
              <CalendarClock className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />
              <span>
                Publishes{" "}
                <strong>
                  {new Date(resolvedTime).toLocaleString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kuala_Lumpur",
                  })}
                </strong>
              </span>
              <Chip className="ml-auto" tone="accent">
                {timing === "slot" ? activeSlot?.label ?? "Slot" : timing === "next" ? "Queue next" : "Custom"}
              </Chip>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="brand" icon={<Send className="size-4" aria-hidden />} onClick={() => save("scheduled")}>
                Schedule post
              </Button>
              <Button
                variant="outline"
                icon={<Clock className="size-4" aria-hidden />}
                onClick={() => save("queued")}
              >
                Add to queue
              </Button>
              <Button variant="ghost" icon={<Save className="size-4" aria-hidden />} onClick={() => save("draft")}>
                Save draft
              </Button>
              <Button
                variant="ghost"
                onClick={() => save("needs_approval")}
                className="ml-auto"
              >
                Send for approval
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <SectionHeader title="Live preview" subtitle="Exactly how it renders on Threads" />
            <PostPreview
              post={{ text, thread, tags, mediaUrl: media, linkUrl: link || null, firstComment: firstComment || null }}
              name={user?.name ?? "Adib | builder & trader"}
            />
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="Guardrails that apply" />
            <ul className="flex flex-col gap-2 text-[12.5px]">
              {[
                "500 character cap enforced before send",
                "Rate limit read before every publish",
                "Duplicate content check on identical text",
                "Quiet hours respected for replies, not scheduled posts",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" onClick={() => router.push("/app/settings")}>
              Adjust in settings
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
