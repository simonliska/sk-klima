"""Sample SHMU 1991-2020 normals + RCP4.5 grids at the district towns.

Input:  scripts/shmu_pipeline/okresne_mesta.csv (71 towns, lat/lon WGS84)
        data_raw/shmu/grids/*.zip, data_raw/shmu/rcp45/*.zip
Output: src/data/towns.json

Point value = mean of the valid pixels within a 750 m radius square window
around the town centre (window sized in metres, so 200 m and 500 m grids
cover the same ground). The centre-pixel value is stored as well for
sanity checks. Past (E-OBS) values are intentionally NOT included.
"""
import csv
import io
import json
import zipfile
from pathlib import Path

import numpy as np
import rasterio
from pyproj import Transformer

BASE = Path(__file__).resolve().parents[2]
RADIUS_M = 750.0
# metric -> (normal stem, rcp indicator, decimals)
GRIDS = {
    "avg_temp": ("PriemernaRocnaTeplotaVzduchu", "PriemernaRocnaTeplotaVzduchu", 2),
    "tropical_days": ("PriemernyPocetTropickychDni", "PriemernyPocetTropickychDni", 1),
    "tropical_nights": ("PriemernyPocetTropickychNoci", "PriemernyPocetTropickychNoci", 1),
    "frost_days": ("PriemernyPocetMrazovychDni", "PriemernyPocetMrazovychDni", 1),
    "precip_sum": ("PriemerneRocneAtmosferickeZrazky", "PriemerneRocneAtmosferickeZrazky", 0),
    "heavy_days": ("PriemernyPocetDniNad40", "PriemernyPocetDniNad40mm", 2),
}
PERIODS = [("1991-2020", None), ("2050", "2021_2050"), ("2100", "2071_2100")]
tr = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)


def open_zip(path: Path):
    with zipfile.ZipFile(path) as z:
        tif = next(n for n in z.namelist() if n.endswith(".tif"))
        buf = io.BytesIO(z.read(tif))
    ds = rasterio.open(buf)
    assert "5514" in str(ds.crs), f"CRS check FAILED for {path.name}"
    return ds


def sample(ds, arr, x, y, dec):
    r, c = ds.index(x, y)
    n = max(1, int(round(RADIUS_M / abs(ds.res[0]))))
    win = arr[max(r - n, 0):r + n + 1, max(c - n, 0):c + n + 1]
    centre = arr[r, c]
    if win.count() == 0:
        return None, None, 0
    cv = None if np.ma.is_masked(centre) else round(float(centre), dec)
    return round(float(win.mean()), dec), cv, int(win.count())


def main() -> int:
    towns = list(csv.DictReader(open(BASE / "scripts/shmu_pipeline/okresne_mesta.csv", encoding="utf-8")))
    xy = {t["slug"]: tr.transform(float(t["lon"]), float(t["lat"])) for t in towns}
    out = {
        "source": "SHMÚ otvorené dáta opendata.shmu.sk, normál 1991–2020 a scenár RCP4.5, licencia CC BY 4.0",
        "method": f"mean of valid grid pixels within a +/-{int(RADIUS_M)} m window around the town centre",
        "towns": {
            t["slug"]: {"name": t["name"], "district": t["district"], "kraj": t["kraj"],
                        "lat": float(t["lat"]), "lon": float(t["lon"]),
                        "coordSource": t["source"], "values": {}, "centre": {}}
            for t in towns
        },
    }
    for metric, (nstem, ind, dec) in GRIDS.items():
        for pid, per in PERIODS:
            path = (BASE / f"data_raw/shmu/grids/KlimaAdapt_{nstem}_1991_2020.zip" if per is None
                    else BASE / f"data_raw/shmu/rcp45/KlimaAdapt_{ind}_rcp45_{per}.zip")
            ds = open_zip(path)
            arr = ds.read(1, masked=True)
            for slug, (x, y) in xy.items():
                mean, centre, n = sample(ds, arr, x, y, dec)
                out["towns"][slug]["values"].setdefault(metric, {})[pid] = mean
                out["towns"][slug]["centre"].setdefault(metric, {})[pid] = centre
                out["towns"][slug].setdefault("nPixels", {})[f"{metric}/{pid}"] = n
            ds.close()
        print(f"[{metric}] done")
    # Kraj means (same SHMU grids, polygon means from 04/07) for "town vs kraj".
    ref = json.loads((BASE / "data_raw/shmu/reference_1991_2020.json").read_text(encoding="utf-8"))
    rcp = json.loads((BASE / "data_raw/shmu/scenarios_rcp45.json").read_text(encoding="utf-8"))
    field = {"avg_temp": "avg_temp_c", "tropical_days": "tropical_days",
             "tropical_nights": "tropical_nights", "frost_days": "frost_days",
             "precip_sum": "precip_sum_mm", "heavy_days": "heavy_days"}
    out["kraje"] = {
        k: {m: {"1991-2020": ref["kraje"][k][f], "2050": rcp["kraje"][k]["2050"][f],
                "2100": rcp["kraje"][k]["2100"][f]} for m, f in field.items()}
        for k in ref["kraje"]
    }
    path = BASE / "src/data/towns.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Wrote {path} ({path.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
