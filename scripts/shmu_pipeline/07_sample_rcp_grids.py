"""Sample SHMU RCP4.5 scenario grids at capitals + kraj means.

Input:  data_raw/shmu/rcp45/*.zip (from 06_fetch_rcp_grids.py)
Output: data_raw/shmu/scenarios_rcp45.json
Parameter "rcp85" is still accepted (SHMÚ provides those grids too)
but this web does not use it.

Same method as 04_sample_shmu_grids.py (EPSG:5514 verified, 500 m grid,
capitals = single pixel, kraje = rasterized polygon means).
Periods are 30-year means: 2021-2050 (-> UI 2050), 2071-2100 (-> UI 2100).

Attribution: SHMÚ otvorené dáta opendata.shmu.sk, licencia CC BY 4.0.
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
GEO_PATH = BASE / "public" / "geo" / "kraje.geo.json"

PERIODS = {"2021_2050": 2050, "2071_2100": 2100}

GRIDS = {
    "avg_temp": ("PriemernaRocnaTeplotaVzduchu", "avg_temp_c", 2),
    "tropical_days": ("PriemernyPocetTropickychDni", "tropical_days", 1),
    "tropical_nights": ("PriemernyPocetTropickychNoci", "tropical_nights", 1),
    "frost_days": ("PriemernyPocetMrazovychDni", "frost_days", 1),
    "precip_sum": ("PriemerneRocneAtmosferickeZrazky", "precip_sum_mm", 1),
    "heavy_days": ("PriemernyPocetDniNad40mm", "heavy_days", 1),
}

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


def open_grid(rcp_dir: Path, scenario: str, ind: str, period: str):
    stem = f"KlimaAdapt_{ind}_{scenario}_{period}"
    with zipfile.ZipFile(rcp_dir / f"{stem}.zip") as z:
        tif = next(n for n in z.namelist() if n.endswith(".tif"))
        buf = io.BytesIO(z.read(tif))
    ds = rasterio.open(buf)
    assert "5514" in str(ds.crs), f"CRS check FAILED for {stem}: {ds.crs}"
    return ds, buf


def reproject_rings(geom: dict, tr: Transformer) -> list:
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    out = []
    for rings in polys:
        out_rings = []
        for ring in rings:
            xs, ys = tr.transform([p[0] for p in ring], [p[1] for p in ring])
            out_rings.append(list(zip(xs, ys)))
        out.append(out_rings)
    return out


def main(argv: list[str]) -> int:
    scenario = argv[1] if len(argv) > 1 else "rcp45"
    assert scenario in ("rcp45", "rcp85"), f"unknown scenario {scenario}"
    label = scenario.upper()
    rcp_dir = BASE / "data_raw" / "shmu" / scenario
    out_path = BASE / "data_raw" / "shmu" / f"scenarios_{scenario}.json"
    tr = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)
    geo = json.loads(GEO_PATH.read_text(encoding="utf-8"))
    kraj_5514 = {f["properties"]["slug"]: reproject_rings(f["geometry"], tr)
                 for f in geo["features"]}
    cap_xy = {c: tr.transform(lo, la) for c, (la, lo) in CAPITALS.items()}

    result: dict = {
        "source": f"SHMÚ otvorené dáta opendata.shmu.sk, scenár {label} (CMIP5), licencia CC BY 4.0",
        "scenario": label,
        "note": "30-year means; 2021-2050 feeds UI year 2050, 2071-2100 feeds UI year 2100",
        "capitals": {},
        "kraje": {},
    }
    for period, ui_year in PERIODS.items():
        print(f"== {period} (-> {ui_year}) ==")
        for key, (ind, field, nd) in GRIDS.items():
            ds, _buf = open_grid(rcp_dir, scenario, ind, period)
            arr = ds.read(1, masked=True)
            for city, (x, y) in cap_xy.items():
                row, col = ds.index(x, y)
                v = arr[row, col]
                val = None if np.ma.is_masked(v) else round(float(v), nd)
                result["capitals"].setdefault(city, {}).setdefault(
                    str(ui_year), {})[field] = val
            for slug, polys in kraj_5514.items():
                geoms = [{"type": "Polygon", "coordinates": p} for p in polys]
                inside = geometry_mask(geoms, out_shape=ds.shape,
                                       transform=ds.transform, invert=True)
                vals = arr[(inside) & (~arr.mask)]
                entry = result["kraje"].setdefault(slug, {}).setdefault(
                    str(ui_year), {})
                entry[field] = round(float(vals.mean()), nd) if len(vals) else None
                entry["n_cells"] = int((inside & (~arr.mask)).sum())
            ds.close()
        print(f"  BA 2050/2100 TG: "
              f"{result['capitals']['Bratislava'][str(ui_year)]['avg_temp_c']}")

    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=1),
                        encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"\n{label} capitals (2050 / 2100): TD, TG:")
    for city in CAPITALS:
        a = result["capitals"][city]["2050"]
        b = result["capitals"][city]["2100"]
        print(f"  {city:16s} TD {a['tropical_days']:5.1f} -> {b['tropical_days']:5.1f} | "
              f"TG {a['avg_temp_c']:5.2f} -> {b['avg_temp_c']:5.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
