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
    title: { absolute: title },
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
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 pb-16 sm:px-6">
      <nav className="text-sm text-stone-500" aria-label="Navigačná cesta">
        <Link href="/" className="hover:underline">Domov</Link>
        <span aria-hidden> / </span>
        <Link href={`/kraj/${town.kraj}`} className="hover:underline">
          {region?.name ?? town.kraj}
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">{town.name}</span>
      </nav>

      <header className="bg-accent-950 p-6 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <DataEraBadge era="DNES" onDark />
          <span aria-hidden className="text-accent-300">→</span>
          <DataEraBadge era="PROJEKCIA" onDark />
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          {town.name}: ako sa zmení klíma
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-accent-50/90">
          Čo môžete čakať v meste {town.name} do roku 2050 a 2100 oproti
          obdobiu 1991–2020. Hodnoty platia pre okolie centra mesta, nie pre
          celý okres.
        </p>
        <p className="mt-3 text-xs text-accent-100/60">
          Normál 1991–2020 a projekcie 2021–2050 a 2071–2100 (RCP4.5) • SHMÚ •{" "}
          <Link href="/metodika" className="underline hover:text-white">
            Ako vznikli tieto údaje? →
          </Link>
        </p>
      </header>

      <section aria-labelledby="indikatory">
        <h2 id="indikatory" className="text-2xl sm:text-3xl">
          Dnes, 2050 a 2100 v číslach
        </h2>
        <ul className="mt-4 border-t-2 border-stone-900">
          {indicators.map((ind) => (
            <li
              key={ind.metric.id}
              className="grid gap-x-8 gap-y-4 border-b border-stone-300 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] lg:items-start"
            >
              <div>
                <h3 className="font-serif text-xl font-semibold">
                  {ind.metric.labelSk}
                  <span className="ml-2 font-sans text-sm font-normal text-stone-500">
                    {ind.metric.unit}
                  </span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  {ind.metric.definitionSk}
                </p>
                {ind.vsKraj && (
                  <p className="mt-2 text-sm text-stone-600">
                    {ind.vsKraj}{" "}
                    <span className="text-stone-400">({ind.krajName}, normál)</span>
                  </p>
                )}
              </div>
              <div>
                <dl className="grid grid-cols-3 gap-4">
                  {TOWN_PERIODS.map((p) => (
                    <div
                      key={p}
                      className={`border-t-2 pt-2 ${
                        p === "1991-2020" ? "border-accent-700" : "border-future-700"
                      }`}
                    >
                      <dt
                        className={`text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] ${
                          p === "1991-2020" ? "text-accent-700" : "text-future-700"
                        }`}
                      >
                        {TOWN_PERIOD_LABEL[p]}
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">
                        {ind.periods[p]}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-stone-700">
                  Zmena oproti normálu:{" "}
                  <strong className="font-semibold tabular-nums text-stone-900">
                    {ind.delta2050}
                  </strong>{" "}
                  do 2050,{" "}
                  <strong className="font-semibold tabular-nums text-stone-900">
                    {ind.delta2100}
                  </strong>{" "}
                  do 2100
                </p>
              </div>
              <div className="min-w-0">
                <ClimateChart data={ind.chart} activePeriodId="1991-2020" />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <SourceBadge source="SHMÚ" />
        </div>
      </section>

      <p className="max-w-3xl border-l-2 border-future-700 pl-4 text-sm leading-relaxed text-stone-700">
        Projekcie sú scenár RCP4.5 (stredne optimistický), nie predpoveď
        počasia. Hodnota je priemer za okolie centra mesta (cca 1,5 × 1,5 km)
        zo SHMÚ gridov s rozlíšením 500 m, preto sa môže líšiť od hodnoty
        pri konkrétnej meteorologickej stanici.
      </p>

      <p className="text-sm">
        <Link
          href={`/kraj/${town.kraj}`}
          className="font-medium text-accent-800 underline underline-offset-2 hover:text-accent-950"
        >
          ← Celý {region?.name ?? "kraj"}
        </Link>
      </p>
    </div>
  );
}
