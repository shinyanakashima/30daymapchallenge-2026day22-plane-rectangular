"""Background land (neighbouring countries) for the base map.

usage: python scripts/build_bg.py <bg.geojson from mapshaper> <out dir>
Source: Natural Earth 1:10m countries via the world-atlas package, Japan removed.
"""
import json
import sys

import numpy as np


def encode_ring(ring):
    """1e-5 degree integers, delta encoded (same as zones.json)"""
    q = np.round(np.asarray(ring) * 1e5).astype(np.int64)
    d = np.vstack([q[:1], np.diff(q, axis=0)])
    return d.ravel().tolist()

src, outdir = sys.argv[1], sys.argv[2]
gj = json.load(open(src))
geoms = gj["geometries"] if "geometries" in gj else [f["geometry"] for f in gj["features"]]
polys = []
for g in geoms:
    parts = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for p in parts:
        polys.append([encode_ring(r) for r in p])
json.dump({"polys": polys}, open(f"{outdir}/bg.json", "w"), separators=(",", ":"))
print(len(polys), "polygons")
