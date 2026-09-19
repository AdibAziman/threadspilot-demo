"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Moon,
  PenSquare,
  Plus,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Users,
  Workflow,
  X,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Avatar, Button, Chip } from "./ui";

export const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, group: "Publish" },
  { href: "/app/composer", label: "Composer", icon: PenSquare, group: "Publish" },
  { href: "/app/queue", label: "Queue", icon: ListOrdered, group: "Publish" },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays, group: "Publish" },
  { href: "/app/inbox", label: "Inbox", icon: Inbox, group: "Engage" },
  { href: "/app/automation", label: "Automation", icon: Workflow, group: "Engage" },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3, group: "Insight" },
  { href: "/app/voice", label: "Brand voice", icon: Sparkles, group: "Insight" },
  { href: "/app/connections", label: "Connections", icon: Link2, group: "Workspace" },
  { href: "/app/team", label: "Team", icon: Users, group: "Workspace" },
  { href: "/app/billing", label: "Plan & billing", icon: CreditCard, group: "Workspace" },
  { href: "/app/settings", label: "Settings", icon: SettingsIcon, group: "Workspace" },
];

const GROUPS = ["Publish", "Engage", "Insight", "Workspace"];
const MOBILE = ["/app", "/app/composer", "/app/queue", "/app/calendar", "/app/inbox"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, connection, settings, setTheme, inbox, posts } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");

  const unread = inbox.filter((i) => i.unread).length;
  const dueCount = posts.filter((p) => p.status === "needs_approval").length;

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(
    () =>
      NAV.filter((n) => n.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 7),
    [query]
  );

  const nav = (
    <nav className="flex flex-col gap-5" aria-label="Main">
      {GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground">
            {group}
          </p>
          <ul className="flex flex-col gap-0.5">
            {NAV.filter((n) => n.group === group).map((item) => {
              const active = pathname === item.href;
              const badge =
                item.href === "/app/inbox" ? unread : item.href === "/app/queue" ? dueCount : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-semibold transition-colors duration-200",
                      active
                        ? "bg-[var(--primary)] text-[var(--on-primary)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{item.label}</span>
                    {badge > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[11px] font-bold",
                          active ? "bg-white/25" : "bg-[var(--primary)] text-[var(--on-primary)]"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh">
      {/* demo ribbon */}
      <div className="flex items-center justify-center gap-2 bg-[var(--foreground)] px-3 py-1.5 text-center text-[11.5px] font-semibold text-[var(--background)]">
        <span className="pulse-dot size-1.5 rounded-full bg-[var(--primary)]" aria-hidden />
        Demo workspace · sample data only · nothing is published to a real Threads account
      </div>

      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-card/70 px-3 py-4 lg:flex">
          <Link href="/app" className="mb-5 flex items-center gap-2 px-1">
            <Logo />
          </Link>
          <div className="flex-1 overflow-y-auto scroll-thin pr-1">{nav}</div>
          <div className="mt-3 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  connection.health === "healthy" ? "bg-[var(--success)]" : "bg-[var(--warn)]"
                )}
                aria-hidden
              />
              <span className="truncate text-[12px] font-semibold">{connection.handle}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {connection.postQuotaUsed}/{connection.postQuotaTotal} posts · quota resets daily
            </p>
          </div>
        </aside>

        {/* main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
            <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
              <button
                onClick={() => setDrawer(true)}
                aria-label="Open navigation"
                className="btn btn-ghost btn-icon lg:hidden"
              >
                <Menu className="size-5" aria-hidden />
              </button>
              <Link href="/app" className="flex min-w-0 items-center gap-2 lg:hidden">
                <Logo compact />
              </Link>

              <button
                onClick={() => setPalette(true)}
                className="hidden min-h-10 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-left text-[13px] text-muted-foreground transition-colors duration-200 hover:border-[var(--primary)] sm:flex lg:max-w-md"
              >
                <Search className="size-4" aria-hidden />
                <span className="flex-1">Search or jump to…</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                  ⌘K
                </kbd>
              </button>

              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <Button
                  variant="brand"
                  size="sm"
                  className="hidden sm:inline-flex"
                  icon={<Plus className="size-4" aria-hidden />}
                  onClick={() => router.push("/app/composer")}
                >
                  New post
                </Button>
                <button
                  onClick={() => setTheme(settings.theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle colour theme"
                  className="btn btn-ghost btn-icon"
                >
                  {settings.theme === "dark" ? (
                    <Sun className="size-4.5" aria-hidden />
                  ) : (
                    <Moon className="size-4.5" aria-hidden />
                  )}
                </button>
                <Link href="/app/inbox" className="btn btn-ghost btn-icon relative" aria-label="Notifications">
                  <Bell className="size-4.5" aria-hidden />
                  {unread > 0 && (
                    <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--primary)]" />
                  )}
                </Link>
                <div className="relative">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-1 py-1 transition-colors duration-200 hover:bg-muted">
                      <Avatar name={user?.name ?? "Demo"} hue={user?.avatarHue ?? 344} size={32} />
                      <span className="hidden text-left sm:block">
                        <span className="block text-[12.5px] font-semibold leading-tight">
                          {user?.name ?? "Demo user"}
                        </span>
                        <span className="block text-[11px] leading-tight text-muted-foreground">
                          {user?.plan ?? "Growth"} plan
                        </span>
                      </span>
                    </summary>
                    <div className="pop absolute right-0 z-40 mt-2 hidden w-56 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-lg)] group-open:block">
                      <div className="px-2 py-1.5">
                        <p className="text-[13px] font-semibold">{user?.workspace}</p>
                        <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                      </div>
                      <hr className="my-1.5 border-border" />
                      <Link
                        href="/app/settings"
                        className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-medium hover:bg-muted"
                      >
                        <SettingsIcon className="size-4" aria-hidden /> Settings
                      </Link>
                      <Link
                        href="/app/billing"
                        className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-medium hover:bg-muted"
                      >
                        <CreditCard className="size-4" aria-hidden /> Plan & billing
                      </Link>
                      <hr className="my-1.5 border-border" />
                      <button
                        onClick={() => {
                          logout();
                          router.push("/login");
                        }}
                        className="flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-[13px] font-medium text-[var(--destructive)] hover:bg-muted"
                      >
                        <LogOut className="size-4" aria-hidden /> Sign out
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-3 pb-28 pt-4 sm:px-5 lg:pb-10">{children}</main>
        </div>
      </div>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="pop relative h-full w-[82%] max-w-xs overflow-y-auto scroll-thin bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button onClick={() => setDrawer(false)} aria-label="Close navigation" className="btn btn-ghost btn-icon">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            {nav}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              icon={<LogOut className="size-4" aria-hidden />}
            >
              Sign out
            </Button>
          </div>
        </div>
      )}

      {/* mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {NAV.filter((n) => MOBILE.includes(n.href)).map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-colors duration-200",
                    active ? "text-[var(--primary)]" : "text-muted-foreground"
                  )}
                  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                  <item.icon className="size-5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setDrawer(true)}
              className="flex min-h-[56px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold text-muted-foreground"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <Menu className="size-5" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* command palette */}
      {palette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setPalette(false)}>
          <div
            className="pop w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="size-4 text-muted-foreground" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page…"
                aria-label="Search pages"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
              />
              <Chip>Esc</Chip>
            </div>
            <ul className="max-h-72 overflow-y-auto scroll-thin p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                  Nothing matches “{query}”.
                </li>
              )}
              {results.map((r) => (
                <li key={r.href}>
                  <button
                    onClick={() => {
                      setPalette(false);
                      setQuery("");
                      router.push(r.href);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-150 hover:bg-muted"
                  >
                    <r.icon className="size-4 text-[var(--primary)]" aria-hidden />
                    {r.label}
                    <span className="ml-auto text-[11px] text-muted-foreground">{r.group}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-[var(--foreground)] text-[var(--background)]">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="text-[15px] font-extrabold tracking-tight">
        Threads<span className="text-[var(--primary)]">Pilot</span>
        {!compact && (
          <span className="ml-1.5 rounded bg-muted px-1 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            demo
          </span>
        )}
      </span>
    </span>
  );
}
