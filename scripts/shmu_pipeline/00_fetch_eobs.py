"""Download E-OBS daily grids (v34.0e, open data licence) for sk-klima.

Dataset: insitu-gridded-observations-europe (Copernicus CDS)
Auth: ~/.cdsapirc (created manually by the user, never touched by this script).
Docs: DATA_SOURCE.md §11.

Since 2026-11-04 the CDS dataset has a `licence_type` field and no longer
splits the archive into periods: one request returns 1950-present.
open_data_licence = E-OBS_EU (EU + NO/CH/IS/UK), CC BY 4.0.

Variables: TX/TN/TG/RR (max/min/mean temperature, precipitation).
Product: ensemble_mean, resolution 0.1deg, version 34.0e.

Raw file lands in data_raw/eobs_open/ (git-ignored). Later steps subset it
to Slovakia + single years and delete nothing until verified.
"""

import hashlib
import sys
import zipfile
from pathlib import Path

import cdsapi

DATASET = "insitu-gridded-observations-europe"
OUT_DIR = Path(__file__).resolve().parents[2] / "data_raw" / "eobs_open"

VARIABLES = [
    "maximum_temperature",
    "minimum_temperature",
    "mean_temperature",
    "precipitation_amount",
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def main(argv: list[str]) -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    client = cdsapi.Client()
    print(f"Target dir: {OUT_DIR}")
    print(f"Variables: {len(VARIABLES)} (TX/TN/TG/RR)")
    print("Progress: CDS prepares the request on its servers first (queue),")
    print("then downloads. cdsapi shows a progress bar per file.")
    print()
    target = OUT_DIR / "eobs_v34_0e_open.zip"
    print(f"{target.name}")
    if target.exists():
        size_mb = target.stat().st_size / 1024 / 1024
        print(f"  [skip] already present ({size_mb:.1f} MB)")
        print(f"  sha256={sha256(target)}")
        return 0
    request = {
        "licence_type": ["open_data_licence"],
        "product_type": ["ensemble_mean"],
        "variable": VARIABLES,
        "grid_resolution": ["0_1deg"],
        "version": ["34_0e"],
    }
    try:
        client.retrieve(DATASET, request, str(target))
    except Exception as e:  # noqa: BLE001 - surface CDS errors verbatim
        print(f"  [ERROR]: {e}", file=sys.stderr)
        return 1
    size_mb = target.stat().st_size / 1024 / 1024
    print(f"  [done] {target.name} ({size_mb:.1f} MB)")
    print(f"  sha256={sha256(target)}")
    # CDS wraps the 4 NetCDFs in a ZIP: verify it opens and holds all vars.
    try:
        with zipfile.ZipFile(target) as z:
            names = z.namelist()
        assert len(names) == len(VARIABLES), f"expected {len(VARIABLES)} members, got {names}"
        print(f"  [zip-ok] {len(names)} members")
    except Exception as e:  # noqa: BLE001
        print(f"  [zip-BROKEN] {target.name}: {e}", file=sys.stderr)
        print("  -> delete the file and rerun.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
