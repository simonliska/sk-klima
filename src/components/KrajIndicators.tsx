"use client";

import Link from "next/link";
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
        <div>
          <h2 id="indikatory" className="text-2xl font-black">
            Normál 1991–2020 → projekcia 2021–2050 v číslach
          </h2>
        </div>
        <span className="inline-flex rounded-full bg-violet-700 px-3 py-1.5 text-xs font-bold text-white">
          Stredný (RCP4.5)
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comparison.map(({ metric, today, future, delta }) => (
          <article
            key={metric.id}
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h3 className="font-bold">
                <span aria-hidden>{metric.icon} </span>
                {metric.labelSk}
              </h3>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="rounded-2xl bg-teal-50 px-4 py-3 text-center">
                <p className="text-[11px] font-bold uppercase text-teal-800">Normál 1991–2020</p>
                <p className="text-2xl font-black tabular-nums">
                  {today?.displayValue}
                </p>
              </div>
              <span aria-hidden className="text-2xl text-teal-700">→</span>
              <div className="rounded-2xl bg-violet-50 px-4 py-3 text-center">
                <p className="text-[11px] font-bold uppercase text-violet-800">Projekcia 2021–2050</p>
                <p className="text-2xl font-black tabular-nums">
                  {future?.displayValue}
                </p>
              </div>
            </div>
            {delta && (
              <p className="mt-2 text-sm font-bold text-teal-800">
                Zmena oproti normálu: {delta}
                {metric.id === "avg_temp"
                  ? ""
                  : ` ${skCountUnit(
                      metric.id,
                      Number(delta.replace("+", "").replace(",", "."))
                    )}`}
              </p>
            )}
            <p className="mt-1 text-sm text-stone-600">{metric.definitionSk}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-sm">
        <Link href="/metodika" className="font-medium text-teal-800 hover:underline">
          Ako vznikli tieto údaje? →
        </Link>
      </p>
    </section>
  );
}
