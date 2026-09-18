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
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Slovensko včera, dnes a zajtra
        </h2>
        <p className="mt-2 text-lg text-stone-600">
          Ako sa menila klíma na Slovensku a čo sa očakáva v najbližších
          desaťročiach? Vyberte obdobie na posuvníku alebo ťuknite na graf.
          Každý bod je 30-ročný priemer — jeden rok je počasie, nie klíma.
        </p>
      </div>

      {/* Slider */}
      <div className="mt-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <label htmlFor="timeline" className="mt-4 block">
          <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-4xl font-black tabular-nums sm:text-5xl">
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
              className={`min-h-[44px] min-w-[44px] rounded-full px-2.5 py-2 hover:bg-stone-100 ${p.id === periodId ? "bg-teal-700 text-white" : ""}`}
            >
              {p.labelSk}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {cards.map(({ metric, series, point }) => (
          <article
            key={metric.id}
            className="reveal rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-2xl" aria-hidden>
                  {metric.icon}
                </p>
                <h3 className="mt-1 font-bold">{metric.labelSk}</h3>
                <p className="text-xs text-stone-500">{metric.unit}</p>
              </div>
              <DataEraBadge era={point?.era ?? "DNES"} />
            </div>
            <p className="mt-3 text-4xl font-black tabular-nums">
              {point?.displayValue}
              <span className="ml-1 text-sm font-medium text-stone-500">
                {metric.id === "avg_temp" ? "°C" : ""}
              </span>
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {metric.definitionSk}
            </p>
            {point && (
              <p className="mt-1 text-xs text-stone-500">
                {pointHint(point.periodId, point.status)} • {point.labelSk}
              </p>
            )}
            <div className="mt-3">
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
            <div className="mt-3 flex items-center justify-between">
              <SourceBadge source={point?.sourceId ?? "E-OBS"} />
              <span className="text-xs tabular-nums text-stone-400">
                30-ročný priemer
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a
          href="/metodika"
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          Ako vznikli tieto údaje? →
        </a>
      </div>

      <p className="mt-4 rounded-2xl bg-violet-50 p-4 text-sm leading-relaxed text-violet-950">
        <strong>Budúce hodnoty sú projekcie, nie predpoveď.</strong>{" "}
        1951–2010 pozorovania E-OBS, 1991–2020 normál SHMÚ, 2021–2050 /
        2071–2100 projekcia RCP4.5 (30-ročné priemery). Skutočný vývoj
        závisí od budúcich emisií a ďalších faktorov.
      </p>
    </section>
  );
}
