"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Inbox,
  PenSquare,
  RefreshCw,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button, Card, Chip, Kpi, Progress, SectionHeader, StatusPill } from "@/components/ui";
import { Heatmap, Sparkline } from "@/components/charts";
import { PostRow, QuotaBar } from "@/components/post-preview";
import { useStore } from "@/lib/store";
import { countdown, DAY_LABELS, fmtDateTime, relTime } from "@/lib/utils";

export default function DashboardPage() {
  const { posts, slots, activity, analytics, connection, user, inbox } = useStore();

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "published");
    const scheduled = posts.filter((p) => p.status === "scheduled" || p.status === "queued");
    const failed = posts.filter((p) => p.status === "failed");
    const approvals = posts.filter((p) => p.status === "needs_approval");
    const engagement = published.reduce(
      (a, p) => a + (p.metrics?.likes ?? 0) + (p.metrics?.replies ?? 0),
      0
    );
    const views = published.reduce((a, p) => a + (p.metrics?.views ?? 0), 0);
    return { published, scheduled, failed, approvals, engagement, views };
  }, [posts]);

  const upcoming = useMemo(
    () =>
      [...stats.scheduled]
        .sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime())
        .slice(0, 5),
    [stats.scheduled]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const unread = inbox.filter((i) => i.unread).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "Asia/Kuala_Lumpur",
            })}{" "}
            · {slots.filter((s) => s.enabled).length} active slots ·{" "}
            {stats.scheduled.length} posts queued
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/composer" className="btn btn-brand btn-sm">
            <PenSquare className="size-4" aria-hidden />
            New post
          </Link>
          <Link href="/app/calendar" className="btn btn-outline btn-sm">
            <CalendarDays className="size-4" aria-hidden />
            Calendar
          </Link>
        </div>
      </div>

      {stats.failed.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] p-3.5">
          <AlertTriangle className="size-5 shrink-0 text-[var(--destructive)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold">
              {stats.failed.length} post{stats.failed.length > 1 ? "s" : ""} failed to publish
            </p>
            <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted-foreground">
              {stats.failed[0].error ?? "Unknown error"}
            </p>
          </div>
          <Link href="/app/queue" className="btn btn-outline btn-sm">
            <RefreshCw className="size-3.5" aria-hidden />
            Review & retry
          </Link>
        </div>
      )}

      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Published (30d)"
          value={String(stats.published.length)}
          delta="+18%"
          hint={`${stats.published.length} posts last month`}
          icon={<CheckCircle2 className="size-4" aria-hidden />}
        />
        <Kpi
          label="Queued"
          value={String(stats.scheduled.length)}
          hint={`Next: ${upcoming[0] ? countdown(upcoming[0].scheduledAt!) : "nothing scheduled"}`}
          icon={<Clock className="size-4" aria-hidden />}
        />
        <Kpi
          label="Followers"
          value={connection.followers.toLocaleString()}
          delta="+2.9%"
          hint="Rolling 14 weeks"
          icon={<Users className="size-4" aria-hidden />}
        />
        <Kpi
          label="Engagement rate"
          value={`${analytics.engagementRate[analytics.engagementRate.length - 1]}%`}
          delta="+0.3pt"
          hint={`${stats.engagement.toLocaleString()} interactions tracked`}
          icon={<TrendingUp className="size-4" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="flex flex-col gap-4">
          <SectionHeader
            title="Next in queue"
            subtitle="The scheduler fires these automatically, in order"
            right={
              <Link href="/app/queue" className="btn btn-ghost btn-sm">
                All queued
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          <ul className="stagger flex flex-col gap-2">
            {upcoming.map((p) => (
              <li key={p.id}>
                <PostRow
                  post={p}
                  right={
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusPill status={p.status} />
                      <span className="font-mono text-[11.5px] font-semibold text-muted-foreground">
                        {countdown(p.scheduledAt!)}
                      </span>
                    </div>
                  }
                />
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-[13px] text-muted-foreground">
                Nothing queued. Fill a slot from the content pool.
              </li>
            )}
          </ul>

          <hr className="border-border" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2.5 text-[13px] font-bold">Reach, last 14 weeks</p>
              <Sparkline values={analytics.reach} label="Reach" tone="var(--accent)" />
              <p className="mt-1 text-[12px] text-muted-foreground">
                {analytics.reach[analytics.reach.length - 1].toLocaleString()} impressions this week
              </p>
            </div>
            <div>
              <p className="mb-2.5 text-[13px] font-bold">Engagement rate</p>
              <Sparkline values={analytics.engagementRate} label="Engagement rate" />
              <p className="mt-1 text-[12px] text-muted-foreground">
                {analytics.engagementRate[analytics.engagementRate.length - 1]}% average
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3.5">
            <SectionHeader
              title="Threads connection"
              right={
                <Chip tone={connection.health === "healthy" ? "success" : "warn"}>
                  {connection.health === "healthy" ? "Healthy" : "Needs attention"}
                </Chip>
              }
            />
            <div className="flex items-center gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, hsl(344 72% 52%), hsl(24 68% 40%))",
                }}
                aria-hidden
              >
                A
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold">{connection.handle}</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  Token renews {relTime(connection.tokenExpiresAt)}
                </p>
              </div>
              <Link href="/app/connections" className="btn btn-ghost btn-sm ml-auto">
                Manage
              </Link>
            </div>
            <QuotaBar label="Posts today" used={connection.postQuotaUsed} total={connection.postQuotaTotal} />
            <QuotaBar label="Replies today" used={connection.replyQuotaUsed} total={connection.replyQuotaTotal} tone="accent" />
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader
              title="Slot health"
              subtitle="Recurring windows and their fill rate"
              right={
                <Link href="/app/calendar" className="btn btn-ghost btn-sm">
                  Edit slots
                </Link>
              }
            />
            <ul className="flex flex-col gap-3">
              {slots.map((s) => {
                const filled = posts.filter((p) => p.slotId === s.id).length;
                const target = s.days.length * 2;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted font-mono text-[11px] font-bold">
                      {s.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold">{s.label}</span>
                        <span className="shrink-0 text-[11.5px] text-muted-foreground">
                          {filled}/{target}
                        </span>
                      </div>
                      <Progress value={filled} max={target} className="mt-1.5" />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {s.days.map((d) => DAY_LABELS[d]).join(", ")}
                        {!s.enabled && " · paused"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="flex flex-col gap-3">
          <SectionHeader
            title="Best hours to post"
            subtitle="Engagement score by hour, from the last 90 days"
          />
          <Heatmap
            data={analytics.bestHours}
            ariaLabel="Engagement score by hour of day; peak at 20:00"
          />
          <p className="text-[12px] text-muted-foreground">
            Peak at 20:00 and 09:00. Slot 3 already covers the evening window.
          </p>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <SectionHeader
              title={`Awaiting approval (${stats.approvals.length})`}
              right={
                <Link href="/app/queue" className="btn btn-ghost btn-sm">
                  Review
                </Link>
              }
            />
            {stats.approvals.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                Nothing waiting. Approval keeps brand risk close to zero.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {stats.approvals.map((p) => (
                  <li key={p.id}>
                    <PostRow
                      post={p}
                      right={
                        <div className="flex flex-col items-end gap-1">
                          <Chip tone="brand">{p.author}</Chip>
                          <span className="text-[11px] text-muted-foreground">
                            {fmtDateTime(p.scheduledAt!)}
                          </span>
                        </div>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader
              title="Activity"
              right={
                <Link href="/app/settings" className="btn btn-ghost btn-sm">
                  View all
                </Link>
              }
            />
            <ul className="flex max-h-72 flex-col gap-2.5 overflow-y-auto scroll-thin pr-1">
              {activity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{
                      background:
                        a.status === "ok"
                          ? "var(--success)"
                          : a.status === "warn"
                            ? "var(--warn)"
                            : "var(--destructive)",
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

          <Card className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
              <Inbox className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold">{unread} unread in your inbox</p>
              <p className="text-[12px] text-muted-foreground">
                Suggested replies are drafted in your brand voice.
              </p>
            </div>
            <Link href="/app/inbox" className="btn btn-brand btn-sm">
              <Send className="size-3.5" aria-hidden />
              Open inbox
            </Link>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card interactive className="flex items-center gap-3">
          <Eye className="size-4 text-[var(--primary)]" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold">{(stats.views / 1000).toFixed(1)}k impressions</p>
            <p className="text-[11.5px] text-muted-foreground">Across published posts</p>
          </div>
        </Card>
        <Card interactive className="flex items-center gap-3">
          <Heart className="size-4 text-[var(--primary)]" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold">{stats.engagement.toLocaleString()} interactions</p>
            <p className="text-[11.5px] text-muted-foreground">Likes and replies combined</p>
          </div>
        </Card>
        <Card interactive className="flex items-center gap-3">
          <CheckCircle2 className="size-4 text-[var(--success)]" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold">
              {Math.round((stats.published.length / Math.max(1, stats.published.length + stats.failed.length)) * 100)}%
              success rate
            </p>
            <p className="text-[11.5px] text-muted-foreground">Publish attempts, last 30 days</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
