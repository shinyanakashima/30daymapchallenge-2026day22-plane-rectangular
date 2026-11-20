"""East-west distances between neighbouring true-distance lines, measured on one latitude.

usage: python scripts/build_gaps.py <web/data dir>

For each row (a latitude and the zones whose lines are taken on it), the lines where
the scale factor is 1 are sorted from west to east, and the true distance (geodesic on
GRS80) between each pair of neighbouring lines is computed. A pair is listed only once.
Writes gaps.json.
"""
import json
import sys

import numpy as np
from pyproj import Geod, Proj, Transformer

from zones import ORIGINS, ROMAN, epsg

outdir = sys.argv[1]
geod = Geod(ellps="GRS80")

# (latitude, zones); rows are chosen where the lines of these zones run over or near land
ROWS = [
    (43.1, [11, 12, 13]),
    (39.2, [10]),
    (36.0, [6, 7, 8, 9]),
    (35.3, [3, 5, 6]),
    (33.3, [1, 2, 4]),
    (27.1, [14]),
    (26.2, [15]),
    (25.6, [17]),
    (24.7, [16]),
    (24.6, [19]),
    (20.7, [18]),
]


def k_at(z, x, y):
    lon, lat = Transformer.from_crs(epsg(z), 6668, always_xy=True).transform(x, y)
    return Proj(epsg(z)).get_factors(lon, lat).meridional_scale


def line_lon(z, side, lat):
    """longitude where the line k = 1 (east: side=1, west: side=-1) crosses the latitude"""
    p = Proj(epsg(z))
    inv = Transformer.from_crs(epsg(z), 6668, always_xy=True)
    lon = ORIGINS[z][1] + side * 1.0
    for _ in range(8):
        _, y = p(lon, lat)
        lo, hi = 0.0, 300000.0
        for _ in range(55):
            m = (lo + hi) / 2
            lo, hi = (m, hi) if k_at(z, m, y) < 1 else (lo, m)
        lon, _ = inv.transform(side * (lo + hi) / 2, y)
    return float(lon)


def line_lat_range(lines, z):
    rec = next(r for r in lines if r["zone"] == z)
    q = np.cumsum(np.array(rec["east"]).reshape(-1, 2), axis=0) / 1e5
    return q[:, 1].min(), q[:, 1].max()


lines = json.load(open(f"{outdir}/lines.json"))["lines"]
seen, rows_out = set(), []
for lat, zs in ROWS:
    pts = []
    for z in zs:
        lo, hi = line_lat_range(lines, z)
        assert lo <= lat <= hi, (z, lat, lo, hi)
        pts.append((line_lon(z, -1, lat), z, "W"))
        pts.append((line_lon(z, 1, lat), z, "E"))
    pts.sort()
    items = []
    for (la, za, sa), (lb, zb, sb) in zip(pts[:-1], pts[1:]):
        key = (za, sa, zb, sb)
        if key in seen:
            continue
        seen.add(key)
        dist = geod.inv(la, lat, lb, lat)[2]
        items.append({
            "a": {"zone": za, "roman": ROMAN[za], "side": sa, "lon": round(la, 6)},
            "b": {"zone": zb, "roman": ROMAN[zb], "side": sb, "lon": round(lb, 6)},
            "m": round(dist, 1),
        })
        print(f"{lat:5.1f}N  {ROMAN[za]:>5} {sa} - {ROMAN[zb]:<5} {sb}  {dist / 1000:8.1f} km")
    rows_out.append({"lat": lat, "items": items})

json.dump({"rows": rows_out}, open(f"{outdir}/gaps.json", "w"), ensure_ascii=False, indent=1)
