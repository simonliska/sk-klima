"""Emit frontend data: merge real observations into ClimateRecord schema.

Reads:
  data_raw/eobs/indicators.json            (E-OBS annual indicators per kraj)
  data_raw/shmu/reference_1991_2020.json   (SHMU 1991-2020 normals per kraj)
  data_raw/shmu/scenarios_rcp45.json       (SHMU RCP4.5 30-year means per kraj)
  src/data/climate.real.json               (previous emit no longer read;
                                            all 5 metrics are real, no demo
                                            records remain)
Writes:
  src/data/climate.real.json               (45 records, existing ClimateRecord schema)

Mapping (documented, no invented numbers):
  - avg_temp (unit "°C vs 1991–2020"): anomaly = E-OBS TG(year) - SHMU normal
    for 1950/2000/2025; anomaly = RCP TG(period) - SHMU normal for
    2050 (2021-2050 mean) / 2100 (2071-2100 mean). 1 decimal.
  - tropical_days / tropical_nights / frost_days: absolute E-OBS counts for
    1950/2000/2025; RCP period means (rounded to integer) for 2050/2100.
  - heavy_precip (days/year >40 mm): E-OBS heavy_days for 1950/2000/2025;
    RCP period means (1 decimal) for 2050/2100.
  - Years 1950, 2000, 2025: status "observed" (source E-OBS).
    Years 2050, 2100: status "projected" (source SHMÚ RCP4.5, CMIP5 —
    closest analogue of SSP2-4.5, labelled RCP4.5, never SSP).
  - drought_risk / snow_days: deleted (demo without real data source).
  - "slovensko": simple mean of the 8 kraje (counts rounded to integer,
    heavy_precip to 1 decimal).
  - Record sourceId "E-OBS + SHMÚ" (combined provenance), scenario "RCP4.5"
    for records with projected points; per-point source is resolved in UI.
  - displayValue: Slovak formatting (decimal comma, signed anomalies).

Sneh/sucho zmazané (demo bez reálneho zdroja dát).
Web používa len stredný scenár RCP4.5; SHMÚ poskytuje aj gridy RCP8.5,
tie sa v tomto webe nepoužívajú (06/07 skripty si parameter rcp85
ponechané pre prípadný budúci návrat).
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[2]
EOBS_PATH = BASE / "data_raw" / "eobs" / "indicators.json"
SHMU_PATH = BASE / "data_raw" / "shmu" / "reference_1991_2020.json"
RCP_PATH = BASE / "data_raw" / "shmu" / "scenarios_rcp45.json"
OUT_PATH = BASE / "src" / "data" / "climate.real.json"

KRAJE = ["bratislavsky", "trnavsky", "trenciansky", "nitriansky",
         "zilinsky", "banskobystricky", "presovsky", "kosicky"]
HIST_YEARS = [1950, 1960, 2000, 2010, 2020, 2025]

# metric -> (eobs field, shmu field or None, decimals, signed)
REAL_METRICS = {
    "avg_temp": ("avg_temp_c", "avg_temp_c", 1, True),
    "tropical_days": ("tropical_days", None, 0, False),
    "tropical_nights": ("tropical_nights", None, 0, False),
    "frost_days": ("frost_days", None, 0, False),
    "heavy_precip": ("heavy_days", None, 1, False),
}
UNITS = {"avg_temp": "°C vs 1991–2020", "tropical_days": "dní / rok",
         "tropical_nights": "nocí / rok", "frost_days": "dní / rok",
         "heavy_precip": "dní / rok"}


def sk(value: float, decimals: int, signed: bool) -> str:
    if decimals == 0:
        s = str(int(round(value)))
    else:
        s = f"{value:.{decimals}f}".replace(".", ",")
    if signed and value > 0:
        s = "+" + s
    return s


def main() -> int:
    eobs = json.loads(EOBS_PATH.read_text(encoding="utf-8"))
    shmu = json.loads(SHMU_PATH.read_text(encoding="utf-8"))
    rcps = {"RCP4.5": json.loads(RCP_PATH.read_text(encoding="utf-8"))}
    today = datetime.date.today().isoformat()

    def hist_value(slug: str, year: int, efield: str, sfield: str | None):
        e = eobs["kraje"][slug][str(year)][efield]
        return e - shmu["kraje"][slug][sfield] if sfield else e

    def rcp_value(rcp: dict, slug: str, ui_year: int, efield: str, sfield: str | None):
        r = rcp["kraje"][slug][str(ui_year)][efield]
        return r - shmu["kraje"][slug][sfield] if sfield else r

    out = []
    for slug in KRAJE + ["slovensko"]:
        for metric in list(REAL_METRICS):
            efield, sfield, dec, signed = REAL_METRICS[metric]
            for sc in ("RCP4.5",):
                rcp = rcps[sc]
                points = []
                if slug == "slovensko":
                    krajs = KRAJE
                    hist = {y: sum(hist_value(k, y, efield, sfield) for k in krajs) / len(krajs)
                            for y in HIST_YEARS}
                    fut = {y: sum(rcp_value(rcp, k, y, efield, sfield) for k in krajs) / len(krajs)
                           for y in (2050, 2100)}
                else:
                    hist = {y: hist_value(slug, y, efield, sfield) for y in HIST_YEARS}
                    fut = {y: rcp_value(rcp, slug, y, efield, sfield) for y in (2050, 2100)}
                if dec == 0:  # counts: rounded to integer
                    hist = {y: int(round(v)) for y, v in hist.items()}
                    fut = {y: int(round(v)) for y, v in fut.items()}
                else:
                    hist = {y: round(v, dec) for y, v in hist.items()}
                    fut = {y: round(v, dec) for y, v in fut.items()}
                for y in HIST_YEARS:
                    points.append({"year": y, "value": hist[y],
                                   "displayValue": sk(hist[y], dec, signed),
                                   "status": "observed"})
                for y in (2050, 2100):
                    points.append({"year": y, "value": fut[y],
                                   "displayValue": sk(fut[y], dec, signed),
                                   "status": "projected"})
                out.append({"regionSlug": slug, "metricId": metric,
                            "unit": UNITS[metric], "points": points,
                            "referencePeriod": "1991–2020",
                            "scenario": sc,
                            "sourceId": "E-OBS + SHMÚ", "lastUpdated": today})

    # Schema self-check (mirrors src/lib/types.ts ClimateRecordSchema).
    assert len(out) == 45, f"expected 45 records (5 metrics x 9 regions), got {len(out)}"
    for r in out:
        assert set(r) == {"regionSlug", "metricId", "unit", "points",
                          "referencePeriod", "scenario", "sourceId",
                          "lastUpdated"}, set(r)
        assert [p["year"] for p in r["points"]] == [1950, 1960, 2000, 2010, 2020, 2025, 2050, 2100], \
            (r["regionSlug"], r["metricId"])
        for p in r["points"]:
            assert set(p) == {"year", "value", "displayValue", "status"}
            assert p["status"] in ("observed", "projected")
            assert isinstance(p["value"], (int, float))

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({len(out)} records)")

    print("\nEmitted 'slovensko' (national, mean of kraje):")
    for r in out:
        if r["regionSlug"] == "slovensko" and r["metricId"] in REAL_METRICS:
            print(f"  {r['metricId']:15s} " +
                  " ".join(f"{p['year']}:{p['displayValue']}({p['status']})"
                            for p in r["points"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
