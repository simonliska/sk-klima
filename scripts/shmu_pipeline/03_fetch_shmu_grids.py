"""Download SHMU 1991-2020 normals grids (scoped subset for sk-klima).

Source: https://opendata.shmu.sk, CC BY 4.0 (DATA_SOURCE.md §2B, §10).
Only the 5 grids matching our E-OBS indicators are fetched:
  mean temperature, tropical days, tropical nights, frost days, precipitation.

Each ZIP = README.txt + .tif + .tfw + .tif.aux.xml (500 m GeoTIFF, S-JTSK).
Raw files land in data_raw/shmu/grids/ (git-ignored); provenance
(URL + date + sha256) goes to manifest.json next to them.

Attribution (DATA_SOURCE.md §10.2): Slovenský hydrometeorologický ústav
(SHMÚ), otvorené dáta opendata.shmu.sk, licencia CC BY 4.0.
"""

from __future__ import annotations

import datetime
import hashlib
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

BASE_URL = ("https://opendata.shmu.sk/meteorology/products/grids/"
            "climateAdaptation/standardNormals")
OUT_DIR = Path(__file__).resolve().parents[2] / "data_raw" / "shmu" / "grids"

# zip-stem -> our indicator key
GRIDS = {
    "KlimaAdapt_PriemernaRocnaTeplotaVzduchu_1991_2020": "avg_temp",
    "KlimaAdapt_PriemernyPocetTropickychDni_1991_2020": "tropical_days",
    "KlimaAdapt_PriemernyPocetTropickychNoci_1991_2020": "tropical_nights",
    "KlimaAdapt_PriemernyPocetMrazovychDni_1991_2020": "frost_days",
    "KlimaAdapt_PriemerneRocneAtmosferickeZrazky_1991_2020": "precip_sum",
    "KlimaAdapt_PriemernyPocetDniNad40_1991_2020": "heavy_days",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def fetch_one(stem: str) -> dict:
    url = f"{BASE_URL}/{stem}.zip"
    target = OUT_DIR / f"{stem}.zip"
    if target.exists():
        print(f"  [skip] {target.name}")
    elif shutil.which("curl"):
        # System curl (uses OS cert store; venv SSL may lack CA certs).
        print(f"  [get] {url}")
        subprocess.run(["curl", "-fSL", "--retry", "3", "-o", str(target), url],
                       check=True)
        print(f"    -> {target.stat().st_size / 1024:.0f} KB")
    else:
        print(f"  [get] {url}")
        req = urllib.request.Request(url, headers={"User-Agent": "sk-klima-pipeline"})
        with urllib.request.urlopen(req, timeout=120) as r, open(target, "wb") as f:
            f.write(r.read())
        print(f"    -> {target.stat().st_size / 1024:.0f} KB")
    with zipfile.ZipFile(target) as z:
        names = z.namelist()
    assert any(n.endswith(".tif") for n in names), f"no .tif in {target.name}: {names}"
    print(f"  [zip-ok] {names}")
    return {"url": url, "file": target.name,
            "sha256": sha256(target), "zip_members": names}


def main(argv: list[str]) -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "source": "SHMÚ otvorené dáta opendata.shmu.sk, licencia CC BY 4.0",
        "downloaded": datetime.date.today().isoformat(),
        "files": {},
    }
    ok = True
    for stem, key in GRIDS.items():
        print(f"[{key}] {stem}")
        try:
            manifest["files"][key] = {"stem": stem, **fetch_one(stem)}
        except Exception as e:  # noqa: BLE001
            print(f"  [ERROR] {stem}: {e}")
            ok = False
    import json
    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Wrote manifest.json")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
