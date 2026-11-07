import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://sk-klima.sk"),
  alternates: { canonical: "/" },
  title: {
    default: "Ako sa zmení Slovensko? | Klimatická zmena jednoducho",
    template: "%s | Ako sa zmení Slovensko?",
  },
  description:
    "Jednoduchý vizuálny preklad klimatických dát do každodenného života. Pozrite sa, čo môže klimatická zmena znamenať pre váš región, mesto a domov — včera, dnes, v roku 2050 a 2100.",
  openGraph: {
    title: "Ako sa zmení Slovensko?",
    description:
      "Klimatická zmena nie je len číslo v grafe. Pozrite sa, čo môže znamenať pre váš región, mesto a každodenný život.",
    url: "https://sk-klima.sk/",
    siteName: "Ako sa zmení Slovensko?",
    locale: "sk_SK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ako sa zmení Slovensko?",
    description:
      "Klimatická zmena nie je len číslo v grafe. Pozrite sa, čo môže znamenať pre váš región, mesto a každodenný život.",
  },
  robots: { index: true, follow: true },
};

const plex = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["600"],
  variable: "--font-source-serif",
  display: "swap",
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ako sa zmení Slovensko?",
  url: "https://sk-klima.sk/",
  inLanguage: "sk-SK",
  description:
    "Jednoduchý vizuálny preklad klimatických dát do každodenného života.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sk"
      className={`${plex.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
