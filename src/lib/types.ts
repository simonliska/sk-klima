import { z } from "zod";

export interface TimelinePeriod {
  id: string;
  /** Full label for display, e.g. "1951–1980". */
  labelSk: string;
  /** Compact label for mini chart ticks, e.g. "1951–80" / "2021–50". */
  shortLabelSk: string;
  start: number;
  end: number;
  /** Chart ordering key (period midpoint). UI never shows this as a year. */
  mid: number;
  era: Era;
  status: DataStatus;
}

/** Climate timeline: six 30-year WMO periods. Past = E-OBS observations,
 *  1991–2020 = SHMÚ normal (today's climate), future = SHMÚ RCP4.5
 *  projections 2021–2050 / 2071–2100 (in mini charts shortened to
 *  "2021–50" / "2071–00"). No single years — one year is weather,
 *  not climate. */
export const TIMELINE_PERIODS: TimelinePeriod[] = [
  { id: "1951-1980", labelSk: "1951–1980", shortLabelSk: "1951–80", start: 1951, end: 1980, mid: 1965, era: "HISTÓRIA", status: "observed" },
  { id: "1961-1990", labelSk: "1961–1990", shortLabelSk: "1961–90", start: 1961, end: 1990, mid: 1975, era: "HISTÓRIA", status: "observed" },
  { id: "1981-2010", labelSk: "1981–2010", shortLabelSk: "1981–10", start: 1981, end: 2010, mid: 1995, era: "HISTÓRIA", status: "observed" },
  { id: "1991-2020", labelSk: "1991–2020", shortLabelSk: "1991–20", start: 1991, end: 2020, mid: 2005, era: "DNES", status: "observed" },
  { id: "2021-2050", labelSk: "2021–2050", shortLabelSk: "2021–50", start: 2021, end: 2050, mid: 2035, era: "PROJEKCIA", status: "projected" },
  { id: "2071-2100", labelSk: "2071–2100", shortLabelSk: "2071–00", start: 2071, end: 2100, mid: 2085, era: "PROJEKCIA", status: "projected" },
];
export type TimelinePeriodId = (typeof TIMELINE_PERIODS)[number]["id"];

export const DEFAULT_PERIOD_ID: TimelinePeriodId = "1991-2020";

export function eraForPeriod(periodId: string): Era {
  return TIMELINE_PERIODS.find((p) => p.id === periodId)?.era ?? "DNES";
}

export function periodById(periodId: string): TimelinePeriod | undefined {
  return TIMELINE_PERIODS.find((p) => p.id === periodId);
}

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

export const ClimatePointSchema = z.object({
  periodId: z.string(),
  labelSk: z.string(),
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
}

export interface MetricDef {
  id: MetricId;
  labelSk: string;
  shortLabelSk: string;
  icon: string;
  unit: string;
  definitionSk: string;
  goodDirection: "up-bad" | "down-bad" | "neutral";
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
