"use client";

import { useMemo, useState } from "react";
import { Download, Eye, Heart, MessageCircle, Repeat2, TrendingUp, Users } from "lucide-react";
import { Button, Card, Chip, Kpi, SectionHeader, StatusPill, Tabs } from "@/components/ui";
import { BarTrend, Donut, HBar, Heatmap, Sparkline } from "@/components/charts";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/utils";

const RANGES = [
  { id: "7", label: "7 days" },
  { id: "14", label: "14 weeks" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
];

export default function AnalyticsPage() {
  const { analytics, posts, connection, toast } = useStore();
  const [range, setRange] = useState("14");

  const published = useMemo(
    () =>
      posts
        .filter((p) => p.status === "published" && p.metrics)
        .sort((a, b) => (b.metrics?.views ?? 0) - (a.metrics?.views ?? 0)),
    [posts]
  );

  const totals = useMemo(() => {
    const likes = published.reduce((a, p) => a + (p.metrics?.likes ?? 0), 0);
    const replies = published.reduce((a, p) => a + (p.metrics?.replies ?? 0), 0);
    const reposts = published.reduce((a, p) => a + (p.metrics?.reposts ?? 0), 0);
    const views = published.reduce((a, p) => a + (p.metrics?.views ?? 0), 0);
    return { likes, replies, reposts, views };
  }, [published]);

  function exportCsv() {
    const header = "date,status,text,likes,replies,reposts,views\n";
    const body = posts
      .map((p) =>
        [
          p.scheduledAt ? new Date(p.scheduledAt).toISOString().slice(0, 10) : "",
          p.status,
          `"${p.text.replace(/"/g, "'").replace(/\n/g, " ")}"`,
          p.metrics?.likes ?? "",
          p.metrics?.replies ?? "",
          p.metrics?.reposts ?? "",
          p.metrics?.views ?? "",
        ].join(",")
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "threadspilot-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", body: "threadspilot-report.csv downloaded.", tone: "ok" });
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Analytics"
        subtitle={`Threads account ${connection.handle} · rolling ${range} days`}
        right={
          <>
            <Tabs tabs={RANGES} active={range} onChange={setRange} />
            <Button variant="outline" size="sm" icon={<Download className="size-3.5" aria-hidden />} onClick={exportCsv}>
              Export CSV
            </Button>
          </>
        }
      />

      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Followers" value={connection.followers.toLocaleString()} delta="+380" hint="net new this month" icon={<Users className="size-4" aria-hidden />} />
        <Kpi label="Impressions" value={`${(totals.views / 1000).toFixed(1)}k`} delta="+12%" hint="published posts only" icon={<Eye className="size-4" aria-hidden />} />
        <Kpi label="Likes" value={totals.likes.toLocaleString()} delta="+9%" hint={`${(totals.likes / Math.max(1, published.length)).toFixed(0)} per post`} icon={<Heart className="size-4" aria-hidden />} />
        <Kpi label="Replies" value={totals.replies.toLocaleString()} delta="+21%" hint="replies beat likes on Threads" icon={<MessageCircle className="size-4" aria-hidden />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <SectionHeader title="Follower growth" subtitle="Net new per week" />
          <Sparkline values={analytics.followers} label="Followers" tone="var(--primary)" />
          <div className="flex items-center gap-2 text-[12.5px]">
            <Chip tone="success">
              <TrendingUp className="size-3" aria-hidden />
              +4,060 in 14 weeks
            </Chip>
            <span className="text-muted-foreground">Best week: W13 (+340)</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionHeader title="Reach by week" subtitle="Impressions, published posts" />
          <BarTrend
            values={analytics.reach}
            labels={analytics.dayLabels}
            ariaLabel="Weekly impressions over 14 weeks"
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <SectionHeader title="Format mix" subtitle="Share of published posts" />
          <Donut
            total={Math.max(1, published.length)}
            centerValue={String(published.length)}
            centerLabel="posts"
            segments={[
              { label: "Text", value: published.filter((_, i) => i % 2 === 0).length, color: "var(--primary)" },
              { label: "With media", value: published.filter((_, i) => i % 2 === 1).length, color: "var(--accent)" },
              { label: "Threads", value: Math.max(1, Math.round(published.length / 6)), color: "var(--success)" },
            ]}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionHeader title="Best hours" subtitle="Engagement score by hour" />
          <Heatmap data={analytics.bestHours} ariaLabel="Engagement score by hour of day" />
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionHeader title="Interactions by type" />
          <HBar
            ariaLabel="Interactions by type"
            rows={[
              { label: "Likes", value: totals.likes },
              { label: "Replies", value: totals.replies, tone: "var(--accent)" },
              { label: "Reposts", value: totals.reposts, tone: "var(--success)" },
            ]}
          />
          <p className="mt-1 rounded-xl bg-muted p-3 text-[11.5px] text-muted-foreground">
            Reply-heavy posts reach 3.2x further than like-heavy posts on this account.
          </p>
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <SectionHeader
          title="Top posts"
          subtitle="Sorted by impressions"
          right={<Chip tone="accent">{published.length} published</Chip>}
        />
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11.5px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5 pr-3 font-bold">Post</th>
                <th className="w-28 py-2.5 pr-3 font-bold">Date</th>
                <th className="w-20 py-2.5 pr-3 font-bold text-right">Views</th>
                <th className="w-20 py-2.5 pr-3 font-bold text-right">Likes</th>
                <th className="w-20 py-2.5 pr-3 font-bold text-right">Replies</th>
                <th className="w-24 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {published.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="max-w-0 py-3 pr-3">
                    <p className="line-clamp-1 font-medium">{p.text}</p>
                  </td>
                  <td className="py-3 pr-3 text-[12px] text-muted-foreground">
                    {p.publishedAt ? fmtDate(p.publishedAt) : "—"}
                  </td>
                  <td className="py-3 pr-3 text-right font-semibold tabular-nums">
                    {p.metrics?.views.toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">{p.metrics?.likes.toLocaleString()}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{p.metrics?.replies.toLocaleString()}</td>
                  <td className="py-3">
                    <StatusPill status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Repeat2 className="size-3.5" aria-hidden />
            {totals.reposts.toLocaleString()} reposts across all posts
          </span>
          <span>·</span>
          <span>Data refreshes every 30 minutes</span>
          <span>·</span>
          <span>Revenue and ad spend are not tracked in this demo</span>
        </div>
      </Card>
    </div>
  );
}
