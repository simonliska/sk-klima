import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Model-training crawlers — blocked (E-OBS licence: non-commercial
      // research and education only). Search and user-initiated assistant
      // fetchers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
      // PerplexityBot) stay allowed so assistants can read and cite the site.
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
          "CCBot",
          "Google-Extended",
        ],
        disallow: "/",
      },
      // SEO crawlers
      {
        userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot"],
        disallow: "/",
      },
    ],
    sitemap: "https://sk-klima.sk/sitemap.xml",
  };
}
