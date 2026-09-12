import Link from "next/link";
import geo from "@/data/kraje.paths.json";
import { getHeroCards } from "@/lib/climate";
import { SourceBadge } from "./Badges";

const PATHS = (geo.paths as unknown) as Record<string, { d: string }>;
const VIEWBOX: string = (geo as { viewBox: string }).viewBox;

export default function Hero() {
  const cards = getHeroCards();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-teal-900 to-stone-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="reveal">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-100">
              <span aria-hidden="true">●</span> Klimatická zmena • Slovensko • jednoducho
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Ako sa zmení Slovensko?
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-teal-50/90">
              Klimatická zmena nie je len číslo v grafe. Pozrite sa, čo môže
              znamenať pre vaše mesto, región a každodenný život.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#mapa"
                className="rounded-full bg-white px-6 py-3 font-bold text-teal-950 hover:bg-teal-50"
              >
                Vybrať svoj kraj
              </Link>
              <Link
                href="/#zivot"
                className="rounded-full border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                Čo to znamená v praxi
              </Link>
            </div>
            <p className="mt-4 text-xs text-teal-100/70">
              Do roku 2025 pozorované dáta • 2050 a 2100 projekcia RCP4.5
            </p>
          </div>

          {/* Real Slovakia shape + mini stats */}
          <div className="reveal rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur" style={{ animationDelay: "120ms" }}>
            <svg
              viewBox={VIEWBOX}
              role="img"
              aria-label="Mapa Slovenska rozdelená na kraje"
              className="h-auto w-full"
            >
              <g
                fill="rgba(255,255,255,0.16)"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1.2}
                strokeLinejoin="round"
              >
                {Object.entries(PATHS).map(([slug, p]) => (
                  <path key={slug} d={p.d}>
                    <title>{slug}</title>
                  </path>
                ))}
              </g>
            </svg>
            <p className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-teal-100/80">
              Priemer Slovenska • Projekcia 2050
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center sm:gap-2">
              {cards.map((c) => (
                <div key={c.metric.id} className="min-w-0 rounded-2xl bg-white/95 px-1.5 py-2.5 sm:px-2 sm:py-3">
                  <div className="truncate text-[11px] font-bold uppercase tracking-wide text-stone-500">
                    <span aria-hidden>{c.metric.icon} </span>
                    {c.metric.shortLabelSk}
                  </div>
                  <div className="mt-1 text-base font-black tabular-nums text-stone-900 sm:text-lg">
                    {c.big}
                  </div>
                  {c.delta !== null && (
                    <div
                      className="mx-auto mt-1.5 w-fit rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-teal-900"
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
            <p className="mt-2 text-center text-[11px] leading-relaxed text-teal-100/70">
              Všetko sa porovnáva s klimatickým normálom 1991–2020 (SHMÚ):
              teplota je odchýlka, pri dňoch rozdiel počtu. 2050 = 30-ročný
              priemer 2021–2050, scenár RCP4.5 (očakávané približné hodnoty).
            </p>
            <div className="mt-2 flex justify-center">
              <SourceBadge source="E-OBS, SHMÚ" />
            </div>
          </div>
        </div>
      </div>
      <div className="h-10 rounded-t-[2rem] bg-stone-50" />
    </section>
  );
}
