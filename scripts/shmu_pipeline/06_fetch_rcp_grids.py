"""Download SHMU RCP4.5 scenario grids (scrapnuté: 5 indikátorov x 2 obdobia).

Source: https://opendata.shmu.sk/.../scenarios/rcp45/, CC BY 4.0.
Periods 2021-2050 (-> UI point 2050) and 2071-2100 (-> UI point 2100)
are 30-year means, same convention as the 1991-2020 normals.
Scenario RCP4.5 (CMIP5) is the closest analogue of SSP2-4.5; the UI
label MUST say RCP4.5, never SSP (DATA_SOURCE.md §7.4).
Parameter "rcp85" is still accepted (SHMÚ provides those grids too)
but this web does not use it.

Raw files land in data_raw/shmu/rcp45/ (git-ignored); provenance
(URL + date + sha256) goes to manifest.json next to them.
"""

from __future__ import annotations

import datetime
import hashlib
import json
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

BASE_URL_TMPL = ("https://opendata.shmu.sk/meteorology/products/grids/"
                 "climateAdaptation/scenarios/{scenario}")
BASE_DIR = Path(__file__).resolve().parents[2] / "data_raw" / "shmu"

INDICATORS = [
    "PriemernaRocnaTeplotaVzduchu",
    "PriemernyPocetTropickychDni",
    "PriemernyPocetTropickychNoci",
    "PriemernyPocetMrazovychDni",
    "PriemerneRocneAtmosferickeZrazky",
    "PriemernyPocetDniNad40mm",
]
PERIODS = ["2021_2050", "2071_2100"]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def fetch_one(base_url: str, out_dir: Path, stem: str) -> dict:
    url = f"{base_url}/{stem}.zip"
    target = out_dir / f"{stem}.zip"
    if target.exists():
        print(f"  [skip] {target.name}")
    elif shutil.which("curl"):
        print(f"  [get] {url}")
        subprocess.run(["curl", "-fSL", "--retry", "3", "-o", str(target), url],
                       check=True, capture_output=True)
        print(f"    -> {target.stat().st_size / 1024:.0f} KB")
    else:
        print(f"  [get] {url}")
        req = urllib.request.Request(url, headers={"User-Agent": "sk-klima-pipeline"})
        with urllib.request.urlopen(req, timeout=120) as r, open(target, "wb") as f:
            f.write(r.read())
    with zipfile.ZipFile(target) as z:
        names = z.namelist()
    assert any(n.endswith(".tif") for n in names), f"no .tif in {target.name}: {names}"
    return {"url": url, "file": target.name,
            "sha256": sha256(target), "zip_members": names}


def main(argv: list[str]) -> int:
    scenario = argv[1] if len(argv) > 1 else "rcp45"
    assert scenario in ("rcp45", "rcp85"), f"unknown scenario {scenario}"
    base_url = BASE_URL_TMPL.format(scenario=scenario)
    out_dir = BASE_DIR / scenario
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "source": f"SHMÚ otvorené dáta opendata.shmu.sk, scenár {scenario.upper()} (CMIP5), licencia CC BY 4.0",
        "downloaded": datetime.date.today().isoformat(),
        "files": {},
    }
    ok = True
    for ind in INDICATORS:
        for per in PERIODS:
            stem = f"KlimaAdapt_{ind}_{scenario}_{per}"
            print(f"[{ind} {per}]")
            try:
                manifest["files"][stem] = fetch_one(base_url, out_dir, stem)
            except Exception as e:  # noqa: BLE001
                print(f"  [ERROR] {stem}: {e}")
                ok = False
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print("Wrote manifest.json")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
