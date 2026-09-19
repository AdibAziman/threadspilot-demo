# ThreadsPilot — product demo

Interactive showcase of a Threads scheduling workspace. **All data is fake and lives in your
browser.** No Threads account is connected, nothing is ever published, and no request leaves the
page except loading fonts.

Built for a client walkthrough: click every button, they all respond.

---

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:4310

Demo login is prefilled on the sign-in screen:

- email: `demo@threadspilot.app`
- password: `demo1234`

Any email plus a 4+ character password also works. Or hit **"open the workspace without signing
in"** on the login page — the workspace guard only redirects when there is no session, so signing
in is worth showing once.

Production build:

```bash
npm run build && npm start
```

---

## What is in the demo

**Marketing site** (`/`) — hero, feature grid, how it works, pricing, CTA. Feature-Rich Showcase
pattern from the design system in `design-system/threadspilot/MASTER.md`.

**Auth** — `/login`, `/register`. Fake auth with a loading state, validation errors and a demo
shortcut. Session is stored in `localStorage`.

**Workspace** (`/app/*`) — protected by the layout guard:

| Route | What it shows |
|---|---|
| `/app` | KPIs, next-in-queue with live countdowns, slot fill, quota, best-hours heatmap, activity feed, failure banner |
| `/app/composer` | Char counter against the real 500 limit, thread builder, tags, media, link, first comment, AI drafts, three scheduling modes, live Threads preview |
| `/app/queue` | Filter tabs, search, bulk approve/publish/delete, inline edit modal, reschedule modal, retry failed |
| `/app/calendar` | Month / week / list views, **drag a post to another day to reschedule**, slot manager (create, pause, delete) |
| `/app/inbox` | Conversations with sentiment tags, AI-suggested reply you can edit and redraft, reply stats |
| `/app/automation` | Like / reply / quote / repost rules, daily caps, dry run, guardrails, engagement log |
| `/app/analytics` | Follower + reach charts, format donut, best-hours heatmap, top posts table, **working CSV export** |
| `/app/voice` | Tone dials, emoji/hashtag sliders, banned words, sample posts, test generation with quality chips |
| `/app/connections` | OAuth-style connect flow, quotas as gauges, the five scopes, token refresh, webhooks, platform roadmap |
| `/app/team` | Members, roles, permission matrix, approval queue, invite modal |
| `/app/billing` | Plan comparison with monthly/yearly toggle, usage meters, invoices |
| `/app/settings` | Profile, appearance (light/dark), timezone, notification switches, guardrails, JSON export, danger zone |

---

## Details worth knowing during the walkthrough

- **The queue actually fires.** A 15-second sweep publishes anything whose `scheduledAt` has
  passed, then writes a metrics block and an activity entry. Leave the tab open and posts go out
  by themselves. Turn it off in Settings → Guardrails → Auto-publish.
- **Dark mode** is a real token flip, top-right of the top bar.
- **⌘K / Ctrl+K** opens a page jump palette.
- **Reschedule by dragging** in Calendar month or week view. It keeps the time of day and only
  changes the date.
- **Export CSV** on Analytics downloads a real file built from the current state.
- **Reset demo data** in Settings → Data restores the seed.

---

## Design system

Generated with the `ui-ux-pro-max` skill and persisted at
`design-system/threadspilot/MASTER.md`.

- Palette as specified: primary `#E11D48`, accent `#2563EB`, background `#FFF1F2`, with a derived
  dark theme.
- Density dial 8/10, so spacing is dashboard-tight.
- **One deliberate deviation:** MASTER pairs Playfair Display as the *body* font. A serif body face
  fights scannability in a dense dashboard, so Inter carries UI text and headings and Playfair
  Display italic is reserved for editorial accents (landing hero, big numbers). This is noted in
  `app/globals.css`.
- Motion uses the specified stagger, shortened to CSS `fadeUp` instead of pulling in GSAP for a
  four-property animation, and it is disabled under `prefers-reduced-motion`.

---

## Stack

Next.js 15 App Router, React 19, Tailwind v4, lucide-react. Charts are hand-rolled SVG — no chart
dependency. State is one React context in `lib/store.tsx` persisted to `localStorage` as
`threadspilot.demo.v1`.

```
app/                  routes; app/app/* is the guarded workspace
components/           ui.tsx (kit), charts.tsx (SVG), shell.tsx (nav + palette), post-preview.tsx
lib/                  store.tsx (state + actions), seed.ts (dummy data), types.ts, utils.ts
design-system/        MASTER.md from the design skill
```

---

## If it ever becomes real

The seams are already in the right place:

- `lib/store.tsx` actions (`savePost`, `publishNow`, `connectThreads`) become API calls.
- Threads needs a Meta app with the Threads use case, the `threads_basic` and
  `threads_content_publish` scopes, and a public HTTPS redirect URI.
- Publishing is two calls: create the container, wait ~30s, then `threads_publish`.
- Hard limits to respect: 250 posts and 1,000 replies per rolling 24 hours, 500 characters per
  post with emoji counted as UTF-8 bytes, and publicly reachable media URLs.
- `localStorage` becomes a real database; serverless hosting cannot keep a SQLite file.
