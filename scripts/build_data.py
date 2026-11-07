"""Build the web data from the zone polygons.

usage: python scripts/build_data.py <zones.geojson from mapshaper> <out dir>

Outputs
  zones.json  zone polygons (lon/lat, 1e-5 deg integers, delta encoded)
  lines.json  per zone: lines where the scale factor is exactly 1,
              the central meridian, and distortion bands
              (same encoding as zones.json)
  facts.json  numbers quoted on the page and in the README
"""
import json
import sys

import numpy as np
from shapely.geometry import Polygon
from shapely.ops import polylabel
from pyproj import Geod, Proj, Transformer

from zones import ORIGINS, ROMAN, K0, epsg

src, outdir = sys.argv[1], sys.argv[2]
geod = Geod(ellps="GRS80")

# distortion bands in cm per km (= (k - 1) * 1e5)
LEVELS = [-10, -8, -6, -4, -2, 0, 2, 5, 10, 20, 50]
STEP = 2000.0  # sampling interval along curves, metres


def factors(z, x, y):
    """scale factor k at grid coordinates (x = easting, y = northing)"""
    inv = Transformer.from_crs(epsg(z), 6668, always_xy=True)
    lon, lat = inv.transform(x, y)
    f = Proj(epsg(z)).get_factors(lon, lat)
    return np.asarray(f.meridional_scale)


def x_for_k(z, ys, k_target):
    """easting (>= 0) where the scale factor equals k_target, for each northing"""
    ys = np.asarray(ys, dtype=float)
    lo = np.zeros_like(ys)
    hi = np.full_like(ys, 600000.0)
    for _ in range(50):
        mid = (lo + hi) / 2
        below = factors(z, mid, ys) < k_target
        lo = np.where(below, mid, lo)
        hi = np.where(below, hi, mid)
    return (lo + hi) / 2


def to_lonlat(z, xs, ys):
    inv = Transformer.from_crs(epsg(z), 6668, always_xy=True)
    lon, lat = inv.transform(np.asarray(xs), np.asarray(ys))
    return encode_ring(np.column_stack([lon, lat]))


def densify(pts, step=STEP):
    out = []
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        n = max(1, int(np.ceil(np.hypot(x1 - x0, y1 - y0) / step)))
        for i in range(n):
            t = i / n
            out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    out.append(pts[-1])
    return out


def encode_ring(ring):
    q = np.round(np.asarray(ring) * 1e5).astype(np.int64)
    d = np.vstack([q[:1], np.diff(q, axis=0)])
    return d.ravel().tolist()


gj = json.load(open(src, encoding="utf-8"))
zones_out, lines_out = [], []
allk1 = []  # k=1 easting over the latitudes of each zone's land
for feat in sorted(gj["features"], key=lambda f: f["properties"]["zone"]):
    z = int(feat["properties"]["zone"])
    geom = feat["geometry"]
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    big = max((Polygon(p[0], p[1:]) for p in polys), key=lambda g: g.area)
    lab = polylabel(big, tolerance=0.01)
    zones_out.append({
        "label": [round(lab.x, 4), round(lab.y, 4)],
        "zone": z,
        "roman": ROMAN[z],
        "origin": list(ORIGINS[z]),
        "polys": [[encode_ring(r) for r in p] for p in polys],
    })

    # extent of the zone in its own grid coordinates
    fwd = Proj(epsg(z))
    allpts = np.array([pt for p in polys for r in p for pt in r])
    gx, gy = fwd(allpts[:, 0], allpts[:, 1])
    xmin, xmax = min(gx.min(), -95000) - 5000, max(gx.max(), 95000) + 5000
    ymin, ymax = gy.min() - 10000, gy.max() + 10000
    if ymax - ymin < 120000:
        c = (ymin + ymax) / 2
        ymin, ymax = c - 60000, c + 60000
    ys = np.linspace(ymin, ymax, int(np.ceil((ymax - ymin) / STEP)) + 1)

    xk1 = x_for_k(z, ys, 1.0)
    lines = {
        "zone": z,
        "east": to_lonlat(z, xk1, ys),
        "west": to_lonlat(z, -xk1, ys),
        "meridian": to_lonlat(z, np.zeros_like(ys), ys),
        "bands": [],
    }
    xmaxabs = max(abs(xmin), abs(xmax))
    curves = {}
    for lv in LEVELS:
        if lv == -10:
            curves[lv] = np.zeros_like(ys)
        else:
            curves[lv] = np.minimum(x_for_k(z, ys, 1 + lv / 1e5), xmaxabs)
    edges = LEVELS + [None]
    for lo_lv, hi_lv in zip(edges[:-1], edges[1:]):
        xa = curves[lo_lv]
        xb = curves[hi_lv] if hi_lv is not None else np.full_like(ys, xmaxabs)
        if np.all(xa >= xmaxabs - 1):
            continue
        rings = []
        if lo_lv == -10:
            pts = list(zip(xb, ys)) + list(zip(-xb[::-1], ys[::-1]))
            pts.append(pts[0])
            rings.append(densify(pts))
        else:
            for sgn in (1, -1):
                pts = list(zip(sgn * xa, ys)) + list(zip(sgn * xb[::-1], ys[::-1]))
                pts.append(pts[0])
                rings.append(densify(pts))
        enc = []
        for r in rings:
            r = np.asarray(r)
            enc.append(to_lonlat(z, r[:, 0], r[:, 1]))
        lines["bands"].append({"lo": lo_lv, "hi": hi_lv, "rings": enc})
    lines_out.append(lines)
    land = (ys >= gy.min()) & (ys <= gy.max())
    allk1 += xk1[land].tolist() if land.any() else xk1.tolist()
    print(z, "k=1 at x =", round(float(xk1.min()), 1), "-", round(float(xk1.max()), 1), "m")

# facts
facts = {"k0": K0, "levels": LEVELS, "k1": {}, "k1Range": {}}
for z in range(1, 20):
    lat0, lon0 = ORIGINS[z]
    xs = x_for_k(z, np.array([0.0]), 1.0)
    facts["k1"][ROMAN[z]] = round(float(xs[0]), 1)
facts["k1Range"] = {"min": round(min(allk1), 1), "max": round(max(allk1), 1)}
facts["k1Typical"] = float(np.median(list(facts["k1"].values())))
# Obihiro City Office (帯広市役所)
ob_lon, ob_lat = 143.19633, 42.92389
f = Proj(epsg(13)).get_factors(ob_lon, ob_lat)
ox, oy = Proj(epsg(13))(ob_lon, ob_lat)
yk1 = float(x_for_k(13, np.array([oy]), 1.0)[0])
facts["obihiro"] = {
    "lon": ob_lon, "lat": ob_lat, "zone": "XIII",
    "x_east": round(ox, 1), "y_north": round(oy, 1),
    "k": round(float(f.meridional_scale), 8),
    "cm_per_km": round((float(f.meridional_scale) - 1) * 1e5, 2),
    "k1_line_x": round(yk1, 1),
    "dist_to_line_m": round(abs(ox) - yk1, 1),
}

json.dump({"zones": zones_out}, open(f"{outdir}/zones.json", "w"), separators=(",", ":"))
json.dump({"lines": lines_out}, open(f"{outdir}/lines.json", "w"), separators=(",", ":"))
json.dump(facts, open(f"{outdir}/facts.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(facts, ensure_ascii=False))
