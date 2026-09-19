"use client";

import { cn } from "@/lib/utils";

function path(values: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1 || 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / span);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${(w - pad).toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  return { line, area, first: pts[0], last: pts[pts.length - 1] };
}

export function Sparkline({
  values,
  height = 64,
  tone = "var(--primary)",
  label,
  showLast = true,
}: {
  values: number[];
  height?: number;
  tone?: string;
  label: string;
  showLast?: boolean;
}) {
  const w = 320;
  const { line, area, last } = path(values, w, height, 4);
  const id = `spark-${label.replace(/\W/g, "")}`;
  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="h-16 w-full"
        role="img"
        aria-label={`${label} trend, ${values.length} points, latest ${values[values.length - 1]}`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.28" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round" />
        {showLast && (
          <circle cx={last[0]} cy={last[1]} r="3.5" fill={tone} stroke="var(--card)" strokeWidth="2" />
        )}
      </svg>
    </div>
  );
}

export function BarTrend({
  values,
  labels,
  height = 120,
  tone = "var(--accent)",
  ariaLabel,
}: {
  values: number[];
  labels: string[];
  height?: number;
  tone?: string;
  ariaLabel: string;
}) {
  const max = Math.max(...values) || 1;
  return (
    <div className="w-full">
      <div
        className="flex items-end gap-1.5"
        style={{ height }}
        role="img"
        aria-label={`${ariaLabel}. Peak ${Math.max(...values)}`}
      >
        {values.map((v, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
            <span
              className="w-full rounded-t-md transition-[opacity,transform] duration-200 group-hover:opacity-80"
              style={{
                height: `${Math.max(6, (v / max) * 100)}%`,
                background: `color-mix(in srgb, ${tone} ${55 + (v / max) * 45}%, transparent)`,
              }}
            />
            <span className="pointer-events-none absolute -top-6 hidden rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] font-semibold shadow-[var(--shadow-sm)] group-hover:block">
              {v.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {labels.map((l, i) => (
          <span
            key={i}
            className="flex-1 truncate text-center text-[10px] font-medium text-muted-foreground"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Gauge({
  value,
  max,
  label,
  sublabel,
  tone = "var(--primary)",
  size = 132,
}: {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  tone?: string;
  size?: number;
}) {
  const pct = Math.min(1, value / max);
  const r = size / 2 - 12;
  const circ = Math.PI * r; // half circle
  const cx = size / 2;
  const cy = size / 2 + 6;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg
        width={size}
        height={size * 0.66}
        role="img"
        aria-label={`${label}: ${value} of ${max}`}
      >
        <path
          d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-[var(--foreground)] text-[19px] font-bold"
        >
          {value.toLocaleString()}
        </text>
      </svg>
      <span className="-mt-1 text-[12px] font-semibold">{label}</span>
      {sublabel && <span className="text-[11px] text-muted-foreground">{sublabel}</span>}
    </div>
  );
}

export function Donut({
  segments,
  total,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  total?: number;
  centerLabel: string;
  centerValue: string;
}) {
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0);
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        viewBox="0 0 140 140"
        className="size-[140px] shrink-0"
        role="img"
        aria-label={`${centerLabel} breakdown`}
      >
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth="16" />
        {segments.map((s) => {
          const len = (s.value / sum) * circ;
          const el = (
            <circle
              key={s.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeLinecap="butt"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
          offset += len;
          return el;
        })}
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className="fill-[var(--foreground)] text-[22px] font-bold"
        >
          {centerValue}
        </text>
        <text
          x="70"
          y="84"
          textAnchor="middle"
          className="fill-[var(--muted-foreground)] text-[10px] font-semibold uppercase tracking-wide"
        >
          {centerLabel}
        </text>
      </svg>
      <ul className="flex min-w-[140px] flex-1 flex-col gap-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Heatmap({
  data,
  ariaLabel,
}: {
  data: { hour: number; score: number }[];
  ariaLabel: string;
}) {
  const max = Math.max(...data.map((d) => d.score)) || 1;
  return (
    <div>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-16" role="img" aria-label={ariaLabel}>
        {data.map((d) => (
          <div key={d.hour} className="group relative">
            <div
              className="h-9 rounded-md border border-border transition-transform duration-200 group-hover:scale-[1.06]"
              style={{
                background: `color-mix(in srgb, var(--primary) ${Math.round(
                  (d.score / max) * 88 + 6
                )}%, var(--card))`,
              }}
            />
            <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold shadow-[var(--shadow-md)] group-hover:block">
              {String(d.hour).padStart(2, "0")}:00 · {d.score}
            </span>
            <span className="mt-1 block text-center text-[9px] font-medium text-muted-foreground">
              {String(d.hour).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Low</span>
        <span className="h-2 w-24 rounded-full bg-[linear-gradient(90deg,var(--muted),var(--primary))]" />
        <span>Peak engagement</span>
      </div>
    </div>
  );
}

export function HBar({
  rows,
  ariaLabel,
}: {
  rows: { label: string; value: number; tone?: string }[];
  ariaLabel: string;
}) {
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  return (
    <ul className="flex flex-col gap-3" aria-label={ariaLabel}>
      {rows.map((r) => (
        <li key={r.label} className="text-[13px]">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="font-semibold tabular-nums">{r.value.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${(r.value / max) * 100}%`,
                background: r.tone ?? "var(--primary)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
