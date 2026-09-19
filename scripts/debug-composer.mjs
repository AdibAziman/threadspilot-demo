/** Debug: why does typing not reach React state on the deployed composer? */
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "https://adibaziman.github.io/threadspilot-demo";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("console error:", m.text());
});

await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.$eval("form", (f) => f.requestSubmit());
await page.waitForFunction(() => location.pathname.includes("/app"), { timeout: 20000 });

await page.goto(`${BASE}/app/composer`, { waitUntil: "networkidle2" });
await page.waitForFunction(() => !!document.documentElement.dataset.theme, { timeout: 20000 });
console.log("theme attr:", await page.evaluate(() => document.documentElement.dataset.theme));
console.log("counter before:", await page.evaluate(() => document.getElementById("char-counter")?.textContent));
console.log("textarea present:", await page.evaluate(() => !!document.getElementById("post-text")));

await page.click("#post-text");
await page.type("#post-text", "Smoke test post. Safe to delete.");
console.log("textarea value:", await page.evaluate(() => document.getElementById("post-text")?.value));
console.log("counter after type:", await page.evaluate(() => document.getElementById("char-counter")?.textContent));

await page.evaluate(() => {
  const el = document.getElementById("post-text");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  setter.call(el, "Smoke test post. Safe to delete.");
  el.dispatchEvent(new Event("input", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 500));
console.log("counter after native-set input event:", await page.evaluate(() => document.getElementById("char-counter")?.textContent));

await browser.close();
