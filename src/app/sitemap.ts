import type { MetadataRoute } from "next";
import { getRegions } from "@/lib/climate";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sk-klima.sk";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/metodika`, lastModified: now },
    ...getRegions().map((r) => ({
      url: `${base}/kraj/${r.slug}`,
      lastModified: now,
    })),
  ];
}
