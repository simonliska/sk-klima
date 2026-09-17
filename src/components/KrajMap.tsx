"use client";

import Link from "next/link";
import { getRegions } from "@/lib/climate";
import geo from "@/data/kraje.paths.json";

const PATHS = (geo.paths as unknown) as Record<string, { d: string; label: [number, number] }>;
const VIEWBOX: string = (geo as { viewBox: string }).viewBox;
const CAPITALS = (geo as unknown as { capitals: Record<string, { name: string; pos: [number, number] }> }).capitals ?? {};

// Mesto -> kraj (na halo podľa výberu)
const SLUG_TO_CAPITAL: Record<string, string> = {
  bratislavsky: "Bratislava",
  trnavsky: "Trnava",
  trenciansky: "Trenčín",
  nitriansky: "Nitra",
  zilinsky: "Žilina",
  banskobystricky: "Banská Bystrica",
  presovsky: "Prešov",
  kosicky: "Košice",
};

// Pozícia popisku kraja voči bodke jeho hlavného mesta — každé ručne,
// aby sedelo vnútri polygónu a nekolidovalo so susedmi
const KRAJ_LABEL_OFFSET: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  bratislavsky: { dx: 7, dy: 4, anchor: "start" },
  trnavsky: { dx: 7, dy: 15, anchor: "middle" },
  trenciansky: { dx: 7, dy: 4, anchor: "start" },
  nitriansky: { dx: 7, dy: 4, anchor: "start" },
  zilinsky: { dx: 7, dy: 4, anchor: "start" },
  banskobystricky: { dx: 0, dy: 20, anchor: "middle" },
  presovsky: { dx: 7, dy: 4, anchor: "start" },
  kosicky: { dx: 7, dy: 4, anchor: "start" },
};

// On-map abbreviations — full names don't fit into small western kraje
const MAP_LABEL: Record<string, string> = {
  bratislavsky: "BA",
  trnavsky: "Trnava",
  trenciansky: "Trenčín",
  nitriansky: "Nitra",
  zilinsky: "Žilina",
  banskobystricky: "Banská Bystrica",
  presovsky: "Prešov",
  kosicky: "Košice",
};

export default function KrajMap({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (slug: string) => void;
}) {
  const regions = getRegions();

  return (
    <div>
      <svg
        viewBox={VIEWBOX}
        role="group"
        aria-label="Interaktívna mapa krajov Slovenska"
        className="h-auto w-full"
      >
        {regions.map((r) => {
          const isActive = selected === r.slug;
          const geoPath = PATHS[r.slug];
          if (!geoPath) return null;
          // Popisok kraja kotvíme k bodke jeho hlavného mesta (nie k centroidu
          // polygónu), aby text sedel „reálne" pri meste a nikde sa neduploval.
          const capital = CAPITALS[SLUG_TO_CAPITAL[r.slug]];
          const [cx, cy] = capital?.pos ?? geoPath.label;
          const off = KRAJ_LABEL_OFFSET[r.slug] ?? { dx: 9, dy: 4, anchor: "start" as const };
          const lx = cx + off.dx;
          const ly = cy + off.dy;
          const label = MAP_LABEL[r.slug] ?? r.shortName;
          const small = r.slug === "bratislavsky" || r.slug === "trnavsky";
          return (
            <g key={r.slug}>
              <path
                d={geoPath.d}
                onClick={() => onSelect?.(r.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(r.slug);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={r.name}
                aria-pressed={isActive}
                className="cursor-pointer transition-all"
                fill={isActive ? "#0d9488" : "#e7e5e4"}
                stroke={isActive ? "#0f766e" : "#57534e"}
                strokeWidth={isActive ? 2.5 : 1}
                strokeLinejoin="round"
              >
                <title>{r.name}</title>
              </path>
              <text
                x={lx}
                y={r.slug === "banskobystricky" ? ly - 6 : ly}
                textAnchor={off.anchor}
                fontSize={small ? 12 : r.slug === "banskobystricky" ? 12 : 13}
                fontWeight="700"
                fill={isActive ? "#ffffff" : "#44403c"}
                pointerEvents="none"
                paintOrder="stroke"
                stroke={isActive ? "#0d9488" : "#e7e5e4"}
                strokeWidth={3}
                strokeLinejoin="round"
              >
                {r.slug === "banskobystricky" ? "Banská" : label}
              </text>
              {r.slug === "banskobystricky" && (
                <text
                  x={lx}
                  y={ly + 7}
                  textAnchor={off.anchor}
                  fontSize={12}
                  fontWeight="700"
                  fill={isActive ? "#ffffff" : "#44403c"}
                  pointerEvents="none"
                  paintOrder="stroke"
                  stroke={isActive ? "#0d9488" : "#e7e5e4"}
                  strokeWidth={3}
                  strokeLinejoin="round"
                >
                  Bystrica
                </text>
              )}
            </g>
          );
        })}

        {/* Krajské mestá — len bodky (meno je v popisku kraja pri bodke) */}
        {Object.values(CAPITALS).map((c) => (
          <g key={c.name} pointerEvents="none">
              <circle
                cx={c.pos[0]}
                cy={c.pos[1]}
                r={3.5}
                fill="#ffffff"
                stroke="#44403c"
                strokeWidth={1.5}
              />
            <title>{c.name}</title>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-stone-500">
        Hranice krajov: Geoportal (geoportal.gov.sk, ZBGIS) via
        drakh/slovakia-gps-data, zjednodušené pre web.
      </p>
      {/* Text fallback — important especially for tiny Bratislavský kraj */}
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Zoznam krajov">
        {regions.map((r) => (
          <button
            key={r.slug}
            onClick={() => onSelect?.(r.slug)}
            className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-medium ${
              selected === r.slug
                ? "bg-teal-700 text-white"
                : "bg-stone-200 text-stone-800 hover:bg-stone-300"
            }`}
            aria-pressed={selected === r.slug}
          >
            {r.shortName}
          </button>
        ))}
      </div>
      {regions.map(
        (r) =>
          selected === r.slug && (
            <p key={r.slug} className="sr-only" aria-live="polite">
              Vybraný kraj: {r.name}.{" "}
              <Link href={`/kraj/${r.slug}`}>Zobraziť detail</Link>
            </p>
          )
      )}
    </div>
  );
}
