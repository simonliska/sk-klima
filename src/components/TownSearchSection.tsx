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
      <div className="rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h2 id="mesto-nadpis" className="text-2xl font-black">
          Nájdite svoje mesto
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-stone-600">
          Poprad a Prešov majú inú klímu. Pozrite si, čo môže zmena znamenať
          pre vaše okresné mesto.
        </p>
        <div className="mt-5">
          <TownSearch towns={towns} />
        </div>
      </div>
    </section>
  );
}
