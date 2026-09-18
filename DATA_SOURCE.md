# DATA_SOURCE.md — Real SHMÚ data for sk-klima

> Status: **ACTIVE — implemented.** Frontend uses real data.
> All facts below were verified live against https://opendata.shmu.sk on 2026-09-11.
> No values in this document are invented; anything unverified is marked as such.

## 1. Source overview

- **Server:** https://opendata.shmu.sk (plain Apache directory index, no registration)
- **License:** CC BY 4.0 (both Slovak and English deeds linked in `README.txt`).
  Attribution of SHMÚ is **mandatory** in the app.
- **Structure (verified):**
  - `meteorology/climate/recent/data/daily/YYYY-MM/kli-inter%20-%20YYYY-MM.json`
    — daily climatological observations, one JSON file per month (~3.3 MB).
  - `meteorology/climate/recent/metadata/kli_inter_metadata.json` (+ `.txt`)
    — 72-column data dictionary (Slovak descriptions + units).
  - `meteorology/products/grids/climateAdaptation/standardNormals/KlimaAdapt_*.zip`
    — 19 files: gridded 1991–2020 climate normals (GeoTIFF).
  - `meteorology/products/grids/climateAdaptation/scenarios/rcp45/KlimaAdapt_*_{2021_2050,2071_2100}.zip`
    — gridded scenario projections (GeoTIFF). The server also provides `rcp85/`;
    this web does not use it.
  - `meteorology/climate/now/`, `meteorology/precipitation/now/`
    — rolling ~30-day 1-minute AWS data (not needed for this task).
- **Dataset catalogue entries:** `https://data.slovensko.sk/datasety/1cd736f6-291c-44e5-ba1d-1683bc5c3e98`
  (daily climate), `9bdd8179-9cb0-46c6-a0d0-a52e50d2e2bc` (1-min AWS).
  Catalogue is a JS SPA; machine-readable metadata was not retrievable.

## 2. Exact files needed

### A. Daily observations (indicators 1–5, recent period)

- Pattern: `meteorology/climate/recent/data/daily/<YYYY-MM>/kli-inter%20-%20<YYYY-MM>.json`
- Top-level keys: `id, dataset ("Climatological stations"), interval ("1 day"), frequency, statistics, data`.
- `data` = array of daily rows. Verified May 2025 file:
  `statistics = {"stations_count": 101, "records_count": 3131}`, full month 2025-05-01…31.
- Relevant columns (from official metadata):
  - `ind_kli` — numeric station code ("klimatologický indikatív stanice"), e.g. 11800…11995
  - `datum` — ISO date (`2025-05-01T00:00:00`)
  - `t_max` — daily max, 21h–21h MSSC, °C
  - `t_min` — daily min, 21h–21h MSSC, °C
  - `t7, t14, t21` — term observations, °C (no `t_avg` column exists)
  - `zra_uhrn` — daily precipitation total 7h–7h next day, mm
  - `sneh_novy, sneh_pokr` — new/total snow cover, cm

### B. 1991–2020 normals grids (reference period for the app)

19 ZIPs, each = `README.txt` + `.tif` + `.tfw` + `.tif.aux.xml`.
Verified content (500 m GeoTIFF; `.tfw` pixel size 500; CRS is S-JTSK per
coordinates — pipeline will confirm EPSG:5514 with `gdalinfo`):

| File | Content |
|---|---|
| `KlimaAdapt_PriemernaRocnaTeplotaVzduchu_1991_2020.zip` | Annual mean temperature, °C (verified stats: national mean 8.56, range −2.36…11.49) |
| `KlimaAdapt_PriemernyPocetTropickychDni_1991_2020.zip` | Mean annual tropical days |
| `KlimaAdapt_PriemernyPocetTropickychNoci_1991_2020.zip` | Mean annual tropical nights |
| `KlimaAdapt_PriemernyPocetMrazovychDni_1991_2020.zip` | Mean annual frost days |
| `KlimaAdapt_PriemerneRocneAtmosferickeZrazky_1991_2020.zip` | Mean annual precipitation, mm |
| (+ seasonal temp/precip, summer/ice days, dry/cold spells, days >40 mm) | Bonus indicators for later |

### C. Scenario grids (future — SHMÚ RCP4.5 grids)

`scenarios/rcp45/`, periods **2021–2050** and **2071–2100**,
same 19-indicator set (incl. tropical days/nights, frost days, mean temp, precip).
(The server also offers `rcp85/`; this web uses RCP4.5 only.)

## 3. Indicator computation (daily data)

Per station, per year, from daily rows:

1. **Annual mean temperature** — daily mean is NOT provided.
   Use standard Central-European climatological formula and document it:
   `t_day = (t7 + t14 + 2·t21) / 4`, then arithmetic mean over the year.
2. **Tropical days** — count days with `t_max >= 30.0`.
3. **Tropical nights** — count days with `t_min >= 20.0`.
   (SHMÚ operational definition; thresholds to be cross-checked against the
   RPI metadata record before publishing.)
4. **Frost days** — count days with `t_min < 0.0`.
5. **Annual precipitation** — `SUM(zra_uhrn)` with `null → 0.0 mm`
   (verified: on rainy 2025-05-05 only 1 of 101 stations was null;
   on dry days nulls dominate; one station, 11974, is always null = non-measuring).

**Completeness rule (proposed):** publish an annual value only if ≥ 90% of days
have non-null temperature (i.e. ≥ 329/365 days); otherwise mark the year
`insufficient_data` and exclude it. Precipitation sums always published with
`precip_completeness` fraction attached.

## 4. Station identifiers (verified, no guessing)

- Codes are 5-digit numbers (`ind_kli`), 101 distinct codes in the May 2025 file.
- **Verified:** the numbering matches WMO SYNOP numbering — station `11801`
  appears both in `kli-inter` and in live Slovak SYNOP traffic
  (checked via `ogimet.com/cgi-bin/getsynop?...&state=Slo`).
- **Names and coordinates are NOT included in any opendata file.**
  A `ind_kli → name/lat/lon` table must be built from an external authority
  (SHMÚ station directory / ECA&D station list) and stored as
  `scripts/shmu_pipeline/stations.csv` with a `source` column per row.
  The pipeline MUST NOT contain hand-guessed mappings.

### Proposed 8 representative stations (names only — codes pending verification)

One per kraj, all are real SHMÚ stations appearing on shmu.sk's public
current-weather board: **Bratislava** (BA) · **Piešťany** (TT) ·
**Trenčín** or Prievidza (TN) · **Hurbanovo** or Nitra (NR — Hurbanovo has
the flagship series since 1872) · **Žilina** (ZA) · **Sliač** (BB) ·
**Poprad** or Prešov (PO) · **Košice** (KE).

## 5. Available historical period (important limitation)

- `climate/recent/data/daily/` contains **only 2025-01 … 2026-05**
  (17 monthly files; dataset `issued: 2025-06-06`).
- **There is NO multi-decadal daily station archive on opendata.shmu.sk.**
  Consequences:
  - `1900 / 1950 / 2000` station values **cannot** come from this server.
  - Realistic division of labour:
    - **Reference / "today":** 1991–2020 normals grids (sampled at the 8 stations
      or averaged per kraj) — fully real SHMÚ data. ✅
    - **Trend / history:** ECA&D / E-OBS gridded observations (Copernicus,
      homogenised, 1950→present) — second source for history points.
    - **Future:** SHMÚ RCP4.5 grids.
    - **Recent validation:** 2025+ daily JSON validates our threshold logic
      against the grids.

## 6. Raw vs quality-controlled

- **Daily `kli-inter` (recent):** operational / near-real-time character —
  current month is published, missing values are bare `null` with **no QC flags**
  in the schema. Treat as **preliminary, not final validated** data.
- **Normals + scenario grids:** quality-controlled climatological products
  derived from homogenised station series ("normálové obdobie 1991–2020").
  Treat as **authoritative**.

## 7. Limitations and open questions

1. No `t_avg` column → daily-mean formula is our methodological choice (documented above).
2. `zra_uhrn: null ≈ 0 mm` is an inference (strong evidence, §3) — pipeline asserts
   it: a station-day with `null` precip but `jav_a` (rain phenomenon) present is
   counted as missing, not zero.
3. Exact index thresholds (≥30 / ≥20 / <0) to be confirmed from the RPI metadata
   record; pipeline cross-checks grid-sampled counts vs daily-computed counts
   where periods overlap.
4. Scenario grids are **RCP4.5 (CMIP5)** for 2021–2050 / 2071–2100;
   the UI labels future values as RCP4.5 projections (SHMÚ provides
   RCP8.5 grids too, but this web does not use them).
5. No snow-cover normals grid exists → snow indicators were deleted
   (no real data source).
6. Grid CRS assumed S-JTSK (EPSG:5514) from `.tfw` — pipeline verifies with
   `gdalinfo` and fails loudly otherwise.
7. Station name/code mapping is external — unverified mappings are blocked by
   a pipeline assertion (every `ind_kli` used must exist in `stations.csv`
   with a citable source).

## 8. Reproducible pipeline

```
scripts/shmu_pipeline/
  stations.csv          # ind_kli,name,lat,lon,elevation_m,source  (hand-verified, cited)
  requirements.txt      # requests, pandas, numpy, rasterio, geopandas/fiona
  01_fetch_daily.py     # download kli-inter monthly JSONs 2025-01→present, hash + archive raw/
  02_fetch_grids.py     # download normals + rcp45 zips, verify README, archive
  03_compute_indicators.py  # daily → annual indicators per §3 (+ completeness flags)
  04_sample_grids.py    # sample .tif at station coords (and kraj means) → reference values
  05_emit_frontend.py   # write src/data/climate.real.json in the EXISTING
                        # ClimateRecord schema with status:"observed"/"projected",
                        # sourceId, referencePeriod, scenario, lastUpdated
  checks.py             # assertions: code mapping, completeness, threshold sanity,
                        # grid-vs-daily consistency, no invented values
```

- Raw downloads are content-hashed and kept in `data_raw/` (git-ignored);
  only `stations.csv` + emitted JSON are committed.
- Emission reuses the current `ClimateRecord` schema — **no frontend redesign**.
- Snow and drought indices were deleted (no real data source);
  heavy-rain index (days >40 mm) is computed from real E-OBS + SHMÚ data.

## 9. Method decisions

1. Indicator definitions + completeness rule (§3).
2. 8 station names (§4) — final `ind_kli` codes verified before coding.
3. Division of labour: SHMÚ grids = reference, E-OBS/ECA&D = history trend, RCP grids = future with relabelling, daily JSON = validation only.
4. `scripts/shmu_pipeline/` implemented as specified in §8.

## 10. Mandatory attribution wording (CC BY 4.0)

The CC BY 4.0 licence requires every use to credit the author, link the
licence, and indicate changes. Below are the binding formulations for this
project — used verbatim, without rephrasing. The Slovak wording is legally
binding; the English version is provided only where noted.

### 10.1 Short badge (at every number / in `SourceBadge`)

> Zdroj: SHMÚ · CC BY 4.0

Linked as source: `https://opendata.shmu.sk`;
licence link: `https://creativecommons.org/licenses/by/4.0/deed.sk`.

### 10.2 Full wording (`/metodika` page, footer, under charts)

> Zdroj dát: Slovenský hydrometeorologický ústav (SHMÚ), otvorené dáta
> opendata.shmu.sk, licencia CC BY 4.0
> (https://creativecommons.org/licenses/by/4.0/deed.sk).
> Údaje upravené a agregované do ročných indikátorov.

English version (if an EN mutation is added):

> Data source: Slovak Hydrometeorological Institute (SHMI), open data
> opendata.shmu.sk, licence CC BY 4.0
> (https://creativecommons.org/licenses/by/4.0/deed.en).
> Data modified and aggregated into annual indicators.

### 10.3 Dataset citation (documentation, `stations.csv`, commit messages)

Slovak template, used verbatim (field names stay Slovak):

> SHMÚ (Slovenský hydrometeorologický ústav). Otvorené dáta:
> `<názov datasetu / URL súboru>`, stiahnuté `<RRRR-MM-DD>`,
> licencia CC BY 4.0. Agregované do ročných indikátorov
> (denný priemer `(t7+t14+2·t21)/4`; `zra_uhrn: null → 0 mm`).

### 10.4 Usage rules

1. The short wording (§10.1) is shown at **every** number with
   `status: "observed"` / `"projected"` and `sourceId: "SHMU"`.
2. The full wording (§10.2) always appears on `/metodika` and in the footer.
3. **Never use data from `www.shmu.sk`** (articles, tables, charts on the
   website) — those fall under stricter terms ("for personal use only").
   Use exclusively `opendata.shmu.sk` and the grids from
   `meteorology/products/grids/`.
4. For every dataset, record URL + download date + hash
   (pipeline `data_raw/`, git-ignored) — provable provenance.

## 11. E-OBS / ECA&D — history 1950–2000 (verified 2026-09-11)

### 11.1 Availability: YES, technically suitable

- **Current version: E-OBSv33.0e** (released May 2026), covering
  **1950-01-01 → 2025-12-31**, daily values, **0.1° (~11 km)**
  and 0.25° grid, NetCDF-4 format, variables `TX` (daily max),
  `TN` (daily min), `TG` (mean), `RR` (precipitation) + pressure,
  wind, humidity, radiation.
  Source: https://www.ecad.eu (KNMI) and the Copernicus CDS dataset
  `insitu-gridded-observations-europe` (DOI: 10.24381/cds.151d3ec6).
- Our indicators can be computed with the **same thresholds** as from SHMÚ
  (≥30 / ≥20 / <0, precipitation sums) — either by selecting the grid cell
  above a station or by averaging cells per kraj.
- ECA&D station daily series (including Slovak stations) are partly
  downloadable; updated to 2026-01-31.

### 11.2 Licence: non-commercial research and education

Verbatim licence wording (E-OBS product licence rev. 1, CDS):

> "These data … are strictly for use in **non-commercial research and
> education projects only**.

**This project is a non-commercial educational web (education), so it meets
the licence terms.** The condition is that the project stays free of
commercial elements (no ads, no paid services, no company operator).

### 11.3 Mandatory E-OBS citation (when used)

Verbatim, at every number derived from E-OBS + on `/metodika`:

> "We acknowledge the E-OBS dataset and the data providers in the ECA&D
> project (https://www.ecad.eu). Cornes, R., G. van der Schrier,
> E.J.M. van den Besselaar, and P.D. Jones. 2018: An Ensemble Version of
> the E-OBS Temperature and Precipitation Datasets, J. Geophys. Res.
> Atmos., 123. doi:10.1029/2017JD028200"
>
> "Dataset version: E-OBSv33.0e (or newer). DOI: 10.24381/cds.151d3ec6."

(The CDS variant additionally cites the Copernicus Climate Change Service,
https://surfobs.climate.copernicus.eu — used according to the download source.)

### 11.4 E-OBS methodological notes

1. Station density changes over time (sparse in the 1950s) — treat trends
   with caution; a homogenised version (HOM) exists for trends.
2. The 24-hour measurement window differs by country (midnight–midnight vs.
   morning–morning) — does not align exactly with SHMÚ windows
   (21h–21h / 7h–7h MSSC).
3. Working with the ensemble mean is recommended.

### 11.5 Decision: timeline = 30-year periods, no single years

One year is weather, not climate (WMO normals are 30-year means), so the
timeline shows only 30-year periods — six points, computed 2026-09-18 from
the full E-OBS 1950–2025 chunks plus SHMÚ grids:

- **1951–1980, 1961–1990, 1981–2010** — E-OBS v33.0e period means
  (`data_raw/eobs/periods.json`, kraj threshold counts = mean of
  per-cell annual counts to match SHMÚ per-pixel semantics).
- **1991–2020** — SHMÚ 500 m normals (authoritative; the same value the
  Hero/Map/kraj pages compare against — one normal everywhere).
- **2021–2050, 2071–2100** — SHMÚ RCP4.5 grids (v mini grafoch skrátene
  „2021–50" / „2071–00").

Known limitation (documented on `/metodika`): the coarser E-OBS grid
(~11 km) smooths local extremes vs SHMÚ 500 m grids, so pre-1991 hot-day
/ heavy-rain means read rather low and frost days rather high; the trend
direction is robust and check-enforced (`checks.py` §6b).

## 12. Kraj boundaries (map) — provenance

`public/geo/kraje.geo.json` is a simplified, 4-decimal-rounded copy of
`regions_epsg_4326.geojson` from `drakh/slovakia-gps-data` (whose README
cites Geoportal.sk -> geoportal.gov.sk, ZBGIS, as the border source).
Verified 2026-09-18 by vertex comparison. `src/data/kraje.paths.json`
holds the precomputed SVG paths for the web. On-map credit
(`KrajMap.tsx`): "Hranice krajov: Geoportal (geoportal.gov.sk, ZBGIS)
via drakh/slovakia-gps-data, zjednodušené pre web."
