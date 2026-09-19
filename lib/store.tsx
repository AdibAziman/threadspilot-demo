"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ActivityItem,
  Analytics,
  AutomationRule,
  Connection,
  InboxItem,
  PoolItem,
  Post,
  PostStatus,
  Settings,
  Slot,
  TeamMember,
  User,
  VoiceProfile,
} from "./types";
import {
  ACTIVITY,
  ANALYTICS,
  CONNECTION,
  DEFAULT_SETTINGS,
  DEMO_USER,
  INBOX,
  POOL,
  POSTS,
  RULES,
  SLOTS,
  TEAM,
  VOICE,
} from "./seed";
import { seeded, uid } from "./utils";

const KEY = "threadspilot.demo.v1";

type Toast = { id: string; title: string; body?: string; tone: "ok" | "warn" | "error" | "info" };

type State = {
  user: User | null;
  posts: Post[];
  slots: Slot[];
  pool: PoolItem[];
  inbox: InboxItem[];
  rules: AutomationRule[];
  voice: VoiceProfile;
  team: TeamMember[];
  activity: ActivityItem[];
  analytics: Analytics;
  connection: Connection;
  settings: Settings;
};

const initialState = (): State => ({
  user: null,
  posts: POSTS,
  slots: SLOTS,
  pool: POOL,
  inbox: INBOX,
  rules: RULES,
  voice: VOICE,
  team: TEAM,
  activity: ACTIVITY,
  analytics: ANALYTICS,
  connection: CONNECTION,
  settings: DEFAULT_SETTINGS,
});

type Ctx = State & {
  ready: boolean;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetDemo: () => void;
  savePost: (post: Post) => void;
  deletePost: (id: string) => void;
  duplicatePost: (id: string) => void;
  setPostStatus: (id: string, status: PostStatus) => void;
  publishNow: (id: string) => void;
  retryPost: (id: string) => void;
  reschedule: (id: string, iso: string) => void;
  addSlot: (slot: Omit<Slot, "id">) => void;
  toggleSlot: (id: string) => void;
  deleteSlot: (id: string) => void;
  addPoolItem: (text: string, category: string) => void;
  removePoolItem: (id: string) => void;
  queueFromPool: (id: string) => void;
  refreshInbox: (id: string, draft: string) => void;
  markInboxRead: (id: string) => void;
  sendInboxReply: (id: string) => void;
  markAllInboxRead: () => void;
  toggleRule: (id: string) => void;
  addRule: (rule: Omit<AutomationRule, "id" | "usedToday">) => void;
  deleteRule: (id: string) => void;
  updateVoice: (patch: Partial<VoiceProfile>) => void;
  addVoiceSample: (sample: string) => void;
  removeVoiceSample: (index: number) => void;
  inviteMember: (member: Omit<TeamMember, "id" | "status" | "avatarHue">) => void;
  removeMember: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (theme: Settings["theme"]) => void;
  connectThreads: () => Promise<void>;
  refreshToken: () => void;
  generateDrafts: (count: number) => Promise<string[]>;
};

const StoreContext = createContext<Ctx | null>(null);

function persist(state: State) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota — demo data is small, ignore */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initialState(), ...(JSON.parse(raw) as State) });
    } catch {
      /* corrupt payload — fall back to seed */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) persist(state);
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state.settings.theme, ready]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid();
    setToasts((prev) => [...prev, { ...t, id }].slice(-3));
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const patch = useCallback((fn: (s: State) => State) => setState(fn), []);

  const logActivity = useCallback(
    (actor: string, action: string, target: string, status: ActivityItem["status"] = "ok") => {
      patch((s) => ({
        ...s,
        activity: [
          { id: uid(), at: new Date().toISOString(), actor, action, target, status },
          ...s.activity,
        ].slice(0, 40),
      }));
    },
    [patch]
  );

  /* ---- simulated publisher: makes the demo feel alive ---- */
  const publishPost = useCallback(
    (id: string, viaAutomation = true) => {
      patch((s) => ({
        ...s,
        posts: s.posts.map((p) => (p.id === id ? { ...p, status: "publishing" as PostStatus } : p)),
      }));
      setTimeout(() => {
        patch((s) => {
          const target = s.posts.find((p) => p.id === id);
          if (!target) return s;
          const r = seeded(new Date().getMinutes() + target.text.length);
          const ok = !target.text.toLowerCase().includes("fail");
          return {
            ...s,
            posts: s.posts.map((p) =>
              p.id === id
                ? ok
                  ? {
                      ...p,
                      status: "published" as PostStatus,
                      publishedAt: new Date().toISOString(),
                      error: null,
                      metrics: {
                        likes: 12 + Math.floor(r() * 60),
                        replies: 1 + Math.floor(r() * 12),
                        reposts: Math.floor(r() * 8),
                        views: 400 + Math.floor(r() * 3000),
                      },
                    }
                  : {
                      ...p,
                      status: "failed" as PostStatus,
                      error: "Threads API 429 — publishing rate limit reached. Retry scheduled.",
                    }
                : p
            ),
            connection: ok
              ? { ...s.connection, postQuotaUsed: Math.min(s.connection.postQuotaUsed + 1, 250) }
              : s.connection,
            activity: [
              {
                id: uid(),
                at: new Date().toISOString(),
                actor: viaAutomation ? "Scheduler" : "You",
                action: ok ? "published" : "publish failed",
                target: target.text.slice(0, 48),
                status: ok ? ("ok" as const) : ("error" as const),
              },
              ...s.activity,
            ].slice(0, 40),
          };
        });
        toast(
          viaAutomation
            ? { title: "Queue fired", body: "Post published to Threads.", tone: "ok" }
            : { title: "Published", body: "Post is live on Threads.", tone: "ok" }
        );
      }, 1400);
    },
    [patch, toast]
  );

  const tickRef = useRef(false);
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      if (tickRef.current) return;
      tickRef.current = true;
      try {
        setState((s) => {
          if (!s.settings.guardrails.autoPublish) return s;
          const now = Date.now();
          const due = s.posts.filter(
            (p) =>
              (p.status === "scheduled" || p.status === "queued") &&
              p.scheduledAt &&
              new Date(p.scheduledAt).getTime() <= now
          );
          if (due.length === 0) return s;
          const next = due[0];
          setTimeout(() => publishPost(next.id), 60);
          return {
            ...s,
            posts: s.posts.map((p) =>
              p.id === next.id ? { ...p, status: "publishing" as PostStatus } : p
            ),
          };
        });
      } finally {
        tickRef.current = false;
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [ready, publishPost]);

  const api = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      toasts,
      toast,
      dismissToast,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 700));
        if (!email.includes("@") || password.length < 4) return false;
        patch((s) => ({ ...s, user: { ...DEMO_USER, email } }));
        return true;
      },
      register: async (name, email, password) => {
        await new Promise((r) => setTimeout(r, 900));
        if (!name || !email.includes("@") || password.length < 4) return false;
        patch((s) => ({ ...s, user: { ...DEMO_USER, name, email } }));
        return true;
      },
      logout: () => patch((s) => ({ ...s, user: null })),
      resetDemo: () => {
        setState(initialState());
        toast({ title: "Demo data reset", tone: "info" });
      },

      savePost: (post) =>
        patch((s) => {
          const exists = s.posts.some((p) => p.id === post.id);
          return {
            ...s,
            posts: exists ? s.posts.map((p) => (p.id === post.id ? post : p)) : [post, ...s.posts],
          };
        }),
      deletePost: (id) => {
        patch((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) }));
        toast({ title: "Post deleted", tone: "info" });
      },
      duplicatePost: (id) => {
        patch((s) => {
          const src = s.posts.find((p) => p.id === id);
          if (!src) return s;
          const copy: Post = {
            ...src,
            id: `p_${uid()}`,
            status: "draft",
            publishedAt: null,
            metrics: undefined,
            createdAt: new Date().toISOString(),
            text: src.text,
          };
          return { ...s, posts: [copy, ...s.posts] };
        });
        toast({ title: "Duplicated as draft", tone: "info" });
      },
      setPostStatus: (id, status) => {
        patch((s) => ({
          ...s,
          posts: s.posts.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
        logActivity(
          "You",
          status === "needs_approval" ? "submitted for review" : `marked ${status}`,
          id
        );
        toast({
          title:
            status === "needs_approval"
              ? "Sent for approval"
              : status === "rejected"
                ? "Rejected"
                : "Status updated",
          body: status === "needs_approval" ? "Hafiz Rosli will review it." : undefined,
          tone: status === "rejected" ? "warn" : "ok",
        });
      },
      publishNow: (id) => publishPost(id, false),
      retryPost: (id) => {
        publishPost(id, false);
        toast({ title: "Retrying", body: "Attempt 2 of 3.", tone: "info" });
      },
      reschedule: (id, iso) => {
        patch((s) => ({
          ...s,
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, scheduledAt: iso, status: "scheduled", error: null } : p
          ),
        }));
        toast({ title: "Rescheduled", tone: "ok" });
      },

      addSlot: (slot) =>
        patch((s) => ({ ...s, slots: [...s.slots, { ...slot, id: `s_${uid()}` }] })),
      toggleSlot: (id) =>
        patch((s) => ({
          ...s,
          slots: s.slots.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)),
        })),
      deleteSlot: (id) =>
        patch((s) => ({ ...s, slots: s.slots.filter((x) => x.id !== id) })),

      addPoolItem: (text, category) => {
        patch((s) => ({ ...s, pool: [{ id: `pl_${uid()}`, text, category, used: false }, ...s.pool] }));
        toast({ title: "Added to content pool", tone: "ok" });
      },
      removePoolItem: (id) =>
        patch((s) => ({ ...s, pool: s.pool.filter((p) => p.id !== id) })),
      queueFromPool: (id) => {
        patch((s) => {
          const item = s.pool.find((p) => p.id === id);
          if (!item) return s;
          const when = new Date(Date.now() + 86400000 * 2);
          when.setHours(9, 0, 0, 0);
          const post: Post = {
            id: `p_${uid()}`,
            text: item.text,
            thread: [],
            scheduledAt: when.toISOString(),
            status: "scheduled",
            tags: [item.category.toLowerCase().replace(" ", "-")],
            author: s.user?.name ?? "Adib Aziman",
            createdAt: new Date().toISOString(),
            publishedAt: null,
          };
          return {
            ...s,
            posts: [post, ...s.posts],
            pool: s.pool.map((p) => (p.id === id ? { ...p, used: true } : p)),
          };
        });
        toast({ title: "Queued", body: "Pool item scheduled for the next morning slot.", tone: "ok" });
      },

      refreshInbox: (id, draft) =>
        patch((s) => ({
          ...s,
          inbox: s.inbox.map((i) => (i.id === id ? { ...i, aiDraft: draft } : i)),
        })),
      markInboxRead: (id) =>
        patch((s) => ({
          ...s,
          inbox: s.inbox.map((i) => (i.id === id ? { ...i, unread: false } : i)),
        })),
      sendInboxReply: (id) => {
        patch((s) => ({
          ...s,
          inbox: s.inbox.map((i) => (i.id === id ? { ...i, replied: true, unread: false } : i)),
        }));
        logActivity("You", "replied", "inbox");
        toast({ title: "Reply sent", body: "Posted as a threaded reply.", tone: "ok" });
      },
      markAllInboxRead: () =>
        patch((s) => ({ ...s, inbox: s.inbox.map((i) => ({ ...i, unread: false })) })),

      toggleRule: (id) => {
        patch((s) => ({
          ...s,
          rules: s.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
        }));
        toast({ title: "Automation updated", tone: "info" });
      },
      addRule: (rule) => {
        patch((s) => ({
          ...s,
          rules: [...s.rules, { ...rule, id: `r_${uid()}`, usedToday: 0 }],
        }));
        toast({ title: "Rule created", body: "Runs inside your guardrails.", tone: "ok" });
      },
      deleteRule: (id) => patch((s) => ({ ...s, rules: s.rules.filter((r) => r.id !== id) })),

      updateVoice: (p) => patch((s) => ({ ...s, voice: { ...s.voice, ...p } })),
      addVoiceSample: (sample) =>
        patch((s) => ({ ...s, voice: { ...s.voice, samples: [sample, ...s.voice.samples] } })),
      removeVoiceSample: (index) =>
        patch((s) => ({
          ...s,
          voice: { ...s.voice, samples: s.voice.samples.filter((_, i) => i !== index) },
        })),

      inviteMember: (member) => {
        patch((s) => ({
          ...s,
          team: [
            ...s.team,
            { ...member, id: `t_${uid()}`, status: "invited", avatarHue: Math.floor(Math.random() * 360) },
          ],
        }));
        toast({ title: "Invite sent", body: `${member.email} can join after accepting.`, tone: "ok" });
      },
      removeMember: (id) => patch((s) => ({ ...s, team: s.team.filter((m) => m.id !== id) })),

      updateSettings: (p) => patch((s) => ({ ...s, settings: { ...s.settings, ...p } })),
      setTheme: (theme) => patch((s) => ({ ...s, settings: { ...s.settings, theme } })),

      connectThreads: async () => {
        await new Promise((r) => setTimeout(r, 1600));
        patch((s) => ({
          ...s,
          connection: {
            ...CONNECTION,
            connected: true,
            tokenExpiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
          },
        }));
        logActivity("Connection", "authorised Threads account", "@adib.builds");
        toast({ title: "Threads connected", body: "60 day token issued.", tone: "ok" });
      },
      refreshToken: () => {
        patch((s) => ({
          ...s,
          connection: {
            ...s.connection,
            tokenExpiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
          },
        }));
        toast({ title: "Token refreshed", body: "Valid for another 60 days.", tone: "ok" });
      },
      generateDrafts: async (count) => {
        await new Promise((r) => setTimeout(r, 1100));
        const r = seeded(count * 7 + new Date().getSeconds());
        const pool = [
          "Queue first, write second.\n\nThe blank page is easier when the slot already exists and the only job left is filling it.",
          "A post that fails at 9am should not wait for a human at 9am.\n\nAlert, retry, escalate. In that order.",
          "People ask how we keep a 3x a week cadence without burning out.\n\nWe do not write posts. We fill slots that were decided last month.",
          "The best growth lever nobody talks about: fewer drafts, shorter review loops, faster ship.\n\nSpeed beats polish when the feedback loop is weekly.",
        ];
        const out: string[] = [];
        for (let i = 0; i < count; i++) out.push(pool[Math.floor(r() * pool.length)]);
        return out;
      },
    }),
    [state, ready, toasts, toast, dismissToast, patch, logActivity, publishPost]
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
