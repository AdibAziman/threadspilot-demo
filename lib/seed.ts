import type {
  ActivityItem,
  Analytics,
  AutomationRule,
  Connection,
  InboxItem,
  PoolItem,
  Post,
  Settings,
  Slot,
  TeamMember,
  User,
  VoiceProfile,
} from "./types";
import { seeded } from "./utils";

const rnd = seeded(20260919);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const hours = (n: number) => n * 3600 * 1000;
const days = (n: number) => new Date(Date.now() + n * 86400000);
const at = (dayOffset: number, hour: number, minute = 0) => {
  const d = days(dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const DEMO_USER: User = {
  name: "Adib Aziman",
  email: "demo@threadspilot.app",
  workspace: "Kuching Growth Studio",
  plan: "Growth",
  avatarHue: 344,
};

export const CONNECTION: Connection = {
  connected: true,
  handle: "@adib.builds",
  displayName: "Adib | builder & trader",
  avatarHue: 344,
  followers: 12480,
  tokenExpiresAt: new Date(Date.now() + hours(912)).toISOString(),
  scopes: ["threads_basic", "threads_content_publish", "threads_manage_replies", "threads_read_replies"],
  postQuotaUsed: 38,
  postQuotaTotal: 250,
  replyQuotaUsed: 143,
  replyQuotaTotal: 1000,
  health: "healthy",
};

const POST_BODIES = [
  "Most traders lose because they optimise entries and ignore exits.\n\nThree years of logs say the same thing: the edge is in the exit rule, not the signal.",
  "Shipped a backtest sweep across 4 years of XAUUSD ticks today.\n\nSame strategy. 11% difference in profit factor just from spread assumptions.\n\nBacktest hygiene > parameter hunting.",
  "Client asked why the content calendar felt heavy.\n\nAnswer: we were writing for the algorithm instead of one person. Cut the posting volume by half. Engagement went up 42%.",
  "Automation is not about posting more.\n\nIt is about never missing the window when your audience is actually awake.",
  "Small build log: a scheduler that respects rate limits, retries failures, and never double-posts.\n\nBoring infra. That is the point.",
  "Reading your own analytics for an hour beats reading three growth threads.\n\nYour audience is not a generic audience.",
  "Unpopular take: AI drafts should never publish themselves.\n\nDraft, review, approve, then automate. That is the only version of this that survives a brand.",
  "3 posts a week, written properly, beats 3 posts a day written badly.\n\nConsistency is a quality claim, not a frequency claim.",
  "We moved the whole queue to one calendar view and cut scheduling time from 90 minutes to 12.\n\nFewer tools, fewer tabs, fewer mistakes.",
  "Threads rewards replies, not broadcasts.\n\nIf your queue has no reply step in it, you are leaving the easiest reach on the table.",
  "Reminder that a failed post at 9am should never need a human at 9am to notice it.\n\nAlert, retry, escalate. In that order.",
  "The best time to post is the time you will still be posting at in six months.",
];

const CATEGORIES = ["Build log", "Trading", "Client work", "Opinion", "Lesson", "Announcement"];

function makePost(i: number, status: Post["status"], dayOffset: number, hour: number): Post {
  const text = POST_BODIES[i % POST_BODIES.length];
  const isThread = i % 6 === 3;
  return {
    id: `p_${i}`,
    text,
    mediaUrl: i % 5 === 2 ? "chart.png" : null,
    thread: isThread
      ? ["Second part of the breakdown.", "Closing thought: ship smaller, ship more often."]
      : [],
    scheduledAt: at(dayOffset, hour, (i * 7) % 60),
    status,
    slotId: i % 4 === 0 ? "s_1" : i % 4 === 1 ? "s_2" : null,
    tags: [pick(CATEGORIES).toLowerCase().replace(" ", "-"), "buildinpublic"],
    linkUrl: i % 5 === 0 ? "https://threadspilot.app/blog/queue-first" : null,
    firstComment: i % 5 === 0 ? "Full writeup with the numbers is in the link." : null,
    author: i % 7 === 5 ? "Nadia (Editor)" : "Adib Aziman",
    approver: i % 7 === 5 ? "Adib Aziman" : null,
    error:
      status === "failed"
        ? "Threads API 429 — publishing rate limit reached. Retry scheduled in 42 min."
        : null,
    metrics:
      status === "published"
        ? {
            likes: 40 + Math.floor(rnd() * 900),
            replies: 5 + Math.floor(rnd() * 120),
            reposts: 2 + Math.floor(rnd() * 80),
            views: 1800 + Math.floor(rnd() * 42000),
          }
        : undefined,
    createdAt: at(dayOffset - 3, 9 + (i % 6)),
    publishedAt: status === "published" ? at(dayOffset, hour) : null,
  };
}

export const POSTS: Post[] = [
  makePost(0, "published", -14, 9),
  makePost(1, "published", -13, 13),
  makePost(2, "published", -12, 20),
  makePost(3, "published", -10, 8),
  makePost(4, "published", -9, 12),
  makePost(5, "published", -8, 19),
  makePost(6, "published", -7, 9),
  makePost(7, "published", -6, 13),
  makePost(8, "published", -5, 20),
  makePost(9, "published", -4, 10),
  makePost(10, "published", -3, 13),
  makePost(11, "published", -2, 9),
  makePost(12, "failed", -1, 13),
  makePost(13, "scheduled", 1, 9),
  makePost(14, "scheduled", 2, 13),
  makePost(15, "scheduled", 3, 20),
  makePost(16, "needs_approval", 4, 9),
  makePost(17, "needs_approval", 5, 13),
  makePost(18, "queued", 6, 20),
  makePost(19, "draft", 8, 9),
  makePost(20, "scheduled", 9, 13),
  makePost(21, "draft", 11, 20),
  makePost(22, "scheduled", 13, 9),
  makePost(23, "rejected", 14, 13),
];

export const SLOTS: Slot[] = [
  {
    id: "s_1",
    label: "Morning build log",
    days: [1, 2, 3, 4, 5],
    time: "09:00",
    category: "Build log",
    enabled: true,
    source: "auto",
  },
  {
    id: "s_2",
    label: "Midday lesson",
    days: [1, 3, 5],
    time: "13:00",
    category: "Lesson",
    enabled: true,
    source: "auto",
  },
  {
    id: "s_3",
    label: "Evening opinion",
    days: [0, 2, 4, 6],
    time: "20:00",
    category: "Opinion",
    enabled: true,
    source: "manual",
  },
  {
    id: "s_4",
    label: "Weekend recap",
    days: [0, 6],
    time: "11:30",
    category: "Client work",
    enabled: false,
    source: "manual",
  },
];

export const POOL: PoolItem[] = [
  { id: "pl_1", text: "Why we cap automation at 250 posts a day before the API does.", category: "Build log", used: false },
  { id: "pl_2", text: "Three reasons a post fails silently, and the retry rule that fixes each one.", category: "Lesson", used: false },
  { id: "pl_3", text: "The 500 character ceiling is a feature. Here is how we write inside it.", category: "Opinion", used: false },
  { id: "pl_4", text: "Trading journal to content calendar: the same discipline, different output.", category: "Trading", used: true },
  { id: "pl_5", text: "Client case study: 3 posts a week, 42% more replies.", category: "Client work", used: false },
  { id: "pl_6", text: "What we learned from 90 days of scheduling in the open.", category: "Build log", used: false },
];

export const INBOX: InboxItem[] = [
  {
    id: "i_1",
    author: "Farah Idris",
    handle: "@farahbuilds",
    avatarHue: 12,
    text: "How do you handle the 500 character limit when a thread needs more?",
    receivedAt: new Date(Date.now() - hours(2)).toISOString(),
    sentiment: "question",
    unread: true,
    replied: false,
    aiDraft:
      "We split it into a chain instead of trimming the point. Slot one carries the claim, the rest carry the proof. Keeps every post readable on its own.",
    postRef: "The 500 character ceiling is a feature",
  },
  {
    id: "i_2",
    author: "Marcus Tan",
    handle: "@marcustrades",
    avatarHue: 210,
    text: "The spread assumption point is underrated. Most backtests I see are fantasy.",
    receivedAt: new Date(Date.now() - hours(5)).toISOString(),
    sentiment: "positive",
    unread: true,
    replied: false,
    aiDraft:
      "Exactly. Same strategy, different spread model, 11% swing in profit factor. The assumption is the strategy.",
    postRef: "Shipped a backtest sweep across 4 years",
  },
  {
    id: "i_3",
    author: "Priya Raman",
    handle: "@priyawrites",
    avatarHue: 280,
    text: "Do you ever let AI publish without review?",
    receivedAt: new Date(Date.now() - hours(9)).toISOString(),
    sentiment: "question",
    unread: false,
    replied: true,
    aiDraft:
      "No. Draft, review, approve, then automate the rest. The automation is the schedule, not the judgement.",
    postRef: "AI drafts should never publish themselves",
  },
  {
    id: "i_4",
    author: "Daniel Wong",
    handle: "@danwongdev",
    avatarHue: 150,
    text: "Any chance you open the calendar view as a template?",
    receivedAt: new Date(Date.now() - hours(20)).toISOString(),
    sentiment: "positive",
    unread: false,
    replied: false,
    aiDraft:
      "Working on it. The slot model is the useful part, not the layout. Will share once the slots are configurable end to end.",
    postRef: "We moved the whole queue to one calendar view",
  },
  {
    id: "i_5",
    author: "Aisyah Rahman",
    handle: "@aisyah.studio",
    avatarHue: 320,
    text: "This looks like more moving parts than posting manually.",
    receivedAt: new Date(Date.now() - hours(28)).toISOString(),
    sentiment: "negative",
    unread: false,
    replied: false,
    aiDraft:
      "Fair. Setup is about 20 minutes, then it runs without you. If you post twice a week, manual is genuinely fine. Past five posts a week is where this pays for itself.",
    postRef: "Automation is not about posting more",
  },
];

export const RULES: AutomationRule[] = [
  {
    id: "r_1",
    name: "Support indie builders",
    trigger: "keyword",
    target: "build in public, indie founder, shipped",
    actions: ["like", "reply"],
    dailyCap: 30,
    usedToday: 12,
    enabled: true,
    quietHours: "23:00–07:00",
  },
  {
    id: "r_2",
    name: "Trade journal crowd",
    trigger: "topic",
    target: "XAUUSD, backtest, prop firm",
    actions: ["like", "reply", "quote"],
    dailyCap: 20,
    usedToday: 19,
    enabled: true,
    quietHours: "23:00–07:00",
  },
  {
    id: "r_3",
    name: "Reply to every question on own posts",
    trigger: "account",
    target: "own posts",
    actions: ["reply"],
    dailyCap: 50,
    usedToday: 23,
    enabled: true,
    quietHours: "Off",
  },
  {
    id: "r_4",
    name: "Amplify Malaysian tech accounts",
    trigger: "account",
    target: "@mytectwitter, @kualalumpurdev",
    actions: ["repost", "like"],
    dailyCap: 10,
    usedToday: 0,
    enabled: false,
    quietHours: "Off",
  },
];

export const VOICE: VoiceProfile = {
  name: "Adib — builder voice",
  archetype: "Straight-talking operator",
  tones: [
    { label: "Direct", value: 88 },
    { label: "Technical", value: 72 },
    { label: "Warm", value: 41 },
    { label: "Playful", value: 26 },
    { label: "Bold", value: 64 },
  ],
  emojiUse: 12,
  hashtagUse: 8,
  languages: ["English", "Bahasa Melayu (light)"],
  signature: "Short sentences. Numbers over adjectives. No hype words. Never end with a question as bait.",
  bannedWords: ["game-changer", "unlock", "leverage", "revolutionary", "10x", "hustle"],
  samples: [
    "Same strategy. 11% difference in profit factor just from spread assumptions.",
    "Boring infra. That is the point.",
    "Consistency is a quality claim, not a frequency claim.",
  ],
};

export const TEAM: TeamMember[] = [
  { id: "t_1", name: "Adib Aziman", email: "adib@kuchingstudio.my", role: "Owner", status: "active", avatarHue: 344 },
  { id: "t_2", name: "Nadia Kamal", email: "nadia@kuchingstudio.my", role: "Editor", status: "active", avatarHue: 280 },
  { id: "t_3", name: "Hafiz Rosli", email: "hafiz@kuchingstudio.my", role: "Approver", status: "active", avatarHue: 200 },
  { id: "t_4", name: "Client — Zaid", email: "zaid@zarabuilt.com", role: "Viewer", status: "invited", avatarHue: 30 },
];

export const ACTIVITY: ActivityItem[] = [
  { id: "a_1", at: new Date(Date.now() - 18 * 60000).toISOString(), actor: "Scheduler", action: "published", target: "Why we cap automation at 250 posts a day", status: "ok" },
  { id: "a_2", at: new Date(Date.now() - 54 * 60000).toISOString(), actor: "Automation", action: "liked 4 posts", target: "rule: Support indie builders", status: "ok" },
  { id: "a_3", at: new Date(Date.now() - 2 * hours(1)).toISOString(), actor: "Hafiz Rosli", action: "approved", target: "Client case study: 3 posts a week", status: "ok" },
  { id: "a_4", at: new Date(Date.now() - 3 * hours(1)).toISOString(), actor: "Scheduler", action: "retry queued", target: "POST 429 rate limit", status: "warn" },
  { id: "a_5", at: new Date(Date.now() - 5 * hours(1)).toISOString(), actor: "Nadia Kamal", action: "submitted for review", target: "Weekend recap thread", status: "ok" },
  { id: "a_6", at: new Date(Date.now() - 26 * hours(1)).toISOString(), actor: "Connection", action: "token refreshed", target: "60 day token extended", status: "ok" },
  { id: "a_7", at: new Date(Date.now() - 30 * hours(1)).toISOString(), actor: "Automation", action: "skipped 3 posts", target: "sensitive topic filter", status: "warn" },
  { id: "a_8", at: new Date(Date.now() - 48 * hours(1)).toISOString(), actor: "Scheduler", action: "publish failed", target: "Media upload rejected", status: "error" },
];

export const ANALYTICS: Analytics = {
  followers: [8420, 8610, 8790, 9040, 9310, 9680, 10020, 10380, 10710, 11090, 11420, 11860, 12100, 12480],
  engagementRate: [3.1, 3.4, 3.2, 3.9, 4.2, 4.1, 4.6, 4.4, 5.1, 5.4, 5.2, 5.8, 6.1, 6.4],
  reach: [12400, 13100, 12800, 15200, 16900, 16400, 18800, 17900, 21200, 22800, 21900, 24600, 26200, 28100],
  bestHours: [
    { hour: 7, score: 34 },
    { hour: 8, score: 58 },
    { hour: 9, score: 92 },
    { hour: 10, score: 71 },
    { hour: 11, score: 52 },
    { hour: 12, score: 60 },
    { hour: 13, score: 84 },
    { hour: 14, score: 66 },
    { hour: 15, score: 44 },
    { hour: 16, score: 38 },
    { hour: 17, score: 49 },
    { hour: 18, score: 63 },
    { hour: 19, score: 77 },
    { hour: 20, score: 95 },
    { hour: 21, score: 81 },
    { hour: 22, score: 45 },
  ],
  dayLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13", "W14"],
};

export const DEFAULT_SETTINGS: Settings = {
  timezone: "Asia/Kuala_Lumpur",
  theme: "light",
  notifications: {
    publishSuccess: false,
    publishFailed: true,
    weeklyDigest: true,
    approvals: true,
  },
  guardrails: {
    autoPublish: true,
    requireApproval: false,
    respectQuietHours: true,
    dailyPostCap: 12,
    minGapMinutes: 90,
  },
};

export const AI_DRAFTS = [
  "Shipped a scheduler that refuses to double-post.\n\nEvery publish writes a receipt first, then confirms. If the confirm never lands, it retries instead of guessing.\n\nBoring infra. That is the point.",
  "Most automation fails quietly.\n\nA post that never went out looks identical to a post nobody engaged with, unless you are watching the queue.\n\nWatch the queue.",
  "Three weeks of running the calendar from one screen.\n\nScheduling time dropped from 90 minutes a week to 12. Nothing about the content changed.\n\nThe tooling was the bottleneck.",
  "Every failed post is a config problem in disguise.\n\n429 means cap. Empty media means the URL was not public. Timeouts mean retry, not rewrite.\n\nRead the error before touching the copy.",
];
