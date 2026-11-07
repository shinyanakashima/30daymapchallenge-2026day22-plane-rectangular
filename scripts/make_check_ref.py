"""Reference values from pyproj for scripts/check.mjs."""
import json

from pyproj import Geod, Proj

from zones import epsg

geod = Geod(ellps="GRS80")
pts = [(13, 143.19633, 42.92389), (13, 145.58, 43.33), (12, 141.35, 43.06), (9, 139.767, 35.681),
       (2, 130.42, 33.59), (1, 129.5, 28.4), (14, 142.19, 27.09), (16, 124.16, 24.34), (11, 140.73, 41.77)]
ref = {"k": [], "dist": []}
for z, lon, lat in pts:
    ref["k"].append({"zone": z, "lon": lon, "lat": lat, "k": Proj(epsg(z)).get_factors(lon, lat).meridional_scale})
for z, a, b in [(13, (143.19633, 42.92389), (143.6, 43.1)), (9, (139.767, 35.681), (140.1, 36.08)),
                (12, (141.35, 43.06), (142.36, 43.77))]:
    p = Proj(epsg(z))
    xa, ya = p(*a); xb, yb = p(*b)
    ref["dist"].append({"zone": z, "a": a, "b": b, "grid": ((xa - xb) ** 2 + (ya - yb) ** 2) ** 0.5,
                        "true": geod.inv(a[0], a[1], b[0], b[1])[2]})
json.dump(ref, open(__file__.replace("make_check_ref.py", "check_ref.json"), "w"), indent=1)
