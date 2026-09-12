"""Download E-OBS daily grids (v33.0e) needed for sk-klima historical indicators.

Dataset: insitu-gridded-observations-europe (Copernicus CDS)
Auth: ~/.cdsapirc (created manually by the user, never touched by this script).
Docs: DATA_SOURCE.md §11.

We need only three 15-year chunks (CDS splits the archive this way):
  1950_1964 -> year 1950 (timeline start, replaces 1900)
  1995_2010 -> year 2000
  2011_2025 -> validation overlap vs SHMU 1991-2020 grids + daily JSON

Variables: TX/TN/TG/RR (max/min/mean temperature, precipitation).
Product: ensemble_mean, resolution 0.1deg, version 33.0e.

Raw files land in data_raw/eobs/ (git-ignored). Later steps subset them
to Slovakia + single years and delete nothing until verified.
"""

import hashlib
import sys
import zipfile
from pathlib import Path

import cdsapi

DATASET = "insitu-gridded-observations-europe"
OUT_DIR = Path(__file__).resolve().parents[2] / "data_raw" / "eobs"

CHUNKS = ["1950_1964", "1995_2010", "2011_2025"]
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
    wanted = [a for a in argv[1:] if not a.startswith("-")]
    chunks = [c for c in CHUNKS if not wanted or c in wanted]
    if not chunks:
        print(f"Unknown chunk. Choose from: {' '.join(CHUNKS)}", file=sys.stderr)
        return 2
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    client = cdsapi.Client()
    print(f"Target dir: {OUT_DIR}")
    print(f"Chunks: {' '.join(chunks)} | Variables: {len(VARIABLES)} (TX/TN/TG/RR)")
    print("Progress: CDS prepares the request on its servers first (queue),")
    print("then downloads. cdsapi shows a progress bar per file.")
    print()
    ok = True
    for i, chunk in enumerate(chunks, 1):
        target = OUT_DIR / f"eobs_v33_0e_{chunk}.nc"
        print(f"[{i}/{len(chunks)}] chunk {chunk} -> {target.name}")
        if target.exists():
            size_mb = target.stat().st_size / 1024 / 1024
            print(f"  [skip] already present ({size_mb:.1f} MB)")
            print(f"  sha256={sha256(target)}")
            continue
        request = {
            "product_type": ["ensemble_mean"],
            "variable": VARIABLES,
            "grid_resolution": ["0_1deg"],
            "period": [chunk],
            "version": ["33_0e"],
        }
        try:
            client.retrieve(DATASET, request, str(target))
        except Exception as e:  # noqa: BLE001 - surface CDS errors verbatim
            print(f"  [ERROR] chunk {chunk}: {e}", file=sys.stderr)
            ok = False
            continue
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
            print("  -> delete the file and rerun this chunk.", file=sys.stderr)
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
