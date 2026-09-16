import { z } from "zod";

export const TIMELINE_YEARS = [1950, 1960, 2000, 2010, 2020, 2025, 2050, 2100] as const;
export type TimelineYear = (typeof TIMELINE_YEARS)[number];

export const METRIC_IDS = [
  "avg_temp",
  "tropical_days",
  "tropical_nights",
  "frost_days",
  "heavy_precip",
] as const;
export type MetricId = (typeof METRIC_IDS)[number];

export type DataStatus = "observed" | "projected";
export type Era = "HISTÓRIA" | "DNES" | "PROJEKCIA";

export function eraForYear(year: number): Era {
  if (year < 2025) return "HISTÓRIA";
  if (year === 2025) return "DNES";
  return "PROJEKCIA";
}

export const ClimatePointSchema = z.object({
  year: z.number(),
  value: z.number(),
  displayValue: z.string(),
  status: z.enum(["observed", "projected"]),
});

export const ClimateRecordSchema = z.object({
  regionSlug: z.string(),
  metricId: z.string(),
  unit: z.string(),
  points: z.array(ClimatePointSchema).min(1),
  referencePeriod: z.string(),
  scenario: z.string().nullable(),
  sourceId: z.string(),
  lastUpdated: z.string(),
});

export type ClimatePoint = z.infer<typeof ClimatePointSchema>;
export type ClimateRecord = z.infer<typeof ClimateRecordSchema>;

export interface Region {
  slug: string;
  name: string;
  shortName: string;
  populationApprox: string;
  characterSk: string;
}

export interface MetricDef {
  id: MetricId;
  labelSk: string;
  shortLabelSk: string;
  icon: string;
  unit: string;
  definitionSk: string;
  goodDirection: "up-bad" | "down-bad" | "neutral";
  headlineTemplateSk: string;
  praxSk: string;
}

export interface ImpactCategory {
  id: string;
  icon: string;
  titleSk: string;
  headlineSk: string;
  statSk: string;
  explanationSk: string;
  praxSk: string;
}

export interface SourceDef {
  id: string;
  nameSk: string;
  name: string;
  url: string;
  roleSk: string;
}

// Reference period + scenario locked for MVP
export const REFERENCE_PERIOD = "1991–2020";
export const MVP_SCENARIO = "RCP4.5";
export const MVP_SCENARIO_LABEL_SK =
  "Stredný scenár RCP4.5 (SHMÚ) — projekcia, nie predpoveď počasia";
