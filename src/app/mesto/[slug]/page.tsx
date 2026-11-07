import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRegion } from "@/lib/climate";
import { getTown, getTownIndicators, getTowns } from "@/lib/towns";
import IndicatorTable from "@/components/IndicatorTable";

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
    description: `Klimatická zmena a globálne otepľovanie v meste ${town.name}: ako sa zmení teplota, tropické dni, mráz a zrážky do roku 2050 a 2100 oproti obdobiu 1991–2020.`,
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domov", item: "https://sk-klima.sk/" },
      {
        "@type": "ListItem",
        position: 2,
        name: region?.name ?? town.kraj,
        item: `https://sk-klima.sk/kraj/${town.kraj}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: town.name,
        item: `https://sk-klima.sk/mesto/${town.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
        <h1 className="text-4xl sm:text-5xl">
          {town.name}: klimatická zmena
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-accent-50/90">
          Čo môžete čakať v meste {town.name} do roku 2100 oproti obdobiu
          1991–2020 v dôsledku globálneho otepľovania. Hodnoty platia pre mesto, nie pre celý okres (pozri{" "}
          <Link
            href={`/kraj/${town.kraj}`}
            className="underline underline-offset-2 hover:text-white"
          >
            celý {region?.name ?? "kraj"}
          </Link>
          ).
        </p>
      </header>

      <IndicatorTable indicators={indicators} />

      <Link
        href="/#zivot"
        className="block border-y border-stone-200 py-5 hover:bg-stone-100/60"
      >
        <span className="block text-lg font-semibold text-stone-900">
          Čo to znamená pre každodenný život? →
        </span>
        <span className="block text-sm text-stone-500">
          Bývanie, zdravie, voda, potraviny a ďalšie oblasti života
        </span>
      </Link>

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
