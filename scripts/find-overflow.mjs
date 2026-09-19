/** Find elements wider than the viewport at a given route/width. */
import puppeteer from "puppeteer-core";

const BASE = "http://127.0.0.1:4310";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/app/queue"];
const widths = [390, 768];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
page.on("requestfailed", (r) => console.log("FAILED", r.url()));
page.on("response", (r) => {
  if (r.status() >= 400) console.log("HTTP", r.status(), r.url());
});

await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.$eval("form", (f) => f.requestSubmit());
await page.waitForFunction(() => location.pathname.startsWith("/app"), { timeout: 20000 });

for (const width of widths) {
  await page.setViewport({ width, height: 844, isMobile: width < 700, hasTouch: width < 700 });
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 800));
    const report = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const offenders = [];
      document.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > vw + 1 || r.right > vw + 1 || r.left < -1) {
          const style = getComputedStyle(el);
          if (style.position === "fixed" && r.width <= vw + 1 && r.right <= vw + 1) return;
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() ?? "").slice(0, 90),
            right: Math.round(r.right),
            left: Math.round(r.left),
            width: Math.round(r.width),
            scrollW: el.scrollWidth,
          });
        }
      });
      return {
        vw,
        docScrollW: document.documentElement.scrollWidth,
        top: offenders.slice(0, 8),
      };
    });
    console.log(`\n== ${route} @ ${width}px == viewport ${report.vw} docScroll ${report.docScrollW}`);
    report.top.forEach((o) =>
      console.log(`  ${o.tag} [${o.cls}] left=${o.left} right=${o.right} w=${o.width} scrollW=${o.scrollW}`)
    );
    if (report.top.length === 0) console.log("  clean");
  }
}

await browser.close();
