"use client";

import { useState } from "react";
import Link from "next/link";
import KrajMap from "./KrajMap";
import { SourceBadge } from "./Badges";
import { getRegion } from "@/lib/climate";

export type KrajPreviewRow = {
  id: string;
  label: string;
  unit: string;
  today: string;
  future: string;
};

const COLS = "grid grid-cols-[minmax(0,1fr)_4rem_4.5rem] gap-x-3";

export default function MapSection({
  preview,
}: {
  preview: Record<string, KrajPreviewRow[]>;
}) {
  const [selected, setSelected] = useState<string>("bratislavsky");
  const region = getRegion(selected);
  const rows = preview[selected] ?? [];

  return (
    <section id="mapa" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl">Vyberte si svoj kraj</h2>
        <p className="mt-2 text-lg text-stone-600">
          Každý región sa mení trochu inak. Kliknite na kraj a pozrite sa,
          ako sa môže zmeniť do roku 2050.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
        <div className="min-w-0 border border-stone-200 bg-white p-5">
          <KrajMap selected={selected} onSelect={setSelected} />
        </div>

        <article className="bg-accent-950 p-6 text-white sm:p-8" aria-live="polite">
          {region && (
            <>
              <h3 className="font-serif text-3xl font-semibold">{region.name}</h3>

              <div
                aria-hidden
                className={`${COLS} mt-6 border-b border-white/20 pb-2 text-xs text-accent-200`}
              >
                <span />
                <span className="text-right">Dnes</span>
                <span className="text-right font-semibold text-white">2050</span>
              </div>

              <ul>
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className={`${COLS} items-baseline border-b border-white/10 py-3.5`}
                  >
                    <span>
                      <span className="block">{row.label}</span>
                      <span className="block text-xs text-accent-200/80">{row.unit}</span>
                    </span>
                    <span className="text-right text-lg tabular-nums text-accent-100/60">
                      <span className="sr-only">Dnes: </span>
                      {row.today}
                    </span>
                    <span className="text-right text-2xl font-semibold tabular-nums">
                      <span className="sr-only">2050: </span>
                      {row.future}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/kraj/${region.slug}`}
                className="mt-6 block rounded-xs bg-white px-5 py-3 text-center font-semibold text-accent-950 hover:bg-accent-50"
              >
                {region.name} do roku 2100 →
              </Link>

              <p className="mt-4 text-[11px] leading-relaxed text-accent-100/60">
                Dnes: priemer za obdobie 1991–2020. 2050: priemer pre obdobie
                2021–2050 (scenár RCP4.5).{" "}
                <SourceBadge source="SHMÚ" onDark />
              </p>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
