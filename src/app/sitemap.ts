import type { MetadataRoute } from "next";
import { getRegions } from "@/lib/climate";
import { getTowns } from "@/lib/towns";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sk-klima.sk";
  // Stable date: sitemap `lastmod` should only change when content changes,
  // otherwise every build looks "new" and wastes crawl budget.
  const lastModified = new Date("2026-09-17T00:00:00.000Z");
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/metodika`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...getRegions().map((r) => ({
      url: `${base}/kraj/${r.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...getTowns().map((t) => ({
      url: `${base}/mesto/${t.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
