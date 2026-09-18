"""Emit frontend data: merge real observations into ClimateRecord schema.

Timeline = six 30-year WMO periods (no single years — climate is
statistics over ≥30 years, not weather in one year):

  1951-1980, 1961-1990, 1981-2010  (E-OBS v33.0e, status "observed")
  1991-2020                        (SHMU 500 m normals, status "observed")
   2021-2050, 2071-2100             (SHMU RCP4.5 grids, status "projected",
                                     UI chart short labels "2021-50" / "2071-00")

Reads:
  data_raw/eobs/periods.json            (E-OBS 30-year period means per kraj)
  data_raw/shmu/reference_1991_2020.json   (SHMU 1991-2020 normals per kraj)
  data_raw/shmu/scenarios_rcp45.json       (SHMU RCP4.5 30-year means per kraj)
Writes:
  src/data/climate.real.json               (45 records, existing ClimateRecord schema)

Mapping (documented, no invented numbers):
  - avg_temp (unit "°C vs 1991–2020"): anomaly = period TG - SHMU normal
    (1991-2020 is definitionally 0.0). 1 decimal.
  - tropical_days / tropical_nights / frost_days: absolute period-mean
    counts (rounded to integer) — E-OBS for past, SHMU normal for
    1991-2020, RCP period means for future.
  - heavy_precip (days/year >40 mm): period means, 1 decimal.
  - "slovensko": simple mean of the 8 kraje (counts rounded to integer,
    heavy_precip to 1 decimal).
  - Record sourceId "E-OBS + SHMÚ" (combined provenance), scenario "RCP4.5"
    for records with projected points; per-point source is resolved in UI
    (E-OBS for past periods, SHMÚ for 1991-2020 normal + projections).
  - displayValue: Slovak formatting (decimal comma, signed anomalies).
  - year = period midpoint (chart ordering only); UI shows labelSk.

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
EOBS_PERIODS_PATH = BASE / "data_raw" / "eobs" / "periods.json"
SHMU_PATH = BASE / "data_raw" / "shmu" / "reference_1991_2020.json"
RCP_PATH = BASE / "data_raw" / "shmu" / "scenarios_rcp45.json"
OUT_PATH = BASE / "src" / "data" / "climate.real.json"

KRAJE = ["bratislavsky", "trnavsky", "trenciansky", "nitriansky",
         "zilinsky", "banskobystricky", "presovsky", "kosicky"]

# periodId -> (labelSk, shortLabelSk, chart year = midpoint, status)
PERIODS: list[tuple[str, str, str, int, str]] = [
    ("1951-1980", "1951–1980", "1951–80", 1965, "observed"),
    ("1961-1990", "1961–1990", "1961–90", 1975, "observed"),
    ("1981-2010", "1981–2010", "1981–2010", 1995, "observed"),
    ("1991-2020", "1991–2020", "1991–2020", 2005, "observed"),
    ("2021-2050", "2021–2050", "2021-2050", 2035, "projected"),
    ("2071-2100", "2071–2100", "2071-2100", 2085, "projected"),
]
PERIOD_IDS = [p[0] for p in PERIODS]

# metric -> (eobs/normal/rcp field, shmu-normal field or None for anomaly, decimals, signed)
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
    eobs = json.loads(EOBS_PERIODS_PATH.read_text(encoding="utf-8"))
    shmu = json.loads(SHMU_PATH.read_text(encoding="utf-8"))
    rcps = {"RCP4.5": json.loads(RCP_PATH.read_text(encoding="utf-8"))}
    today = datetime.date.today().isoformat()

    def past_value(slug: str, period: str, efield: str, sfield: str | None):
        e = eobs["kraje"][slug][period][efield]
        return e - shmu["kraje"][slug][sfield] if sfield else e

    def normal_value(slug: str, efield: str, sfield: str | None):
        # 1991-2020 comes from the authoritative SHMU grids, not E-OBS.
        # avg_temp is definitionally anomaly 0.0 against its own normal.
        if sfield:
            return 0.0
        return shmu["kraje"][slug][efield]

    def rcp_value(rcp: dict, slug: str, ui_year: int, efield: str, sfield: str | None):
        r = rcp["kraje"][slug][str(ui_year)][efield]
        return r - shmu["kraje"][slug][sfield] if sfield else r

    RCP_UI_YEAR = {"2021-2050": 2050, "2071-2100": 2100}

    out = []
    for slug in KRAJE + ["slovensko"]:
        for metric in list(REAL_METRICS):
            efield, sfield, dec, signed = REAL_METRICS[metric]
            for sc in ("RCP4.5",):
                rcp = rcps[sc]
                vals: dict[str, float] = {}
                if slug == "slovensko":
                    krajs = KRAJE
                    for pid in ("1951-1980", "1961-1990", "1981-2010"):
                        vals[pid] = sum(past_value(k, pid, efield, sfield)
                                        for k in krajs) / len(krajs)
                    vals["1991-2020"] = (
                        sum(normal_value(k, efield, sfield) for k in krajs)
                        / len(krajs))
                    for pid, ui in RCP_UI_YEAR.items():
                        vals[pid] = sum(rcp_value(rcp, k, ui, efield, sfield)
                                        for k in krajs) / len(krajs)
                else:
                    for pid in ("1951-1980", "1961-1990", "1981-2010"):
                        vals[pid] = past_value(slug, pid, efield, sfield)
                    vals["1991-2020"] = normal_value(slug, efield, sfield)
                    for pid, ui in RCP_UI_YEAR.items():
                        vals[pid] = rcp_value(rcp, slug, ui, efield, sfield)
                if dec == 0:  # counts: rounded to integer
                    vals = {k: int(round(v)) for k, v in vals.items()}
                else:
                    vals = {k: round(v, dec) for k, v in vals.items()}
                points = []
                for pid, label, _short, mid, status in PERIODS:
                    points.append({"periodId": pid, "labelSk": label,
                                   "year": mid, "value": vals[pid],
                                   "displayValue": sk(vals[pid], dec, signed),
                                   "status": status})
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
        assert [p["periodId"] for p in r["points"]] == PERIOD_IDS, \
            (r["regionSlug"], r["metricId"])
        for p in r["points"]:
            assert set(p) == {"periodId", "labelSk", "year", "value",
                              "displayValue", "status"}
            assert p["status"] in ("observed", "projected")
            assert isinstance(p["value"], (int, float))

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({len(out)} records)")

    print("\nEmitted 'slovensko' (national, mean of kraje):")
    for r in out:
        if r["regionSlug"] == "slovensko" and r["metricId"] in REAL_METRICS:
            print(f"  {r['metricId']:15s} " +
                  " ".join(f"{p['periodId']}:{p['displayValue']}({p['status']})"
                            for p in r["points"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
