// Record a demo as PNG frames (30 fps, 1920x1080).
// usage: node scripts/capture_video.cjs <page url> <en|ja> <frames dir>
// then:  ffmpeg -framerate 30 -i <frames dir>/%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 out.mp4
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const [base, lang, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
let n = 0;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await p.goto(`${base}?lang=${lang}`);
  await p.waitForFunction(() => document.body.classList.contains('ready'));
  await p.waitForTimeout(500);
  const shot = async () => { await p.evaluate(() => __app.drawNow()); await p.screenshot({ path: path.join(out, String(n++).padStart(5, '0') + '.png') }); };
  const hold = async (sec) => { for (let i = 0; i < sec * 30; i++) await shot(); };
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const fly = async (name, sec) => {
    const [a, z] = await p.evaluate((nm) => [__app.viewNow(), __app.viewOf(nm)], name);
    const N = Math.round(sec * 30);
    for (let i = 1; i <= N; i++) {
      await p.evaluate(([a, z, t]) => __app.setView(d3.interpolateZoom(a, z)(t)), [a, z, ease(i / N)]);
      await shot();
    }
  };
  const click = async (lon, lat, zone) => {
    const [x, y] = await p.evaluate(([lon, lat, zone]) => __app.screenOf(lon, lat, zone), [lon, lat, zone]);
    await p.mouse.click(x, y);
    await p.mouse.move(1200, 700); // move off the map so no hover box stays
  };
  await hold(3);
  await fly('hokkaido', 2.2); await hold(2.5);
  await fly('japan', 2.2); await hold(0.5);
  await p.click('#mode button[data-mode="exag"]');
  await p.evaluate(() => { const r = document.getElementById('factor'); r.value = 100; r.dispatchEvent(new Event('input')); });
  await hold(1);
  for (let f = 200; f <= 1000; f += 100) {
    await p.evaluate((f) => { const r = document.getElementById('factor'); r.value = f; r.dispatchEvent(new Event('input')); }, f);
    await hold(0.35);
  }
  await p.evaluate(() => { const r = document.getElementById('factor'); r.value = 500; r.dispatchEvent(new Event('input')); });
  await hold(1);
  await fly('hokkaido', 2.2); await hold(2.5);
  await b.close();
  console.log('frames', n);
})();
