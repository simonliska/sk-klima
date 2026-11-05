import Link from "next/link";
import geo from "@/data/kraje.paths.json";
import { getHeroCards, getRegion } from "@/lib/climate";
import { SourceBadge } from "./Badges";

const PATHS = (geo.paths as unknown) as Record<string, { d: string }>;
const VIEWBOX: string = (geo as { viewBox: string }).viewBox;

export default function Hero() {
  const cards = getHeroCards();
  return (
    <section className="relative overflow-hidden bg-accent-950">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div>
            <p className="border-b border-white/20 pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent-200">
              Klimatická zmena · Slovensko · 1951–2100
            </p>
            <h1 className="mt-4 text-5xl leading-[1.02] text-white sm:text-7xl">
              Ako sa zmení Slovensko?
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-accent-50/90">
              Klimatická zmena nie je len číslo v grafe. Pozrite sa, čo môže
              znamenať pre vaše mesto, región a každodenný život.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#mapa"
                className="rounded-xs bg-white px-6 py-3 font-semibold text-accent-950 hover:bg-accent-100"
              >
                Vybrať svoj kraj
              </Link>
              <Link
                href="/#zivot"
                className="rounded-xs border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Čo to znamená v praxi
              </Link>
            </div>
          </div>

          {/* Real Slovakia shape + mini stats */}
          <div className="border border-white/15 bg-accent-950 p-5">
            <svg
              viewBox={VIEWBOX}
              role="group"
              aria-label="Mapa Slovenska — vyberte kraj pre detail"
              className="h-auto w-full"
            >
              <g
                fill="rgba(255,255,255,0.16)"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1.2}
                strokeLinejoin="round"
              >
                {Object.entries(PATHS).map(([slug, p]) => (
                  <Link
                    key={slug}
                    href={`/kraj/${slug}`}
                    aria-label={getRegion(slug)?.name ?? slug}
                    className="group/kraj"
                  >
                    <path
                      d={p.d}
                      className="cursor-pointer transition-colors hover:fill-white/40 group-focus-visible/kraj:fill-white/40 group-focus-visible/kraj:stroke-white group-focus-visible/kraj:[stroke-width:2.5]"
                    >
                      <title>{getRegion(slug)?.name ?? slug}</title>
                    </path>
                  </Link>
                ))}
              </g>
            </svg>
            <p className="mt-1 text-center text-[11px] text-accent-50/80">
              Kliknite na kraj pre detail.
            </p>
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-accent-100">
              Priemer Slovenska • Projekcia 2021-2050
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center sm:gap-2">
              {cards.map((c) => (
                <div key={c.metric.id} className="min-w-0 bg-white/95 px-1.5 py-2.5 sm:px-2 sm:py-3">
                  <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                    {c.metric.shortLabelSk}
                  </div>
                  <div className="mt-1 text-base font-semibold tabular-nums text-stone-900 sm:text-lg">
                    {c.big}
                  </div>
                  {c.delta !== null && (
                    <div
                      className="mx-auto mt-1.5 w-fit rounded-xs border border-accent-700/30 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-accent-900"
                      aria-label={
                        c.delta
                          ? `${c.delta} oproti klimatickému normálu 1991 až 2020`
                          : "Oproti klimatickému normálu 1991 až 2020"
                      }
                    >
                      {c.delta ? `${c.delta} ` : ""}oproti 1991–2020
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-accent-50/90">
              Projekcia porovnáva 30-ročný priemer 2021–2050 s klimatickým normálom 1991–2020.
              Scenár RCP4.5 (stredne optimistický klimatický scenár).
            </p>
            <div className="mt-2 flex justify-center">
              <SourceBadge source="E-OBS, SHMÚ" onDark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
