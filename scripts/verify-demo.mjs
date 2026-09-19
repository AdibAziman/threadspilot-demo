/**
 * Demo smoke test — drives the real app in headless Chrome.
 *
 *   node scripts/verify-demo.mjs
 *
 * Signs in with the demo credentials, walks the main routes, asserts that
 * client hydration actually rendered each screen (not just the SSR shell),
 * captures screenshots into shots/, and fails loudly on console errors.
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:4310";
const CHROME =
  process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const ROUTES = [
  { path: "/app", expect: ["Next in queue", "Slot health", "Best hours to post"], shot: true },
  { path: "/app/composer", expect: ["Live preview", "character", "Scheduling"], shot: true },
  { path: "/app/queue", expect: ["Queue", "Actions"], shot: true },
  { path: "/app/calendar", expect: ["Posting slots", "Legend"], shot: true },
  { path: "/app/inbox", expect: ["Suggested reply", "Send reply"], shot: true },
  { path: "/app/automation", expect: ["Guardrails", "Engagement log"], shot: true },
  { path: "/app/analytics", expect: ["Top posts", "Format mix"], shot: true },
  { path: "/app/voice", expect: ["Tone dials", "Banned words"], shot: false },
  { path: "/app/connections", expect: ["Daily quota", "Permissions"], shot: false },
  { path: "/app/team", expect: ["Role permissions", "Approval queue"], shot: false },
  { path: "/app/billing", expect: ["Compare plans", "Invoices"], shot: false },
  { path: "/app/settings", expect: ["Guardrails", "Data & danger"], shot: false },
];

mkdirSync("shots", { recursive: true });

const errors = [];
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

const results = [];

await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.$eval("form", (f) => f.requestSubmit());
await page.waitForFunction(() => location.pathname.includes("/app"), { timeout: 20000 });
await page.waitForFunction(() => document.body.innerText.includes("Next in queue"), {
  timeout: 20000,
});
results.push({ path: "/login -> /app", hydrated: true, note: "signed in, dashboard rendered" });

for (const route of ROUTES) {
  await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle2" });
  let ok = false;
  try {
    await page.waitForFunction(
      (words) => {
        const body = document.body.innerText.toLowerCase();
        return words.every((w) => body.includes(w.toLowerCase()));
      },
      { timeout: 20000 },
      route.expect
    );
    ok = true;
  } catch {
    ok = false;
  }
  const missing = ok
    ? []
    : await page.evaluate(
        (words) => {
          const body = document.body.innerText.toLowerCase();
          return words.filter((w) => !body.includes(w.toLowerCase()));
        },
        route.expect
      );
  results.push({ path: route.path, hydrated: ok, missing });
  if (route.shot) {
    await page.screenshot({ path: `shots/${route.path.replace(/\//g, "_")}.png` });
  }
}

// interaction check: scheduling from the composer puts the post in the queue
await page.goto(`${BASE}/app/composer`, { waitUntil: "networkidle2" });
await page.type("#post-text", "Smoke test post. Safe to delete.");
const clicked = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.textContent?.includes("Schedule post")
  );
  btn?.click();
  return !!btn;
});
await new Promise((r) => setTimeout(r, 400));
// the store persists on a React effect — wait for the write, don't guess with a sleep
let persisted = true;
try {
  await page.waitForFunction(
    () => (localStorage.getItem("threadspilot.demo.v1") ?? "").includes("Smoke test post"),
    { timeout: 15000 }
  );
} catch {
  persisted = false;
}
await page.goto(`${BASE}/app/queue`, { waitUntil: "networkidle2" });
const scheduled = await page.evaluate(() => document.body.innerText.includes("Smoke test post"));
results.push({
  path: "composer -> queue",
  hydrated: clicked && persisted && scheduled,
  missing: !clicked
    ? ["schedule button not found"]
    : !persisted
      ? ["post never persisted to store"]
      : scheduled
        ? []
        : ["post not found in queue"],
});

// toggle dark mode + drag-free reschedule surface
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.getAttribute("aria-label")?.includes("theme")
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 500));
const dark = await page.evaluate(() => document.documentElement.dataset.theme);
results.push({ path: "theme toggle", hydrated: dark === "dark", missing: dark === "dark" ? [] : ["dark"] });
await page.screenshot({ path: "shots/_app_dark.png" });

// mobile
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(`${BASE}/app/queue`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 900));
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
await page.screenshot({ path: "shots/_mobile_queue.png" });
results.push({
  path: "mobile 390px",
  hydrated: overflow <= 1,
  missing: overflow <= 1 ? [] : [`horizontal overflow ${overflow}px`],
});
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: "shots/_mobile_dashboard.png" });

await browser.close();

const failed = results.filter((r) => !r.hydrated);
console.log(JSON.stringify({ results, errorCount: errors.length, errors: errors.slice(0, 12) }, null, 2));
process.exit(failed.length === 0 && errors.length === 0 ? 0 : 1);
