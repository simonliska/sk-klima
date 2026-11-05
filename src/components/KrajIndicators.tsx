"use client";

import { SourceBadge } from "./Badges";
import {
  compareNormalVs2050,
  DEFAULT_SCENARIO,
  skCountUnit,
} from "@/lib/climate";

/** Today → 2050 numbers for the single RCP4.5 scenario (client island on server page). */
export default function KrajIndicators({ slug }: { slug: string }) {
  const scenario = DEFAULT_SCENARIO;
  const comparison = compareNormalVs2050(slug, scenario);
  return (
    <section aria-labelledby="indikatory">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="indikatory" className="text-2xl sm:text-3xl">
          Normál 1991–2020 → projekcia 2021–2050 v číslach
        </h2>
        <span className="inline-flex rounded-xs border border-future-700 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-future-700">
          Scenár RCP4.5 (stredný)
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-stone-900 text-xs font-semibold uppercase tracking-[0.06em] text-stone-500">
              <th scope="col" className="py-2 pr-4 font-semibold">Ukazovateľ</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-accent-700">
                Normál 1991–2020
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-future-700">
                Projekcia 2021–2050
              </th>
              <th scope="col" className="py-2 text-right font-semibold">Zmena</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map(({ metric, today, future, delta }) => (
              <tr key={metric.id} className="border-b border-stone-300 align-top">
                <th scope="row" className="py-4 pr-4 font-normal">
                  <span className="font-serif text-lg font-semibold text-stone-900">
                    {metric.labelSk}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-600">
                    {metric.definitionSk}
                  </span>
                </th>
                <td className="py-4 pr-4 text-right text-2xl font-semibold tabular-nums sm:text-3xl">
                  {today?.displayValue}
                </td>
                <td className="py-4 pr-4 text-right text-2xl font-semibold tabular-nums sm:text-3xl">
                  {future?.displayValue}
                </td>
                <td className="whitespace-nowrap py-4 text-right tabular-nums">
                  {delta ? (
                    <span className="text-base font-semibold text-stone-900">
                      {delta}
                      <span className="ml-1 text-sm font-normal text-stone-500">
                        {metric.id === "avg_temp"
                          ? ""
                          : skCountUnit(
                              metric.id,
                              Number(delta.replace("+", "").replace(",", "."))
                            )}
                      </span>
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <SourceBadge source="SHMÚ" />
      </div>
    </section>
  );
}
