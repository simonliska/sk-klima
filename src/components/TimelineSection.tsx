"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_SCENARIO,
  getMetricSeries,
  getMetrics,
  NATIONAL_SLUG,
} from "@/lib/climate";
import {
  DEFAULT_PERIOD_ID,
  TIMELINE_PERIODS,
  periodById,
  type TimelinePeriodId,
} from "@/lib/types";
import { DataEraBadge, SourceBadge } from "./Badges";
import ClimateChart from "./ClimateChart";

function periodHint(periodId: string): string {
  if (periodId === "1991-2020")
    return "Klimatický normál 1991–2020 (SHMÚ) — dnešná klíma";
  const p = periodById(periodId);
  if (!p) return "";
  if (p.status === "projected")
    return "Projekcia RCP4.5: 30-ročný priemer — nie predpoveď počasia";
  return "Pozorovaný 30-ročný priemer (E-OBS)";
}

function pointHint(periodId: string, status: string): string {
  if (status === "projected") return "Projekcia: 30-ročný priemer";
  if (periodId === "1991-2020") return "Klimatický normál (SHMÚ)";
  return "Pozorovaný 30-ročný priemer (E-OBS)";
}

export default function TimelineSection() {
  const [periodId, setPeriodId] = useState<TimelinePeriodId>(DEFAULT_PERIOD_ID);
  const scenario = DEFAULT_SCENARIO;
  const metrics = getMetrics();

  const periodIndex = TIMELINE_PERIODS.findIndex((p) => p.id === periodId);
  const period = periodById(periodId);

  const cards = useMemo(
    () =>
      metrics.map((m) => {
        const series = getMetricSeries(NATIONAL_SLUG, m.id, scenario);
        const point = series.find((p) => p.periodId === periodId);
        return { metric: m, series, point };
      }),
    [periodId, metrics, scenario]
  );

  return (
    <section id="cas" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl">
          Slovensko včera, dnes a zajtra
        </h2>
        <p className="mt-2 text-lg text-stone-600">
          Ako sa menila klíma na Slovensku a čo sa očakáva v najbližších
          desaťročiach? Vyberte obdobie na posuvníku alebo ťuknite na graf.
          Každý bod je 30-ročný priemer — jeden rok je počasie, nie klíma.
        </p>
      </div>

      {/* Slider */}
      <div className="mt-6 border-y border-stone-300 py-5">
        <label htmlFor="timeline" className="block">
          <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-4xl font-semibold tabular-nums sm:text-5xl">
              {period?.labelSk}
            </span>
            <span className="text-sm text-stone-500 sm:text-right">
              {periodHint(periodId)}
            </span>
          </span>
          <input
            id="timeline"
            type="range"
            min={0}
            max={TIMELINE_PERIODS.length - 1}
            step={1}
            value={periodIndex}
            onChange={(e) =>
              setPeriodId(
                TIMELINE_PERIODS[Number(e.target.value)].id as TimelinePeriodId
              )
            }
            className="timeline-range mt-3 w-full"
            aria-valuetext={`Obdobie ${period?.labelSk}`}
          />
        </label>
        <div
          className="mt-3 flex flex-wrap gap-1 text-xs font-semibold text-stone-500"
          role="group"
          aria-label="Vyberte obdobie na časovej osi"
        >
          {TIMELINE_PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id as TimelinePeriodId)}
              title={p.labelSk}
              className={`min-h-[44px] min-w-[44px] rounded-xs px-2.5 py-2 ${p.id === periodId ? "bg-accent-700 text-white" : "hover:bg-stone-100"}`}
            >
              {p.labelSk}
            </button>
          ))}
        </div>
      </div>

      {/* Metric rows */}
      <div
        aria-hidden="true"
        className="mt-8 hidden grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)_minmax(0,1.4fr)] gap-8 border-b-2 border-stone-900 pb-2 text-xs font-semibold uppercase tracking-[0.06em] text-stone-500 lg:grid"
      >
        <span>Ukazovateľ</span>
        <span>{period?.labelSk}</span>
        <span>Vývoj 1951–2100 (ťuknite na bod)</span>
      </div>
      <ul className="mt-8 border-t-2 border-stone-900 lg:mt-0 lg:border-t-0">
        {cards.map(({ metric, series, point }) => (
          <li
            key={metric.id}
            className="grid gap-x-8 gap-y-3 border-b border-stone-300 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)_minmax(0,1.4fr)] lg:items-center"
          >
            <div>
              <h3 className="font-serif text-xl font-semibold">
                {metric.labelSk}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                {metric.definitionSk}
              </p>
            </div>
            <div>
              <p className="text-4xl font-semibold leading-none tabular-nums sm:text-5xl">
                {point?.displayValue}
                <span className="ml-1.5 text-base font-medium text-stone-500">
                  {metric.unit}
                </span>
              </p>
              <div className="mt-3">
                <DataEraBadge era={point?.era ?? "DNES"} />
              </div>
              {point && (
                <p className="mt-1 text-xs text-stone-500">
                  {pointHint(point.periodId, point.status)}
                </p>
              )}
            </div>
            <div className="min-w-0">
              <ClimateChart
                data={series.map((s) => ({
                  periodId: s.periodId,
                  label: s.shortLabelSk,
                  value: s.value,
                }))}
                activePeriodId={periodId}
                onSelectPeriod={(id) => setPeriodId(id as TimelinePeriodId)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <SourceBadge source="E-OBS, SHMÚ" />
      </div>
    </section>
  );
}
