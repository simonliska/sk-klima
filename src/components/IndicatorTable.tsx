import { SourceBadge } from "./Badges";
import { TOWN_PERIODS, TOWN_PERIOD_LABEL, type Indicator } from "@/lib/towns";

/** Shared columns for the header row and every indicator row. */
const ROW_GRID =
  "grid grid-cols-3 gap-x-4 md:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,8rem))] md:gap-x-8";
const PERIOD_HEAD = {
  "1991-2020": { title: "Dnes", years: "1991–2020" },
  "2050": { title: "2050", years: "2021–2050" },
  "2100": { title: "2100", years: "2071–2100" },
} as const;

/** Today / 2050 / 2100 numbers for a town or kraj (server-rendered). */
export default function IndicatorTable({
  indicators,
}: {
  indicators: Indicator[];
}) {
  return (
    <section aria-labelledby="indikatory">
      <h2 id="indikatory" className="text-2xl sm:text-3xl">
        Dnes, 2050 a 2100 v číslach
      </h2>
      <div
        aria-hidden
        className={`${ROW_GRID} mt-8 border-b border-stone-900 pb-3`}
      >
        <span className="hidden md:block" />
        {TOWN_PERIODS.map((p) => (
          <span key={p} className="md:text-right">
            <span
              className={`block text-sm font-semibold ${
                p === "1991-2020" ? "text-accent-700" : "text-future-700"
              }`}
            >
              {PERIOD_HEAD[p].title}
            </span>
            <span className="block text-xs text-stone-500">
              {PERIOD_HEAD[p].years}
            </span>
          </span>
        ))}
      </div>
      <ul>
        {indicators.map((ind) => (
          <li
            key={ind.metric.id}
            className={`${ROW_GRID} items-baseline gap-y-3 border-b border-stone-200 py-6`}
          >
            <div className="col-span-3 md:col-span-1">
              <h3 className="text-lg font-semibold text-stone-900">
                {ind.metric.labelSk}
                <span className="ml-1.5 text-sm font-normal text-stone-400">
                  {ind.metric.unit}
                </span>
              </h3>
              <p className="text-sm text-stone-500">{ind.metric.definitionSk}</p>
            </div>
            {TOWN_PERIODS.map((p) => (
              <p
                key={p}
                className="text-3xl font-semibold tracking-tight tabular-nums text-stone-900 md:text-right"
              >
                <span className="sr-only">{TOWN_PERIOD_LABEL[p]}: </span>
                {ind.periods[p]}
              </p>
            ))}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <SourceBadge source="SHMÚ" />
        <span className="text-[11px] text-stone-500">
          Normál 1991–2020 a projekcie 2021–2050 a 2071–2100 (RCP4.5)
        </span>
      </div>
    </section>
  );
}
