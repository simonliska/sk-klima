"""Subset E-OBS chunks to Slovakia + needed years only.

Input:  data_raw/eobs_open/eobs_v33_0e_open.zip (ZIP with 4 NetCDF members,
        each covering 1950-2025, from 00_fetch_eobs.py)
Output: data_raw/eobs/sk/<var>_<year>.nc  (small working files; existing
        files are skipped - delete data_raw/eobs/sk to regenerate)

Needed years (timeline = 30-year WMO periods):
  1951..1980 (period 1951-1980), 1961..1990 (period 1961-1990),
  1981..2010 (period 1981-2010) + 2020..2025 (validation vs SHMU
  grids + daily JSON; recent single years kept only for checks).

Slovakia bbox with margin: lat 47.5-49.8, lon 16.5-22.8 (0.1deg grid).
Provenance attributes are copied to every output file.
"""

import sys
import zipfile
from pathlib import Path

import cftime
import numpy as np
from netCDF4 import Dataset

BASE = Path(__file__).resolve().parents[2] / "data_raw"
ZIP_PATH = BASE / "eobs_open" / "eobs_v33_0e_open.zip"
UNZIPPED = BASE / "eobs_open" / "unzipped"
OUT = BASE / "eobs" / "sk"

LAT_MIN, LAT_MAX = 47.5, 49.8
LON_MIN, LON_MAX = 16.5, 22.8

# years we actually need
YEARS = list(range(1951, 2011)) + [2020, 2021, 2022, 2023, 2024, 2025]

VAR_NAMES = {"tx": "tx", "tn": "tn", "tg": "tg", "rr": "rr"}


def ensure_member(var: str) -> Path:
    """Extract one variable file from the ZIP, return its path."""
    prefix = {"tx": "tx_", "tn": "tn_", "tg": "tg_", "rr": "rr_"}[var]
    with zipfile.ZipFile(ZIP_PATH) as z:
        member = next(n for n in z.namelist() if n.startswith(prefix))
        target = UNZIPPED / member
        if not target.exists():
            print(f"  [extract] {member}")
            z.extract(member, UNZIPPED)
        return target


def subset_year(src: Path, var: str, year: int) -> Path:
    """Slice one year + Slovakia bbox from a full-Europe file."""
    target = OUT / f"{var}_{year}.nc"
    if target.exists():
        print(f"  [skip] {target.name}")
        return target
    ds = Dataset(src)
    time = ds.variables["time"]
    dates = cftime.num2date(time[:], time.units, calendar="standard")
    day_idx = np.array([d.year == year for d in dates])
    if not day_idx.any():
        raise ValueError(f"year {year} not found in {src.name}")
    lat = np.array(ds.variables["latitude"])
    lon = np.array(ds.variables["longitude"])
    lat_idx = np.where((lat >= LAT_MIN) & (lat <= LAT_MAX))[0]
    lon_idx = np.where((lon >= LON_MIN) & (lon <= LON_MAX))[0]
    print(
        f"  [subset] {var} {year}: {day_idx.sum()} days, "
        f"lat[{lat[lat_idx[0]]:.1f}..{lat[lat_idx[-1]]:.1f}] "
        f"lon[{lon[lon_idx[0]]:.1f}..{lon[lon_idx[-1]]:.1f}]"
    )
    data = np.array(
        ds.variables[var][day_idx][:, lat_idx[:, None], lon_idx], dtype=np.float32
    )
    out = Dataset(target, "w")
    out.createDimension("time", data.shape[0])
    out.createDimension("latitude", data.shape[1])
    out.createDimension("longitude", data.shape[2])
    for name, values, units in [
        ("time", np.where(day_idx)[0].astype(np.int32), time.units),
        ("latitude", lat[lat_idx].astype(np.float32), "degrees_north"),
        ("longitude", lon[lon_idx].astype(np.float32), "degrees_east"),
    ]:
        v = out.createVariable(name, values.dtype, (name,))
        v[:] = values
        v.units = units
    vd = out.createVariable(var, np.float32, ("time", "latitude", "longitude"), fill_value=-9999.0)
    vd[:] = data
    vd.units = ds.variables[var].units
    out.setncattr("source", "E-OBS v33.0e ensemble_mean (open_data_licence, EU), CDS insitu-gridded-observations-europe")
    out.setncattr("subset_year", year)
    out.setncattr("subset_bbox", f"lat {LAT_MIN}-{LAT_MAX}, lon {LON_MIN}-{LON_MAX}")
    out.close()
    ds.close()
    print(f"    -> {target.name} ({target.stat().st_size / 1024 / 1024:.1f} MB)")
    return target


def main(argv: list[str]) -> int:
    only_years = [int(a) for a in argv[1:] if a.isdigit()]
    OUT.mkdir(parents=True, exist_ok=True)
    UNZIPPED.mkdir(parents=True, exist_ok=True)
    for year in YEARS:
        if only_years and year not in only_years:
            continue
        for var in ("tx", "tn", "tg", "rr"):
            src = ensure_member(var)
            subset_year(src, var, year)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
