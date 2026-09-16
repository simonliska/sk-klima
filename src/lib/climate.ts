import regionsData from "@/data/regions.json";
import metricsData from "@/data/metrics.json";
import climateData from "@/data/climate.real.json";
import impactsData from "@/data/impacts.sk.json";
import sourcesData from "@/data/sources.json";
import {
  eraForYear,
  type ClimateRecord,
  type ImpactCategory,
  type MetricDef,
  type MetricId,
  type Region,
  type SourceDef,
  type TimelineYear,
} from "./types";

export const REGIONS = regionsData as Region[];
export const METRICS = metricsData as MetricDef[];
export const IMPACTS = impactsData as ImpactCategory[];
export const SOURCES = sourcesData as SourceDef[];
const RECORDS = climateData as ClimateRecord[];

export const NATIONAL_SLUG = "slovensko";

export const DEFAULT_SCENARIO = "RCP4.5";
export type ScenarioId = typeof DEFAULT_SCENARIO;

/** Find record for region×metric under a scenario. */
function findRecord(regionSlug: string, metricId: string, scenario: string) {
  return RECORDS.find(
    (r) =>
      r.regionSlug === regionSlug &&
      r.metricId === metricId &&
      (r.scenario === scenario || r.scenario === null)
  );
}

export function getRegions(): Region[] {
  return REGIONS;
}

export function getRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export function getMetrics(): MetricDef[] {
  return METRICS;
}

export function getMetric(id: string): MetricDef | undefined {
  return METRICS.find((m) => m.id === id);
}

export function getRecordsForRegion(regionSlug: string): ClimateRecord[] {
  return RECORDS.filter((r) => r.regionSlug === regionSlug);
}

export function getPoint(
  regionSlug: string,
  metricId: MetricId,
  year: TimelineYear,
  scenario: string = DEFAULT_SCENARIO
) {
  const rec = findRecord(regionSlug, metricId, scenario);
  return rec?.points.find((p) => p.year === year);
}

/** Per-point source: history/today (≤2025) is pure E-OBS; SHMÚ normals
 *  serve only as the 1991–2020 baseline for temperature anomalies;
 *  projections are SHMÚ RCP4.5 scenario grids (SHMÚ provides RCP8.5
 *  grids too, but this web uses RCP4.5 only). */
export function getPointSource(
  regionSlug: string,
  metricId: string,
  year: number,
  scenario: string = DEFAULT_SCENARIO
) {
  const rec = findRecord(regionSlug, metricId, scenario);
  const point = rec?.points.find((p) => p.year === year);
  if (!point) return undefined;
  if (point.status === "projected") return "SHMÚ";
  return "E-OBS";
}

export function getMetricSeries(
  regionSlug: string,
  metricId: MetricId,
  scenario: string = DEFAULT_SCENARIO
) {
  const rec = findRecord(regionSlug, metricId, scenario);
  return (
    rec?.points.map((p) => ({
      year: p.year,
      value: p.value,
      displayValue: p.displayValue,
      status: p.status,
      era: eraForYear(p.year),
      sourceId: getPointSource(regionSlug, metricId, p.year, scenario),
    })) ?? []
  );
}

/** Normál 1991–2020, priemer Slovenska (nevážený priemer 8 krajov).
 *  Zdroj: data_raw/shmu/reference_1991_2020.json (SHMÚ 500 m gridy,
 *  sampling scripts/shmu_pipeline/04_sample_shmu_grids.py), CC BY 4.0.
 *  Teplota je anomália voči normálu, preto je definitoricky 0.
 *  Slúži ako baseline „dneška" pre delty v Hero: 30-ročný priemer
 *  vs 30-ročný priemer 2021–2050 (UI rok „2050").
 *  TODO: roky 2021–2024 existujú v data_raw/eobs/indicators.json —
 *  prípadné rozšírenie TIMELINE_YEARS z 8 na 12 bodov. */
export const NORMAL_1991_2020: Record<MetricId, number> = {
  avg_temp: 0,
  tropical_days: 18.0,
  tropical_nights: 1.8,
  frost_days: 110.2,
  heavy_precip: 0.8,
};

/** Nezaokrúhlené krajské normály (súčet / 8 dá PRESNEJŠIU deltu).
 *  tropical_days: 144,1/8 = 18,0125; tropical_nights: 14,6/8 = 1,825. */
const NORMAL_PRECISE: Record<string, number> = {
  avg_temp: 0,
  tropical_days: 144.1 / 8,
  tropical_nights: 14.6 / 8,
};

export function skCountUnit(metricId: MetricId, value: number): string {
  const a = Math.abs(value);
  if (metricId === "tropical_nights")
    return a === 1 ? "noc" : a >= 2 && a <= 4 ? "noci" : "nocí";
  return a === 1 ? "deň" : a >= 2 && a <= 4 ? "dni" : "dní";
}

export interface HeroCard {
  metric: MetricDef;
  /** Veľké číslo karty: hodnota 2050 ("+0,9 °C" / "22 dní" / "4 noci"). */
  big: string;
  /** Pilulka zmeny oproti normálu 1991–2020 ("+4 dni" / "+2 noci").
   *  U teploty je prázdny reťazec — pilulka sa zobrazí len s textom
   *  „oproti normálu", hodnota +0,9 °C už sama je odchýlka od normálu. */
  delta: string | null;
}

const HERO_METRICS: MetricId[] = [
  "avg_temp",
  "tropical_days",
  "tropical_nights",
];

/** 3 karty pre Hero: stav 2050 + delta oproti normálu 1991–2020.
 *  Hodnota 2050 sa číta z climate.real.json (nie hardcode),
 *  baseline je NORMAL_PRECISE (SHMÚ normály). */
export function getHeroCards(
  scenario: string = DEFAULT_SCENARIO
): HeroCard[] {
  return HERO_METRICS.map((id) => {
    const metric = METRICS.find((m) => m.id === id)!;
    const future = getPoint(NATIONAL_SLUG, id, 2050, scenario);
    const base = NORMAL_PRECISE[id] ?? 0;
    const rawDelta = (future?.value ?? 0) - base;
    let big: string;
    let delta: string | null;
    if (id === "avg_temp") {
      big = `${future?.displayValue} °C`;
      delta = "";
    } else {
      const d = Math.round(rawDelta);
      big = `${future?.displayValue} ${skCountUnit(id, future?.value ?? 0)}`;
      delta = `${d > 0 ? "+" : ""}${d} ${skCountUnit(id, d)}`;
    }
    return { metric, big, delta };
  });
}

/** Compare today (2025) vs 2050 for a region — used on region pages. */
export function compareTodayVs2050(
  regionSlug: string,
  scenario: string = DEFAULT_SCENARIO
) {
  return METRICS.map((metric) => {
    const today = getPoint(regionSlug, metric.id, 2025, scenario);
    const future = getPoint(regionSlug, metric.id, 2050, scenario);
    let delta: string | null = null;
    if (today && future) {
      const d = Math.round((future.value - today.value) * 10) / 10;
      const sign = d > 0 ? "+" : "";
      delta =
        metric.id === "avg_temp"
          ? `${sign}${String(d).replace(".", ",")} °C`
          : `${sign}${String(d).replace(".", ",")}`;
    }
    return { metric, today, future, delta };
  });
}

export function getImpacts(): ImpactCategory[] {
  return IMPACTS;
}

export function getSources(): SourceDef[] {
  return SOURCES;
}

export { eraForYear };
