"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_SCENARIO,
  getMetricSeries,
  getMetrics,
  NATIONAL_SLUG,
} from "@/lib/climate";
import { TIMELINE_YEARS, type TimelineYear } from "@/lib/types";
import { DataEraBadge, SourceBadge } from "./Badges";
import ClimateChart from "./ClimateChart";

export default function TimelineSection() {
  const [year, setYear] = useState<TimelineYear>(2025);
  const scenario = DEFAULT_SCENARIO;
  const metrics = getMetrics();

  const yearIndex = TIMELINE_YEARS.indexOf(year);

  const cards = useMemo(
    () =>
      metrics.map((m) => {
        const series = getMetricSeries(NATIONAL_SLUG, m.id, scenario);
        const point = series.find((p) => p.year === year);
        return { metric: m, series, point };
      }),
    [year, metrics, scenario]
  );

  return (
    <section id="cas" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Slovensko včera, dnes a zajtra
        </h2>
        <p className="mt-2 text-lg text-stone-600">
          Ako sa menila klíma na Slovensku a čo sa očakáva v najbližších
          desaťročiach? Vyberte rok na posuvníku alebo ťuknite na graf.
        </p>
      </div>

      {/* Slider */}
      <div className="mt-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
          <DataEraBadge
            era={year < 2025 ? "HISTÓRIA" : year === 2025 ? "DNES" : "PROJEKCIA"}
          />
          <p className="text-sm text-stone-500">
            Klimatický normál 1991–2020 • Scenár {scenario} pre budúcnosť
          </p>
        </div>

        <label htmlFor="timeline" className="mt-4 block">
          <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-5xl font-black tabular-nums">{year}</span>
            <span className="text-sm text-stone-500 sm:text-right">
              {year < 2025
                ? "Pozorované zmeny (E-OBS)"
                : year === 2025
                  ? "Pozorovaná hodnota za rok 2025 (E-OBS)"
                  : "Projekcia: očakávané približné hodnoty — nie predpoveď počasia"}
            </span>
          </span>
          <input
            id="timeline"
            type="range"
            min={0}
            max={TIMELINE_YEARS.length - 1}
            step={1}
            value={yearIndex}
            onChange={(e) =>
              setYear(TIMELINE_YEARS[Number(e.target.value)] as TimelineYear)
            }
            className="timeline-range mt-3 w-full"
            aria-valuetext={`Rok ${year}`}
          />
        </label>
        <div
          className="mt-3 flex flex-wrap gap-1 text-xs font-semibold text-stone-500"
          role="group"
          aria-label="Vyberte rok na časovej osi"
        >
          {TIMELINE_YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`min-h-[44px] min-w-[44px] rounded-full px-2.5 py-2 hover:bg-stone-100 ${y === year ? "bg-teal-700 text-white" : ""}`}
            >
              {y}
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
              {point && point.year > 2025
                ? metric.headlineTemplateSk
                : metric.definitionSk}
            </p>
            {point && (
              <p className="mt-1 text-xs text-stone-500">
                {point.status === "projected"
                  ? "Projekcia: približná hodnota"
                  : point.year === 2025
                    ? "Pozorovaná hodnota za rok 2025"
                    : "Pozorovaná hodnota"}
              </p>
            )}
            <div className="mt-3">
              <ClimateChart
                data={series.map((s) => ({ year: s.year, value: s.value }))}
                activeYear={year}
                onSelectYear={(y) => {
                  if ((TIMELINE_YEARS as readonly number[]).includes(y))
                    setYear(y as TimelineYear);
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <SourceBadge source={point?.sourceId ?? "E-OBS"} />
              <span className="text-xs tabular-nums text-stone-400">
                {point?.year === 2050 || point?.year === 2100
                  ? "Projekcia: 30-ročný priemer"
                  : "Pozorovaný rok"}
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
        <strong>Budúce hodnoty sú projekcie, nie predpoveď.</strong> Minulosť
        a rok 2025 sú pozorované dáta E-OBS (teplotné odchýlky oproti
        klimatickému normálu SHMÚ 1991–2020); roky 2050 a 2100 sú projekcie scenára
        RCP4.5. Skutočný vývoj
        závisí od budúcich emisií skleníkových plynov a ďalších faktorov.
      </p>
    </section>
  );
}
