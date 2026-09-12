import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getImpacts,
  getRegion,
  getRegions,
} from "@/lib/climate";
import { DataEraBadge } from "@/components/Badges";
import KrajIndicators from "@/components/KrajIndicators";
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
    title: `Klimatická zmena ${region.name} do roku 2050`,
    description: `Ako sa môže zmeniť život v regióne ${region.name} do roku 2050? Teploty, horúčavy, mráz a zrážky — jednoducho a zrozumiteľne.`,
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

  const impacts = getImpacts().slice(0, 4);
  const others = getRegions().filter((r) => r.slug !== slug);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500" aria-label="Navigačná cesta">
        <Link href="/" className="hover:underline">Domov</Link>
        <span aria-hidden> / </span>
        <Link href="/#mapa" className="hover:underline">Mapa</Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">{region.name}</span>
      </nav>

      <header className="rounded-3xl bg-teal-950 p-6 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <DataEraBadge era="DNES" />
          <span aria-hidden className="text-teal-300">→</span>
          <DataEraBadge era="PROJEKCIA" />
        </div>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-teal-300">
          {region.characterSk}
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
          {region.name}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-teal-50/90">
          Ako sa môže zmeniť život v regióne {region.shortName} do roku 2050?
        </p>
        <p className="mt-3 text-xs text-teal-100/60">
          Rok 2025: pozorované (E-OBS) • Klimatický normál 1991–2020: SHMÚ •
          2050: projekcia RCP4.5 (SHMÚ, očakávané približné hodnoty)
        </p>
      </header>

      {/* Today → 2050 grid (client island) */}
      <KrajIndicators slug={slug} />

      {/* Practical meaning */}
      <section aria-labelledby="prax" className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <h2 id="prax" className="text-2xl font-black">
          Čo to môže znamenať v {region.shortName}?
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="font-bold">☀️ V lete</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">
              Očakáva sa častejšie prehrievanie bytov počas horúčav.
              Najnáročnejšie sú podkrovia a byty bez tienenia. Tropické
              noci môžu zhoršiť spánok.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4">
            <p className="font-bold">❄️ V zime</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">
              Sneh môže byť menej pravidelný, mrazových dní sa očakáva
              menej. Zima bude pravdepodobne kratšia a teplejšia.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="font-bold">⛈️ Pri dažďoch</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">
              Krátke intenzívne zrážky môžu predstavovať väčšie riziko
              lokálnych prívalových povodní — aj keď celkovo prší podobne.
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 p-4">
            <p className="font-bold">🌲 Pre prírodu</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">
              Dlhšie obdobia sucha môžu zvyšovať stres lesov a vegetácie,
              množiť škodcov a zvyšovať riziko požiarov.
            </p>
          </div>
        </div>

        <h3 className="mt-6 font-bold">Vybrané dopady na život</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {impacts.map((c) => (
            <div key={c.id} className="rounded-2xl bg-stone-50 p-4 text-sm">
              <p className="font-bold">
                <span aria-hidden>{c.icon} </span>
                {c.titleSk}: {c.headlineSk}
              </p>
              <p className="mt-1 text-stone-600">{c.praxSk}</p>
            </div>
          ))}
        </div>
        <Link
          href="/#zivot"
          className="mt-4 inline-block font-bold text-teal-800 hover:underline"
        >
          Zobraziť všetkých 8 oblastí života →
        </Link>
      </section>

      {/* Other regions */}
      <nav aria-label="Ostatné kraje" className="rounded-3xl bg-stone-100 p-6">
        <h2 className="font-black">Pozrite si aj iné kraje</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((r) => (
            <Link
              key={r.slug}
              href={`/kraj/${r.slug}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-teal-700 hover:text-white"
            >
              {r.shortName}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
