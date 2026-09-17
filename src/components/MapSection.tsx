"use client";

import { useState } from "react";
import Link from "next/link";
import KrajMap from "./KrajMap";
import {
  compareNormalVs2050,
  DEFAULT_SCENARIO,
  getRegion,
} from "@/lib/climate";
import { SourceBadge } from "./Badges";

export default function MapSection() {
  const [selected, setSelected] = useState<string>("bratislavsky");
  const scenario = DEFAULT_SCENARIO;
  const region = getRegion(selected);
  const comparison = compareNormalVs2050(selected, scenario).slice(0, 5);

  return (
    <section id="mapa" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Vyberte si svoj kraj
        </h2>
        <p className="mt-2 text-lg text-stone-600">
          Každý región sa mení trochu inak. Kliknite na kraj a pozrite sa,
          ako sa môže zmeniť do roku 2050.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
        <div className="min-w-0 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-stone-500">
              Vyberte kraj — v paneli uvidíte normál 1991–2020 a projekciu 2050 (scenár RCP4.5)
            </span>
          </div>
          <KrajMap selected={selected} onSelect={setSelected} />
        </div>

        <article
          className="rounded-3xl bg-teal-950 p-6 text-white shadow-sm"
          aria-live="polite"
        >
          {region && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300">
                Aká zmena sa tu očakáva do roku 2050?
              </p>
              <h3 className="mt-1 text-2xl font-black">{region.name}</h3>
              <p className="mt-1 text-sm text-teal-100/80">
                {region.characterSk} • {region.populationApprox}
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                {comparison.map(({ metric, today, future, delta }) => (
                  <li
                    key={metric.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2"
                  >
                    <span>
                      <span aria-hidden>{metric.icon} </span>
                      {metric.shortLabelSk}
                    </span>
                    <span className="font-bold tabular-nums">
                      {today?.displayValue}{" "}
                      <span aria-hidden className="text-teal-300">→</span>{" "}
                      {future?.displayValue}{" "}
                      {delta && (
                        <span
                          className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs"
                          title="Zmena oproti normálu 1991–2020"
                        >
                          {delta}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/kraj/${region.slug}`}
                className="mt-4 block rounded-full bg-white px-5 py-3 text-center font-bold text-teal-950 hover:bg-teal-50"
              >
                Detail {region.shortName}: normál vs. 2050 →
              </Link>
              <div className="mt-3 flex flex-col items-start gap-2">
                <span className="text-[11px] leading-relaxed text-teal-100/70">
                  Normál 1991–2020 (SHMÚ) • 2050 je projekcia {scenario} (SHMÚ,
                  30-ročný priemer 2021–2050, očakávané približné hodnoty).
                </span>
                <SourceBadge source="SHMÚ" />
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
