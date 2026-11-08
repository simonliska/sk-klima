import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEFAULT_SCENARIO,
  getRegion,
  getRegionIntro,
  getRegions,
  krajAdjective,
} from "@/lib/climate";
import IndicatorTable from "@/components/IndicatorTable";
import { getKrajIndicators, getTownsByKraj } from "@/lib/towns";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getRegions().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) return { title: "Kraj sa nenašiel" };
  return {
    title: { absolute: `Klimatická zmena ${region.name} do roku 2100` },
    description: `${region.name}: klimatická zmena a globálne otepľovanie — ako sa zmení teplota, tropické dni, mráz a zrážky do roku 2050 a 2100 oproti obdobiu 1991–2020.`,
    alternates: { canonical: `/kraj/${region.slug}` },
    openGraph: {
      title: `Klimatická zmena ${region.name} do roku 2100`,
      url: `https://sk-klima.sk/kraj/${region.slug}`,
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) notFound();

  const scenario = DEFAULT_SCENARIO;
  const intro = getRegionIntro(slug, scenario);
  const others = getRegions().filter((r) => r.slug !== slug);
  const towns = getTownsByKraj(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Klimatická zmena ${region.name} do roku 2100`,
    description: intro,
    inLanguage: "sk-SK",
    mainEntityOfPage: `https://sk-klima.sk/kraj/${region.slug}`,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domov", item: "https://sk-klima.sk/" },
      {
        "@type": "ListItem",
        position: 2,
        name: region.name,
        item: `https://sk-klima.sk/kraj/${region.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500" aria-label="Navigačná cesta">
        <Link href="/" className="hover:underline">Domov</Link>
        <span aria-hidden> / </span>
        <Link href="/#mapa" className="hover:underline">Mapa</Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">{region.name}</span>
      </nav>

      <header className="bg-accent-950 p-6 text-white sm:p-10">
        <h1 className="text-4xl sm:text-5xl">
          {region.name}: klimatická zmena
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-accent-50/90">
          Čo môžete čakať v {region.nameLocative} do roku 2100 oproti
          obdobiu 1991–2020.
        </p>
      </header>

      <IndicatorTable indicators={getKrajIndicators(slug)} />

      {towns.length > 0 && (
        <section aria-labelledby="mesta">
          <h2 id="mesta" className="text-2xl sm:text-3xl">
            Okresné mestá v kraji
          </h2>
          <p className="mt-1 text-stone-600">
            Priemer kraja skrýva rozdiely v nadmorskej výške a lokalite. Pozrite si hodnoty pre konkrétne mesto.
          </p>
          <ul className="mt-4 grid grid-cols-2 border-t-2 border-stone-900 sm:grid-cols-3 lg:grid-cols-4">
            {towns.map((t) => (
              <li key={t.slug} className="border-b border-stone-300">
                <Link
                  href={`/mesto/${t.slug}`}
                  className="flex min-h-[44px] items-center justify-between gap-2 py-2 pr-4 font-medium text-stone-900 hover:text-accent-700 hover:underline"
                >
                  {t.name}
                  <span aria-hidden className="text-stone-400">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Other regions */}
      <nav aria-label="Ostatné kraje" className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-xl">Pozrite si aj iné kraje</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {others.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/kraj/${r.slug}`}
                className="inline-flex min-h-[44px] items-center font-medium text-accent-800 underline underline-offset-2 hover:text-accent-950"
              >
                {krajAdjective(r)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
