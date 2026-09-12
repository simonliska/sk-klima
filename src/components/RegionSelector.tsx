import { getRegions } from "@/lib/climate";
import Link from "next/link";

/** Accessible list fallback for the map — keyboard + screen-reader friendly. */
export default function RegionSelector({ active }: { active?: string }) {
  const regions = getRegions();
  return (
    <nav aria-label="Výber kraja" className="flex flex-wrap gap-2">
      {regions.map((r) => (
        <Link
          key={r.slug}
          href={`/kraj/${r.slug}`}
          aria-current={active === r.slug ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            active === r.slug
              ? "bg-teal-700 text-white"
              : "bg-stone-200 text-stone-800 hover:bg-stone-300"
          }`}
        >
          {r.shortName}
        </Link>
      ))}
    </nav>
  );
}
