export type PostStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "publishing"
  | "published"
  | "failed"
  | "needs_approval"
  | "rejected";

export type Post = {
  id: string;
  text: string;
  mediaUrl?: string | null;
  thread: string[];
  scheduledAt: string | null;
  status: PostStatus;
  slotId?: string | null;
  tags: string[];
  linkUrl?: string | null;
  firstComment?: string | null;
  author: string;
  approver?: string | null;
  error?: string | null;
  metrics?: { likes: number; replies: number; reposts: number; views: number };
  createdAt: string;
  publishedAt?: string | null;
};

export type InboxItem = {
  id: string;
  author: string;
  handle: string;
  avatarHue: number;
  text: string;
  receivedAt: string;
  sentiment: "positive" | "neutral" | "question" | "negative";
  unread: boolean;
  replied: boolean;
  aiDraft: string;
  postRef: string;
};

export type AutomationRule = {
  id: string;
  name: string;
  trigger: "keyword" | "account" | "topic" | "schedule";
  target: string;
  actions: ("like" | "reply" | "quote" | "repost" | "follow")[];
  dailyCap: number;
  usedToday: number;
  enabled: boolean;
  quietHours: string;
};

export type VoiceProfile = {
  name: string;
  archetype: string;
  tones: { label: string; value: number }[];
  emojiUse: number;
  hashtagUse: number;
  languages: string[];
  signature: string;
  bannedWords: string[];
  samples: string[];
};

export type Slot = {
  id: string;
  label: string;
  days: number[];
  time: string;
  category: string;
  enabled: boolean;
  source: "auto" | "manual";
};

export type PoolItem = {
  id: string;
  text: string;
  category: string;
  used: boolean;
};

export type Connection = {
  connected: boolean;
  handle: string;
  displayName: string;
  avatarHue: number;
  followers: number;
  tokenExpiresAt: string;
  scopes: string[];
  postQuotaUsed: number;
  postQuotaTotal: number;
  replyQuotaUsed: number;
  replyQuotaTotal: number;
  health: "healthy" | "warning" | "error";
};

export type ActivityItem = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  status: "ok" | "warn" | "error";
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Approver" | "Viewer";
  status: "active" | "invited";
  avatarHue: number;
};

export type Settings = {
  timezone: string;
  theme: "light" | "dark";
  notifications: {
    publishSuccess: boolean;
    publishFailed: boolean;
    weeklyDigest: boolean;
    approvals: boolean;
  };
  guardrails: {
    autoPublish: boolean;
    requireApproval: boolean;
    respectQuietHours: boolean;
    dailyPostCap: number;
    minGapMinutes: number;
  };
};

export type User = {
  name: string;
  email: string;
  workspace: string;
  plan: "Starter" | "Growth" | "Scale";
  avatarHue: number;
};

export type Analytics = {
  followers: number[];
  engagementRate: number[];
  reach: number[];
  bestHours: { hour: number; score: number }[];
  dayLabels: string[];
};
