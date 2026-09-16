import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // AI scrapers / SEO crawlers — polite bots obey, saves bandwidth
      // on the 10 GB free plan. Google/Bing/Seznam unaffected.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "ClaudeBot",
          "anthropic-ai",
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://sk-klima.sk/sitemap.xml",
  };
}
