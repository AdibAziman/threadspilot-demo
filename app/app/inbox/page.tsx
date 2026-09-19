"use client";

import { useMemo, useState } from "react";
import {
  CheckCheck,
  CornerDownLeft,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Avatar, Button, Card, Chip, EmptyState, SectionHeader, Tabs } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, relTime } from "@/lib/utils";

const SENTIMENT = {
  question: { label: "Question", tone: "accent" as const, icon: MessageSquare },
  positive: { label: "Positive", tone: "success" as const, icon: ThumbsUp },
  neutral: { label: "Neutral", tone: "muted" as const, icon: MessageSquare },
  negative: { label: "Pushback", tone: "warn" as const, icon: ThumbsDown },
};

const SUGGESTIONS = [
  "Keep it short and concrete. One idea per reply.",
  "Answer the question first, add context second.",
  "No emoji, no hype words. Match their register.",
  "If it is pushback, concede the valid part before defending the rest.",
];

export default function InboxPage() {
  const { inbox, refreshInbox, markInboxRead, sendInboxReply, markAllInboxRead, toast } = useStore();
  const [filter, setFilter] = useState("all");
  const [activeId, setActiveId] = useState(inbox[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const rows = useMemo(() => {
    if (filter === "unread") return inbox.filter((i) => i.unread);
    if (filter === "questions") return inbox.filter((i) => i.sentiment === "question");
    if (filter === "awaiting") return inbox.filter((i) => !i.replied);
    return inbox;
  }, [inbox, filter]);

  const active = inbox.find((i) => i.id === activeId) ?? rows[0] ?? null;
  const unread = inbox.filter((i) => i.unread).length;

  async function regenerate() {
    if (!active) return;
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    const variants = [
      "Short version: yes, and here is the constraint that matters. Everything else is preference.",
      "Good question. We solved it by capping the queue per day, so the publisher never hits the API limit mid-run.",
      "That is the tension worth naming. Speed of drafting and quality of judgement pull in opposite directions, so we keep the human on the approval step.",
    ];
    refreshInbox(active.id, variants[Math.floor(Math.random() * variants.length)]);
    setRegenerating(false);
    toast({ title: "New suggestion drafted", tone: "info" });
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Inbox"
        subtitle="Replies, mentions and questions from your posts"
        right={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCheck className="size-3.5" aria-hidden />}
              onClick={() => {
                markAllInboxRead();
                toast({ title: "All marked as read", tone: "info" });
              }}
            >
              Mark all read
            </Button>
            <Chip tone="brand">{unread} unread</Chip>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: "all", label: "All", count: inbox.length },
          { id: "unread", label: "Unread", count: unread },
          { id: "awaiting", label: "Awaiting reply", count: inbox.filter((i) => !i.replied).length },
          { id: "questions", label: "Questions", count: inbox.filter((i) => i.sentiment === "question").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="flex max-h-[620px] min-w-0 flex-col gap-1 overflow-y-auto scroll-thin p-2">
          {rows.length === 0 && (
            <p className="p-6 text-center text-[13px] text-muted-foreground">Nothing here.</p>
          )}
          {rows.map((item) => {
            const meta = SENTIMENT[item.sentiment];
            const isActive = active?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveId(item.id);
                  setDraft(item.aiDraft);
                  markInboxRead(item.id);
                }}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full cursor-pointer flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors duration-200",
                  isActive
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]"
                    : "border-transparent hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={item.author} hue={item.avatarHue} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold">
                      {item.author}
                      {item.unread && <span className="size-1.5 rounded-full bg-[var(--primary)]" aria-label="unread" />}
                    </p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{item.handle}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{relTime(item.receivedAt)}</span>
                </div>
                <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{item.text}</p>
                <div className="flex items-center gap-1.5">
                  <Chip tone={meta.tone}>
                    <meta.icon className="size-3" aria-hidden />
                    {meta.label}
                  </Chip>
                  {item.replied && <Chip tone="success">Replied</Chip>}
                </div>
              </button>
            );
          })}
        </Card>

        {active ? (
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Avatar name={active.author} hue={active.avatarHue} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{active.author}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {active.handle} · {relTime(active.receivedAt)}
                  </p>
                </div>
                <Chip tone={SENTIMENT[active.sentiment].tone}>{SENTIMENT[active.sentiment].label}</Chip>
              </div>

              <p className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-[14px] leading-relaxed">
                {active.text}
              </p>

              <p className="text-[12px] text-muted-foreground">
                Replying to your post · <span className="font-medium">{active.postRef}</span>
              </p>
            </Card>

            <Card className="flex flex-col gap-3">
              <SectionHeader
                title="Suggested reply"
                subtitle="Drafted in your brand voice, editable before sending"
                right={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerate}
                    disabled={regenerating}
                    icon={
                      regenerating ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : (
                        <RefreshCw className="size-3.5" aria-hidden />
                      )
                    }
                  >
                    {regenerating ? "Drafting" : "Redraft"}
                  </Button>
                }
              />

              <label htmlFor="reply-draft" className="sr-only">
                Reply text
              </label>
              <textarea
                id="reply-draft"
                className="textarea min-h-[110px]"
                value={draft || active.aiDraft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your reply…"
              />

              <ul className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                    <CheckCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span className="min-w-0">{s}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="brand"
                  icon={<Send className="size-4" aria-hidden />}
                  onClick={() => {
                    sendInboxReply(active.id);
                    setDraft("");
                  }}
                >
                  Send reply
                </Button>
                <Button
                  variant="ghost"
                  icon={<Sparkles className="size-4" aria-hidden />}
                  onClick={regenerate}
                  disabled={regenerating}
                >
                  Try another angle
                </Button>
                <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <CornerDownLeft className="size-3" aria-hidden />
                  Threaded reply · counted against the 1,000/day reply quota
                </span>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { l: "Median first reply", v: "38 min" },
                { l: "Reply rate", v: "82%" },
                { l: "Replies today", v: "23 / 1,000" },
              ].map((k) => (
                <Card key={k.l} className="text-center">
                  <p className="text-[19px] font-bold">{k.v}</p>
                  <p className="text-[11.5px] text-muted-foreground">{k.l}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<MessageSquare className="size-5" aria-hidden />}
            title="No conversation selected"
            body="Pick a thread on the left to see it with a suggested reply."
          />
        )}
      </div>
    </div>
  );
}
