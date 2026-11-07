#!/usr/bin/env bash
# Rebuild web/data from N03 (行政区域) shapefile.
# usage: scripts/build.sh path/to/N03-20250101.shp
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build
python3 scripts/assign_zones.py "$1" build/zoned.geojson
npx mapshaper -i build/zoned.geojson -dissolve zone -simplify interval=100 keep-shapes \
  -o build/zones.geojson precision=0.00001
python3 scripts/build_data.py build/zones.geojson web/data
python3 scripts/make_check_ref.py
