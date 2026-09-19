import clsx, { type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const uid = () => Math.random().toString(36).slice(2, 10);

export const TZ = "Asia/Kuala_Lumpur";

/** Deterministic pseudo-random generator so dummy data never changes between reloads. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function fmtDate(iso: string, tz = TZ) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: tz,
  });
}

export function fmtTime(iso: string, tz = TZ) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

export function fmtDateTime(iso: string, tz = TZ) {
  return `${fmtDate(iso, tz)} · ${fmtTime(iso, tz)}`;
}

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return mins > 0 ? `${mins}m ago` : `in ${-mins}m`;
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return hrs > 0 ? `${hrs}h ago` : `in ${-hrs}h`;
  const days = Math.round(hrs / 24);
  return days > 0 ? `${days}d ago` : `in ${-days}d`;
}

export function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "due now";
  const mins = Math.floor(diff / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function localInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function nextDateAtTime(time: string, days: number[]) {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(h, m, 0, 0);
    if (days.includes(d.getDay()) && d.getTime() > now.getTime()) return d;
  }
  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 1);
  fallback.setHours(h, m, 0, 0);
  return fallback;
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export function charBudget(text: string) {
  const used = new TextEncoder().encode(text).length;
  return { used, limit: 500, left: 500 - used, over: used > 500 };
}
