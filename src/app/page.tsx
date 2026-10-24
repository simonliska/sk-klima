import Hero from "@/components/Hero";
import TownSearchSection from "@/components/TownSearchSection";
import TimelineSection from "@/components/TimelineSection";
import MapSection from "@/components/MapSection";
import ImpactsSection from "@/components/ImpactsSection";

export const metadata = {
  title: "Klimatická zmena Slovensko: ako sa zmení klíma do roku 2100",
  description:
    "Klimatická zmena Slovensko jednoducho: čo môže znamenať pre vaše mesto a kraj. Normál 1991–2020 a projekcie na rok 2050 a 2100.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="space-y-16 overflow-x-clip pb-16 sm:space-y-20">
      <Hero />
      <TimelineSection />
      <MapSection />
      <TownSearchSection />
      <ImpactsSection />
    </div>
  );
}
