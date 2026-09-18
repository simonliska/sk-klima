import regionsData from "@/data/regions.json";
import metricsData from "@/data/metrics.json";
import climateData from "@/data/climate.real.json";
import normalsData from "@/data/normals.1991_2020.json";
import impactsData from "@/data/impacts.sk.json";
import sourcesData from "@/data/sources.json";
import {
  eraForPeriod,
  periodById,
  TIMELINE_PERIODS,
  type ClimateRecord,
  type ImpactCategory,
  type MetricDef,
  type MetricId,
  type Region,
  type SourceDef,
  type TimelinePeriodId,
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
  periodId: TimelinePeriodId,
  scenario: string = DEFAULT_SCENARIO
) {
  const rec = findRecord(regionSlug, metricId, scenario);
  return rec?.points.find((p) => p.periodId === periodId);
}

/** Per-point source: past periods are E-OBS observations; the 1991–2020
 *  normal and both RCP4.5 projections are SHMÚ grids (SHMÚ provides RCP8.5
 *  grids too, but this web uses RCP4.5 only). */
export function getPointSource(
  regionSlug: string,
  metricId: string,
  periodId: string,
  scenario: string = DEFAULT_SCENARIO
) {
  const rec = findRecord(regionSlug, metricId, scenario);
  const point = rec?.points.find((p) => p.periodId === periodId);
  if (!point) return undefined;
  if (point.status === "projected") return "SHMÚ";
  if (point.periodId === "1991-2020") return "SHMÚ";
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
      periodId: p.periodId,
      labelSk: p.labelSk,
      shortLabelSk:
        TIMELINE_PERIODS.find((t) => t.id === p.periodId)?.shortLabelSk ??
        p.labelSk,
      year: p.year,
      value: p.value,
      displayValue: p.displayValue,
      status: p.status,
      era: eraForPeriod(p.periodId),
      sourceId: getPointSource(regionSlug, metricId, p.periodId, scenario),
    })) ?? []
  );
}

/** Normál 1991–2020, priemer Slovenska (nevážený priemer 8 krajov).
 *  Zdroj: data_raw/shmu/reference_1991_2020.json (SHMÚ 500 m gridy,
 *  sampling scripts/shmu_pipeline/04_sample_shmu_grids.py), CC BY 4.0.
 *  Teplota je anomália voči normálu, preto je definitoricky 0.
 *  Slúži ako baseline „dneška" pre delty v Hero: 30-ročný priemer
 *  vs 30-ročný priemer 2021–2050. Tá istá hodnota je aj
 *  bodom časovej osi s periodId "1991-2020" — normál je na webe
 *  vždy a všade to isté číslo. */
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
    const future = getPoint(NATIONAL_SLUG, id, "2021-2050", scenario);
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

/** Krajský klimatický normál 1991–2020 (SHMÚ 500 m gridy,
 *  sampling scripts/shmu_pipeline/04_sample_shmu_grids.py), CC BY 4.0.
 *  Pre avg_temp je normálom definitoricky anomália 0 — teplota sa
 *  vždy vyjadruje ako odchýlka od normálu, nie absolútna hodnota. */
interface NormalEntry {
  avg_temp_c: number;
  tropical_days: number;
  tropical_nights: number;
  frost_days: number;
  heavy_days: number;
}
const KRAJ_NORMALS = (normalsData as { kraje: Record<string, NormalEntry> })
  .kraje;

export function getRegionalNormal(
  regionSlug: string,
  metricId: MetricId
): number | undefined {
  if (regionSlug === NATIONAL_SLUG) return NORMAL_1991_2020[metricId];
  const entry = KRAJ_NORMALS[regionSlug];
  if (!entry) return undefined;
  switch (metricId) {
    case "avg_temp":
      return 0;
    case "tropical_days":
      return entry.tropical_days;
    case "tropical_nights":
      return entry.tropical_nights;
    case "frost_days":
      return entry.frost_days;
    case "heavy_precip":
      return entry.heavy_days;
  }
}

/** Formát normálu na zobrazenie: rovnaké desatinné miesta ako
 *  displayValue projekcie (teplota 1 des. miesto, lejaky 1 des.
 *  miesto, počty dní celé čísla). */
function formatNormal(metricId: MetricId, value: number): string {
  if (metricId === "avg_temp") return "0,0";
  if (metricId === "heavy_precip")
    return String(Math.round(value * 10) / 10).replace(".", ",");
  return String(Math.round(value));
}

/** Compare 1991–2020 normal vs 2050 projection (RCP4.5) — the
 *  climate-standard baseline comparison (same convention as Hero
 *  cards and IPCC practice: future period mean vs reference normal).
 *  Shape mirrors point-based entries so cards render unchanged;
 *  `today` is the normal baseline, `future` the 2050 projection. */
export function compareNormalVs2050(
  regionSlug: string,
  scenario: string = DEFAULT_SCENARIO
) {
  return METRICS.map((metric) => {
    const normalValue = getRegionalNormal(regionSlug, metric.id);
    const future = getPoint(regionSlug, metric.id, "2021-2050", scenario);
    const today =
      normalValue === undefined
        ? undefined
        : {
            displayValue: formatNormal(metric.id, normalValue),
            value: normalValue,
          };
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

/** Unique short intro per region (no numbers — details are in the
 *  cards below). Server-rendered so every /kraj page has distinct
 *  indexable text (fixes thin/duplicate content across the 8 pages). */
export function getRegionIntro(
  regionSlug: string,
  scenario: string = DEFAULT_SCENARIO
): string {
  const region = getRegion(regionSlug);
  if (!region) return "";
  const comp = compareNormalVs2050(regionSlug, scenario);
  const entry = (id: MetricId) => comp.find((c) => c.metric.id === id);

  const tn50 = entry("tropical_nights")?.future?.value ?? 0;
  const td50 = entry("tropical_days")?.future?.value ?? 0;
  const fdNorm = entry("frost_days")?.today?.value ?? 0;
  let focus: string;
  if (tn50 >= 5) {
    focus = "najciteľnejšie budú častejšie horúčavy a tropické noci, ktoré zhoršujú spánok a prehrievajú byty";
  } else if (td50 >= 25) {
    focus = "najciteľnejšie budú častejšie horúčavy a prehrievanie bytov počas leta";
  } else if (fdNorm >= 100) {
    focus = "najviditeľnejšia bude kratšia a teplejšia zima s menej pravidelným snehom";
  } else {
    focus = "prejavia sa teplejšie letá aj miernejšie zimy";
  }

  return (
    `Ako sa môže zmeniť klíma v regióne ${region.name}? ` +
    `Porovnávame klimatický normál 1991–2020 s projekciou 2021–2050 (scenár RCP4.5). ` +
    `Pre ${region.shortName} to znamená, že ${focus}.`
  );
}

export function getImpacts(): ImpactCategory[] {
  return IMPACTS;
}

export function getSources(): SourceDef[] {
  return SOURCES;
}

export { eraForPeriod, periodById, TIMELINE_PERIODS };
