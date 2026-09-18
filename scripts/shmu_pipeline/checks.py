"""Validation checks: E-OBS indicators vs SHMU normals vs SHMU daily JSON.

Reads data_raw/eobs/indicators.json + data_raw/shmu/reference_1991_2020.json
(+ one month of SHMU daily JSON, downloaded on demand).
Fails loudly (exit 1) on any violation. No invented values: every check
compares two computed products or asserts completeness/plausibility ranges.

Checks:
  1. completeness >= 90 % everywhere, status ok (both products, no nulls).
  2. Plausible physical ranges for SHMU normals.
  3. Cross-dataset magnitude: |E-OBS 2000 TG - SHMU normal| < 2.5 °C
     (catches unit / coordinate / CRS blunders, not climate).
  4. Trend direction: E-OBS 1950 colder + more frost than 2024 (per city).
  5. Recent warmth: E-OBS 2020-2025 mean TG above SHMU normal - 0.5 °C.
  6. SHMU daily JSON spot check (July 2025): schema columns exist;
     hot-day share (t_max >= 30) is order-of-magnitude consistent with
     E-OBS TX >= 30 share over SK in the same month (stations skew
     lowland-hot vs grid incl. mountains, so only a loose bound).
"""

from __future__ import annotations

import io
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import numpy as np
from netCDF4 import Dataset

BASE = Path(__file__).resolve().parents[2]
EOBS_PATH = BASE / "data_raw" / "eobs" / "indicators.json"
SHMU_PATH = BASE / "data_raw" / "shmu" / "reference_1991_2020.json"
RCP_PATH = BASE / "data_raw" / "shmu" / "scenarios_rcp45.json"
DAILY_DIR = BASE / "data_raw" / "shmu" / "daily"

FAILURES: list[str] = []


def check(cond: bool, msg: str) -> None:
    print(("  [ok] " if cond else "  [FAIL] ") + msg)
    if not cond:
        FAILURES.append(msg)


def main() -> int:
    eobs = json.loads(EOBS_PATH.read_text(encoding="utf-8"))
    shmu = json.loads(SHMU_PATH.read_text(encoding="utf-8"))

    print("== 1. completeness + status ==")
    for city, years in eobs["capitals"].items():
        for y, d in years.items():
            check(d["status"] == "ok" and d["completeness"] >= 0.9,
                  f"E-OBS {city} {y}: status={d['status']} compl={d['completeness']}")
    for slug, years in eobs["kraje"].items():
        for y, d in years.items():
            check(d.get("status") == "ok" and d.get("completeness", 0) >= 0.9
                  and d.get("n_cells", 0) > 0,
                  f"E-OBS kraj {slug} {y}: {d.get('status')}/{d.get('completeness')}")
    for city, vals in shmu["capitals"].items():
        check(all(v is not None for v in vals.values()), f"SHMU {city}: no nulls")
    for slug, vals in shmu["kraje"].items():
        check(all(vals.get(k) is not None for k in
                  ("avg_temp_c", "tropical_days", "tropical_nights",
                   "frost_days", "precip_sum_mm")) and vals.get("n_cells", 0) > 100,
              f"SHMU kraj {slug}: values + cells={vals.get('n_cells')}")

    print("== 2. SHMU plausible ranges ==")
    bounds = {"avg_temp_c": (-5, 13), "tropical_days": (0, 60),
              "tropical_nights": (0, 15), "frost_days": (50, 260),
              "precip_sum_mm": (400, 2600), "heavy_days": (0, 8)}
    for city, vals in shmu["capitals"].items():
        for k, (lo, hi) in bounds.items():
            check(lo <= vals[k] <= hi, f"SHMU {city} {k}={vals[k]} in [{lo},{hi}]")

    print("== 3. cross-dataset magnitude (E-OBS 2000 vs SHMU normal) ==")
    for city in shmu["capitals"]:
        e = eobs["capitals"][city]["2000"]
        s = shmu["capitals"][city]
        check(abs(e["avg_temp_c"] - s["avg_temp_c"]) < 2.5,
              f"{city}: E-OBS2000 {e['avg_temp_c']} vs SHMU {s['avg_temp_c']}")
        check(abs(e["heavy_days"] - s["heavy_days"]) < 2.0,
              f"{city}: E-OBS2000 heavy {e['heavy_days']} vs SHMU {s['heavy_days']}")

    print("== 4. trend direction 1951 -> 2024 (E-OBS capitals) ==")
    for city, years in eobs["capitals"].items():
        a, b = years["1951"], years["2024"]
        check(b["avg_temp_c"] > a["avg_temp_c"],
              f"{city}: TG 2024 {b['avg_temp_c']} > 1951 {a['avg_temp_c']}")
        check(b["frost_days"] <= a["frost_days"],
              f"{city}: frost 2024 {b['frost_days']} <= 1951 {a['frost_days']}")

    print("== 5. recent warmth vs normal ==")
    for city in shmu["capitals"]:
        recent = float(np.mean([eobs["capitals"][city][str(y)]["avg_temp_c"]
                                for y in range(2020, 2026)]))
        check(recent > shmu["capitals"][city]["avg_temp_c"] - 0.5,
              f"{city}: E-OBS Ø20-25 {recent:.2f} vs normal "
              f"{shmu['capitals'][city]['avg_temp_c']}")

    print("== 6. SHMU daily JSON spot check (July 2025 hot-day share) ==")
    spot_ok = daily_spot_check(eobs)

    print("== 6b. E-OBS 30-year periods monotonic warming ==")
    periods = json.loads(
        (BASE / "data_raw" / "eobs" / "periods.json").read_text(
            encoding="utf-8"))
    for slug, per in periods["kraje"].items():
        ts = [per[p]["avg_temp_c"] for p in ("1951-1980", "1961-1990", "1981-2010")]
        check(ts[2] > ts[0],
              f"period kraj {slug}: TG 1981-2010 {ts[2]} > 1951-1980 {ts[0]}")
        check(per["1981-2010"]["frost_days"] <= per["1951-1980"]["frost_days"],
              f"period kraj {slug}: frost III <= I")
        for p in ("1951-1980", "1961-1990", "1981-2010"):
            check(per[p]["status"] == "ok" and per[p]["n_years"] == 30,
                  f"period kraj {slug} {p}: ok/30y")

    print("== 7. RCP4.5 progression (SHMU normal < 2050 <= 2100) ==")
    rcps = {"rcp45": json.loads(
        (BASE / "data_raw" / "shmu" / "scenarios_rcp45.json").read_text(
            encoding="utf-8"))}
    for sc, rcp in rcps.items():
        for city in shmu["capitals"]:
            n = shmu["capitals"][city]
            a = rcp["capitals"][city]["2050"]
            b = rcp["capitals"][city]["2100"]
            check(a["avg_temp_c"] > n["avg_temp_c"],
                  f"RCP {city} {sc}: 2050 TG {a['avg_temp_c']} > normal {n['avg_temp_c']}")
            check(b["avg_temp_c"] >= a["avg_temp_c"],
                  f"RCP {city} {sc}: 2100 TG {b['avg_temp_c']} >= 2050 {a['avg_temp_c']}")
            check(a["tropical_days"] >= n["tropical_days"],
                  f"RCP {city} {sc}: 2050 TD {a['tropical_days']} >= normal {n['tropical_days']}")
            check(b["tropical_days"] >= a["tropical_days"],
                  f"RCP {city} {sc}: 2100 TD {b['tropical_days']} >= 2050 {a['tropical_days']}")
            check(a["frost_days"] <= n["frost_days"],
                  f"RCP {city} {sc}: 2050 frost {a['frost_days']} <= normal {n['frost_days']}")
            check(b["frost_days"] <= a["frost_days"],
                  f"RCP {city} {sc}: 2100 frost {b['frost_days']} <= 2050 {a['frost_days']}")
            check(0 <= b["tropical_nights"] <= 60,
                  f"RCP {city} {sc}: 2100 TN {b['tropical_nights']} sane")
            check(0 <= a["heavy_days"] <= 8 and 0 <= b["heavy_days"] <= 8,
                  f"RCP {city} {sc}: heavy 2050 {a['heavy_days']} / 2100 {b['heavy_days']} sane")
    print()

    if FAILURES or not spot_ok:
        print(f"CHECKS FAILED: {len(FAILURES)} hard failures.")
        return 1
    print("ALL CHECKS PASSED.")
    return 0


def daily_spot_check(eobs: dict) -> bool:
    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    target = DAILY_DIR / "kli-inter-2025-07.json"
    url = ("https://opendata.shmu.sk/meteorology/climate/recent/data/daily/"
           "2025-07/kli-inter%20-%202025-07.json")
    if not target.exists():
        print(f"  [get] {url}")
        try:
            subprocess.run(["curl", "-fSL", "--retry", "3", "-o", str(target), url],
                           check=True, capture_output=True)
        except Exception as e:  # noqa: BLE001
            print(f"  [skip] daily download failed: {e}")
            return True  # soft-skip: network only, not a data failure
    doc = json.loads(target.read_text(encoding="utf-8"))
    rows = doc.get("data", [])
    check(isinstance(rows, list) and len(rows) > 2000,
          f"daily rows present ({len(rows)})")
    cols = set()
    for r in rows[:50]:
        cols.update(r.keys())
    for c in ("t_max", "datum", "ind_kli"):
        check(c in cols, f"daily column '{c}' exists")
    if any(c not in cols for c in ("t_max", "datum")):
        return False
    july = [r for r in rows if str(r.get("datum", "")).startswith("2025-07")]
    vals = [r["t_max"] for r in july if r.get("t_max") is not None]
    check(len(vals) > 2000, f"July t_max values ({len(vals)})")
    station_share = sum(v >= 30.0 for v in vals) / max(len(vals), 1)
    print(f"  [info] SHMU stations July 2025 hot-day share: {station_share:.3f}")

    # Same month in E-OBS: TX>=30 share over SK subset cells.
    eobs_share = eobs_july_share(2025, 7)
    print(f"  [info] E-OBS July 2025 hot-cell share: {eobs_share:.3f}")
    # Stations skew toward hot lowlands, grid includes cool mountains:
    # station share should not be far below grid share; both sane (< 0.8).
    ok = station_share >= eobs_share - 0.20 and station_share < 0.8
    check(ok, f"hot-share order-of-magnitude (stations {station_share:.2f} "
              f"vs grid {eobs_share:.2f})")
    return ok


def eobs_july_share(year: int, month: int) -> float:
    import cftime
    path = BASE / "data_raw" / "eobs" / "sk" / f"tx_{year}.nc"
    ds = Dataset(path)
    time = ds.variables["time"]
    dates = cftime.num2date(time[:], time.units, calendar="standard")
    idx = np.array([d.month == month for d in dates])
    a = np.asarray(ds.variables["tx"][:], dtype=np.float64)
    ds.close()
    sel = a[idx]
    valid = sel > -900.0
    return float(((sel >= 30.0) & valid).sum() / valid.sum())


if __name__ == "__main__":
    raise SystemExit(main())
