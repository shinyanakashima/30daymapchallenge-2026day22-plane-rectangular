"""Assign a plane rectangular zone number to every N03 polygon.

usage: python scripts/assign_zones.py <N03-YYYYMMDD.shp> <out.geojson>
"""
import sys

import geopandas as gpd

from zones import zone_for

src, out = sys.argv[1], sys.argv[2]
g = gpd.read_file(src)
g = g.explode(index_parts=False).reset_index(drop=True)
pts = g.geometry.representative_point()


def s(v):
    return v if isinstance(v, str) else ""


g["zone"] = [
    zone_for(s(r.N03_001), s(r.N03_002), s(r.N03_003), s(r.N03_004), p.x, p.y)
    for r, p in zip(g.itertuples(), pts)
]
g = g[["zone", "N03_001", "N03_004", "geometry"]]
g.to_file(out, driver="GeoJSON")
print(g.groupby("zone").size().to_string())
