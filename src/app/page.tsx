import Hero from "@/components/Hero";
import TimelineSection from "@/components/TimelineSection";
import MapSection from "@/components/MapSection";
import ImpactsSection from "@/components/ImpactsSection";

export const metadata = {
  title: "Ako sa zmení Slovensko? | Klimatická zmena jednoducho",
  description:
    "Pozrite sa, čo môže klimatická zmena znamenať pre vaše mesto, región a každodenný život. Včera → dnes → 2050 → 2100.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="space-y-16 overflow-x-clip pb-16 sm:space-y-20">
      <Hero />
      <TimelineSection />
      <MapSection />
      <ImpactsSection />
    </div>
  );
}
