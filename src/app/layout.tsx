import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Ako sa zmení Slovensko? | Klimatická zmena jednoducho",
    template: "%s | Ako sa zmení Slovensko?",
  },
  description:
    "Jednoduchý vizuálny preklad klimatických dát do každodenného života. Pozrite sa, čo môže klimatická zmena znamenať pre vaše mesto, región a domov — včera, dnes, v roku 2050 a 2100.",
  keywords: [
    "klimatická zmena Slovensko",
    "globálne otepľovanie Slovensko",
    "klimatická zmena Bratislava",
    "klimatická zmena Košice",
    "ako sa zmení Slovensko",
    "horúčavy Slovensko",
    "mráz Slovensko",
    "klimatická zmena regióny Slovenska",
    "počasie Slovensko 2050",
  ],
  openGraph: {
    title: "Ako sa zmení Slovensko?",
    description:
      "Klimatická zmena nie je len číslo v grafe. Pozrite sa, čo môže znamenať pre vaše mesto, región a každodenný život.",
    locale: "sk_SK",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
