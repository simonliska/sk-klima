import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-sm text-stone-600 sm:flex-row sm:px-6 sm:text-left">
        <p>
          <span className="font-bold text-stone-800">Ako sa zmení Slovensko?</span>{" "}
          <span>
            Dáta: SHMÚ (CC BY 4.0), E-OBS · Projekcie RCP4.5 sú orientačné,
            nie predpoveď počasia.
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <Link className="hover:underline" href="/metodika">
            Metodika a zdroje
          </Link>
          <a
            href="https://github.com/simonliska/sk-klima"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
