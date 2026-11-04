## Ako sa zmení Slovensko?

> **EN abstract:** Slovak educational website about climate change — what it
> can mean for Slovakia, its regions and everyday life (1951 → 2100).
> Static site, no backend: Next.js 16 App Router + TypeScript +
> Tailwind v4. Hosting on [StaticHost](https://www.statichost.eu/).
> All values are annual aggregates from real sources (E-OBS
> history, SHMÚ normals + RCP4.5 projections); see `DATA_SOURCE.md`.
> Code is MIT licensed; derived E-OBS_EU (CC BY 4.0) and SHMÚ (CC BY 4.0)
> values require attribution (see `LICENSE`).

Slovenský informačný web o klimatickej zmene: čo môže znamenať pre Slovensko,
jeho regióny a každodenný život. 1951 → 2100.

Statický web, bez backendu. Next.js 16 App Router + TypeScript + Tailwind v4.
Jazyk rozhrania: slovenčina. Hosting na [StaticHost](https://www.statichost.eu/).

```bash
npm run dev
npm run build
npm run lint
```

### Dáta

Všetky zobrazené hodnoty sú ročné agregáty.
(zdroje dát v `DATA_SOURCE.md`, reprodukovateľná pipeline
v `scripts/shmu_pipeline/`):

- **História do roku 2025** — E-OBS_EU v33.0e (ECA&D / Copernicus, licencia
  CC BY 4.0), denný grid 0,1°.
- **Normály 1991–2020 + projekcie 2050/2100 (RCP4.5)** — otvorené dáta
  SHMÚ ([opendata.shmu.sk](https://opendata.shmu.sk)).
- **IPCC** — len výkladový rámec emisných scenárov (RCP) a neistoty
  projekcií; z IPCC sa nepreberajú žiadne číselné údaje.

Kód v tomto repozitári je pod MIT licenciou (viď `LICENSE`), ale **odvodené
hodnoty z E-OBS_EU aj zo SHMÚ vyžadujú atribúciu (CC BY 4.0)** — podrobnosti
v `LICENSE` a na stránke `/metodika` priamo vo webe.
