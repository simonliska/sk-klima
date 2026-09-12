"""Sample SHMU 1991-2020 normals grids at capitals + kraj means.

Input:  data_raw/shmu/grids/*.zip (from 03_fetch_shmu_grids.py)
Output: data_raw/shmu/reference_1991_2020.json

Method:
  - CRS verified EPSG:5514 (S-JTSK / Krovak East North), 500 m grid.
  - Capitals: WGS84 -> EPSG:5514 (pyproj), single-pixel sample.
  - Kraje: kraj polygons from public/geo/kraje.geo.json reprojected to
    EPSG:5514, rasterized with rasterio.features.geometry_mask;
    mean of valid (non-nodata) cells per kraj.
  - Prints E-OBS 2020-2025 mean (from data_raw/eobs/indicators.json) next
    to each SHMU normal for eyeball validation (recent years are expected
    to run warmer than the 1991-2020 normal).

Attribution (DATA_SOURCE.md §10.2): Slovenský hydrometeorologický ústav
(SHMÚ), otvorené dáta opendata.shmu.sk, licencia CC BY 4.0.
"""

from __future__ import annotations

import io
import json
import sys
import zipfile
from pathlib import Path

import numpy as np
import rasterio
from pyproj import Transformer
from rasterio.features import geometry_mask

BASE = Path(__file__).resolve().parents[2]
GRIDS_DIR = BASE / "data_raw" / "shmu" / "grids"
GEO_PATH = BASE / "public" / "geo" / "kraje.geo.json"
EOBS_PATH = BASE / "data_raw" / "eobs" / "indicators.json"
OUT_PATH = BASE / "data_raw" / "shmu" / "reference_1991_2020.json"

EXPECTED_CRS = "EPSG:5514"

# grid key -> (zip stem, json field, decimals)
GRIDS = {
    "avg_temp": ("KlimaAdapt_PriemernaRocnaTeplotaVzduchu_1991_2020", "avg_temp_c", 2),
    "tropical_days": ("KlimaAdapt_PriemernyPocetTropickychDni_1991_2020", "tropical_days", 1),
    "tropical_nights": ("KlimaAdapt_PriemernyPocetTropickychNoci_1991_2020", "tropical_nights", 1),
    "frost_days": ("KlimaAdapt_PriemernyPocetMrazovychDni_1991_2020", "frost_days", 1),
    "precip_sum": ("KlimaAdapt_PriemerneRocneAtmosferickeZrazky_1991_2020", "precip_sum_mm", 1),
    "heavy_days": ("KlimaAdapt_PriemernyPocetDniNad40_1991_2020", "heavy_days", 1),
}

# Same city centres as 02_compute_indicators.py (nearest 500 m cell now).
CAPITALS: dict[str, tuple[float, float]] = {
    "Bratislava": (48.15, 17.11),
    "Trnava": (48.38, 17.59),
    "Trenčín": (48.89, 18.04),
    "Nitra": (48.31, 18.09),
    "Žilina": (49.22, 18.74),
    "Banská Bystrica": (48.74, 19.15),
    "Prešov": (49.00, 21.23),
    "Košice": (48.72, 21.26),
}


def open_grid(stem: str):
    """Open the .tif inside the ZIP, return (dataset, raw_bytes_holder)."""
    zpath = GRIDS_DIR / f"{stem}.zip"
    with zipfile.ZipFile(zpath) as z:
        tif = next(n for n in z.namelist() if n.endswith(".tif"))
        buf = io.BytesIO(z.read(tif))
    ds = rasterio.open(buf)
    crs = ds.crs.to_string() if ds.crs else "?"
    assert "5514" in crs, f"CRS check FAILED for {stem}: {crs} (expected {EXPECTED_CRS})"
    return ds, buf


def reproject_rings(geom: dict, tr: Transformer) -> list:
    """GeoJSON Polygon/MultiPolygon (lon/lat) -> list of polygons in EPSG:5514."""
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    out = []
    for rings in polys:
        out_rings = []
        for ring in rings:
            xs, ys = tr.transform([p[0] for p in ring], [p[1] for p in ring])
            out_rings.append(list(zip(xs, ys)))
        out.append(out_rings)
    return out


def main() -> int:
    tr = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)
    geo = json.loads(GEO_PATH.read_text(encoding="utf-8"))
    kraj_geoms = {f["properties"]["slug"]: f["geometry"] for f in geo["features"]}
    kraj_5514 = {s: reproject_rings(g, tr) for s, g in kraj_geoms.items()}

    # Capital coords in grid CRS.
    cap_xy = {c: tr.transform(lo, la) for c, (la, lo) in CAPITALS.items()}

    eobs = json.loads(EOBS_PATH.read_text(encoding="utf-8")) if EOBS_PATH.exists() else None

    result: dict = {
        "source": "SHMÚ otvorené dáta opendata.shmu.sk, normály 1991–2020, licencia CC BY 4.0",
        "period": "1991–2020",
        "crs": EXPECTED_CRS,
        "capitals": {},
        "kraje": {},
    }

    for key, (stem, field, nd) in GRIDS.items():
        ds, _buf = open_grid(stem)
        arr = ds.read(1, masked=True)
        print(f"[{key}] {ds.width}x{ds.height}, valid cells: {(~arr.mask).sum()}")
        for city, (x, y) in cap_xy.items():
            row, col = ds.index(x, y)
            v = arr[row, col]
            val = None if np.ma.is_masked(v) else round(float(v), nd)
            result["capitals"].setdefault(city, {})[field] = val
        for slug, polys in kraj_5514.items():
            geoms = [{"type": "Polygon", "coordinates": p} for p in polys]
            inside = geometry_mask(geoms, out_shape=ds.shape,
                                   transform=ds.transform, invert=True)
            vals = arr[(inside) & (~arr.mask)]
            entry = result["kraje"].setdefault(slug, {})
            entry[field] = round(float(vals.mean()), nd) if len(vals) else None
            entry["n_cells"] = int((inside & (~arr.mask)).sum())
        ds.close()

    OUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=1),
                        encoding="utf-8")
    print(f"Wrote {OUT_PATH}")

    print("\nSHMU 1991–2020 normal  vs  E-OBS 2020–2025 mean (capitals):")
    print(f"{'mesto':16s} {'TD':>5s} {'TN':>5s} {'FR':>5s} {'RR':>6s} {'TG':>6s}")
    for city in CAPITALS:
        s = result["capitals"][city]
        line = (f"{city:16s} {s['tropical_days']:5.1f} {s['tropical_nights']:5.1f} "
                f"{s['frost_days']:5.1f} {s['precip_sum_mm']:6.0f} {s['avg_temp_c']:6.2f}")
        if eobs:
            ys = [eobs["capitals"][city][str(y)] for y in (2020, 2021, 2022, 2023, 2024, 2025)]
            line += (f"   | E-OBS Ø20–25: {np.mean([d['tropical_days'] for d in ys]):5.1f} "
                     f"{np.mean([d['tropical_nights'] for d in ys]):5.1f} "
                     f"{np.mean([d['frost_days'] for d in ys]):5.1f} "
                     f"{np.mean([d['precip_sum_mm'] for d in ys]):6.0f} "
                     f"{np.mean([d['avg_temp_c'] for d in ys]):6.2f}")
        print(line)
    print("\nSHMU 1991–2020 normal (kraje):")
    for slug in sorted(result["kraje"]):
        k = result["kraje"][slug]
        print(f"  {slug:16s} TD {k['tropical_days']:5.1f} TN {k['tropical_nights']:4.1f} "
              f"FR {k['frost_days']:6.1f} RR {k['precip_sum_mm']:6.0f} "
              f"TG {k['avg_temp_c']:5.2f} ({k['n_cells']} cells)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
