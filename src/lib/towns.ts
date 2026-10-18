import townsData from "@/data/towns.json";
import { getRegion, getMetric, skCountUnit } from "./climate";
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
/** Chart X-axis labels (end year of the 30-year period, as on the main page). */
export const TOWN_PERIOD_AXIS: Record<TownPeriod, string> = {
  "1991-2020": "2020",
  "2050": "2050",
  "2100": "2100",
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
/** Count unit; fractional values take the genitive singular ("0,7 dňa"). */
function countUnit(id: MetricId, v: number): string {
  if (!Number.isInteger(v)) return id === "tropical_nights" ? "noci" : "dňa";
  return skCountUnit(id, v);
}
const rounded = (id: MetricId, v: number) => Number(v.toFixed(decimals(id)));
/** Delta between the DISPLAYED (rounded) values, so the numbers on the card add up. */
function formatDelta(id: MetricId, from: number, to: number): string {
  const dec = decimals(id);
  const r = Number((rounded(id, to) - rounded(id, from)).toFixed(dec));
  const s = sk(r, dec);
  const signed = r > 0 ? `+${s}` : s;
  if (id === "avg_temp") return `${signed} °C`;
  return `${signed} ${countUnit(id, r)}`;
}

/** Text: how the town differs from its kraj average (normal 1991–2020). */
function krajComparison(id: MetricId, town: number, kraj: number): string {
  const dec = decimals(id);
  const d = Number((town - kraj).toFixed(dec));
  if (d === 0) return "Približne rovnako ako priemer kraja.";
  const abs = Math.abs(d);
  if (id === "avg_temp")
    return `O ${sk(abs, dec)} °C ${d > 0 ? "teplejšie" : "chladnejšie"} než priemer kraja.`;
  return `O ${sk(abs, dec)} ${countUnit(id, abs)} ${d > 0 ? "viac" : "menej"} než priemer kraja.`;
}

export function getTownIndicators(town: Town) {
  const region = getRegion(town.kraj);
  return METRIC_ORDER.map((id) => {
    const metric = getMetric(id)!;
    const key = GRID_KEY[id];
    const v = town.values[key];
    const normal = v["1991-2020"] as number;
    const p2050 = v["2050"] as number;
    const p2100 = v["2100"] as number;
    const k = DATA.kraje[town.kraj]?.[key];
    return {
      metric,
      periods: {
        "1991-2020": formatTownValue(id, normal),
        "2050": formatTownValue(id, p2050),
        "2100": formatTownValue(id, p2100),
      } as Record<TownPeriod, string>,
      chart: [
        { periodId: "1991-2020", label: TOWN_PERIOD_AXIS["1991-2020"], value: normal },
        { periodId: "2050", label: TOWN_PERIOD_AXIS["2050"], value: p2050 },
        { periodId: "2100", label: TOWN_PERIOD_AXIS["2100"], value: p2100 },
      ],
      delta2050: formatDelta(id, normal, p2050),
      delta2100: formatDelta(id, normal, p2100),
      vsKraj: k ? krajComparison(id, normal, k["1991-2020"]) : null,
      krajName: region?.name ?? town.kraj,
    };
  });
}
