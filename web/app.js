/* 19 Flat Maps of Japan */
(() => {
  "use strict";

  // ---------- geodesy ----------
  const A = 6378137, F_INV = 298.257222101; // GRS80
  const F_ = 1 / F_INV, E2 = F_ * (2 - F_), EP2 = E2 / (1 - E2);
  const K0 = 0.9999;
  const LL = "+proj=longlat +ellps=GRS80 +no_defs";
  const LCC = "+proj=lcc +lat_1=33 +lat_2=43 +lat_0=37 +lon_0=137 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs";
  const base = proj4(LL, LCC);
  const geod = new geodesic.Geodesic.Geodesic(A, F_);
  const RAD = Math.PI / 180;

  const tmDef = (lat0, lon0) =>
    `+proj=etmerc +lat_0=${lat0} +lon_0=${lon0} +k=${K0} +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs`;

  // point scale factor of the Transverse Mercator projection (ellipsoid)
  function scaleFactor(lon0, lon, lat) {
    const phi = lat * RAD, c = Math.cos(phi), t = Math.tan(phi);
    const T = t * t, C = EP2 * c * c, Aa = (lon - lon0) * RAD * c;
    const A2 = Aa * Aa;
    return K0 * (1 + (1 + C) * A2 / 2
      + (5 - 4 * T + 42 * C + 13 * C * C - 28 * EP2) * A2 * A2 / 24
      + (61 - 148 * T + 16 * T * T) * A2 * A2 * A2 / 720);
  }

  // ---------- state ----------
  const state = {
    lang: "en",
    mode: "true", // "true" | "exag"
    fill: "dist", // "dist" | "zone"
    factor: 500,
    pts: [], // measurement points {lon, lat, zone}
  };
  let zones = [], facts = null;
  const byZone = new Map();

  const BAND_COLORS = {
    "-10": "#6f98ad", "-8": "#89abbd", "-6": "#a3bfcc", "-4": "#bdd2db", "-2": "#d9e5ea",
    "0": "#f5e7d6", "2": "#eed1b2", "5": "#e4b388", "10": "#d38d5f", "20": "#b8653d", "50": "#86402a",
  };
  const ZONE_COLORS = ["#ddd5c1", "#c7d7cc", "#d8c9d6", "#cad3e0"];
  const ZONE_GROUP = { 1: 0, 2: 1, 3: 2, 4: 0, 5: 3, 6: 1, 7: 2, 8: 0, 9: 1, 10: 2, 11: 0, 12: 1, 13: 3,
    14: 2, 15: 0, 16: 1, 17: 3, 18: 3, 19: 0 };
  const ZONE_COLORS_EXAG = ["#b9a77c", "#86ab95", "#b28eac", "#8ea0bf"];
  const SEA = "#f3f1ec";

  // Okinawa and remote zones are drawn in moved frames.
  // anchor = where the frame's top-left corner goes, in base-map metres (x east, y north)
  const INSETS = [
    { key: "frameOkinawa", zones: [15, 16, 17], anchor: [-960000, 1010000] },
    { key: "frameXIV", zones: [14], anchor: [470000, -260000] },
    { key: "frameXIX", zones: [19], anchor: null },
    { key: "frameXVIII", zones: [18], anchor: null },
  ];

  // ---------- decode ----------
  function decode(arr) {
    const n = arr.length / 2, out = new Float64Array(arr.length);
    let x = 0, y = 0;
    for (let i = 0; i < n; i++) {
      x += arr[2 * i]; y += arr[2 * i + 1];
      out[2 * i] = x / 1e5; out[2 * i + 1] = y / 1e5;
    }
    return out;
  }

  // a geometry: lon/lat, base-map world coords (y down), displacement vectors (lazy)
  function geom(ll, zone) {
    const n = ll.length / 2, r = new Float64Array(ll.length);
    for (let i = 0; i < n; i++) {
      const p = base.forward([ll[2 * i], ll[2 * i + 1]]);
      r[2 * i] = p[0]; r[2 * i + 1] = -p[1];
    }
    return { ll, r, d: null, zone };
  }

  function bboxOf(geoms) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const g of geoms) for (let i = 0; i < g.r.length; i += 2) {
      const x = g.r[i], y = g.r[i + 1];
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return [x0, y0, x1, y1];
  }

  function shift(g, dx, dy) {
    for (let i = 0; i < g.r.length; i += 2) { g.r[i] += dx; g.r[i + 1] += dy; }
  }

  // displacement of the zone's flat map relative to true distance/direction from its origin,
  // as a vector in base-map world units
  function frameVectors(z) {
    if (z.fv) return z.fv;
    const [lat0, lon0] = z.origin;
    const o = base.forward([lon0, lat0]);
    const pe = geod.Direct(lat0, lon0, 90, 1000), pn = geod.Direct(lat0, lon0, 0, 1000);
    const e = base.forward([pe.lon2, pe.lat2]), nn = base.forward([pn.lon2, pn.lat2]);
    z.fv = [(e[0] - o[0]) / 1000, -(e[1] - o[1]) / 1000, (nn[0] - o[0]) / 1000, -(nn[1] - o[1]) / 1000];
    return z.fv;
  }
  function dispAt(z, lon, lat) {
    const [lat0, lon0] = z.origin, [ex, ey, nx, ny] = frameVectors(z);
    const t = z.tm.forward([lon, lat]);
    const inv = geod.Inverse(lat0, lon0, lat, lon);
    const az = inv.azi1 * RAD;
    const dE = t[0] - inv.s12 * Math.sin(az), dN = t[1] - inv.s12 * Math.cos(az);
    return [dE * ex + dN * nx, dE * ey + dN * ny];
  }
  function computeD(z) {
    for (const g of z.allGeoms) {
      if (g.d) continue;
      const n = g.ll.length / 2, d = new Float64Array(g.ll.length);
      for (let i = 0; i < n; i++) {
        const v = dispAt(z, g.ll[2 * i], g.ll[2 * i + 1]);
        d[2 * i] = v[0]; d[2 * i + 1] = v[1];
      }
      g.d = d;
    }
    if (!z.labelD) z.labelD = dispAt(z, z.labelLL[0], z.labelLL[1]);
  }

  // ---------- load ----------
  async function load() {
    const [zj, lj, fj] = await Promise.all(
      ["data/zones.json", "data/lines.json", "data/facts.json"].map((u) => fetch(u).then((r) => r.json())));
    facts = fj;
    for (const zd of zj.zones) {
      const z = {
        zone: zd.zone, roman: zd.roman, origin: zd.origin, labelLL: zd.label,
        tm: proj4(LL, tmDef(zd.origin[0], zd.origin[1])),
        polys: zd.polys.map((p) => p.map((r) => geom(decode(r), zd.zone))),
        offset: [0, 0], frame: null,
      };
      z.label = base.forward(zd.label); z.label[1] = -z.label[1];
      byZone.set(z.zone, z); zones.push(z);
    }
    for (const ld of lj.lines) {
      const z = byZone.get(ld.zone);
      z.east = geom(decode(ld.east), z.zone);
      z.west = geom(decode(ld.west), z.zone);
      z.meridian = geom(decode(ld.meridian), z.zone);
      z.bands = ld.bands.map((b) => ({ lo: b.lo, hi: b.hi, rings: b.rings.map((r) => geom(decode(r), z.zone)) }));
      z.allGeoms = [...z.polys.flat(), z.east, z.west, z.meridian, ...z.bands.flatMap((b) => b.rings)];
    }
    layoutInsets();
  }

  function layoutInsets() {
    const PAD = 25000, GAP = 40000;
    let prev = null;
    for (const ins of INSETS) {
      const zs = ins.zones.map((n) => byZone.get(n));
      const bb = bboxOf(zs.flatMap((z) => [...z.polys.flat(), z.east, z.west]));
      // frame height limited to the land extent of the zones (lines are clipped to the frame)
      const lb = bboxOf(zs.flatMap((z) => z.polys.flat()));
      const fy0 = Math.min(lb[1], bb[1] + (bb[3] - bb[1]) / 2 - 70000) - PAD;
      const fy1 = Math.max(lb[3], bb[1] + (bb[3] - bb[1]) / 2 + 70000) + PAD;
      const fx0 = bb[0] - PAD, fx1 = bb[2] + PAD;
      let ax, ay;
      if (ins.anchor) { ax = ins.anchor[0]; ay = -ins.anchor[1]; }
      else if (ins.key === "frameXIX") { ax = prev.frame[2] + GAP; ay = prev.frame[1]; }
      else { ax = INSETS[2].frame[0]; ay = INSETS[2].frame[3] + GAP; }
      const dx = ax - fx0, dy = ay - fy0;
      for (const z of zs) {
        for (const g of z.allGeoms) shift(g, dx, dy);
        z.label[0] += dx; z.label[1] += dy;
        z.offset = [dx, dy];
      }
      ins.frame = [fx0 + dx, fy0 + dy, fx1 + dx, fy1 + dy];
      for (const z of zs) z.frame = ins.frame;
      prev = ins;
    }
  }

  // ---------- paths ----------
  let cache = null;
  function ringTo(p, g, f) {
    const r = g.r, d = g.d, n = r.length / 2;
    if (f && d) {
      p.moveTo(r[0] + f * d[0], r[1] + f * d[1]);
      for (let i = 1; i < n; i++) p.lineTo(r[2 * i] + f * d[2 * i], r[2 * i + 1] + f * d[2 * i + 1]);
    } else {
      p.moveTo(r[0], r[1]);
      for (let i = 1; i < n; i++) p.lineTo(r[2 * i], r[2 * i + 1]);
    }
  }
  function buildPaths() {
    const f = state.mode === "exag" ? state.factor : 0;
    if (f) for (const z of zones) computeD(z);
    cache = new Map();
    for (const z of zones) {
      const land = new Path2D();
      for (const g of z.polys.flat()) { ringTo(land, g, f); land.closePath(); }
      const bands = z.bands.map((b) => {
        const p = new Path2D();
        for (const g of b.rings) { ringTo(p, g, f); p.closePath(); }
        return { lo: b.lo, path: p };
      });
      const k1 = new Path2D(); ringTo(k1, z.east, f); ringTo(k1, z.west, f);
      const mer = new Path2D(); ringTo(mer, z.meridian, f);
      cache.set(z.zone, { land, bands, k1, mer });
    }
  }

  // ---------- canvas & view ----------
  const canvas = document.getElementById("map");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;
  let view = d3.zoomIdentity;
  const zoom = d3.zoom().scaleExtent([1e-5, 0.05]).on("zoom", (ev) => { view = ev.transform; requestDraw(); });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height; DPR = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    requestDraw();
  }

  function fitWorld(bb, animate) {
    const [x0, y0, x1, y1] = bb, pad = Math.min(W, H) < 500 ? 12 : 30;
    const k = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0));
    const t = d3.zoomIdentity.translate(W / 2 - k * (x0 + x1) / 2, H / 2 - k * (y0 + y1) / 2).scale(k);
    const sel = d3.select(canvas);
    (animate ? sel.transition().duration(700) : sel).call(zoom.transform, t);
  }

  function llBox(lon0, lat0, lon1, lat1) {
    const pts = [];
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
      const p = base.forward([lon0 + (lon1 - lon0) * i / 8, lat0 + (lat1 - lat0) * j / 8]);
      pts.push(p);
    }
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => -p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }

  const VIEWS = {
    japan: () => {
      const bb = bboxOf(zones.flatMap((z) => z.polys.flat()));
      for (const ins of INSETS) {
        bb[0] = Math.min(bb[0], ins.frame[0]); bb[1] = Math.min(bb[1], ins.frame[1]);
        bb[2] = Math.max(bb[2], ins.frame[2]); bb[3] = Math.max(bb[3], ins.frame[3]);
      }
      return bb;
    },
    hokkaido: () => llBox(139.3, 41.3, 146.2, 45.6),
    tokachi: () => llBox(142.4, 42.2, 144.6, 43.6),
  };

  let pending = false;
  function requestDraw() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; draw(); });
  }

  function toScreen(x, y) { return [view.x + view.k * x, view.y + view.k * y]; }

  function draw() {
    if (!cache) return;
    const k = view.k, px = 1 / k;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = SEA; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(DPR * k, 0, 0, DPR * k, DPR * view.x, DPR * view.y);
    const exag = state.mode === "exag";

    // frames (background)
    for (const ins of INSETS) {
      const [x0, y0, x1, y1] = ins.frame;
      ctx.fillStyle = "#f8f7f3"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    // fills
    for (const z of zones) {
      const c = cache.get(z.zone);
      ctx.save();
      if (z.frame) { const [x0, y0, x1, y1] = z.frame; ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); }
      if (state.fill === "dist") {
        ctx.save();
        ctx.clip(c.land, "evenodd");
        for (const b of c.bands) { ctx.fillStyle = BAND_COLORS[String(b.lo)]; ctx.fill(b.path, "evenodd"); }
        ctx.restore();
      } else {
        if (exag) {
          ctx.globalAlpha = 0.6; ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = ZONE_COLORS_EXAG[ZONE_GROUP[z.zone]];
        } else ctx.fillStyle = ZONE_COLORS[ZONE_GROUP[z.zone]];
        ctx.fill(c.land, "evenodd");
      }
      ctx.restore();
    }

    // lines
    for (const z of zones) {
      const c = cache.get(z.zone);
      ctx.save();
      if (z.frame) { const [x0, y0, x1, y1] = z.frame; ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); }
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      // zone outline
      ctx.strokeStyle = exag ? "#3a3a3a" : "#6b6b6b"; ctx.lineWidth = (exag ? 0.9 : 0.6) * px;
      ctx.stroke(c.land);
      // origin meridian (dotted), and k=1 lines outside land (dashed, faint)
      ctx.setLineDash([1.5 * px, 3 * px]); ctx.strokeStyle = "#163f55"; ctx.lineWidth = 1 * px;
      ctx.save(); ctx.clip(c.land, "evenodd"); ctx.stroke(c.mer); ctx.restore();
      ctx.setLineDash([5 * px, 4 * px]); ctx.strokeStyle = "rgba(20,20,20,0.28)"; ctx.lineWidth = 0.8 * px;
      ctx.stroke(c.k1);
      ctx.setLineDash([]);
      // k=1 lines on land
      ctx.save(); ctx.clip(c.land, "evenodd");
      ctx.strokeStyle = "#141414"; ctx.lineWidth = 2.2 * px; ctx.stroke(c.k1);
      ctx.restore();
      ctx.restore();
    }

    // frame borders
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.font = "12px system-ui, -apple-system, 'Segoe UI', sans-serif";
    for (const ins of INSETS) {
      const [a, b] = toScreen(ins.frame[0], ins.frame[1]), [c2, d2] = toScreen(ins.frame[2], ins.frame[3]);
      ctx.strokeStyle = "#9a9a9a"; ctx.lineWidth = 1; ctx.strokeRect(a, b, c2 - a, d2 - b);
      ctx.fillStyle = "#555"; ctx.textBaseline = "top";
      const label = t(ins.key);
      if (ctx.measureText(label).width < c2 - a - 8) ctx.fillText(label, a + 4, b + 4);
    }

    // zone labels
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fs = Math.max(11, Math.min(26, 13 + Math.log2(k * 2e4 + 1) * 2.5));
    ctx.font = `600 ${fs}px Georgia, 'Times New Roman', serif`;
    for (const z of zones) {
      let [lx, ly] = z.label;
      if (exag && z.labelD) { lx += state.factor * z.labelD[0]; ly += state.factor * z.labelD[1]; }
      const [sx, sy] = toScreen(lx, ly);
      if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue;
      ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.strokeText(z.roman, sx, sy);
      ctx.fillStyle = "#222"; ctx.fillText(z.roman, sx, sy);
    }
    ctx.textAlign = "left";

    drawObihiro();
    drawMeasure();
  }

  function worldOf(lon, lat, zoneNo) {
    const p = base.forward([lon, lat]);
    const z = byZone.get(zoneNo);
    let x = p[0] + z.offset[0], y = -p[1] + z.offset[1];
    return [x, y];
  }

  function drawObihiro() {
    if (state.mode === "exag" || !facts) return;
    const ob = facts.obihiro;
    const [sx, sy] = toScreen(...worldOf(ob.lon, ob.lat, 13));
    if (sx < -10 || sy < -10 || sx > W + 10 || sy > H + 10) return;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    ctx.font = "600 12px system-ui, -apple-system, 'Segoe UI', sans-serif";
    ctx.textBaseline = "middle";
    const label = state.lang === "ja" ? "帯広" : "Obihiro";
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.strokeText(label, sx + 7, sy);
    ctx.fillStyle = "#111"; ctx.fillText(label, sx + 7, sy);
  }

  function drawMeasure() {
    if (state.mode === "exag" || !state.pts.length) return;
    const s = state.pts.map((p) => toScreen(...worldOf(p.lon, p.lat, p.zone)));
    if (s.length === 2 && state.pts[0].zone === state.pts[1].zone) {
      ctx.strokeStyle = "#b0005a"; ctx.lineWidth = 2; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(...s[0]); ctx.lineTo(...s[1]); ctx.stroke();
    }
    s.forEach(([x, y], i) => {
      ctx.fillStyle = "#b0005a"; ctx.beginPath(); ctx.arc(x, y, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "700 9px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(i ? "B" : "A", x, y + 0.5); ctx.textAlign = "left";
    });
  }

  // ---------- picking ----------
  function inRing(ll, lon, lat) {
    let inside = false;
    const n = ll.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = ll[2 * i], yi = ll[2 * i + 1], xj = ll[2 * j], yj = ll[2 * j + 1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function zoneAt(lon, lat) {
    for (const z of zones) for (const p of z.polys) {
      if (!inRing(p[0].ll, lon, lat)) continue;
      let hole = false;
      for (let h = 1; h < p.length; h++) if (inRing(p[h].ll, lon, lat)) { hole = true; break; }
      if (!hole) return z.zone;
    }
    return null;
  }
  // screen -> lon/lat (true-scale view only), taking moved frames into account
  function pick(sx, sy) {
    const wx = (sx - view.x) / view.k, wy = (sy - view.y) / view.k;
    const cands = [];
    for (const ins of INSETS) {
      const [x0, y0, x1, y1] = ins.frame;
      if (wx >= x0 && wx <= x1 && wy >= y0 && wy <= y1) cands.push(byZone.get(ins.zones[0]).offset);
    }
    if (!cands.length) cands.push([0, 0]);
    for (const off of cands) {
      const ll = base.inverse([wx - off[0], -(wy - off[1])]);
      const z = zoneAt(ll[0], ll[1]);
      if (z && (byZone.get(z).offset[0] === off[0] && byZone.get(z).offset[1] === off[1]))
        return { lon: ll[0], lat: ll[1], zone: z };
    }
    return null;
  }

  // ---------- measurement ----------
  const fmt = (v, d) => v.toLocaleString(state.lang === "ja" ? "ja-JP" : "en-US",
    { minimumFractionDigits: d, maximumFractionDigits: d });
  const signed = (v, d) => (v > 0 ? "+" : v < 0 ? "−" : "±") + fmt(Math.abs(v), d);

  function pointInfo(p) {
    const z = byZone.get(p.zone);
    const k = scaleFactor(z.origin[1], p.lon, p.lat);
    return { k, cm: (k - 1) * 1e5 };
  }

  function measureResult() {
    const [a, b] = state.pts;
    if (a.zone !== b.zone) return { cross: true, a: byZone.get(a.zone).roman, b: byZone.get(b.zone).roman };
    const z = byZone.get(a.zone);
    const pa = z.tm.forward([a.lon, a.lat]), pb = z.tm.forward([b.lon, b.lat]);
    const grid = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
    const truth = geod.Inverse(a.lat, a.lon, b.lat, b.lon).s12;
    return { cross: false, zone: z.roman, grid, truth, diffCm: (grid - truth) * 100 };
  }

  function renderMeasure() {
    const out = document.getElementById("measure-out");
    if (state.mode === "exag") { out.innerHTML = `<p class="small">${t("measureExag")}</p>`; return; }
    if (state.msg === "sea") { out.innerHTML = `<p class="small warn">${t("measureSea")}</p>`; return; }
    if (!state.pts.length) { out.innerHTML = `<p class="small">${t("measureHint")}</p>`; return; }
    if (state.pts.length === 1) {
      const p = state.pts[0], i = pointInfo(p);
      out.innerHTML = `<p class="small">${t("measureFirst", { z: byZone.get(p.zone).roman, k: i.k.toFixed(7), cm: signed(i.cm, 1) })}</p>`;
      return;
    }
    const r = measureResult();
    if (r.cross) {
      out.innerHTML = `<p class="warn">${t("measureCross", r)}</p><p class="small">${t("measureAgain")}</p>`;
      return;
    }
    const cmkm = r.truth > 0 ? r.diffCm / (r.truth / 1000) : 0;
    out.innerHTML = `
      <table class="mtable">
        <tr><th>${t("measureGrid", { z: r.zone })}</th><td>${fmt(r.grid, 3)} m</td></tr>
        <tr><th>${t("measureTrue")}</th><td>${fmt(r.truth, 3)} m</td></tr>
        <tr class="diff"><th>${t("measureDiff")}</th><td>${signed(r.diffCm, 1)} cm</td></tr>
      </table>
      <p class="small">${r.diffCm >= 0 ? t("measureLonger") : t("measureShorter")} · ${t("measureDiffNote", { cmkm: signed(cmkm, 2) })}</p>
      <p class="small">${t("measureAgain")}</p>`;
  }

  function onClick(ev) {
    if (state.mode === "exag") return;
    const rect = canvas.getBoundingClientRect();
    const p = pick(ev.clientX - rect.left, ev.clientY - rect.top);
    if (!p) { state.msg = "sea"; renderMeasure(); return; }
    state.msg = null;
    if (state.pts.length >= 2) state.pts = [];
    state.pts.push(p);
    renderMeasure(); requestDraw();
  }

  // hover readout
  const hover = document.getElementById("hover");
  function onMove(ev) {
    if (state.mode === "exag" || matchMedia("(hover: none)").matches) { hover.hidden = true; return; }
    const rect = canvas.getBoundingClientRect();
    const p = pick(ev.clientX - rect.left, ev.clientY - rect.top);
    if (!p) { hover.hidden = true; return; }
    const i = pointInfo(p);
    hover.innerHTML = `<b>${t("hoverZone", { z: byZone.get(p.zone).roman })}</b><br>${t("hoverK", { k: i.k.toFixed(7), cm: signed(i.cm, 1) })}`;
    hover.hidden = false;
    hover.style.left = Math.min(ev.clientX - rect.left + 14, W - 230) + "px";
    hover.style.top = (ev.clientY - rect.top + 14) + "px";
  }

  // ---------- i18n ----------
  function vars() {
    if (!facts) return {};
    const ob = facts.obihiro;
    return {
      k1km: fmt(facts.k1Typical / 1000, 1),
      k1min: fmt(facts.k1Range.min / 1000, 2), k1max: fmt(facts.k1Range.max / 1000, 2),
      obx: fmt(Math.abs(ob.x_east) / 1000, 1), obline: fmt(ob.k1_line_x / 1000, 1),
      obgap: fmt(Math.abs(ob.dist_to_line_m) / 1000, 1),
      obk: ob.k.toFixed(6), obcm: fmt(Math.abs(ob.cm_per_km), 1),
      f: fmt(state.factor, 0),
    };
  }
  function t(key, extra) {
    let s = (I18N[state.lang][key] || I18N.en[key] || key);
    const v = Object.assign(vars(), extra || {});
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  }
  function applyLang() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === state.lang));
    document.getElementById("factor-val").textContent = "×" + fmt(state.factor, 0);
    updateBadge(); renderMeasure(); renderLegend(); requestDraw();
  }
  function updateBadge() {
    const b = document.getElementById("badge");
    b.hidden = state.mode !== "exag";
    b.textContent = t("badge");
  }

  function renderLegend() {
    const lv = facts.levels, el = document.getElementById("legend-bar");
    const labels = lv.map((v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v));
    el.innerHTML = lv.map((v, i) =>
      `<div class="sw" style="background:${BAND_COLORS[String(v)]}"><span>${labels[i]}</span></div>`).join("");
  }

  // ---------- controls ----------
  function setMode(m) {
    state.mode = m;
    document.querySelectorAll("#mode button").forEach((b) => b.classList.toggle("on", b.dataset.mode === m));
    document.getElementById("exag-ctl").hidden = m !== "exag";
    if (m === "exag") setFill("zone", true);
    hover.hidden = true;
    rebuild();
  }
  function setFill(f, silent) {
    state.fill = f;
    document.querySelectorAll("#fill button").forEach((b) => b.classList.toggle("on", b.dataset.fill === f));
    if (!silent) requestDraw();
  }
  function rebuild() {
    buildPaths();
    updateBadge(); renderMeasure(); requestDraw();
  }

  function initUI() {
    document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
      state.lang = b.dataset.lang;
      try { localStorage.setItem("lang", state.lang); } catch (e) { /* ignore */ }
      applyLang();
    }));
    document.querySelectorAll("#mode button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    document.querySelectorAll("#fill button").forEach((b) => b.addEventListener("click", () => setFill(b.dataset.fill)));
    const fr = document.getElementById("factor");
    fr.addEventListener("input", () => {
      state.factor = +fr.value;
      document.getElementById("factor-val").textContent = "×" + fmt(state.factor, 0);
      rebuild();
    });
    document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => fitWorld(VIEWS[b.dataset.view](), true)));
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { hover.hidden = true; });
    window.addEventListener("resize", () => { resize(); });
  }

  async function main() {
    const qs = new URLSearchParams(location.search);
    let saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) { /* ignore */ }
    state.lang = qs.get("lang") === "ja" ? "ja" : qs.get("lang") === "en" ? "en" : (saved === "ja" ? "ja" : "en");
    initUI();
    await load();
    resize();
    d3.select(canvas).call(zoom).on("dblclick.zoom", null);
    buildPaths();
    applyLang();
    fitWorld(VIEWS[qs.get("view")] ? VIEWS[qs.get("view")]() : VIEWS.japan(), false);
    if (qs.get("mode") === "exag") setMode("exag");
    document.body.classList.add("ready");
    // exposed for automated checks
    window.__app = { scaleFactor, byZone, state, pick, zoneAt, measure: (a, b) => { state.pts = [a, b]; return measureResult(); } };
  }
  main();
})();
