// Load the page in Chromium, fail on console errors / HTTP errors, and save screenshots.
// usage: node scripts/check.mjs [outdir for extra screenshots]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.resolve("web");
const extra = process.argv[2];
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  const f = p.endsWith("/") ? path.join(p, "index.html") : p;
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const problems = [];
async function open(url, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  page.on("requestfailed", (r) => problems.push(`failed ${r.url()}`));
  await page.goto(url);
  await page.waitForFunction(() => document.body.classList.contains("ready"));
  await page.waitForTimeout(400);
  return page;
}

const page = await open(base, { viewport: { width: 1200, height: 900 } });
fs.mkdirSync("docs", { recursive: true });
await page.screenshot({ path: "docs/screenshot.png" });

// numeric checks against values computed with pyproj
const ref = JSON.parse(fs.readFileSync("scripts/check_ref.json", "utf8"));
const res = await page.evaluate((ref) => {
  const a = window.__app, out = [];
  for (const r of ref.k) {
    const z = a.byZone.get(r.zone);
    out.push({ kind: "k", zone: r.zone, js: a.scaleFactor(z.origin[1], r.lon, r.lat), py: r.k });
  }
  for (const r of ref.dist) {
    const m = a.measure({ lon: r.a[0], lat: r.a[1], zone: r.zone }, { lon: r.b[0], lat: r.b[1], zone: r.zone });
    out.push({ kind: "grid", js: m.grid, py: r.grid });
    out.push({ kind: "true", js: m.truth, py: r.true });
  }
  a.state.pts = [];
  return out;
}, ref);
for (const r of res) {
  const tol = r.kind === "k" ? 1e-8 : 1e-3;
  if (Math.abs(r.js - r.py) > tol) problems.push(`mismatch ${JSON.stringify(r)}`);
}
console.log(`numeric checks: ${res.length}`);

if (extra) {
  fs.mkdirSync(extra, { recursive: true });
  const shots = [
    ["hokkaido", "?view=hokkaido", { width: 1200, height: 900 }],
    ["tokachi", "?view=tokachi", { width: 1200, height: 900 }],
    ["exag", "?mode=exag", { width: 1200, height: 900 }],
    ["exag-hokkaido", "?mode=exag&view=hokkaido", { width: 1200, height: 900 }],
    ["ja", "?lang=ja", { width: 1200, height: 900 }],
    ["mobile", "?lang=ja", { width: 390, height: 844, deviceScaleFactor: 1 }],
  ];
  for (const [name, q, vp] of shots) {
    const p = await open(base + q, { viewport: vp });
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(extra, name + ".png"), fullPage: name === "mobile" });
  }
  // a measurement by clicking in the Tokachi view
  const p = await open(base + "?view=tokachi", { viewport: { width: 1200, height: 900 } });
  await p.mouse.click(300, 500); await p.mouse.click(520, 260);
  await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(extra, "measure.png") });
  console.log(await p.textContent("#measure-out"));
}

await browser.close();
server.close();
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("OK: no console errors, no failed requests");
