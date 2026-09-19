"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Check, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

/* ---------------- primitives ---------------- */

export function Card({
  className,
  children,
  interactive,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div className={cn("card p-4 sm:p-5", interactive && "card-interactive", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="flex min-w-0 flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "brand" | "outline" | "ghost";
  size?: "md" | "sm";
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "brand" && "btn-brand",
        variant === "outline" && "btn-outline",
        variant === "ghost" && "btn-ghost",
        size === "sm" && "btn-sm",
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_30%,transparent)]",
  scheduled: "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
  queued: "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_26%,transparent)]",
  publishing: "bg-[color-mix(in_srgb,var(--warn)_16%,transparent)] text-[var(--warn)] border-[color-mix(in_srgb,var(--warn)_30%,transparent)]",
  draft: "bg-muted text-muted-foreground border-border",
  needs_approval: "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)] border-[color-mix(in_srgb,var(--primary)_30%,transparent)]",
  rejected: "bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-[var(--destructive)] border-[color-mix(in_srgb,var(--destructive)_28%,transparent)]",
  failed: "bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-[var(--destructive)] border-[color-mix(in_srgb,var(--destructive)_28%,transparent)]",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn("chip", STATUS_STYLES[status] ?? STATUS_STYLES.draft, className)}>
      {status === "publishing" && (
        <span className="pulse-dot size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {label}
    </span>
  );
}

export function Chip({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "brand" | "accent" | "success" | "warn";
}) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground border-border",
    brand: "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] border-[color-mix(in_srgb,var(--primary)_28%,transparent)]",
    accent: "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_28%,transparent)]",
    success: "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_28%,transparent)]",
    warn: "bg-[color-mix(in_srgb,var(--warn)_14%,transparent)] text-[var(--warn)] border-[color-mix(in_srgb,var(--warn)_28%,transparent)]",
  };
  return <span className={cn("chip", tones[tone], className)}>{children}</span>;
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[var(--destructive)]">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </span>
      ) : (
        hint && <span className="mt-1.5 block text-[12px] text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      {label && (
        <div className="min-w-0">
          <label htmlFor={id} className="block text-[13px] font-semibold cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label ?? "toggle"}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200",
          checked ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-muted border-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4.5 rounded-full bg-white shadow-sm transition-all duration-200",
            checked ? "left-[22px]" : "left-0.5"
          )}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  );
}

export function Avatar({
  name,
  hue = 344,
  size = 36,
}: {
  name: string;
  hue?: number;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 40) % 360} 68% 40%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Progress({
  value,
  max = 100,
  tone = "brand",
  className,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "accent" | "success" | "warn" | "destructive";
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const tones: Record<string, string> = {
    brand: "var(--primary)",
    accent: "var(--accent)",
    success: "var(--success)",
    warn: "var(--warn)",
    destructive: "var(--destructive)",
  };
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, background: tones[tone] }}
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "pop max-h-[92vh] w-full overflow-y-auto scroll-thin rounded-t-2xl bg-card p-5 shadow-[var(--shadow-xl)] outline-none sm:rounded-2xl sm:p-6",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[17px] font-bold">{title}</h3>
            {description && (
              <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn btn-ghost btn-icon shrink-0"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex max-w-full min-w-0 gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 scroll-thin"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors duration-200",
            active === t.id
              ? "bg-[var(--primary)] text-[var(--on-primary)]"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px]",
                active === t.id ? "bg-white/25" : "bg-muted"
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  const positive = delta?.startsWith("+");
  return (
    <Card interactive className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-[var(--primary)]">{icon}</span>}
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {delta && (
          <span
            className={cn(
              "text-[12px] font-bold",
              positive ? "text-[var(--success)]" : "text-[var(--destructive)]"
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

/* ---------------- toasts ---------------- */

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  const icons = {
    ok: <Check className="size-4" aria-hidden />,
    warn: <TriangleAlert className="size-4" aria-hidden />,
    error: <AlertCircle className="size-4" aria-hidden />,
    info: <Info className="size-4" aria-hidden />,
  };
  const tones = {
    ok: "var(--success)",
    warn: "var(--warn)",
    error: "var(--destructive)",
    info: "var(--accent)",
  };
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-20 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-80"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pop pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-lg)]"
        >
          <span
            className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white"
            style={{ background: tones[t.tone] }}
          >
            {icons[t.tone]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[12px] text-muted-foreground">{t.body}</p>}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useCopy() {
  const [copied, setCopied] = useState(false);
  return {
    copied,
    copy: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* clipboard blocked in insecure context */
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    },
  };
}
