import Hero from "@/components/Hero";
import TimelineSection from "@/components/TimelineSection";
import MapSection from "@/components/MapSection";
import ImpactsSection from "@/components/ImpactsSection";
import Link from "next/link";

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

      {/* Methodology — teaser card, full explanation lives on /metodika */}
      <section
        aria-label="Odkaz na metodiku"
        className="mx-auto max-w-6xl px-4 sm:px-6"
      >
        <p className="mx-auto max-w-2xl rounded-2xl border border-amber-200/70 bg-amber-50 px-5 py-4 text-center text-sm leading-relaxed text-amber-950">
          Do roku 2025 pozorované dáta (E-OBS) • 2050 a 2100 projekcia RCP4.5
          (SHMÚ) —{" "}
          <Link
            href="/metodika"
            className="rounded font-medium text-teal-800 underline decoration-teal-600/40 underline-offset-4 hover:decoration-teal-800"
          >
            Ako vznikli tieto údaje?
          </Link>
        </p>
      </section>
    </div>
  );
}
