import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-bold">Ako sa zmení Slovensko?</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Jednoduchý vizuálny preklad klimatických dát do každodenného
            života. Bez strašenia, bez žargónu — vecne a pokojne.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-800">Navigácia</p>
          <ul className="mt-2 space-y-1 text-stone-600">
            <li><Link className="hover:underline" href="/#cas">Slovensko v čase</Link></li>
            <li><Link className="hover:underline" href="/#mapa">Interaktívna mapa</Link></li>
            <li><Link className="hover:underline" href="/#zivot">Čo to znamená pre mňa?</Link></li>
            <li><Link className="hover:underline" href="/metodika">Metodika a zdroje</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-800">Dôvera a zdroje</p>
          <p className="mt-2 leading-relaxed text-stone-600">
            Roky do 2025: pozorované dáta E-OBS (klimatický normál
            1991–2020: SHMÚ). Budúcnosť: projekcie RCP4.5 (SHMÚ, očakávané
            približné hodnoty).
            Zdroj: SHMÚ · CC BY 4.0.
          </p>
          <Link
            href="/metodika"
            className="mt-3 inline-block rounded-full border border-stone-300 px-4 py-2 font-medium hover:bg-stone-100"
          >
            Ako vznikli tieto údaje?
          </Link>
        </div>
      </div>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-500">
        Pozorované dáta E-OBS, klimatický normál a projekcie SHMÚ • Hodnoty 2050/2100 sú projekcie scenára RCP4.5 (očakávané približné hodnoty), nie predpoveď počasia.
      </div>
    </footer>
  );
}
