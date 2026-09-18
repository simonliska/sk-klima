"""Compute annual climate indicators from E-OBS Slovakia subsets.

Input:  data_raw/eobs/sk/<var>_<year>.nc  (TX/TN/TG/RR, from 01_subset_slovakia.py)
Output: data_raw/eobs/indicators.json

Indicators (same thresholds as SHMU, DATA_SOURCE.md §3):
  - tropical_days   = count(TX >= 30.0 °C)
  - tropical_nights = count(TN >= 20.0 °C)
  - frost_days      = count(TN <  0.0 °C)
  - heavy_days      = count(RR >  40.0 mm)  (SHMÚ DniNad40 definition)
  - precip_sum_mm   = SUM(RR)
  - avg_temp_c      = MEAN(TG)

Two spatial levels:
  - capitals: 8 kraj cities, nearest-grid-cell (0.1deg grid ~ 11 km).
  - kraje: daily spatial mean over grid cells whose centre falls inside
    the kraj polygon from public/geo/kraje.geo.json (ray-casting
    point-in-polygon, pure stdlib — no geopandas). Linear indicators
    (avg_temp_c, precip_sum_mm) are computed on the regional-mean daily
    series. Threshold-count indicators (tropical_days, tropical_nights,
    frost_days, heavy_days) are computed PER CELL and then averaged
    over kraj cells (mean of per-cell annual counts) — counting on the
    smoothed mean series would systematically erase hot events in
    mountainous kraje and inflate frost days. This matches the SHMU
    grid semantics (mean of per-pixel mean counts).

Completeness rule (DATA_SOURCE.md §3): an annual value is published only
if >= 90 % of days are valid; otherwise the year is flagged
"insufficient_data". E-OBS over land has no gaps in practice; the check
is still enforced.

No invented numbers: everything is computed from the NetCDF subsets.
City coordinates below are approximate city centres (nearest 0.1deg cell
is insensitive to ±2 km, i.e. any public gazetteer gives the same cell).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from netCDF4 import Dataset

BASE = Path(__file__).resolve().parents[2]
SK_DIR = BASE / "data_raw" / "eobs" / "sk"
GEO_PATH = BASE / "public" / "geo" / "kraje.geo.json"
OUT_PATH = BASE / "data_raw" / "eobs" / "indicators.json"
PERIODS_PATH = BASE / "data_raw" / "eobs" / "periods.json"

# Annual years: full coverage for the three WMO past periods
# (1951-1980, 1961-1990, 1981-2010) + recent years for validation.
YEARS = list(range(1951, 2011)) + [2020, 2021, 2022, 2023, 2024, 2025]

# Past timeline periods (WMO 30-year normals from observations).
# 1991-2020 comes from the authoritative SHMU grids (not E-OBS),
# 2021-2050 / 2071-2100 from SHMU RCP4.5 grids — see 05_emit_frontend.py.
PERIODS: dict[str, list[int]] = {
    "1951-1980": list(range(1951, 1981)),
    "1961-1990": list(range(1961, 1991)),
    "1981-2010": list(range(1981, 2011)),
}

# Approximate city centres (lat, lon). Only used to pick the nearest
# 0.1° grid cell (~11 km), so metre-level precision is irrelevant.
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

CAPITAL_TO_KRAJ = {
    "Bratislava": "bratislavsky",
    "Trnava": "trnavsky",
    "Trenčín": "trenciansky",
    "Nitra": "nitriansky",
    "Žilina": "zilinsky",
    "Banská Bystrica": "banskobystricky",
    "Prešov": "presovsky",
    "Košice": "kosicky",
}

MISSING_CUTOFF = -900.0  # subset fill_value is -9999.0; anything below is missing


def load_var(var: str, year: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Return (masked_data[time,lat,lon], lat[lat], lon[lon])."""
    path = SK_DIR / f"{var}_{year}.nc"
    if not path.exists():
        raise FileNotFoundError(f"missing subset file: {path}")
    ds = Dataset(path)
    raw = np.asarray(ds.variables[var][:], dtype=np.float64)
    lat = np.asarray(ds.variables["latitude"][:], dtype=np.float64)
    lon = np.asarray(ds.variables["longitude"][:], dtype=np.float64)
    ds.close()
    masked = np.ma.masked_where(raw <= MISSING_CUTOFF, raw)
    return masked, lat, lon


def point_in_ring(lon: float, lat: float, ring: list) -> bool:
    """Ray casting for a single linear ring. Ring points are [lon, lat]."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > lat) != (yj > lat):
            xinters = (xj - xi) * (lat - yi) / (yj - yi) + xi
            if lon < xinters:
                inside = not inside
        j = i
    return inside


def point_in_polygon(lon: float, lat: float, rings: list) -> bool:
    """Outer ring minus holes (GeoJSON Polygon coordinates)."""
    if not point_in_ring(lon, lat, rings[0]):
        return False
    for hole in rings[1:]:
        if point_in_ring(lon, lat, hole):
            return False
    return True


def kraj_cell_masks(lat: np.ndarray, lon: np.ndarray) -> dict[str, np.ndarray]:
    """Boolean [lat, lon] mask per kraj slug: cell centre inside polygon."""
    geo = json.loads(GEO_PATH.read_text(encoding="utf-8"))
    masks: dict[str, np.ndarray] = {}
    for feat in geo["features"]:
        slug = feat["properties"]["slug"]
        geom = feat["geometry"]
        polys = (
            [geom["coordinates"]]
            if geom["type"] == "Polygon"
            else geom["coordinates"]
        )
        mask = np.zeros((len(lat), len(lon)), dtype=bool)
        for iy, la in enumerate(lat):
            for ix, lo in enumerate(lon):
                for rings in polys:
                    if point_in_polygon(lo, la, rings):
                        mask[iy, ix] = True
                        break
        masks[slug] = mask
        print(f"  [poly] {slug}: {mask.sum()} cells")
    return masks


def annual_indicators(
    tx: np.ndarray, tn: np.ndarray, tg: np.ndarray, rr: np.ndarray
) -> dict:
    """tx/tn/tg/rr are 1-D masked daily series. Returns indicator dict."""
    n_days = len(tx)
    valid = (
        ~(np.ma.getmaskarray(tx) | np.ma.getmaskarray(tn))
        & ~np.ma.getmaskarray(tg)
        & ~np.ma.getmaskarray(rr)
    )
    n_valid = int(valid.sum())
    completeness = n_valid / n_days if n_days else 0.0
    out: dict = {
        "n_days": n_days,
        "n_valid_days": n_valid,
        "completeness": round(completeness, 4),
    }
    if completeness < 0.9:
        out["status"] = "insufficient_data"
        return out
    out["status"] = "ok"
    txv = tx[valid].compressed() if isinstance(tx[valid], np.ma.MaskedArray) else np.asarray(tx[valid])
    tnv = np.asarray(tn[valid].compressed() if isinstance(tn[valid], np.ma.MaskedArray) else tn[valid])
    tgv = np.asarray(tg[valid].compressed() if isinstance(tg[valid], np.ma.MaskedArray) else tg[valid])
    rrv = np.asarray(rr[valid].compressed() if isinstance(rr[valid], np.ma.MaskedArray) else rr[valid])
    out["tropical_days"] = int((txv >= 30.0).sum())
    out["tropical_nights"] = int((tnv >= 20.0).sum())
    out["frost_days"] = int((tnv < 0.0).sum())
    out["heavy_days"] = int((rrv > 40.0).sum())
    out["precip_sum_mm"] = round(float(rrv.sum()), 1)
    out["avg_temp_c"] = round(float(tgv.mean()), 2)
    return out


def kraj_heavy_mean(rr: np.ma.MaskedArray, mask: np.ndarray) -> dict:
    """Mean of per-cell annual RR>40 counts over kraj cells.

    Heavy rain is localized; counting on the smoothed mean series would
    systematically erase events. This matches the SHMU grid semantics
    (mean of per-pixel mean counts).
    """
    return kraj_count_mean(rr, mask, 40.0, ">", "heavy_days")


def kraj_count_mean(var: np.ma.MaskedArray, mask: np.ndarray,
                    threshold: float, op: str, field: str) -> dict:
    """Mean of per-cell annual threshold counts over kraj cells.

    Generalization of the heavy-rain rule for TX>=30 (tropical days),
    TN>=20 (tropical nights), TN<0 (frost days): per-cell annual
    counts, then arithmetic mean over cells. Returns the same
    completeness/status envelope as annual_indicators plus
    {field} = mean count (1 decimal).
    """
    cell = var[:, mask]  # [time, cells]
    valid_days = ~np.ma.getmaskarray(cell).any(axis=1)
    n_valid = int(valid_days.sum())
    completeness = n_valid / cell.shape[0]
    out = {"n_days": cell.shape[0], "n_valid_days": n_valid,
           "completeness": round(float(completeness), 4)}
    if completeness < 0.9:
        out["status"] = "insufficient_data"
        return out
    sel = cell[valid_days]
    if op == ">":
        hits = (sel > threshold).sum(axis=0)
    elif op == ">=":
        hits = (sel >= threshold).sum(axis=0)
    else:  # "<"
        hits = (sel < threshold).sum(axis=0)
    counts = hits.compressed() \
        if isinstance(hits, np.ma.MaskedArray) else np.asarray(hits)
    out["status"] = "ok"
    out[field] = round(float(np.asarray(counts).mean()), 1)
    return out


def write_periods(result: dict) -> None:
    """Average annual indicators into 30-year WMO period means.

    Output: data_raw/eobs/periods.json — {capitals, kraje}[name][period]
    with mean annual values over the 30 years (temp 2dec, heavy/precip
    1dec, counts 1dec fractional — final display rounding in 05_emit).
    A period is published only if all 30 years have status ok.
    """
    MEAN_FIELDS = ("tropical_days", "tropical_nights", "frost_days",
                   "heavy_days", "precip_sum_mm", "avg_temp_c")
    out: dict = {
        "source": result["source"],
        "method": ("30-year arithmetic mean of annual indicators "
                   "from indicators.json; kraje threshold counts = mean of "
                   "annual mean-of-cell counts"),
        "periods": list(PERIODS),
        "capitals": {},
        "kraje": {},
    }
    for level in ("capitals", "kraje"):
        for name, by_year in result[level].items():
            for period, years in PERIODS.items():
                vals = [by_year.get(str(y)) for y in years]
                if any(v is None or v.get("status") != "ok" for v in vals):
                    out[level].setdefault(name, {})[period] = {
                        "status": "insufficient_data",
                        "reason": "not all 30 years ok",
                    }
                    continue
                agg: dict = {"status": "ok", "n_years": 30}
                for f in MEAN_FIELDS:
                    m = sum(v[f] for v in vals) / len(vals)  # type: ignore[index]
                    agg[f] = round(float(m), 2 if f == "avg_temp_c" else 1)
                if level == "kraje":
                    agg["n_cells"] = vals[0]["n_cells"]
                out[level].setdefault(name, {})[period] = agg
    PERIODS_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=1),
                            encoding="utf-8")
    print(f"Wrote {PERIODS_PATH} ({PERIODS_PATH.stat().st_size / 1024:.0f} KB)")
    for slug in sorted(out["kraje"]):
        row = " ".join(
            f"{p}:{out['kraje'][slug][p].get('avg_temp_c', '?')}"
            for p in PERIODS
        )
        print(f"  [period] KRAJ {slug:14s} TG {row}")


def main(argv: list[str]) -> int:
    years = [int(a) for a in argv[1:] if a.isdigit()] or YEARS
    print(f"Years: {years}")

    # Grid is identical in all subset files; read once.
    _, lat, lon = load_var("tx", years[0])
    print(f"Grid: lat {lat[0]:.2f}..{lat[-1]:.2f} ({len(lat)}), "
          f"lon {lon[0]:.2f}..{lon[-1]:.2f} ({len(lon)})")

    # Nearest grid cell per capital.
    cap_cells: dict[str, tuple[int, int]] = {}
    for city, (cla, clo) in CAPITALS.items():
        iy = int(np.argmin(np.abs(lat - cla)))
        ix = int(np.argmin(np.abs(lon - clo)))
        cap_cells[city] = (iy, ix)
        print(f"  [city] {city}: ({cla},{clo}) -> cell "
              f"({lat[iy]:.2f},{lon[ix]:.2f})")

    print("Kraj polygons:")
    masks = kraj_cell_masks(lat, lon)

    result: dict = {
        "source": "E-OBS v33.0e ensemble_mean, CDS insitu-gridded-observations-europe",
        "method": ("capitals = nearest 0.1deg grid cell; kraje linear "
                   "(avg_temp_c, precip_sum_mm) = daily spatial mean of cells, "
                   "then indicators; kraje threshold counts (tropical_days "
                   "TX>=30, tropical_nights TN>=20, frost_days TN<0, "
                   "heavy_days RR>40) = mean of per-cell annual counts; "
                   "completeness >= 90%"),
        "citation": ("We acknowledge the E-OBS dataset and the data providers in the "
                     "ECA&D project (https://www.ecad.eu). Cornes, R., G. van der Schrier, "
                     "E.J.M. van den Besselaar, and P.D. Jones. 2018: An Ensemble Version of "
                     "the E-OBS Temperature and Precipitation Datasets, J. Geophys. Res. "
                     "Atmos., 123. doi:10.1029/2017JD028200. Version E-OBSv33.0e, "
                     "DOI: 10.24381/cds.151d3ec6."),
        "years": years,
        "capitals": {},
        "kraje": {},
    }

    for year in years:
        print(f"[{year}] loading ...")
        tx, _, _ = load_var("tx", year)
        tn, _, _ = load_var("tn", year)
        tg, _, _ = load_var("tg", year)
        rr, _, _ = load_var("rr", year)

        for city, (iy, ix) in cap_cells.items():
            ind = annual_indicators(tx[:, iy, ix], tn[:, iy, ix],
                                    tg[:, iy, ix], rr[:, iy, ix])
            result["capitals"].setdefault(city, {})[str(year)] = ind

        for slug, mask in masks.items():
            n_cells = int(mask.sum())
            if n_cells == 0:
                result["kraje"].setdefault(slug, {})[str(year)] = {
                    "status": "insufficient_data",
                    "reason": "no grid cells in polygon",
                }
                continue
            # Linear indicators on the daily spatial mean series
            # (mean of means = mean, no threshold distortion).
            txm = np.ma.mean(tx[:, mask], axis=1)
            tnm = np.ma.mean(tn[:, mask], axis=1)
            tgm = np.ma.mean(tg[:, mask], axis=1)
            rrm = np.ma.mean(rr[:, mask], axis=1)
            ind = annual_indicators(txm, tnm, tgm, rrm)
            ind["n_cells"] = n_cells
            # Threshold counts: mean of per-cell annual counts
            # (matches SHMU grid semantics; counting on the smoothed
            # mean series would erase hot events / inflate frost).
            for var, thr, op, field in (
                (tx, 30.0, ">=", "tropical_days"),
                (tn, 20.0, ">=", "tropical_nights"),
                (tn, 0.0, "<", "frost_days"),
                (rr, 40.0, ">", "heavy_days"),
            ):
                c = kraj_count_mean(var, mask, thr, op, field)
                ind[field] = c.get(field)
            result["kraje"].setdefault(slug, {})[str(year)] = ind

    OUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=1),
                        encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size / 1024:.0f} KB)")

    write_periods(result)

    # Console summary for validation.
    print("\nYear  city/KRAJ        tropD tropN frost precip  tmean  compl")
    for year in years:
        for city in CAPITALS:
            d = result["capitals"][city][str(year)]
            if d["status"] == "ok":
                print(f"{year}  {city:16s} {d['tropical_days']:5d} {d['tropical_nights']:5d} "
                      f"{d['frost_days']:5d} {d['precip_sum_mm']:6.0f} {d['avg_temp_c']:6.2f} "
                      f"{d['completeness']:.2f}")
        for slug in sorted(masks):
            d = result["kraje"][slug][str(year)]
            if d.get("status") == "ok":
                print(f"{year}  KRAJ {slug:14s} {d['tropical_days']:5.1f} {d['tropical_nights']:5.1f} "
                      f"{d['frost_days']:5.1f} {d['precip_sum_mm']:6.0f} {d['avg_temp_c']:6.2f} "
                      f"{d['completeness']:.2f} ({d['n_cells']} cells)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
