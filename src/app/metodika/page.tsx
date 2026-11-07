import Link from "next/link";
import { getSources } from "@/lib/climate";

export const metadata = {
  title: "Metodika a zdroje",
  description:
    "Odkiaľ pochádzajú dáta, čo sú pozorovania a projekcie, prečo existujú scenáre a prečo je budúcnosť neistá. Zrozumiteľne pre nevedcov.",
  alternates: { canonical: "/metodika" },
  openGraph: {
    title: "Metodika a zdroje",
    description:
      "Odkiaľ pochádzajú dáta, čo sú pozorovania a projekcie, prečo existujú scenáre a prečo je budúcnosť neistá.",
    url: "https://sk-klima.sk/metodika",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function MetodikaPage() {
  const sources = getSources();
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Klimatické indikátory Slovenska — pozorované dáta a projekcie",
    description:
      "30-ročné klimatické priemery pre Slovensko a kraje: pozorovania E-OBS (1951–1980 až 1981–2010), klimatický normál SHMÚ 1991–2020 a projekcie scenára RCP4.5 na obdobia 2021–2050 a 2071–2100.",
    url: "https://sk-klima.sk/metodika",
    inLanguage: "sk-SK",
    creator: [
      { "@type": "Organization", name: "SHMÚ" },
      { "@type": "Organization", name: "E-OBS (ECA&D)" },
    ],
    license: "https://creativecommons.org/licenses/by/4.0/deed.sk",
  };
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-8 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datasetJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="text-sm text-stone-500" aria-label="Navigačná cesta">
        <Link href="/" className="hover:underline">Domov</Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">Metodika</span>
      </nav>

      <header>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl sm:text-5xl">
            Ako vznikli tieto údaje?
          </h1>
        </div>
        <p className="mt-3 text-lg leading-relaxed text-stone-600">
          Minulosť a súčasnosť sú skutočné pozorované dáta. Čísla do
          budúcnosti nie sú predpoveď počasia — ide o modelované scenáre.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="border-t-4 border-past-700 pt-3">
          <h2 className="text-xl text-past-800">Pozorované dáta</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Merania a gridy — čo sa reálne stalo. Zobrazujú sa len 3×
            30-ročné priemery WMO (1951–1980, 1961–1990, 1981–2010)
            z európskeho datasetu E-OBS. Klimatický
            normál 1991–2020 tvoria normály SHMÚ.
          </p>
        </div>
        <div className="border-t-4 border-accent-700 pt-3">
          <h2 className="text-xl text-accent-800">Súčasnosť a normál</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Klimatický normál <strong>1991–2020</strong> (štandard WMO).
            Teplotné odchýlky a zmeny v úvodnej infografike sa vzťahujú
            k tomuto obdobiu, aby boli čísla porovnateľné.
          </p>
        </div>
        <div className="border-t-4 border-future-700 pt-3">
          <h2 className="text-xl text-future-800">Projekcie</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Modelované scenáre vývoja klímy. Používame strednú cestu{" "}
            <strong>RCP4.5</strong> (SHMÚ gridy, generácia CMIP5), ako 30-ročné priemery
            2021–2050 a 2071–2100: emisie
            ešte rastú, potom klesajú. Skutočný výsledok závisí od
            budúcich emisií, preto neexistuje „jedna zaručená hodnota pre
            rok 2050“.
          </p>
        </div>
      </section>

      <section className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-2xl">Prečo existujú scenáre?</h2>
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
            scenár RCP4.5.
          </p>
        </div>
      </section>

      <section className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-2xl">Prečo je budúcnosť neistá?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700 sm:text-base">
          <li>Modely sú zjednodušením reality — rôzne modely dávajú mierne iné výsledky.</li>
          <li>Regionálne detaily sa modelujú ťažšie než celoslovenský priemer.</li>
          <li>Extrémy (lejak, sucho) sú neistejšie než priemerná teplota.</li>
        </ul>
      </section>

      <section className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-2xl">Dajú sa obdobia z dvoch zdrojov porovnať?</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-700 sm:text-base">
          <p>
            Obdobia 1951–2010 pochádzajú z E-OBS (grid cca 11 km), normál
            1991–2020 a projekcie zo SHMÚ (grid 500 m). Hrubší grid vyhladzuje
            extrémy: horúčavy a lejaky vychádzajú nižšie, mrazové dni vyššie.
            Odchýlky teploty vs 1991–2020 navyše porovnávajú dva rôzne
            datasety, takže môžu obsahovať malý rozdiel medzi zdrojmi.
          </p>
        </div>
      </section>

      <section className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-2xl">Zdroje dát</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-stone-900 text-xs uppercase tracking-[0.06em] text-stone-500">
                <th className="py-2 pr-4">Zdroj</th>
                <th className="py-2">Úloha</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-b border-stone-300">
                  <td className="w-[36%] py-3 pr-6 align-top">
                    <a
                      href={s.url}
                      className="font-semibold text-stone-900 underline decoration-stone-300 underline-offset-2 hover:text-accent-800 hover:decoration-accent-800"
                      target={s.url.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      {s.nameSk}
                    </a>
                    {s.url.startsWith("http") && (
                      <span className="mt-0.5 block text-xs text-stone-500">
                        {new URL(s.url).hostname.replace(/^www\./, "")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 align-top text-stone-600">{s.roleSk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-2xl">Ako vznikli súčasné dáta?</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-700 sm:text-base">
          <li>Skripty v <code>/scripts/shmu_pipeline</code> stiahli E-OBS gridy, SHMÚ normály 1991–2020 a RCP4.5 gridy 2021–2050 / 2071–2100 (raw dáta sa nepublikujú, len agregáty).</li>
          <li>Kontrola (<code>checks.py</code>) porovná E-OBS s normálmi SHMÚ a bodovo s jedným mesiacom denných dát; prejde len pri kompletnosti ≥ 90 % a potvrdenom oteplení (2024 teplejšie ako 1951, 2050 teplejšie ako normál).</li>
          <li>Emisia do <code>src/data/climate.real.json</code> v schéme ClimateRecord: obdobia 1951–1980, 1961–1990 a 1981–2010 (E-OBS, „observed“), normál 1991–2020 (SHMÚ, „observed“) a projekcie 2021–2050 / 2071–2100 (RCP4.5, „projected“).</li>
          <li>Stránky okresných miest (<code>/mesto/…</code>) používajú len SHMÚ: normál 1991–2020 a projekcie RCP4.5 v bode centra mesta (priemer okolia cca 1,5 × 1,5 km zo 500 m gridov). Minulosť z E-OBS sa pri mestách neukazuje, lebo jeho 11 km grid nerozlíši rozdiely vo výške.</li>
          <li>Každý záznam nesie aj zdroj, referenčné obdobie, scenár a dátum (<code>sourceId, referencePeriod, scenario, lastUpdated</code>); každý bod obdobie, hodnotu a status (<code>periodId, value, displayValue, status</code>).</li>
        </ol>
      </section>

      <section className="border-t-2 border-stone-900 pt-4">
        <h2 className="text-2xl">Citácie zdrojov</h2>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-stone-700">
          <div className="border-l-2 border-stone-300 pl-4">
            <p className="font-semibold">SHMÚ (plné znenie, CC BY 4.0)</p>
            <p className="mt-1">
              Zdroj dát: Slovenský hydrometeorologický ústav (SHMÚ),
              otvorené dáta opendata.shmu.sk, licencia CC BY 4.0{" "}
              (<a className="text-accent-800 underline underline-offset-2 hover:text-accent-950" href="https://creativecommons.org/licenses/by/4.0/deed.sk">CC BY 4.0</a>).
              Údaje upravené a agregované do ročných indikátorov.
            </p>
          </div>
          <div className="border-l-2 border-stone-300 pl-4">
            <p className="font-semibold">E-OBS_EU (CC BY 4.0)</p>
            <p className="mt-1">
              Zdroj dát: E-OBS_EU, Copernicus Climate Change Service (C3S)
              Climate Data Store, licencia{" "}
              <a className="text-accent-800 underline underline-offset-2 hover:text-accent-950" href="https://creativecommons.org/licenses/by/4.0/deed.sk">CC BY 4.0</a>.
              Údaje upravené a agregované do 30-ročných priemerov.
            </p>
            <p className="mt-1" lang="en">
              Generated using or contains modified Copernicus Climate Change
              Service information 2025. Neither the European Commission nor
              ECMWF is responsible for any use that may be made of the
              Copernicus information or data it contains.
            </p>
            <p className="mt-1" lang="en">
              We acknowledge the E-OBS dataset and the data providers in the
              ECA&amp;D project (https://www.ecad.eu). Cornes, R., van der
              Schrier, G., van den Besselaar, E.J.M., Jones, P., (2018): An
              Ensemble Version of the E-OBS Temperature and Precipitation
              Datasets, J. Geophys. Res. Atmos., 123. DOI:{" "}
              <a className="text-accent-800 underline underline-offset-2 hover:text-accent-950" href="https://doi.org/10.1029/2017JD028200">10.1029/2017JD028200</a>
            </p>
            <p className="mt-1" lang="en">
              Copernicus Climate Change Service, Climate Data Store, (2020):
              E-OBS daily gridded meteorological data for Europe from 1950 to
              present derived from in-situ observations. Copernicus Climate
              Change Service (C3S) Climate Data Store (CDS). DOI:{" "}
              <a className="text-accent-800 underline underline-offset-2 hover:text-accent-950" href="https://doi.org/10.24381/cds.151d3ec6">10.24381/cds.151d3ec6</a>{" "}
              (Accessed on 06-Nov-2026). Verzia datasetu: E-OBS_EU v34.0e.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
