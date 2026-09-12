import Link from "next/link";

export function DemoBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900"
      title="Ilustračné demo dáta — nie sú to skutočné vedecké merania"
    >
      <span aria-hidden="true">◐</span>
      {compact ? "Demo" : "Ilustračné dáta"}
    </span>
  );
}

export function SourceBadge({
  source,
  href = "/metodika",
}: {
  source: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50"
      title="Zobraziť zdroj a metodiku"
    >
      <span aria-hidden="true">📚</span> Zdroj: {source}
    </Link>
  );
}

export function DataEraBadge({ era }: { era: "HISTÓRIA" | "DNES" | "PROJEKCIA" }) {
  const styles: Record<string, string> = {
    HISTÓRIA: "bg-sky-100 text-sky-900",
    DNES: "bg-teal-100 text-teal-900",
    PROJEKCIA: "bg-violet-100 text-violet-900",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles[era]}`}
    >
      {era === "HISTÓRIA" ? "Pozorované" : era === "DNES" ? "Rok 2025" : "Projekcia"}
    </span>
  );
}
