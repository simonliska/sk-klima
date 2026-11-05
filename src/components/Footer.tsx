import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-2 border-stone-900 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-sm text-stone-600 sm:flex-row sm:items-baseline sm:gap-8 sm:px-6">
        <p className="max-w-3xl">
          <span className="font-semibold text-stone-800">Ako sa zmení Slovensko?</span>{" "}
          <span>
            Dáta: SHMÚ (CC BY 4.0), E-OBS_EU / Copernicus C3S (CC BY 4.0) · Projekcie RCP4.5 sú orientačné,
            nie predpoveď počasia.
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <Link className="whitespace-nowrap hover:underline" href="/metodika">
            Metodika a zdroje
          </Link>
          <a
            href="https://github.com/simonliska/sk-klima"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
