import Link from "next/link";
import { getSources } from "@/lib/climate";

export const metadata = {
  title: "Metodika a zdroje",
  description:
    "Odkiaľ pochádzajú dáta, čo sú pozorovania a projekcie, prečo existujú scenáre a prečo je budúcnosť neistá. Zrozumiteľne pre nevedcov.",
};

export default function MetodikaPage() {
  const sources = getSources();
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <nav className="text-sm text-stone-500" aria-label="Navigačná cesta">
        <Link href="/" className="hover:underline">Domov</Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">Metodika</span>
      </nav>

      <header>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-black tracking-tight">
            Ako vznikli tieto údaje?
          </h1>
        </div>
        <p className="mt-3 text-lg leading-relaxed text-stone-600">
          Minulosť a súčasnosť sú skutočné pozorované dáta. Čísla do
          budúcnosti nie sú predpoveď počasia — ide o modelované scenáre.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-sky-50 p-5">
          <h2 className="font-black text-sky-950">📜 Pozorované dáta</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Merania a gridy — čo sa reálne stalo. Roky 1950–2025 sa počítajú
            z európskeho datasetu E-OBS (denný grid 0,1°), klimatický
            normál 1991–2020 tvoria oficiálne 500 m normály SHMÚ.
            Všetkých 5 metrík sa počíta z reálnych dát.
          </p>
        </div>
        <div className="rounded-3xl bg-teal-50 p-5">
          <h2 className="font-black text-teal-950">📍 Súčasnosť a normál</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Klimatický normál <strong>1991–2020</strong> (štandard WMO).
            Teplotné odchýlky a zmeny v úvodnej infografike sa vzťahujú
            k tomuto obdobiu, aby boli čísla porovnateľné.
          </p>
        </div>
        <div className="rounded-3xl bg-violet-50 p-5">
          <h2 className="font-black text-violet-950">🔮 Projekcie</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Modelované scenáre vývoja klímy. Používame strednú cestu{" "}
            <strong>RCP4.5</strong> (SHMÚ gridy, generácia CMIP5): emisie
            ešte rastú, potom klesajú. Skutočný výsledok závisí od
            budúcich emisií, preto neexistuje „jedna zaručená hodnota pre
            rok 2050“.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black">Prečo existujú scenáre?</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-700 sm:text-base">
          <p>
            Klíma v roku 2050 závisí od toho, koľko skleníkových plynov ľudstvo
            dovtedy vypustí, ako sa zmení využívanie pôdy a ako presne zareaguje
            klimatický systém. Vedci preto počítajú viacero variantov —
            scenárov.
          </p>
          <p>
            <strong>RCP4.5</strong> nie je ani najoptimistickejší, ani
            najpesimistickejší variant — práve preto ho tento web používa:
            nepreháňa ani nebagatelizuje. SHMÚ poskytuje aj gridy
            RCP8.5 (vysoké emisie), tento web však používa len stredný
            scenár RCP4.5. Rozdiel medzi scenármi sa naplno ukáže až okolo
            roku 2100; do roku 2050 sa scenáre takmer prekrývajú.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black">Prečo je budúcnosť neistá?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700 sm:text-base">
          <li>Modely sú zjednodušením reality — rôzne modely dávajú mierne iné výsledky.</li>
          <li>Regionálne detaily (údolie vs hrebeň) sa modelujú ťažšie než celoslovenský priemer.</li>
          <li>Extrémy (lejak, sucho) sú neistejšie než priemerná teplota.</li>
          <li>Kraje sú vnútorne rôznorodé — napr. Žilinský kraj zahŕňa nížiny aj Tatry.</li>
        </ul>
        <p className="mt-3 rounded-2xl bg-stone-100 p-4 text-sm">
          Preto tento web hovorí jazykom pravdepodobnosti: „Očakávajú sa častejšie
          horúčavy.“, „Očakávajú sa skôr kratšie a teplejšie zimy.“,
          „Obdobia sucha môžu
          byť dlhšie.“ — nie katastrofickými titulkami.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black">Zdroje dát</h2>
        <p className="mt-1 text-sm text-stone-600">
          Každé dôležité číslo má svoj zdroj. Používame tieto
          autoritatívne zdroje:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <th className="py-2 pr-4">Zdroj</th>
                <th className="py-2 pr-4">Úloha</th>
                <th className="py-2">Odkaz</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4 font-bold">{s.nameSk}</td>
                  <td className="py-3 pr-4 text-stone-600">{s.roleSk}</td>
                  <td className="py-3">
                    <a
                      href={s.url}
                      className="text-teal-800 hover:underline"
                      target={s.url.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      Otvoriť →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-stone-950 p-6 text-white sm:p-8">
        <h2 className="text-xl font-black">Ako vznikli súčasné dáta?</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-300">
          <li>Skripty v <code>/scripts/shmu_pipeline</code> stiahli E-OBS gridy a SHMÚ normály 1991–2020 (raw dáta sa nepublikujú, len agregáty).</li>
          <li>Validácia (<code>checks.py</code>) porovnala E-OBS proti SHMÚ gridom aj denným staniciam; publikuje sa len pri kompletnosti ≥ 90 % dní.</li>
          <li>Emisia do <code>src/data/climate.real.json</code> v schéme ClimateRecord: roky 1950–2025 so statusom „observed“, 2050/2100 ako projekcie RCP4.5 so statusom „projected“.</li>
          <li>Každý záznam nesie <code>sourceId, referencePeriod, scenario, lastUpdated</code>.</li>
        </ol>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 font-bold text-stone-900 hover:bg-stone-200"
        >
          ← Späť na homepage
        </Link>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black">Povinné citácie zdrojov</h2>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-stone-700">
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="font-bold">SHMÚ (plné znenie, CC BY 4.0)</p>
            <p className="mt-1">
              Zdroj dát: Slovenský hydrometeorologický ústav (SHMÚ),
              otvorené dáta opendata.shmu.sk, licencia CC BY 4.0{" "}
              (<a className="text-teal-800 hover:underline" href="https://creativecommons.org/licenses/by/4.0/deed.sk">CC BY 4.0</a>).
              Údaje upravené a agregované do ročných indikátorov.
            </p>
          </div>
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="font-bold">E-OBS </p>
            <p className="mt-1" lang="en">
              “We acknowledge the E-OBS dataset and the data providers in
              the ECA&amp;D project (https://www.ecad.eu). Cornes, R., G. van
              der Schrier, E.J.M. van den Besselaar, and P.D. Jones. 2018:
              An Ensemble Version of the E-OBS Temperature and Precipitation
              Datasets, J. Geophys. Res. Atmos., 123.
              doi:10.1029/2017JD028200” Verzia datasetu: E-OBSv33.0e. DOI:
              10.24381/cds.151d3ec6.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
