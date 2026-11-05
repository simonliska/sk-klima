import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEFAULT_SCENARIO,
  getImpacts,
  getRegion,
  getRegionIntro,
  getRegions,
} from "@/lib/climate";
import { DataEraBadge } from "@/components/Badges";
import KrajIndicators from "@/components/KrajIndicators";
import { getTownsByKraj } from "@/lib/towns";
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
    title: { absolute: `Klimatická zmena ${region.name} do roku 2050` },
    description: `Klimatická zmena ${region.name}: ako sa zmení teplota, mráz a horúčavy do roku 2050.`,
    alternates: { canonical: `/kraj/${region.slug}` },
    openGraph: {
      title: `Klimatická zmena ${region.name} do roku 2050`,
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
  const impacts = getImpacts().slice(0, 4);
  const others = getRegions().filter((r) => r.slug !== slug);
  const towns = getTownsByKraj(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Klimatická zmena ${region.name} do roku 2050`,
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
        <div className="flex flex-wrap items-center gap-2">
          <DataEraBadge era="HISTÓRIA" onDark />
          <span aria-hidden className="text-accent-300">→</span>
          <DataEraBadge era="PROJEKCIA" onDark />
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          {region.name}: klimatická zmena do roku 2050
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-accent-50/90">
          {intro || `Ako sa môže zmeniť život v regióne ${region.shortName} do roku 2050?`}
        </p>
        <p className="mt-3 text-xs text-accent-100/60">
          Normál 1991–2020 a projekcia 2021–2050 (RCP4.5) • SHMÚ •{" "}
          <Link href="/metodika" className="underline hover:text-white">
            Ako vznikli tieto údaje? →
          </Link>
        </p>
      </header>

      {/* Normal → 2050 numbers (prerendered to static HTML at build time) */}
      <KrajIndicators slug={slug} />

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

      {/* Practical meaning */}
      <section aria-labelledby="prax">
        <h2 id="prax" className="text-2xl sm:text-3xl">
          Čo to môže znamenať v {region.shortName}?
        </h2>
        <dl className="mt-4 border-t-2 border-stone-900">
            <div className="grid gap-1 border-b border-stone-300 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-serif text-lg font-semibold">V lete</dt>
              <dd className="leading-relaxed text-stone-700">
                Očakáva sa častejšie prehrievanie bytov počas horúčav. Najnáročnejšie sú podkrovia a byty bez tienenia. Tropické noci môžu zhoršiť spánok.
              </dd>
            </div>
            <div className="grid gap-1 border-b border-stone-300 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-serif text-lg font-semibold">V zime</dt>
              <dd className="leading-relaxed text-stone-700">
                Sneh môže byť menej pravidelný, mrazových dní sa očakáva menej. Zima bude pravdepodobne kratšia a teplejšia.
              </dd>
            </div>
            <div className="grid gap-1 border-b border-stone-300 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-serif text-lg font-semibold">Pri dažďoch</dt>
              <dd className="leading-relaxed text-stone-700">
                Krátke intenzívne zrážky môžu predstavovať väčšie riziko lokálnych prívalových povodní — aj keď celkovo prší podobne.
              </dd>
            </div>
            <div className="grid gap-1 border-b border-stone-300 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-serif text-lg font-semibold">Pre prírodu</dt>
              <dd className="leading-relaxed text-stone-700">
                Dlhšie obdobia sucha môžu zvyšovať stres lesov a vegetácie, množiť škodcov a zvyšovať riziko požiarov.
              </dd>
            </div>
        </dl>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.06em] text-stone-500">
          Vybrané dopady na život
        </h3>
        <ul className="mt-2 border-t border-stone-900">
          {impacts.map((c) => (
            <li
              key={c.id}
              className="grid gap-1 border-b border-stone-300 py-4 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6"
            >
              <p className="font-serif text-lg font-semibold">{c.titleSk}</p>
              <p className="font-medium text-stone-900">{c.headlineSk}</p>
              <p className="leading-relaxed text-stone-600">{c.praxSk}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/#zivot"
          className="mt-4 inline-block font-medium text-accent-800 underline underline-offset-2 hover:text-accent-950"
        >
          Zobraziť všetkých 8 oblastí života →
        </Link>
      </section>

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
                {r.shortName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
