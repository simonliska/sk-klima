import Link from "next/link";

export function SourceBadge({
  source,
  href = "/metodika",
  onDark = false,
}: {
  source: string;
  href?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-[11px] font-medium underline underline-offset-2 ${
        onDark
          ? "text-accent-100 decoration-white/40 hover:text-white hover:decoration-white"
          : "text-stone-600 decoration-stone-300 hover:text-stone-900 hover:decoration-stone-600"
      }`}
      title="Zobraziť zdroj a metodiku"
    >
      Zdroj: {source} <span aria-hidden="true">→</span>
    </Link>
  );
}

export function DataEraBadge({
  era,
  onDark = false,
}: {
  era: "HISTÓRIA" | "DNES" | "PROJEKCIA";
  onDark?: boolean;
}) {
  const styles: Record<string, string> = onDark
    ? {
        HISTÓRIA: "border-past-100/70 text-past-100",
        DNES: "border-accent-100/70 text-accent-100",
        PROJEKCIA: "border-future-100/70 text-future-100",
      }
    : {
        HISTÓRIA: "border-past-700 text-past-700",
        DNES: "border-accent-700 text-accent-700",
        PROJEKCIA: "border-future-700 text-future-700",
      };
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-xs border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${styles[era]}`}
    >
      {era === "HISTÓRIA" ? "Pozorované" : era === "DNES" ? "Normál" : "Projekcia"}
    </span>
  );
}
