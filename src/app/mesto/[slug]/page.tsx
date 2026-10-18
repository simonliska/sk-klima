import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRegion } from "@/lib/climate";
import {
  getTown,
  getTownIndicators,
  getTowns,
  TOWN_PERIODS,
  TOWN_PERIOD_LABEL,
} from "@/lib/towns";
import { DataEraBadge, SourceBadge } from "@/components/Badges";
import ClimateChart from "@/components/ClimateChart";

export function generateStaticParams() {
  return getTowns().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const town = getTown(slug);
  if (!town) return { title: "Mesto sa nenašlo" };
  const title = `Klimatická zmena ${town.name} do roku 2100`;
  return {
    title,
    description: `Ako sa môže zmeniť klíma v meste ${town.name}? Normál 1991–2020 a projekcie na rok 2050 a 2100 — teplota, horúce dni, mráz a zrážky.`,
    alternates: { canonical: `/mesto/${town.slug}` },
    openGraph: {
      title,
      url: `https://sk-klima.sk/mesto/${town.slug}`,
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function TownPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const town = getTown(slug);
  if (!town) notFound();
  const region = getRegion(town.kraj);
  const indicators = getTownIndicators(town);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 pb-16 sm:px-6">
      <nav className="text-sm text-stone-500" aria-label="Navigačná cesta">
        <Link href="/" className="hover:underline">Domov</Link>
        <span aria-hidden> / </span>
        <Link href={`/kraj/${town.kraj}`} className="hover:underline">
          {region?.name ?? town.kraj}
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">{town.name}</span>
      </nav>

      <header className="rounded-3xl bg-teal-950 p-6 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <DataEraBadge era="DNES" />
          <span aria-hidden className="text-teal-300">→</span>
          <DataEraBadge era="PROJEKCIA" />
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          {town.name}: ako sa zmení klíma
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-teal-50/90">
          Čo môžete čakať v meste {town.name} do roku 2050 a 2100 oproti
          obdobiu 1991–2020. Hodnoty platia pre okolie centra mesta, nie pre
          celý okres.
        </p>
        <p className="mt-3 text-xs text-teal-100/60">
          Normál 1991–2020 a projekcie 2021–2050 a 2071–2100 (RCP4.5) • SHMÚ •{" "}
          <Link href="/metodika" className="underline hover:text-white">
            Ako vznikli tieto údaje? →
          </Link>
        </p>
      </header>

      <section aria-labelledby="indikatory">
        <h2 id="indikatory" className="text-2xl font-black">
          Dnes, 2050 a 2100 v číslach
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((ind) => (
            <article
              key={ind.metric.id}
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-bold">
                <span aria-hidden>{ind.metric.icon} </span>
                {ind.metric.labelSk}
                <span className="ml-2 text-xs font-normal text-stone-500">
                  {ind.metric.unit}
                </span>
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {TOWN_PERIODS.map((p) => (
                  <div
                    key={p}
                    className={`rounded-2xl px-1 py-2.5 ${
                      p === "1991-2020" ? "bg-teal-50" : "bg-violet-50"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase leading-tight ${
                        p === "1991-2020" ? "text-teal-800" : "text-violet-800"
                      }`}
                    >
                      {TOWN_PERIOD_LABEL[p]}
                    </p>
                    <p className="mt-1 text-xl font-black tabular-nums">
                      {ind.periods[p]}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm font-bold text-teal-800">
                Zmena oproti normálu: {ind.delta2050} do 2050, {ind.delta2100} do 2100
              </p>
              {ind.vsKraj && (
                <p className="mt-1 text-sm text-stone-600">
                  {ind.vsKraj} <span className="text-stone-400">({ind.krajName}, normál)</span>
                </p>
              )}
              <div className="mt-3">
                <ClimateChart data={ind.chart} activePeriodId="1991-2020" />
              </div>
              <p className="mt-1 text-xs text-stone-500">{ind.metric.definitionSk}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <SourceBadge source="SHMÚ" />
          <Link href="/metodika" className="font-medium text-teal-800 hover:underline">
            Ako vznikli tieto údaje? →
          </Link>
        </div>
      </section>

      <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-stone-700">
        Projekcie sú scenár RCP4.5 (stredne optimistický), nie predpoveď
        počasia. Hodnota je priemer za okolie centra mesta (cca 1,5 × 1,5 km)
        zo SHMÚ gridov s rozlíšením 500 m, preto sa môže líšiť od hodnoty
        pri konkrétnej meteorologickej stanici.
      </p>

      <p className="text-sm">
        <Link
          href={`/kraj/${town.kraj}`}
          className="font-medium text-teal-800 hover:underline"
        >
          ← Celý {region?.name ?? "kraj"}
        </Link>
      </p>
    </div>
  );
}
