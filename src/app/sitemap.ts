import type { MetadataRoute } from "next";
import { CONDITIONS } from "@/lib/conditions";
import { PAYMENTS_ENABLED } from "@/lib/plans";
import { routes } from "@/lib/routes";
import { canonical } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" }[] = [
    { path: routes.home, priority: 1, freq: "weekly" },
    { path: routes.analyze, priority: 0.9, freq: "monthly" },
    { path: routes.conditions, priority: 0.8, freq: "monthly" },
    ...(PAYMENTS_ENABLED ? [{ path: routes.pricing, priority: 0.6, freq: "monthly" as const }] : []),
    { path: routes.about, priority: 0.6, freq: "monthly" },
    { path: routes.privacy, priority: 0.3, freq: "monthly" },
    { path: routes.terms, priority: 0.3, freq: "monthly" },
    ...CONDITIONS.map((c) => ({ path: routes.condition(c.slug), priority: 0.7, freq: "monthly" as const })),
  ];
  return pages.map((p) => ({ url: canonical(p.path), changeFrequency: p.freq, priority: p.priority }));
}
