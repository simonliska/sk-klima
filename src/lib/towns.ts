import townsData from "@/data/towns.json";
import { getMetric } from "./climate";
import type { MetricId } from "./types";

/** District towns: SHMÚ 1991–2020 normal + RCP4.5 (2050 / 2100) in the
 *  town centre (scripts/shmu_pipeline/08_sample_towns.py). No E-OBS history. */
export interface Town {
  slug: string;
  name: string;
  district: string;
  kraj: string;
  lat: number;
  lon: number;
  values: Record<string, Record<string, number | null>>;
}

type TownsFile = {
  towns: Record<string, Town>;
  kraje: Record<string, Record<string, Record<string, number>>>;
};
const DATA = townsData as unknown as TownsFile;
const TOWNS: Town[] = Object.entries(DATA.towns)
  .map(([slug, t]) => ({ ...t, slug }))
  .sort((a, b) => a.name.localeCompare(b.name, "sk"));

export const TOWN_PERIODS = ["1991-2020", "2050", "2100"] as const;
export type TownPeriod = (typeof TOWN_PERIODS)[number];
export const TOWN_PERIOD_LABEL: Record<TownPeriod, string> = {
  "1991-2020": "Normál 1991–2020",
  "2050": "Projekcia 2021–2050",
  "2100": "Projekcia 2071–2100",
};

/** MetricId -> key in towns.json. */
const GRID_KEY: Record<MetricId, string> = {
  avg_temp: "avg_temp",
  tropical_days: "tropical_days",
  tropical_nights: "tropical_nights",
  frost_days: "frost_days",
  heavy_precip: "heavy_days",
};
const METRIC_ORDER: MetricId[] = [
  "avg_temp",
  "frost_days",
  "tropical_days",
  "tropical_nights",
  "heavy_precip",
];

export function getTowns(): Town[] {
  return TOWNS;
}
export function getTown(slug: string): Town | undefined {
  return TOWNS.find((t) => t.slug === slug);
}
export function getTownsByKraj(krajSlug: string): Town[] {
  return TOWNS.filter((t) => t.kraj === krajSlug);
}

const decimals = (id: MetricId) => (id === "avg_temp" || id === "heavy_precip" ? 1 : 0);
const sk = (v: number, dec: number) => v.toFixed(dec).replace(".", ",");
export function formatTownValue(id: MetricId, v: number): string {
  return sk(v, decimals(id));
}

export type Indicator = {
  metric: NonNullable<ReturnType<typeof getMetric>>;
  periods: Record<TownPeriod, string>;
};

function buildIndicators(
  values: Record<string, Record<string, number | null>>
): Indicator[] {
  return METRIC_ORDER.map((id) => {
    const v = values[GRID_KEY[id]];
    return {
      metric: getMetric(id)!,
      periods: Object.fromEntries(
        TOWN_PERIODS.map((p) => [p, formatTownValue(id, v[p] as number)])
      ) as Record<TownPeriod, string>,
    };
  });
}

export function getTownIndicators(town: Town): Indicator[] {
  return buildIndicators(town.values);
}

/** Kraj average from the same SHMÚ grids (normal + RCP4.5 2050 / 2100). */
export function getKrajIndicators(krajSlug: string): Indicator[] {
  const values = DATA.kraje[krajSlug];
  return values ? buildIndicators(values) : [];
}
