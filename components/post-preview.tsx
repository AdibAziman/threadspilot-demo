"use client";

import { Avatar, Card, Chip } from "./ui";
import { cn, charBudget } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { Heart, Image as ImageIcon, Link2, MessageCircle, Repeat2, Send } from "lucide-react";

/** Renders a post the way it would appear on Threads, so drafts are judged in context. */
export function PostPreview({
  post,
  handle = "@adib.builds",
  name = "Adib | builder & trader",
  hue = 344,
  className,
}: {
  post: Pick<Post, "text" | "thread" | "mediaUrl" | "linkUrl" | "firstComment" | "tags">;
  handle?: string;
  name?: string;
  hue?: number;
  className?: string;
}) {
  const budget = charBudget(post.text);
  return (
    <div className={cn("mx-auto w-full max-w-[440px]", className)}>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Avatar name={name} hue={hue} size={38} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13.5px] font-semibold">{name}</span>
              <span className="shrink-0 text-[12.5px] text-muted-foreground">{handle}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">
              {post.text || <span className="text-muted-foreground">Your post text appears here…</span>}
            </p>

            {post.mediaUrl && (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
                <ImageIcon className="size-4 text-muted-foreground" aria-hidden />
                <span className="truncate text-[12.5px] text-muted-foreground">
                  {post.mediaUrl} · hosted publicly at publish time
                </span>
              </div>
            )}
            {post.linkUrl && (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
                <Link2 className="size-4 text-muted-foreground" aria-hidden />
                <span className="truncate text-[12.5px] text-muted-foreground">{post.linkUrl}</span>
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Chip key={t} tone="accent">
                    #{t}
                  </Chip>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 text-muted-foreground">
              {[Heart, MessageCircle, Repeat2, Send].map((Icon, i) => (
                <Icon key={i} className="size-[18px]" aria-hidden />
              ))}
            </div>
          </div>
        </div>

        {post.thread.length > 0 && (
          <div className="mt-3 border-l-2 border-border pl-4">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Thread continues
            </p>
            <ul className="flex flex-col gap-2">
              {post.thread.map((t, i) => (
                <li key={i} className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {post.firstComment && (
          <div className="mt-3 rounded-xl border border-dashed border-border p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              First comment
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed">{post.firstComment}</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-muted-foreground">
        <span>
          {budget.used} / {budget.limit} characters
        </span>
        <span className={budget.over ? "font-bold text-[var(--destructive)]" : undefined}>
          {budget.over ? `${-budget.left} over the limit` : `${budget.left} left`}
        </span>
      </div>
    </div>
  );
}

export function PostRow({
  post,
  onClick,
  right,
}: {
  post: Post;
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-3",
        onClick && "cursor-pointer transition-colors duration-200 hover:border-[var(--secondary)]"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13.5px] leading-relaxed">{post.text}</p>
        {post.error && (
          <p className="mt-1 line-clamp-1 text-[12px] font-medium text-[var(--destructive)]">
            {post.error}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function QuotaBar({
  label,
  used,
  total,
  tone = "brand",
}: {
  label: string;
  used: number;
  total: number;
  tone?: "brand" | "accent";
}) {
  const pct = Math.round((used / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: tone === "brand" ? "var(--primary)" : "var(--accent)" }}
        />
      </div>
    </div>
  );
}
