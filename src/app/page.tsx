import Hero from "@/components/Hero";
import TownSearchSection from "@/components/TownSearchSection";
import TimelineSection from "@/components/TimelineSection";
import MapSection from "@/components/MapSection";
import ImpactsSection from "@/components/ImpactsSection";
import { getRegions } from "@/lib/climate";
import { getKrajIndicators } from "@/lib/towns";

export const metadata = {
  title: "Klimatická zmena Slovensko: ako sa zmení klíma do roku 2100",
  description:
    "Klimatická zmena a globálne otepľovanie na Slovensku jednoducho: čo môžu znamenať pre vaše mesto a kraj. Normál 1991–2020 a projekcie na rok 2050 a 2100.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // Kraj preview (dnes → 2050) built on the server so towns.json stays out
  // of the client bundle.
  const krajPreview = Object.fromEntries(
    getRegions().map((r) => [
      r.slug,
      getKrajIndicators(r.slug).map(({ metric, periods }) => ({
        id: metric.id,
        label: metric.labelSk,
        unit: metric.unit,
        today: periods["1991-2020"],
        future: periods["2050"],
      })),
    ])
  );
  return (
    <div className="space-y-16 overflow-x-clip pb-16 sm:space-y-20">
      <Hero />
      <TimelineSection />
      <MapSection preview={krajPreview} />
      <TownSearchSection />
      <ImpactsSection />
    </div>
  );
}
