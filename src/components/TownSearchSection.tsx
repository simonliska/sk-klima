import { getRegion } from "@/lib/climate";
import { getTowns } from "@/lib/towns";
import TownSearch from "./TownSearch";

/** Home page: find your district town (71 pages /mesto/<slug>). */
export default function TownSearchSection() {
  const towns = getTowns().map((t) => ({
    slug: t.slug,
    name: t.name,
    krajName: getRegion(t.kraj)?.name ?? t.kraj,
  }));
  return (
    <section
      id="mesto"
      aria-labelledby="mesto-nadpis"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6"
    >
      <div className="grid gap-6 border-y-2 border-stone-900 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <h2 id="mesto-nadpis" className="text-3xl sm:text-4xl">
            Nájdite svoje mesto
          </h2>
          <p className="mt-2 max-w-xl text-lg text-stone-600">
            Poprad a Prešov majú inú klímu. Pozrite si, čo môže zmena znamenať
            pre vaše okresné mesto.
          </p>
        </div>
        <div>
          <TownSearch towns={towns} />
        </div>
      </div>
    </section>
  );
}
